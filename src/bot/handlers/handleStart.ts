import { Context } from "grammy";
import { userRepository } from "../../repository/user-repo.js";

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

    You can *talk in natural language* and I'll handle the rest.


🪜 *How to use this bot*
1. First, *upload your resume as a PDF* or share your information in text  
   (education, experience, projects, skills, links, etc.)  
2. Then *paste the job description* you’re targeting  
3. I'll generate a *tailored, ATS-friendly resume* customized for that role  


🧠 *What I can do for you*
• Generate clean, professional resumes in multiple templates  
• Rewrite or improve bullets with better impact and metrics  
• Align your resume tightly to a specific job description  
• Suggest missing skills, projects, and phrasing to stand out  


⭐ *Support the project*
If you find this useful, don’t forget to *star us on GitHub*:  
https://github.com/nerdyabhi/nerdyResume


You can start *right now* by uploading your resume PDF or sending your details, then pasting a job description and saying:  
\`"Generate a tailored resume for this job."\``,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Error in /start:", error);
    await ctx.reply("Something went wrong. Please try again.");
  }
}
