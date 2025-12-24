import { type MyContext } from "../bot.js";
import { redis } from "../../config/redis.js";
import { resumeQueue } from "../../worker/resume-worker.js";

export async function handleMessage(ctx: MyContext) {
  if (!ctx.message?.text || !ctx.from) return;

  const userId = ctx.from.id;
  const userMessage = ctx.message.text;
  if (!ctx.chat) return;
  const chatId = ctx.chat.id;

  // Rate limiting check
  const cooldownKey = `cooldown:messages:${userId}`;
  const cooldownTTL = await redis.ttl(cooldownKey);

  if (cooldownTTL > 0) {
    return;
  }

  const key = `ratelimit:messages:${userId}`;
  const limit = 70;
  const window = 60 * 60;
  const count = await redis.get(key);
  const current = count ? parseInt(count) : 0;

  if (current >= limit) {
    await redis.setex(cooldownKey, 60, "1");
    await ctx.reply("⏳ Rate limit exceeded. Please wait a minute.");
    return;
  }

  const newCount = await redis.incr(key);
  if (newCount === 1) {
    await redis.expire(key, window);
  }

  let threadId = ctx.session.threadId;
  if (!threadId) {
    threadId = `user_${userId}`;
    ctx.session.threadId = threadId;
  }

  await resumeQueue.add(
    "process-message",
    {
      userId,
      userMessage,
      threadId,
      chatId,
    },
    {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
}
