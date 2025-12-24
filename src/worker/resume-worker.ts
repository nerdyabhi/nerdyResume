import { Worker, Queue } from "bullmq";
import { redis } from "../config/redis.js";
import { agent } from "../agent/index.js";
import { HumanMessage } from "@langchain/core/messages";
import { bot } from "../bot/index.js";
import { InputFile } from "grammy";

export const resumeQueue = new Queue("resume-generation", {
  connection: redis,
});

// Create the worker
const resumeWorker = new Worker(
  "resume-generation",
  async (job) => {
    const { userId, userMessage, threadId, chatId } = job.data;

    console.log(`🔄 Processing job ${job.id} for user ${userId}`);

    try {
      const config = {
        configurable: { thread_id: threadId, userId: userId },
      };

      const stream = await agent.stream(
        {
          messages: [new HumanMessage(userMessage)],
        },
        config
      );

      let agentResponse = "";
      let pdfData: { buffer: Buffer; fileName: string } | null = null;

      for await (const event of stream) {
        // Agent messages
        if (event.agent?.messages) {
          const messagesArray = Array.isArray(event.agent.messages)
            ? event.agent.messages
            : Object.values(event.agent.messages);
          const lastMsg = messagesArray[messagesArray.length - 1];

          if (lastMsg.content && typeof lastMsg.content === "string") {
            agentResponse = lastMsg.content;
          }

          // Tool calls
          if (lastMsg.tool_calls?.length > 0) {
            for (const toolCall of lastMsg.tool_calls) {
              if (toolCall.name === "save_profile") {
                await bot.api.sendMessage(chatId, "💾 Saving your profile...");
                toolCall.args.userId = userId;
              }
            }
          }
        }

        // Tool results
        if (event.tools?.messages) {
          const toolMessagesArray = Array.isArray(event.tools.messages)
            ? event.tools.messages
            : Object.values(event.tools.messages);

          for (const toolMsg of toolMessagesArray) {
            try {
              let result;

              try {
                result = JSON.parse(toolMsg.content);
              } catch (parseError) {
                console.warn(`⚠️  Non-JSON tool response: ${toolMsg.content}`);
                continue;
              }

              if (result.error === "rate_limit_exceeded") {
                await bot.api.sendMessage(chatId, result.message, {
                  parse_mode: "Markdown",
                });
              }

              if (result?.success && result.pdfData && result.fileName) {
                const buffer = Buffer.from(result.pdfData, "base64");
                pdfData = { buffer, fileName: result.fileName };

                await bot.api.sendDocument(
                  chatId,
                  new InputFile(buffer, result.fileName),
                  {
                    caption: "✅ Your tailored resume is ready!",
                  }
                );

                console.log(`📤 Sent resume PDF to user ${userId}`);
                return { success: true, type: "pdf" };
              }
            } catch (err) {
              console.error("Failed to parse tool result:", err);
            }
          }
        }
      }

      // Send text reply
      if (agentResponse) {
        await bot.api.sendMessage(chatId, agentResponse, {
          parse_mode: "Markdown",
        });
      }

      return { success: true, type: "text" };
    } catch (error) {
      console.error("❌ Worker error:", error);
      await bot.api.sendMessage(
        chatId,
        "Sorry, something went wrong. Please try again."
      );
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

resumeWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

resumeWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

export { resumeWorker };
