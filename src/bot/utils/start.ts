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

    // console.dir(ctx, { depth: null });

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

    // Welcome message
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

// src/bot/handlers/message-handler.ts

export async function handleMessage(ctx: MyContext) {
  if (!ctx.message?.text || !ctx.from) return;

  const userId = ctx.from.id;
  const userMessage = ctx.message.text;

  let threadId = ctx.session.threadId;
  if (!threadId) {
    threadId = `user_${userId}`;
    ctx.session.threadId = threadId;
    console.log(`🆕 New conversation thread: ${threadId}`);
  }

  const config = {
    configurable: { thread_id: threadId },
  };

  await ctx.replyWithChatAction("typing");

  try {
    console.log(`📨 [${userId}] "${userMessage}"`);

    // ⭐ Stream agent execution
    const stream = await agent.stream(
      {
        userId,
        messages: [userMessage],
      },
      config
    );

    let hasResponse = false;

    for await (const event of stream) {
      if ("__interrupt__" in event && event.__interrupt__) {
        const interrupts = event.__interrupt__;

        // Ensure interrupts is iterable (array or similar)
        if (Array.isArray(interrupts)) {
          for (const interrupt of interrupts) {
            console.log(`⏸ Interrupt: ${interrupt.value.substring(0, 50)}...`);
            await ctx.reply(interrupt.value);
            hasResponse = true;
          }
        }

        // Graph paused, waiting for user's next message
        return;
      }

      // Handle final messages (profile saved)
      if (event.save?.messages) {
        for (const msg of event.save.messages) {
          console.log("✅ Conversation complete");
          await ctx.reply(msg);
          hasResponse = true;
        }

        // Clear thread after completion
        ctx.session.threadId = undefined;
        return;
      }
    }

    // Fallback
    if (!hasResponse) {
      await ctx.reply("Processing your information...");
    }
  } catch (error) {
    console.error("❌ Agent error:", error);
    await ctx.reply(
      "Sorry, something went wrong. Please try /start to restart."
    );
    ctx.session.threadId = undefined;
  }
}
