import dotenv from "dotenv";
import { Bot } from "grammy";

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN || null;

if (!botToken) {
  throw new Error("No valid token Provided !");
}

const bot = new Bot(botToken);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.on("message", (ctx) => ctx.reply("Got another message!"));

bot.start();
