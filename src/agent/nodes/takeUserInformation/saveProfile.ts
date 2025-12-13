import { profileRepository } from "../../../repository/profile-repo.ts";
import type { AgentState } from "../../state/state.ts";

export async function saveProfile(state: AgentState) {
  const { userId, profile } = state;

  if (!profile) {
    console.error("❌ No profile to save!");
    return {
      messages: ["❌ Error: No profile data found. Please try again."],
    };
  }

  try {
    await profileRepository.saveCompleteProfile(userId, profile);

    console.log(`💾 Successfully saved profile for user ${userId}`);

    return {
      messages: [
        "✅ *Profile saved successfully!*\n\n" +
          "Your information has been stored. You can now:\n" +
          "• Use `/resume <job_description>` to generate a tailored resume\n" +
          "• Use `/addwork` to add more experience\n" +
          "• Use `/profile` to view or update your profile",
      ],
    };
  } catch (error) {
    console.error("❌ Error saving profile:", error);
    return {
      messages: [
        "❌ Sorry, there was an error saving your profile. Please try again or contact support.",
      ],
    };
  }
}
