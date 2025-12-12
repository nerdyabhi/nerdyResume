import { Redis } from "ioredis";

export const redis = new Redis(process.env.UPSTASH_REDIS_URL!, {
  tls: {
    rejectUnauthorized: false,
  },
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log(" Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});
