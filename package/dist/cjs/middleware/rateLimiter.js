"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
/**
 * 🚦 Rate limiting middleware for request throttling
 *
 * Enforces maximum request limits per client with sliding window.
 * Currently supports in-memory storage only (Redis coming soon).
 *
 * @param {RateLimiterOptions} options - Configuration
 * @returns {Middleware} Middleware function
 *
 * @example
 * // Basic rate limiting (100 requests/minute)
 * app.use(rateLimiter({
 *   maxRequests: 100,
 *   windowMs: 60_000
 * }));
 *
 * // Custom client identification
 * app.use(rateLimiter({
 *   maxRequests: 10,
 *   windowMs: 10_000,
 *   keyGenerator: (ctx) => ctx.user?.id || ctx.ip
 * }));
 */
const rateLimiter = (options) => {
    const { maxRequests, windowMs, keyGenerator = (ctx) => `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`, 
    // storage = "memory",
    // redisClient,
    onError = (ctx, retryAfter, error) => {
        ctx.setStatus = 429; // Too Many Requests
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }, } = options;
    // if (storage === "redis" && !redisClient) {
    //     throw new Error("Redis client is required when using 'redis' as the storage backend.");
    // }
    const memoryStore = new Map();
    return async (ctx, next) => {
        // Generate a unique key for the client
        const key = keyGenerator(ctx);
        let requestCount;
        let resetTime;
        // if (storage === "memory") {
        // Clean up expired keys before processing the request
        for (const [key, entry] of memoryStore.entries()) {
            if (Date.now() >= entry.resetTime) {
                memoryStore.delete(key);
            }
        }
        //     // In-memory storage logic
        const entry = memoryStore.get(key);
        if (entry && Date.now() < entry.resetTime) {
            requestCount = entry.count + 1;
            resetTime = entry.resetTime;
        }
        else {
            requestCount = 1;
            console.log(45354);
            resetTime = Date.now() + windowMs;
            memoryStore.set(key, { count: requestCount, resetTime });
        }
        // }
        //      else if (storage === "redis") {
        // // Redis storage logic
        // const currentTime = Date.now();
        // const result = await redisClient
        //     .multi()
        //     .incr(key)
        //     .expire(key, timeWindow / 1000)
        //     .exec();
        // requestCount = parseInt(result[0][1], 10);
        // resetTime = currentTime + timeWindow;
        // Optional: Explicitly clean up expired keys (not strictly necessary due to Redis TTL)
        // Uncomment the following block if you want to manually clean up Redis keys
        /*
            const scanResult = await redisClient.scan(0, "MATCH", `${key}*`);
            const keys = scanResult[1];
            for (const key of keys) {
                const ttl = await redisClient.ttl(key);
                if (ttl === -2) { // Key does not exist
                    await redisClient.del(key);
                }
            }
            */
        // // Check if the request count exceeds the limit
        if (requestCount > maxRequests) {
            const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
            ctx.headers.set("Retry-After", retryAfter.toString());
            return onError(ctx, retryAfter, new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`));
        }
        ctx.headers.set("X-RateLimit-Limit", maxRequests.toString());
        ctx.headers.set("X-RateLimit-Remaining", (maxRequests - requestCount).toString());
        ctx.headers.set("X-RateLimit-Reset", resetTime.toString());
        // Proceed to the next middleware
        return await next();
    };
};
exports.rateLimiter = rateLimiter;
