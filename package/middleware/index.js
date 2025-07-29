import { basicAuth } from "./basicAuth.js";
import { cacheControl } from "./cacheControl.js";
import { cors } from "./cors.js";
import { detectBot } from "./detectBot.js";
import { detectLocale } from "./detectLocale.js";
import { i18n } from "./i18n.js";
import { lazyLoader } from "./lazyLoader.js";
import { logger } from "./logger.js";
import { paginationHandler } from "./pagination.js";
import { poweredBy } from "./powered-by.js";
import { rateLimiter } from "./rateLimiter.js";
import { requestID } from "./request-id.js";
import { requestTimeout } from "./requestTimeout.js";
import { sanitizeHeaders } from "./sanitizeHeader.js";
import { secureHeaders } from "./secureHeaders.js";
import { xssProtection } from "./xssProtection.js";
export * from "./basicAuth.js";
export * from "./cacheControl.js";
export * from "./cors.js";
export { detectBot } from "./detectBot.js";
export * from "./detectLocale.js";
export * from "./i18n.js";
export * from "./lazyLoader.js";
export * from "./logger.js";
export * from "./pagination.js";
export * from "./powered-by.js";
export * from "./rateLimiter.js";
export * from "./request-id.js";
export * from "./requestTimeout.js";
export * from "./sanitizeHeader.js";
export * from "./secureHeaders.js";
export * from "./xssProtection.js";
export default {
    basicAuth,
    cacheControl,
    cors,
    detectBot,
    detectLocale,
    i18n,
    lazyLoader,
    logger,
    paginationHandler,
    poweredBy,
    rateLimiter,
    requestID,
    requestTimeout,
    sanitizeHeaders,
    secureHeaders,
    xssProtection,
};
