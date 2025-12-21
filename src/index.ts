import { agent } from "./agent/index.ts";
import { UserProfile } from "./models/profile-model.ts";
import { bot } from "./bot/index.ts";
import { openAiLLM } from "./config/llm.ts";
import "dotenv/config";


const start = async () => {
  await bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot @${botInfo.username} is running!`);
    },
  });
};

start();
