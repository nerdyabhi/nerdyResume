import { Bot, session, Context, type SessionFlavor } from "grammy";
import {
  conversations,
  type ConversationFlavor,
} from "@grammyjs/conversations";
import { RedisAdapter } from "@grammyjs/storage-redis";
import { redis } from "../config/redis.ts";
import { handleStart } from "./utils/start.ts";

/**
 * bot initialisation
 */
export const bot = new Bot<
  Context & SessionFlavor<{}> & ConversationFlavor<Context & SessionFlavor<{}>>
>(process.env.TELEGRAM_BOT_TOKEN!);

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

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error for ${ctx.from?.id}:`, err.error);
  ctx.reply("Sorry, something went wrong. Please try again.").catch(() => {});
});
