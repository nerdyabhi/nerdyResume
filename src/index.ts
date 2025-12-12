// import { AzureChatOpenAI } from "@langchain/openai";
// import "dotenv/config";

// const model = new AzureChatOpenAI({
//   azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY!,
//   azureOpenAIApiInstanceName:
//     process.env.AZURE_OPENAI_ENDPOINT?.split("//")[1]?.split(".")[0]!,
//   azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT!,
//   azureOpenAIApiVersion: "2024-02-15-preview",
// });

// const ans = await model.invoke("What is the capital of France?");
// console.log("Ans is : ", ans.content);

import dotenv from "dotenv";
import { Bot } from "grammy";

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  throw new Error("No valid token Provided !");
}

const bot = new Bot(botToken);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.on("message", async (ctx) => {
  const message = ctx.message; // the message object
  console.log("Recieved Message from User ");
  console.dir(message, { depth: null });
  console.log("-----------------");
});

bot.start();
