import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { openAiLLM } from "../config/llm.ts";
import { getUserProfileTool } from "./tools/getUserProfile.ts";
import { generateResumePDFTool } from "./tools/resume-generator.ts";
import { trimMessages } from "@langchain/core/messages";

const resumeMemory = new MemorySaver();

function preModelHook(state: any) {
  const trimmedMessages = trimMessages(state.messages, {
    strategy: "last",
    maxTokens: 8000,  // Keep only ~8k tokens of history
    startOn: "human",
    includeSystem: true,  // Always keep system message
  });
}

export const resumeAgent = createReactAgent({
  llm: openAiLLM,
  tools: [getUserProfileTool, generateResumePDFTool],
  checkpointer: resumeMemory,
  interruptBefore: ["tools"],
  messageModifier: `You are the ResumeGeneration agent.
- Your ONLY job is to generate tailored resume PDFs.
- Steps:
  1) Use getUserProfileTool to fetch profile.
  2) If incomplete, ask user for missing fields.
  3) When ready, ask: "Pick a template (1-5)" and WAIT.
  4) After templateId is provided, call generateResumePDFTool with userProfile, jobDescription, templateId.
  5) Explain briefly what you did.`,
});
