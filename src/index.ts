import { bot } from "./bot/index.ts";
import { openAiLLM } from "./config/llm.ts";

const start = async () => {
  const ans = await openAiLLM.invoke("capital of india?");
  console.log(ans);
  await bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot @${botInfo.username} is running!`);
    },
  });
};

start();
