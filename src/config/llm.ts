// src/config/llm.ts
import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";

export const groqLLM = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY!,
});

export const openAiLLM = new AzureChatOpenAI({
  temperature: 0,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY!,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT!,
  azureOpenAIApiVersion: "2024-12-01-preview",
});
