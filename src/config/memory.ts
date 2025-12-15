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

  // graphStore: {
  //   provider: "neo4j",
  //   config: {
  //     url: process.env.NEO4J_CONNECTION_URI!,
  //     username: process.env.NEO4J_USERNAME!,
  //     password: process.env.NEO4J_PASSWORD!,
  //     database: "neo4j",
  //   },
  // },
  // enableGraph: true,
  embedder: {
    provider: "azure_openai",
    config: {
      model: "text-embedding-3-large",
      apiKey: process.env.AZURE_EMBEDDINGS_KEY!,

      modelProperties: {
        endpoint: process.env.AZURE_EMBEDDINGS_ENDPOINT!,
        deployment: process.env.AZURE_EMBEDDINGS_DEPLOYMENT!,
        apiVersion: "2024-12-01-preview",
      },
    },
  },
  vectorStore: {
    provider: "qdrant",
    config: {
      apiKey: process.env.QDRANT_API_KEY!,
      collectionName: "memories",
      url: process.env.QDRANT_ENDPOINT!,
    },
  },
  telemetry: false,
  disableHistory: true,
  version: "v1.1",
};

export const mem0 = new Memory(config);
