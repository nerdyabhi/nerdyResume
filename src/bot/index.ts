import { bot } from "./bot.ts";
import { handleStart } from "./utils/start.ts";

bot.command("start", handleStart);

export { bot };
