// src/agent/nodes.ts
import z from "zod";
import { openAiLLM } from "../../config/llm.ts";
import { userRepository } from "../../repository/user-repo.ts";
import {
  type AgentState,
  ValidationSchema,
  ProfileSchema,
} from "../state/state.ts";
import { interrupt } from "@langchain/langgraph";

export async function validateInfo(state: AgentState) {
  const allMessages = state.messages.join("\n\n");

  const validationLLM = openAiLLM.withStructuredOutput(ValidationSchema);

  const validation = await validationLLM.invoke([
    {
      role: "system",
      content: `You are validating if the user has provided COMPLETE resume information AND extracting that information.

REQUIRED for a complete profile:
✓ Full name (first + last name)
✓ Email address (any standard format like name@domain.com, office123@gmail.com, etc. - be LENIENT)
✓ Phone number (any format with digits)
✓ Work Experience (if they have any) with:
  - Company name
  - Job title/role
  - Time period (start and end dates)
  - What they did/achieved (description)
✓ At least 3 technical skills

OPTIONAL but recommended:
• Profile links (GitHub, LeetCode, HackerRank, HuggingFace, GeeksForGeeks, Kaggle, LinkedIn, Portfolio)
• Education details
• Achievements/Certifications
• Projects

IMPORTANT RULES:
1. Email validation: Accept ANY email that has text@text.text format.
2. If user says "yes", "confirmed", "everything is good", treat as CONFIRMATION. Set isComplete to TRUE.
3. Skills count: Count ALL technical skills mentioned across ALL messages.
4. Extract ALL provided information including education, achievements, projects, and profile links.
5. DO NOT ask for confirmation if all required fields are present. Confirmation is handled in a separate step.

EXTRACTION GUIDELINES:
- name: Full name as provided
- email: Email address
- phone: Phone number
- experience: Array of { company, role, duration, description }
- education: Array of { institution, degree, duration, description }
- skills: Array of all technical skills
- achievements: Array of certifications, awards, accomplishments
- profileLinks: Extract URLs for:
  * github: GitHub profile (github.com/username)
  * leetcode: LeetCode profile
  * hackerrank: HackerRank profile
  * huggingface: HuggingFace profile
  * geeksforgeeks: GeeksForGeeks profile
  * kaggle: Kaggle profile
  * linkedin: LinkedIn profile
  * portfolio: Personal website/portfolio

ALWAYS populate extractedProfile with whatever info is available, even if incomplete.

Set isComplete to TRUE if:
- User has provided name, email, phone, work experience (or stated they have none), and 3+ skills`,
    },
    {
      role: "user",
      content: `User's messages so far:\n\n${allMessages}\n\nValidate and extract ALL profile information including profile links.`,
    },
  ]);
  console.log("✅ Validation:", validation);

  if (validation.isComplete && validation.extractedProfile) {
    return {
      validation,
      isComplete: true,
      profile: validation.extractedProfile,
    };
  }

  return {
    validation,
    isComplete: validation.isComplete,
  };
}

export async function askForMore(state: AgentState) {
  const { validation } = state;

  if (!validation?.nextQuestion) {
    return {};
  }

  console.log("❓ Asking:", validation.nextQuestion);
  const userResponse = interrupt(validation.nextQuestion);

  return {
    messages: [userResponse as string],
  };
}

export async function confirmProfile(state: AgentState) {
  const { profile, messages } = state;

  if (!profile) {
    console.error("❌ No profile in state!");
    return { isComplete: false };
  }

  // Check if we already have a user response (from a resume)
  const lastMessage = messages[messages.length - 1];
  let userResponse: string;

  // If this is the first run, show summary and interrupt
  // If resuming, skip the summary generation
  if (!lastMessage || lastMessage.includes("Profile Summary")) {
    // Generate summary only on first run
    const summaryResponse = await openAiLLM.invoke([
      {
        role: "system",
        content: `Create a clear, professional summary of the user's profile for confirmation.

Use markdown formatting and emojis. Make it easy to read.

IMPORTANT: 
- If profileLinks are present, display them in a nice format under a "🔗 Profile Links" section
- Show achievements under "🏆 Achievements" if present
- Show education under "🎓 Education" if present
- Format work experience nicely with bullet points

End with: "Does this look correct? Reply 'yes' to save, or tell me what needs to be corrected."`,
      },
      {
        role: "user",
        content: JSON.stringify(profile, null, 2),
      },
    ]);

    const summary = summaryResponse.content as string;
    console.log("📋 Showing summary to user");

    // Single interrupt
    userResponse = interrupt(summary) as string;
  } else {
    // We're resuming, use the last message as the response
    userResponse = lastMessage;
  }

  // Interpret user's response
  const interpretLLM = openAiLLM.withStructuredOutput(
    z.object({
      isConfirming: z.boolean(),
      correction: z.string().optional(),
    })
  );

  const interpretation = await interpretLLM.invoke([
    {
      role: "system",
      content: `Interpret if user is confirming or wants to correct something.

Examples of confirming: "yes", "looks good", "correct", "perfect", "yep", "ok"
Examples of correcting: "change email to...", "actually I worked at...", "no, my name is..."

Set isConfirming = true if they're confirming.
Set isConfirming = false if they want changes.`,
    },
    {
      role: "user",
      content: `User said: "${userResponse}"`,
    },
  ]);

  if (!interpretation.isConfirming) {
    console.log("✏️ User wants to correct:", interpretation.correction);

    return {
      messages: [...messages, interpretation.correction || userResponse],
      isComplete: false,
    };
  }

  console.log("✅ User confirmed");
  return { isComplete: true };
}

// Node 5: Save to database
export async function saveProfile(state: AgentState) {
  const { userId, profile } = state;

  if (!profile) {
    console.error("❌ No profile to save!");
    return {
      messages: ["❌ Error: No profile data found. Please try again."],
    };
  }

  try {
    // Import profile repository
    const { profileRepository } = await import(
      "../../repository/profile-repo.ts"
    );

    // Save to database
    await profileRepository.saveCompleteProfile(userId, profile);

    console.log(`💾 Successfully saved profile for user ${userId}`);

    return {
      messages: [
        "✅ *Profile saved successfully!*\n\n" +
          "Your information has been stored. You can now:\n" +
          "• Use `/resume <job_description>` to generate a tailored resume\n" +
          "• Use `/addwork` to add more experience\n" +
          "• Use `/profile` to view or update your profile",
      ],
    };
  } catch (error) {
    console.error("❌ Error saving profile:", error);
    return {
      messages: [
        "❌ Sorry, there was an error saving your profile. Please try again or contact support.",
      ],
    };
  }
}
