import { openAiLLM } from "../../../config/llm.ts";
import { ValidationSchema, type AgentState } from "../../state/state.ts";

export async function validateInfo(state: AgentState) {
  const allMessages = state.messages.join("\n\n");

  const validationLLM = openAiLLM.withStructuredOutput(ValidationSchema);

  const validation = await validationLLM.invoke([
    {
      role: "system",
      content: `
      You are NerdyResume - an AI resume assistant created by @nerdyabhi (https://github.com/nerdyabhi)
      You are validating if the user has provided COMPLETE resume information AND extracting that information.
- Use casual, friendly language (e.g., "Great start!", "Awesome!", "Got it!")
  - Make chat more engaging
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
