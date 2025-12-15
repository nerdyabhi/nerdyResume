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

    let statusMessage = null; // Track the status message for editing

    for await (const event of stream) {
      console.log("📦 Event:", Object.keys(event));

      // Update status based on which node is running
      if (event.validate && ctx.chat) {
        if (!statusMessage) {
          statusMessage = await ctx.reply("🔍 Validating your resume...");
        } else {
          try {
            await ctx.api.editMessageText(
              ctx.chat.id,
              statusMessage.message_id,
              "Validating your Information..."
            );
          } catch (error) {
            console.error("Edit failed:", error);
          }
        }
      }

      if (event.ask && ctx.chat) {
        if (!statusMessage) {
          statusMessage = await ctx.reply("❓ Analyzing information...");
        } else {
          try {
            await ctx.api.editMessageText(
              ctx.chat.id,
              statusMessage.message_id,
              "❓ Analyzing information..."
            );
          } catch (error) {
            console.error("Edit failed:", error);
          }
        }
      }

      if (event.confirm && ctx.chat) {
        if (!statusMessage) {
          statusMessage = await ctx.reply("📋 Generating summary...");
        } else {
          try {
            await ctx.api.editMessageText(
              ctx.chat.id,
              statusMessage.message_id,
              " Generating Profile summary..."
            );
          } catch (error) {
            console.error("Edit failed:", error);
          }
        }
      }

      if (event.save && ctx.chat) {
        if (!statusMessage) {
          statusMessage = await ctx.reply("💾 Saving your profile...");
        } else {
          try {
            await ctx.api.editMessageText(
              ctx.chat.id,
              statusMessage.message_id,
              "💾 Saving your profile..."
            );
          } catch (error) {
            console.error("Edit failed:", error);
          }
        }
      }

      // Handle interrupts
      if (
        "__interrupt__" in event &&
        event.__interrupt__ &&
        Array.isArray(event.__interrupt__)
      ) {
        // Delete status message before showing interrupt
        if (statusMessage && ctx.chat) {
          try {
            await ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id);
            statusMessage = null;
          } catch (error) {
            console.error("Delete failed:", error);
          }
        }

        for (const interruptData of event.__interrupt__) {
          console.log(
            "⏸️ Interrupt value:",
            interruptData.value.substring(0, 100)
          );
          await ctx.reply(interruptData.value, { parse_mode: "Markdown" });
        }
        continue;
      }

      // Handle save completion
      if (event.save) {
        const message = event.save.messages?.[0];
        if (message) {
          // Delete status message
          if (statusMessage && ctx.chat) {
            try {
              await ctx.api.deleteMessage(
                ctx.chat.id,
                statusMessage.message_id
              );
              statusMessage = null;
            } catch (error) {
              console.error("Delete failed:", error);
            }
          }

          // Send final success message
          await ctx.reply(message, { parse_mode: "Markdown" });
          ctx.session.threadId = undefined;
        }
      }
    }

    // Clean up status message if stream ends without save
    if (statusMessage && ctx.chat) {
      try {
        await ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id);
      } catch (error) {
        console.error("Cleanup delete failed:", error);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    await ctx.reply("Sorry, something went wrong. Please try again.");
  }
}
