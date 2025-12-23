import { agent } from "./agent/index.ts";
import { UserProfile } from "./models/profile-model.ts";
import { bot } from "./bot/index.ts";
import { openAiLLM } from "./config/llm.ts";
import "dotenv/config";
import { PDFDeliveryService } from "./services/pdfService.ts";


const start = async () => {
  try {
    await bot.start({
      onStart: (botInfo) => {
        console.log(`✅ Bot @${botInfo.username} is running!`);
      },
    });
  } catch (error) {
    console.error("❌ Failed to start the bot:", error);
  }
};

start();
