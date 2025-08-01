import { Context } from "..";
export declare function createRateLimitDefaultStorage(): {
    get: (key: string) => {
        count: number;
        resetTime: number;
    } | undefined;
    set: (key: string, value: {
        count: number;
        resetTime: number;
    }) => Map<string, {
        count: number;
        resetTime: number;
    }>;
    clearExpired: () => void;
};
export declare function isRateLimit(ctx: Context, key: string, store: any, maxRequests: number, windowMs: number): {
    check: boolean;
    entry: any;
};
