import { bot } from "./bot/index.ts";
import { User, ResumeGeneration, UserProfile } from "./models/index.ts";

const start = async () => {
  await bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot @${botInfo.username} is running!`);
    },
  });
};

start();
