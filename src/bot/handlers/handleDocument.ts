import { type MyContext } from "../bot.ts";
import { agent } from "../../agent/index.ts";
import { PDFParse } from "pdf-parse";
import { HumanMessage } from "@langchain/core/messages";

export const handleDocument = async (ctx: MyContext) => {
  if (!ctx.message || !ctx.from || !ctx.message.document) return;

  const document = ctx.message.document;

  if (document.mime_type === "application/pdf") {
    try {
      // Check file size first (optional pre-check)
      if (document.file_size && document.file_size > 2 * 1024 * 1024) {
        await ctx.reply(
          "⚠️ Please send a PDF with less than 4 pages (max 2MB)."
        );
        return;
      }

      await ctx.reply("📄 Processing your PDF...");

      // Get file from Telegram
      const file = await ctx.api.getFile(document.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;

      // Download PDF
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log("Received buffer");

      // Parse PDF - v2 API uses class instantiation
      const parser = new PDFParse({ data: buffer });

      // Get document info to check page count
      const info = await parser.getInfo();

      console.log("📊 PDF Info:", {
        pages: info.total,
        title: info.info?.Title,
      });

      // Check page count
      if (info.total > 3) {
        await parser.destroy(); // Clean up
        await ctx.reply(
          `❌ Your PDF has ${info.total} pages. Please send a resume with 3 pages or less.`
        );
        return;
      }

      const textResult = await parser.getText();
      await parser.destroy();
      const extractedText = textResult.text.trim();

      if (!extractedText || extractedText.length < 50) {
        await ctx.reply(
          "⚠️ Could not extract enough text from your PDF. Please make sure it's a text-based PDF (not a scanned image)."
        );
        return;
      }
      const previewText =
        extractedText.substring(0, 500) +
        (extractedText.length > 500 ? "..." : "");

      await ctx.reply(
        `✅ Successfully extracted text from your ${info.total}-page PDF!\n\n` +
          `📝 Preview:\n${previewText}\n\n` +
          `I'll now process this information to create your profile.`
      );

      // Feed to your agent
      const userId = ctx.from.id;
      let threadId = `user_${userId}`;

      if (!threadId) throw new Error("ThreadId not found!!!");

      const config = {
        configurable: {
          thread_id: threadId.toString(),
          userId: userId.toString(),
        },
      };

      await ctx.replyWithChatAction("typing");

      try {
        const stream = await agent.stream(
          {
            messages: [new HumanMessage(extractedText)],
          },
          config
        );

        let agentResponse = "";
        let isCallingTool = false;
        let hasReplied = false;

        for await (const event of stream) {
          console.log("📦 Event:", JSON.stringify(Object.keys(event)));
          console.log("📦 Full Event:", JSON.stringify(event, null, 2));

          // Agent is generating a response or calling a tool
          if (event.agent?.messages) {
            const messagesArray = Array.isArray(event.agent.messages)
              ? event.agent.messages
              : Object.values(event.agent.messages);
            const lastMsg = messagesArray[messagesArray.length - 1];

            console.log("🤖 Agent message:", {
              type: lastMsg.constructor.name,
              hasContent: !!lastMsg.content,
              hasToolCalls: !!lastMsg.tool_calls?.length,
            });

            // Check if it's a text response
            if (lastMsg.content && typeof lastMsg.content === "string") {
              agentResponse = lastMsg.content;
              console.log(
                "💬 Agent response:",
                agentResponse.substring(0, 100)
              );
            }

            // Check if agent is calling save_profile tool
            if (lastMsg.tool_calls?.length > 0) {
              const saveToolCall = lastMsg.tool_calls.find(
                (tc: any) => tc.name === "save_profile"
              );

              if (saveToolCall) {
                isCallingTool = true;
                if (!hasReplied) {
                  await ctx.reply("💾 Saving your profile...");
                  hasReplied = true;
                }
                console.log(
                  "🔧 Agent calling save_profile with:",
                  saveToolCall.args
                );
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

        // If we got a text response (not a tool call), send it
        if (agentResponse && !isCallingTool && !hasReplied) {
          await ctx.reply(agentResponse, { parse_mode: "Markdown" });
        } else if (!hasReplied) {
          // Fallback if no response was generated
          await ctx.reply(
            "✅ I've received your resume and will process it. Please provide any missing information if I ask."
          );
        }
      } catch (error) {
        console.error("❌ Agent error:", error);
        await ctx.reply(
          "❌ Sorry, there was an error processing your PDF. Please try again or send your information as text messages."
        );
      }
    } catch (error) {
      console.error("❌ PDF parsing error:", error);
      await ctx.reply(
        "❌ Sorry, there was an error processing your PDF. Please try again or send your information as text messages."
      );
    }
  }
};
