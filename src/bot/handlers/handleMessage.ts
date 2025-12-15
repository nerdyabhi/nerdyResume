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
    let isCallingTool = false;

    for await (const event of stream) {
      console.log("📦 Event:", Object.keys(event));

      // Agent is generating a response or calling a tool
      if (event.agent?.messages) {
        const messagesArray = Array.isArray(event.agent.messages)
          ? event.agent.messages
          : Object.values(event.agent.messages);
        const lastMsg = messagesArray[messagesArray.length - 1];

        // Check if it's a text response
        if (lastMsg.content && typeof lastMsg.content === "string") {
          agentResponse = lastMsg.content;
        }

        // Check if agent is calling save_profile tool
        if (lastMsg.tool_calls?.length > 0) {
          const saveToolCall = lastMsg.tool_calls.find(
            (tc: any) => tc.name === "save_profile"
          );

          if (saveToolCall) {
            isCallingTool = true;
            await ctx.reply("💾 Saving your profile...");
            console.log(
              "🔧 Agent calling save_profile with:",
              saveToolCall.args
            );

            // CRITICAL: Inject userId into tool args if not present
            // The agent doesn't know the userId, we need to provide it
            saveToolCall.args.userId = userId;
          }
        }
      }

      // Tool has finished executing
      if (event.tools?.messages) {
        const messagesArray = Array.isArray(event.tools.messages)
          ? event.tools.messages
          : Object.values(event.tools.messages);
        const toolResult = messagesArray[0].content as string;

        console.log("✅ Tool result:", toolResult);

        // Send the success message
        await ctx.reply(toolResult, { parse_mode: "Markdown" });

        // Clear thread after successful save
        ctx.session.threadId = undefined;
        return;
      }
    }

    if (agentResponse) {
      // 1. Reply immediately
      await ctx.reply(agentResponse, { parse_mode: "Markdown" });

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

    // If we got a text response (not a tool call), send it
    if (agentResponse && !isCallingTool) {
      await ctx.reply(agentResponse, { parse_mode: "Markdown" });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    await ctx.reply("Sorry, something went wrong. Please try again.");
  }
}
