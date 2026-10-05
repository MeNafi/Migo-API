import Redis from "ioredis";
import config from "../config";

let redis: Redis | null = null;

export const getRedis = () => {
  if (!config.redis_url) return null;
  if (!redis) {
    redis = new Redis(config.redis_url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });
    redis.on("error", (err) => {
      console.error("Redis error:", err.message);
    });
  }
  return redis;
};

export const pingRedis = async () => {
  const client = getRedis();
  if (!client) return { connected: false, message: "REDIS_URL is not configured" };
  try {
    const pong = await client.ping();
    return { connected: pong === "PONG", message: "ok" };
  } catch (error) {
    return { connected: false, message: (error as Error).message };
  }
};
