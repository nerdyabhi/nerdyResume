import { bot } from "./bot.ts";
import { handleDocument } from "./handlers/handleDocument.ts";
import { handleMessage } from "./handlers/handleMessage.ts";
import { handleStart } from "./handlers/handleStart.ts";

bot.command("start", handleStart);
bot.on("message:text", handleMessage);
bot.on("message:document", handleDocument);

export { bot };
