import { bot } from "./bot.ts";
import { handleMessage, handleStart } from "./utils/start.ts";

bot.command("start", handleStart);
bot.on("message:text", handleMessage);

export { bot };
