import { Memory } from "mem0ai/oss";
import "dotenv/config";
const config = {
  llm: {
    provider: "azure_openai",
    config: {
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      modelProperties: {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
        modelName: process.env.AZURE_OPENAI_DEPLOYMENT!,
        apiVersion: "2024-12-01-preview",
      },
    },
  },
  embedder: {
    provider: "azure_openai",
    config: {
      model: "text-embedding-3-large",
      apiKey: process.env.AZURE_OPENAI_API_KEY!,

      modelProperties: {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
        apiVersion: "2024-12-01-preview",
      },
    },
  },
  vectorStore: {
    provider: "pgvector",
    dbname: "nerdyResume",
    config: {
      connection_string: process.env.PG_CONNECTION_STRING!,
      sslmode: "require",
    },
  },
  telemetry: false,
  disableHistory: true,
  version: "v1.1",
};
export const mem0 = new Memory(config);
