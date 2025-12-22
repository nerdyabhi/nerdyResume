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
    maxTokens: 20000,
    includeSystem: true,
    tokenCounter: openAiLLM,
    allowPartial: true,
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

**RESUME GENERATION FLOW:**
1. Call getUserProfileTool to check if profile exists
2. If found → call generateResumePDFTool with templateId
3. If not → collect info, show summary, save, then generate

**PROFILE CREATION FLOW:**
1. Extract ALL data from resume/PDF including:
   - ALL project URLs: BOTH "github" (repo link) AND "url" (live demo)
   - Example: Stratifyy has github.com/VIBHORE-LAB/stratify-backend AND stratifyy.netlify.app
   - ALL profile links: GitHub, LinkedIn, Portfolio, LeetCode, etc.
   - ALL bullet points and achievements
2. Show complete summary with ALL links
3. Ask: "Does this look correct?"
4. If yes → call saveProfileTool with COMPLETE data
5. If no → ask what to change

**CRITICAL:**
- When extracting projects, look for MULTIPLE URLs per project
- GitHub repo links go in "github" field
- Live/demo links go in "url" field
- Profile-level GitHub goes in "profileLinks.github"
- Don't skip or merge URLs

Keep responses short and friendly.`,
});
