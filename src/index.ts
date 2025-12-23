import { agent } from "./agent/index.js";
import { UserProfile } from "./models/profile-model.js";
import { bot } from "./bot/index.js";
import { openAiLLM } from "./config/llm.js";
import "dotenv/config";
import { PDFDeliveryService } from "./services/pdfService.js";

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
