import { type MyContext } from "../bot.ts";
import { agent } from "../../agent/index.ts";

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
