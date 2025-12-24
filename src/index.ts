import { agent } from "./agent/index.js";
import { UserProfile } from "./models/profile-model.js";
import { bot } from "./bot/index.js";
import { openAiLLM } from "./config/llm.js";
import "dotenv/config";
import { PDFDeliveryService } from "./services/pdfService.js";
import { resumeWorker } from "./worker/resume-worker.js"; // Import worker

const start = async () => {
  try {
    console.log("🔧 Starting resume worker...");

    await bot.start({
      onStart: (botInfo) => {
        console.log(`✅ Bot @${botInfo.username} is running!`);
        console.log("✅ Resume worker is processing jobs in background");
      },
    });
  } catch (error) {
    console.error("❌ Failed to start the bot:", error);
  }
};

start();
