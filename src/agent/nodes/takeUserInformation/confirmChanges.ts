import { interrupt } from "@langchain/langgraph";
import { openAiLLM } from "../../../config/llm.ts";
import type { AgentState } from "../../state/state.ts";
import z from "zod";

export async function confirmChanges(state: AgentState) {
  const { profile } = state;

  if (!profile) {
    console.error("❌ No profile in state!");
    return { isComplete: false };
  }

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

  const userResponse = interrupt(summary) as string;
  console.log("📨 User responded:", userResponse);

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

  console.log("🔍 Interpretation:", interpretation);

  if (!interpretation.isConfirming) {
    console.log("✏️ User wants to correct:", interpretation.correction);

    return {
      messages: [...state.messages, interpretation.correction || userResponse],
      isComplete: false,
    };
  }

  console.log("✅ User confirmed - moving to save");
  return { isComplete: true };
}
