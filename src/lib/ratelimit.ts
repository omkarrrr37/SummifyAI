import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// DEV: 50 requests/day so testing doesn't hit the wall.
// PRODUCTION: Change back to Ratelimit.slidingWindow(5, "24 h")
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "24 h"),
  analytics: true,
  prefix: "@upstash/ratelimit/summify",
});
