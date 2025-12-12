import { Redis } from "ioredis";
import "dotenv/config";

// For Upstash, use the REST URL with proper configuration
const redisUrl = process.env.REDIS_REST_URL!;

// Parse the URL to get host and port
const url = new URL(redisUrl);

export const redis = new Redis({
  host: url.hostname,
  port: parseInt(url.port || "6379"),
  password: process.env.REDIS_REST_TOKEN!,
  tls: {
    rejectUnauthorized: false,
  },
  connectTimeout: 10000,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
});

// Connect explicitly
redis.connect().catch((err) => {
  console.error("❌ Failed to connect to Redis:", err);
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redis.on("close", () => {
  console.log("⚠️  Redis connection closed");
});
