import { bot } from "./bot.js";
import { handleDocument } from "./handlers/handleDocument.js";
import { handleMessage } from "./handlers/handleMessage.js";
import { handleStart } from "./handlers/handleStart.js";

bot.command("start", handleStart);
bot.on("message:text", handleMessage);
bot.on("message:document", handleDocument);

export { bot };
