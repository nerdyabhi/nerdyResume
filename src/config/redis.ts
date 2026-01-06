import { Redis } from "ioredis";
import "dotenv/config";

// const redisUrl = process.env.REDIS_REST_URL!;

// const url = new URL(redisUrl);

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;
export const redis = new Redis({
  host: REDIS_HOST!,
  port: parseInt(REDIS_PORT!),
  password: REDIS_PASSWORD!,

  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
});

redis.connect().catch((err: any) => {
  console.error("❌ Failed to connect to Redis:", err.message);
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
