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

export async function handleMessage(ctx: MyContext) {
  if (!ctx.message?.text || !ctx.from) return;

  const userId = ctx.from.id;
  const userMessage = ctx.message.text;

  let threadId = ctx.session.threadId;

  if (!threadId) {
    threadId = `user_${userId}`;
    ctx.session.threadId = threadId;
  }

  const config = {
    configurable: { thread_id: threadId },
  };

  await ctx.replyWithChatAction("typing");

  try {
    console.log(`📨 [${userId}]: "${userMessage}"`);

    const stream = await agent.stream(
      { userId, messages: [userMessage] },
      config
    );

    for await (const event of stream) {
      console.log("📦 Event:", Object.keys(event));

      // Handle interrupts - this is where the summary will be shown
      if (
        "__interrupt__" in event &&
        event.__interrupt__ &&
        Array.isArray(event.__interrupt__)
      ) {
        for (const interruptData of event.__interrupt__) {
          console.log(
            "⏸️ Interrupt value:",
            interruptData.value.substring(0, 100)
          );
          await ctx.reply(interruptData.value, { parse_mode: "Markdown" });
        }
        continue;
      }

      if (event.ask) {
        const message = event.ask.messages?.[0];
        if (message) {
          await ctx.reply(message);
        }
      }

      if (event.save) {
        const message = event.save.messages?.[0];
        if (message) {
          await ctx.reply(message, { parse_mode: "Markdown" });
          ctx.session.threadId = undefined; // Clear thread after save
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    await ctx.reply("Sorry, something went wrong. Please try again.");
  }
}
