import { AzureChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import "dotenv/config";

export const groqLLM = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY!,
});

export const openAiLLM = new AzureChatOpenAI({
  temperature: 0.2,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY!,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT!,
  azureOpenAIApiVersion: "2024-12-01-preview",
});

export const gpt4o = new AzureChatOpenAI({
  temperature: 0,
  azureOpenAIApiKey: process.env.GPT4O_API_KEY!,
  azureOpenAIApiDeploymentName: process.env.GPT4O_DEPLOYMENT!,
  azureOpenAIApiVersion: "2024-12-01-preview",
});
