import { type MyContext } from "../bot.ts";
import { agent } from "../../agent/index.ts";
import { PDFParse } from "pdf-parse";

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

      console.log("Recieved buffer");

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
      const threadId = { configurable: { thread_id: userId.toString() } };

      await agent.invoke(
        {
          messages: [
            `Here's my resume information from PDF:\n\n${extractedText}`,
          ],
          userId,
        },
        threadId
      );
    } catch (error) {
      console.error("❌ Error processing PDF:", error);
      await ctx.reply(
        "❌ Sorry, there was an error processing your PDF. Please try again or send your information as text messages."
      );
    }
  }
};
