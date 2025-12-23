import { Bot, session, Context, type SessionFlavor } from "grammy";
import {
  conversations,
  type ConversationFlavor,
} from "@grammyjs/conversations";
import { RedisAdapter } from "@grammyjs/storage-redis";
import { redis } from "../config/redis.ts";
import { handleStart } from "./handlers/handleStart.ts";
import { PDFDeliveryService } from "../services/pdfService.ts";

/**
 * bot initialisation
 */
export const bot = new Bot<
  Context & SessionFlavor<{}> & ConversationFlavor<Context & SessionFlavor<{}>>
>(process.env.TELEGRAM_BOT_TOKEN!);

new PDFDeliveryService(bot);

interface SessionData {
  threadId?: string | undefined;
}

export type MyContext = Context &
  SessionFlavor<SessionData> &
  ConversationFlavor<Context & SessionFlavor<SessionData>>;

bot.use(
  session({
    initial: () => ({}),
    storage: new RedisAdapter({
      autoParseDates: true,
      instance: redis,
    }),
  })
);

bot.use(conversations());

// ✅ Add global cooldown middleware (10 seconds between messages)
bot.use(async (ctx, next) => {
  if (!ctx.from || !ctx.message?.text) return next();

  const userId = ctx.from.id;
  const cooldownKey = `cooldown:global:${userId}`;

  // Check if user is in cooldown
  const ttl = await redis.ttl(cooldownKey);

  if (ttl > 0) {
    // ✅ Silently ignore OR send a single warning
    console.log(`⏳ User ${userId} is in cooldown (${ttl}s remaining)`);

    const lastWarning = await redis.get(`${cooldownKey}:warned`);
    if (!lastWarning) {
      await redis.setex(`${cooldownKey}:warned`, ttl, "1");
      await ctx.reply(
        `⏳ Please wait ${ttl} seconds before sending another message.`,
        { reply_to_message_id: ctx.message.message_id }
      );
    }
    return;
  }

  // Process message
  await next();

  // ✅ Set 10-second cooldown after processing
  await redis.setex(cooldownKey, 7, "1");
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error for ${ctx.from?.id}:`, err.error);
  ctx.reply("Sorry, something went wrong. Please try again.").catch(() => {});
});
