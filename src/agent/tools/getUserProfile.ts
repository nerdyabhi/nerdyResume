// src/agent/tools/get-user-profile-tool.js
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { profileRepository } from "../../repository/profile-repo.js";

export const getUserProfileTool = tool(
  async (_, config) => {
    const userId = config?.configurable?.userId as number;

    if (!userId) {
      return "Error: User ID not available";
    }

    try {
      const profileData = await profileRepository.getFullProfile(userId);

      if (!profileData) {
        return "No profile found. User hasn't created a profile yet. Ask them to provide their information to create one.";
      }

      return profileData.profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return "Error retrieving profile. Please try again.";
    }
  },
  {
    name: "get_user_profile",
    description: `Retrieve the user's complete profile information from the database.

Use this tool when:
- User asks "what's my profile?", "show my resume", "what do you know about me?"
- You need to see what information the user has already provided
- User wants to update specific parts of their profile (check what exists first)
- User asks about their work experience, skills, projects, or education
- You need to verify if profile exists before suggesting actions

This returns comprehensive profile data including work experience, skills, education, projects, achievements, and profile links.`,
    schema: z.object({}), //
  }
);
