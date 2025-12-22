import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { profileRepository } from "../../repository/profile-repo.ts";
import { type RunnableConfig } from "@langchain/core/runnables";

export const saveProfileTool = tool(
  async ({ profile }, config: RunnableConfig) => {
    try {
      const userId = config?.configurable?.userId as number;
      if (!userId) {
        return JSON.stringify({
          success: false,
          error: "userId not found in config",
        });
      }

      await profileRepository.saveCompleteProfile(userId, profile);

      return JSON.stringify({
        success: true,
        message: `✅ *Profile saved successfully!*

Saved:
• ${profile.experience?.length || 0} work experiences
• ${profile.projects?.length || 0} projects
• ${profile.activities?.length || 0} activities
• ${profile.achievements?.length || 0} achievements

You can now generate resumes with /resume`,
      });
    } catch (error) {
      console.error("❌ saveProfileTool error:", error);
      return JSON.stringify({
        success: false,
        error: `Failed to save profile: ${(error as Error).message}`,
      });
    }
  },
  {
    name: "save_profile",
    description: `Save user's COMPLETE resume data. Extract EVERYTHING including:
- ALL project URLs (both GitHub repo AND live demo links)
- ALL bullet points and achievements
- ALL profile links (GitHub, LinkedIn, Portfolio, LeetCode, etc.)
Don't make up information - capture exactly what's in the resume.`,
    schema: z.object({
      profile: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        summary: z
          .string()
          .optional()
          .describe("2-3 sentence professional summary"),

        experience: z
          .array(
            z.object({
              company: z.string(),
              role: z.string(),
              duration: z.string(),
              location: z.string().optional(),
              description: z.string().optional().describe("Brief overview"),
              bullets: z
                .array(z.string())
                .describe("ALL achievement bullets from resume"),
              technologies: z.array(z.string()).optional(),
            })
          )
          .optional(),

        education: z
          .array(
            z.object({
              institution: z.string(),
              degree: z.string(),
              duration: z.string(),
              location: z.string().optional(),
              gpa: z.string().optional().describe("e.g., '8.97/10'"),
              coursework: z
                .array(z.string())
                .optional()
                .describe("Relevant courses"),
              description: z.string().optional(),
            })
          )
          .optional(),

        // ✅ FIXED: Added github field for projects
        projects: z
          .array(
            z.object({
              name: z.string(),
              description: z.string().optional(),
              duration: z.string().optional(),
              tech: z.array(z.string()),
              url: z.string().optional().describe("Live demo or project URL"),
              github: z.string().optional().describe("GitHub repository URL"), // ✅ NEW
              bullets: z
                .array(z.string())
                .optional()
                .describe("Project achievement bullets"),
            })
          )
          .optional(),

        activities: z
          .array(
            z.object({
              organization: z.string(),
              role: z.string(),
              duration: z.string().optional(),
              description: z.string().optional(),
            })
          )
          .optional()
          .describe("Club memberships, community activities"),

        skills: z.array(z.string()).min(3),
        achievements: z.array(z.string()).optional(),

        // ✅ ENHANCED: More profile links
        profileLinks: z
          .object({
            github: z.string().optional().describe("GitHub profile URL"),
            linkedin: z.string().optional().describe("LinkedIn profile URL"),
            portfolio: z
              .string()
              .optional()
              .describe("Personal portfolio/website URL"),
            leetcode: z.string().optional().describe("LeetCode profile URL"),
            hackerrank: z
              .string()
              .optional()
              .describe("HackerRank profile URL"),
            twitter: z.string().optional().describe("Twitter/X profile URL"),
          })
          .optional(),
      }),
    }),
  }
);
