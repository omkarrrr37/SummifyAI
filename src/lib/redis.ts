import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn('Upstash Redis environment variables are missing! Rate limiting will not function until they are configured.');
}

export const redis = new Redis({
  url: redisUrl || '',
  token: redisToken || '',
});
