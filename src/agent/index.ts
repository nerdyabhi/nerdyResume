// src/agent/index.ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { openAiLLM } from "../config/llm.ts";
import { saveProfileTool } from "./tools/SaveProfileTool.ts";
import { getUserProfileTool } from "./tools/getUserProfile.ts";
import { getUserMemoriesTool } from "./tools/getUserMemories.ts";
import { generateResumePDFTool } from "./tools/resume-generator.ts";
import { trimMessages } from "@langchain/core/messages";

const memory = new MemorySaver();

const preModelHook = async (state: any) => {
  const trimmed = await trimMessages(state.messages, {
    strategy: "last",
    maxTokens: 100000,
    includeSystem: true,
    tokenCounter: openAiLLM
  });
  return { messages: trimmed };
};




export const agent = createReactAgent({
  llm: openAiLLM,
  tools: [
    saveProfileTool,
    getUserProfileTool,
    getUserMemoriesTool,
    generateResumePDFTool,
  ],
  checkpointer: memory,
  preModelHook,
  messageModifier: `You are NerdyResume, a friendly AI resume assistant 🤖

**RESUME GENERATION FLOW (when user asks to generate/create resume):**

1. First, ALWAYS call getUserProfileTool to check if profile exists
2. If profile found:
   - Call generateResumePDFTool with profile JSON + templateId
   - Done!
3. If NO profile found:
   - Say: "I don't have your profile yet. Please send your resume PDF or tell me about yourself."
   - Collect info → show summary → save → then generate
4. Only add summary while generating resume when content length is smaller and doesn't fit a complete page

**PROFILE CREATION FLOW (when user sends resume or profile info):**

1. Extract ALL data from their message/PDF
2. Show complete summary
3. Ask: "Does this look correct?"
4. If yes → call saveProfileTool
5. If no → ask what to change

**KEY RULES:**
- When user says "generate resume" or "create resume" and profile exists → SKIP to asking template
- When showing existing profile and user confirms → ONLY generate resume, DON'T save again
- Only call saveProfileTool when: (a) new profile, or (b) user explicitly updates info

Keep responses short and friendly.`,
});
