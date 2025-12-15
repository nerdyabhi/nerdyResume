// src/agent/tools/save-profile-tool.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { profileRepository } from "../../repository/profile-repo.ts";
import { type RunnableConfig } from "@langchain/core/runnables";

export const saveProfileTool = tool(
  async ({ profile }, config: RunnableConfig) => {
    // Extract userId from the config (passed via thread_id or metadata)
    const userId = config?.configurable?.userId as number;

    if (!userId) {
      throw new Error("userId not found in config");
    }

    await profileRepository.saveCompleteProfile(userId, profile);

    return `✅ *Profile saved successfully!*

Your information has been stored. You can now:
• Use \`/resume <job_description>\` to generate a tailored resume
• Use \`/addwork\` to add more experience
• Use \`/profile\` to view or update your profile`;
  },
  {
    name: "save_profile",
    description: `Save the user's complete profile to the database. 

CRITICAL: ONLY call this tool after:
1. You have collected ALL required information
2. You have shown a formatted summary
3. The user has explicitly confirmed`,
    schema: z.object({
      profile: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string(),
        experience: z
          .array(
            z.object({
              company: z.string(),
              role: z.string(),
              duration: z.string(),
              description: z.string(),
            })
          )
          .optional(),
        education: z
          .array(
            z.object({
              institution: z.string(),
              degree: z.string(),
              duration: z.string(),
              description: z.string().optional(),
            })
          )
          .optional(),
        skills: z.array(z.string()).min(3),
        achievements: z.array(z.string()).optional(),
        profileLinks: z
          .object({
            github: z.string().optional(),
            leetcode: z.string().optional(),
            hackerrank: z.string().optional(),
            huggingface: z.string().optional(),
            geeksforgeeks: z.string().optional(),
            kaggle: z.string().optional(),
            linkedin: z.string().optional(),
            portfolio: z.string().optional(),
          })
          .optional(),
      }),
    }),
  }
);
