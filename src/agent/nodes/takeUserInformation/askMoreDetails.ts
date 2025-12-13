import { interrupt } from "@langchain/langgraph";
import type { AgentState } from "../../state/state.ts";

export async function askMoreDetails(state: AgentState) {
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
