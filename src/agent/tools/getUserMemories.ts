// src/agent/tools/get-user-memories-tool.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { mem0 } from "../../config/memory.ts";

export const getUserMemoriesTool = tool(
  async ({ query, limit }, config) => {
    const userId = config?.configurable?.userId as number;

    if (!userId) {
      return JSON.stringify({
        error: "User ID not available",
        memories: [],
      });
    }

    try {
      console.log(`🔍 Searching memories for user ${userId}: "${query}"`);

      const response = await mem0.search(query, {
        userId: userId.toString(),
        limit: limit || 5,
      });

      const results = response?.results || response || [];

      if (!results || results.length === 0) {
        return JSON.stringify({
          count: 0,
          memories: [],
          note: "No memories found for this query. User hasn't mentioned this before.",
        });
      }

      // Return ONLY structured data - no formatting
      const memories = results.map((result: any) => ({
        text: result.memory || result.text || result.content,
        score: result.score,
        metadata: result.metadata || {},
      }));

      return JSON.stringify({
        count: memories.length,
        memories: memories,
        // Don't include pre-formatted summaries
      });
    } catch (error) {
      console.error("Error searching memories:", error);
      return JSON.stringify({
        error: "Failed to search memories",
        memories: [],
      });
    }
  },
  {
    name: "get_user_memories",
    description: `Search user's conversation history and memories. 

CRITICAL: This tool returns RAW DATA as JSON. You MUST:
1. Parse the JSON response
2. Interpret the memories array
3. Formulate a NATURAL, CONVERSATIONAL response
4. NEVER show the raw JSON or numbered lists to the user

Example:
Tool returns: {"count": 2, "memories": [{"text": "likes pizza"}, {"text": "is vegan"}]}
You say: "I remember you mentioned you like pizza and you're vegan! 🍕🌱"

NOT: "Found 2 memories: 1. likes pizza 2. is vegan"

Use when user asks about their history or references past conversations.`,
    schema: z.object({
      query: z
        .string()
        .describe(
          "Search query for memories (e.g., 'food preferences', 'work background')"
        ),
      limit: z
        .number()
        .optional()
        .default(5)
        .describe("Max memories to return (default: 5)"),
    }),
  }
);
