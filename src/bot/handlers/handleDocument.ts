import { type MyContext } from "../bot.ts";
import { agent } from "../../agent/index.ts";
import { HumanMessage } from "@langchain/core/messages";
import { getDocumentProxy, extractText } from "unpdf";

type LinkPair = { text: string; url: string };

async function extractLinkPairs(pdf: any): Promise<LinkPair[]> {
  const pairs: LinkPair[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const [annotations, textContent] = await Promise.all([
      page.getAnnotations(),
      page.getTextContent(),
    ]);

    for (const ann of annotations) {
      if (ann.subtype !== "Link" || !ann.url) continue;

      const [x0, y0, x1, y1] = ann.rect || [0, 0, 0, 0];
      const overlapping: { str: string; x: number; y: number }[] = [];

      for (const item of textContent.items) {
        if (!item.transform || !item.str) continue;
        const [, , , , e, f] = item.transform;
        const w = item.width || 50;
        const h = item.height || 10;

        // Check rectangle overlap
        if (!(e + w < x0 || e > x1 || f + h < y0 || f > y1)) {
          overlapping.push({ str: item.str, x: e, y: f });
        }
      }

      // Sort and join text
      overlapping.sort((a, b) =>
        Math.abs(a.y - b.y) > 2 ? b.y - a.y : a.x - b.x
      );
      const text = overlapping
        .map((o) => o.str.trim())
        .join(" ")
        .trim()
        .slice(0, 100);

      pairs.push({ text: text || ann.url, url: ann.url });
    }
  }

  return pairs;
}

// Extract profile URLs from text (O(n) single pass)
function extractProfileURLs(text: string) {
  const result: { linkedin?: string; github?: string; portfolio?: string } = {};

  for (const match of text.matchAll(/(https?:\/\/[^\s]+)/gi)) {
    const url = match[1] ? match[1].replace(/[,)\]}>]+$/, "") : undefined;

    if (url) {
      if (!result.linkedin && url.includes("linkedin.com")) {
        result.linkedin = url;
      } else if (!result.github && url.includes("github.com")) {
        result.github = url;
      } else if (
        !result.portfolio &&
        !url.includes("linkedin") &&
        !url.includes("github")
      ) {
        result.portfolio = url;
      }

      if (result.linkedin && result.github && result.portfolio) break;
    }
  }

  return result;
}

// Enrich text with structured links
function enrichText(text: string, linkPairs: LinkPair[]) {
  const urls = extractProfileURLs(text);
  const lines = ["--- EXTRACTED PROFILE LINKS ---"];

  if (linkPairs.length) {
    lines.push("\nClickable links:");
    linkPairs.forEach(({ text: t, url }) => lines.push(`• ${t}: ${url}`));
  }

  if (urls.linkedin) lines.push(`• LinkedIn: ${urls.linkedin}`);
  if (urls.github) lines.push(`• GitHub: ${urls.github}`);
  if (urls.portfolio) lines.push(`• Portfolio: ${urls.portfolio}`);

  return lines.length > 1 ? `${text}\n\n${lines.join("\n")}\n` : text;
}

export const handleDocument = async (ctx: MyContext) => {
  if (
    !ctx.message?.document ||
    !ctx.from ||
    ctx.message.document.mime_type !== "application/pdf"
  )
    return;

  const doc = ctx.message.document;

  try {
    // Guards
    if (doc.file_size && doc.file_size > 2 * 1024 * 1024) {
      return await ctx.reply(
        "⚠️ Please send a PDF with less than 4 pages (max 2MB)."
      );
    }

    await ctx.reply("📄 Processing your PDF...");

    // Download
    const file = await ctx.api.getFile(doc.file_id);
    const res = await fetch(
      `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`
    );
    const buffer = Buffer.from(await res.arrayBuffer());

    // Parse (parallel text + links)
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const totalPages = pdf.numPages;

    if (totalPages > 3) {
      return await ctx.reply(
        `❌ Your PDF has ${totalPages} pages. Please send 3 pages or less.`
      );
    }

    const [{ text }, linkPairs] = await Promise.all([
      extractText(pdf, { mergePages: true }),
      extractLinkPairs(pdf),
    ]);

    const extractedText = text.trim();

    if (extractedText.length < 50) {
      return await ctx.reply(
        "⚠️ Could not extract enough text. Ensure it's a text-based PDF."
      );
    }

    // Enrich for agent
    const enrichedText = enrichText(extractedText, linkPairs);
    const urls = extractProfileURLs(extractedText);

    // Preview message
    const preview = extractedText.slice(0, 900) + "....";
    let msg = `✅ Extracted ${totalPages}-page PDF!\n\n`;

    if (linkPairs.length) {
      msg += "🔗 Clickable links:\n";
      linkPairs.forEach(({ text: t, url }) => {
        const label = t.length > 40 ? t.slice(0, 40) + "…" : t;
        msg += `• ${label}\n  → ${url}\n`;
      });
      if (linkPairs.length > 5) msg += `…and ${linkPairs.length - 5} more.\n`;
      msg += "\n";
    }

    if (urls.linkedin || urls.github || urls.portfolio) {
      msg += "🔗 Profile links:\n";
      if (urls.linkedin) msg += `• LinkedIn: ${urls.linkedin}\n`;
      if (urls.github) msg += `• GitHub: ${urls.github}\n`;
      if (urls.portfolio) msg += `• Portfolio: ${urls.portfolio}\n`;
      msg += "\n";
    }

    msg += `📝 Preview:\n${preview}\n\nProcessing your profile now...`;
    await ctx.reply(msg);

    // Agent processing
    const userId = ctx.from.id;
    const config = {
      configurable: {
        thread_id: `user_${userId}`,
        userId: userId.toString(),
      },
    };

    await ctx.replyWithChatAction("typing");

    const stream = await agent.stream(
      { messages: [new HumanMessage(enrichedText)] },
      config
    );
    let agentResponse = "";
    let isCallingTool = false;
    let hasReplied = false;

    for await (const event of stream) {
      if (event.agent?.messages) {
        const msgs = Array.isArray(event.agent.messages)
          ? event.agent.messages
          : Object.values(event.agent.messages);
        const last = msgs[msgs.length - 1];

        if (last.content && typeof last.content === "string") {
          agentResponse = last.content;
        }

        if (
          last.tool_calls?.find((tc: any) => tc.name === "save_profile") &&
          !hasReplied
        ) {
          await ctx.reply("💾 Saving your profile...");
          hasReplied = true;
          isCallingTool = true;
        }
      }

      if (event.tools?.messages) {
        const msgs = Array.isArray(event.tools.messages)
          ? event.tools.messages
          : Object.values(event.tools.messages);
        await ctx.reply(msgs[0].content as string, { parse_mode: "Markdown" });
        ctx.session.threadId = undefined;
        return;
      }
    }

    if (agentResponse && !isCallingTool && !hasReplied) {
      await ctx.reply(agentResponse, { parse_mode: "Markdown" });
    } else if (!hasReplied) {
      await ctx.reply(
        "✅ I've received your resume. Please provide any missing info if needed."
      );
    }
  } catch (error) {
    console.error("❌ PDF error:", error);
    await ctx.reply(
      "❌ Error processing PDF. Try again or send text messages."
    );
  }
};
