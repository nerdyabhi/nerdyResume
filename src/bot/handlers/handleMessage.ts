import { type MyContext } from "../bot.ts";
import { agent } from "../../agent/index.ts";
import { HumanMessage } from "@langchain/core/messages";
import { mem0 } from "../../config/memory.ts";

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
    configurable: { thread_id: threadId, userId: userId },
  };

  await ctx.replyWithChatAction("typing");

  try {
    console.log(`📨 [${userId}]: "${userMessage}"`);

    const stream = await agent.stream(
      {
        messages: [new HumanMessage(userMessage)],
      },
      config
    );

    let agentResponse = "";
    let shouldSaveMemory = false;
    let profileSaveSuccess = false;

    for await (const event of stream) {
      console.log("📦 Event:", Object.keys(event));

      if (event.agent?.messages) {
        const messagesArray = Array.isArray(event.agent.messages)
          ? event.agent.messages
          : Object.values(event.agent.messages);
        const lastMsg = messagesArray[messagesArray.length - 1];

        if (lastMsg.content && typeof lastMsg.content === "string") {
          agentResponse = lastMsg.content;
          shouldSaveMemory = true; 
        }

        // Check if agent is calling save_profile tool
        if (lastMsg.tool_calls?.length > 0) {
          const saveToolCall = lastMsg.tool_calls.find(
            (tc: any) => tc.name === "save_profile"
          );

          if (saveToolCall) {
            await ctx.reply("💾 Saving your profile...");
            console.log(
              "🔧 Agent calling save_profile with:",
              saveToolCall.args
            );

            // Inject userId into tool args
            saveToolCall.args.userId = userId;
            profileSaveSuccess = true;
          }
        }
      }
    }

    if (agentResponse) {
      await ctx.reply(agentResponse, { parse_mode: "Markdown" });

      if (shouldSaveMemory && !profileSaveSuccess) {
        mem0
          .add(
            [
              { role: "user", content: userMessage },
              { role: "assistant", content: agentResponse },
            ],
            { userId: userId.toString() } 
          )
          .catch((err) => {
            console.error("Memory save error:", err);
          });
      }

      if (profileSaveSuccess) {
        ctx.session.threadId = undefined;
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    await ctx.reply("Sorry, something went wrong. Please try again.");
  }
}
