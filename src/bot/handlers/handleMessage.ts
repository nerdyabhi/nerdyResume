import { type MyContext } from "../bot.ts";
import { agent } from "../../agent/index.ts";
import { HumanMessage } from "@langchain/core/messages";
import { mem0 } from "../../config/memory.ts";
import { InputFile } from "grammy";

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
    let pdfData: { buffer: Buffer; fileName: string } | null = null;

    console.log("🔄 Starting stream loop...");

    for await (const event of stream) {
      console.log("📦 Event:", Object.keys(event));

      // ----- agent messages (LLM side) -----
      if (event.agent?.messages) {
        const messagesArray = Array.isArray(event.agent.messages)
          ? event.agent.messages
          : Object.values(event.agent.messages);
        const lastMsg = messagesArray[messagesArray.length - 1];

        if (lastMsg.content && typeof lastMsg.content === "string") {
          agentResponse = lastMsg.content;
          shouldSaveMemory = true;
        }

        // Tool calls
        if (lastMsg.tool_calls?.length > 0) {
          for (const toolCall of lastMsg.tool_calls) {
            // save_profile tool
            if (toolCall.name === "save_profile") {
              await ctx.reply("💾 Saving your profile...");
              console.log("🔧 Agent calling save_profile with:", toolCall.args);
              toolCall.args.userId = userId;
              profileSaveSuccess = true;
            }

            // generate_resume_pdf tool
            if (toolCall.name === "generate_resume_pdf") {
              await ctx.reply(
                "📄 Generating your tailored resume... This may take 30–60 seconds."
              );
              console.log(
                "🔧 Agent calling generate_resume_pdf with JD length:",
                toolCall.args.jobDescription?.length
              );
            }
          }
        }
      }

      // ----- tool results -----
      if (event.tools?.messages) {
        console.log("🛠 Processing tool results...");
        const toolMessagesArray = Array.isArray(event.tools.messages)
          ? event.tools.messages
          : Object.values(event.tools.messages);

        console.log("Tool messages count:", toolMessagesArray.length);

        for (const toolMsg of toolMessagesArray) {
          console.log(
            "🛠 Tool message content (first 100 chars):",
            String(toolMsg.content).slice(0, 100)
          );

          try {
            const result = JSON.parse(String(toolMsg.content));

            if (result && result.success && result.pdfData && result.fileName) {
              const buffer = Buffer.from(result.pdfData, "base64");
              console.log("✅ Resume PDF ready, length:", buffer.length);

              pdfData = {
                buffer,
                fileName: result.fileName,
              };
              console.log("✅ pdfData set:", {
                len: pdfData.buffer.length,
                name: pdfData.fileName,
              });

              console.log("Sending PDF with length:", pdfData.buffer.length);

              await ctx.replyWithDocument(
                new InputFile(pdfData.buffer, pdfData.fileName),
                {
                  caption: "✅ Your tailored resume is ready!",
                }
              );

              console.log(`📤 Sent resume PDF to user ${userId}`);
            }
          } catch (err) {
            console.error("Failed to parse tool result:", err);
          }
        }
      }
    }

    console.log("🔄 Stream loop completed");

    // ----- send text reply -----
    if (agentResponse) {
      console.log("Sending agent response...");
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

    console.log(
      "Final pdfData check:",
      pdfData ? { len: pdfData.buffer.length, name: pdfData.fileName } : null
    );
  } catch (error) {
    console.error("❌ Main error:", error);
    await ctx.reply("Sorry, something went wrong. Please try again.");
  }
}
