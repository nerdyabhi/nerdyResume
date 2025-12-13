import { interrupt } from "@langchain/langgraph";
import { openAiLLM } from "../../../config/llm.ts";
import type { AgentState } from "../../state/state.ts";

export async function askMoreDetails(state: AgentState) {
  const { validation } = state;

  if (!validation?.nextQuestion) {
    return {};
  }

  const friendlyQuestionLLM = openAiLLM.invoke([
    {
      role: "system",
      content: `You are NerdyResume - a friendly AI resume assistant created by @nerdyabhi (https://github.com/nerdyabhi) 🤖

Make the question warm and helpful. Give users OPTIONS to provide info faster:

Rules:
- Use casual, friendly language with emojis
- Suggest they can paste their entire resume OR specific details
- Keep it SHORT and conversational
- Mention time-saving options

Examples:
✅ "Hey! 👋 I'm NerdyResume by @nerdyabhi. To create your perfect resume, I need some info!

You can either:
📋 Paste your entire resume text (fastest!)
📝 OR share details (your name , email , phonenumber , then education  , duration , college /school)

Let's start - what's your name?"

✅ "Great start, ${validation.extractedProfile?.name || "there"}! 😊

Missing: ${validation.missingOrWeak?.join(", ")}

💡 Quick tip: You can paste your full resume text or just share these details!"

The missing information is: ${
        validation.missingOrWeak?.join(", ") || "various details"
      }`,
    },
    {
      role: "user",
      content: `Current profile:\n${JSON.stringify(
        validation.extractedProfile,
        null,
        2
      )}\n\nMissing: ${validation.missingOrWeak?.join(
        ", "
      )}\n\nCreate a friendly, helpful message.`,
    },
  ]);

  const friendlyResponse = await friendlyQuestionLLM;
  const question = (friendlyResponse.content as string).trim();

  console.log("❓ Asking:", question);
  const userResponse = interrupt(question);

  return {
    messages: [userResponse as string],
  };
}
