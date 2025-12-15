import { Context } from "grammy";
import { userRepository } from "../../repository/user-repo.ts";
import { type MyContext } from "../bot.ts";
import { agent } from "../../agent/index.ts";

export async function handleStart(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    const username = ctx.from?.username || null;
    const firstName = ctx.from?.first_name || null;
    const lastName = ctx.from?.last_name || null;

    if (!telegramId) {
      await ctx.reply("Unable to identify user. Please try again.");
      return;
    }

    await userRepository.createOrUpdate({
      telegramId,
      username: username ?? null,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
    });

    console.log(`Updated user : ${firstName} ${lastName} in db`);

    await ctx.reply(
      `🎯 *Welcome to NerdyResume, ${firstName}!*\n\n` +
        `I'm your intelligent resume generator that creates *tailored resumes* for any job opportunity.\n\n` +
        `📋 *Available Commands:*\n` +
        `• \`/profile\` - Set up your personal profile\n` +
        `• \`/addwork\` - Add work experience & projects\n` +
        `• \`/addskills\` - Manage your technical skills\n` +
        `• \`/resume\` - Generate a custom resume\n` +
        `• \`/help\` - View detailed help guide\n\n` +
        `💡 *Tip:* Start by setting up your profile to get the best results!`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Error in /start:", error);
    await ctx.reply("Something went wrong. Please try again.");
  }
}
