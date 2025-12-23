import { Context } from "grammy";
import { userRepository } from "../../repository/user-repo.ts";

export async function handleStart(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    const username = ctx.from?.username || null;
    const firstName = ctx.from?.first_name || "there";
    const lastName = ctx.from?.last_name || null;

    if (!telegramId) {
      await ctx.reply("Unable to identify user. Please try again.");
      return;
    }

    await userRepository.createOrUpdate({
      telegramId,
      username,
      firstName,
      lastName,
    });

    console.log(`Updated user : ${firstName} ${lastName} in db`);

    await ctx.reply(
      `🎯 *Welcome to NerdyResume, ${firstName}!*

I'm an AI resume assistant — you can *talk in natural language* and I'll handle the rest:

• Ask things like:
  • \`"Create a SWE resume from my profile."\`
  • \`"Tailor my resume for an SDE-1 role at Amazon."\`
  • \`"Rewrite my work at ISRO with better metrics."\`

🧠 *What I can do for you*
• Generate ATS-friendly resumes in multiple templates  
• Rewrite or improve bullets with impact + metrics  
• Tailor your resume to a specific job description  
• Suggest missing skills, projects, and phrasing

🚦 *Rate limits & usage*
To keep things fast and stable:
• Please avoid sending more than *1–2 requests per second* in this chat  
• Heavy generation (full resumes, big rewrites) may take a few seconds  

You can start *right now* by sending a message like:  
\`"Help me create a resume for a backend engineer internship."\``,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Error in /start:", error);
    await ctx.reply("Something went wrong. Please try again.");
  }
}
