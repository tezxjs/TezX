
// Helper function for default storage
export function createRateLimitDefaultStorage() {
  const store = new Map<string, { count: number; resetTime: number }>();
  return {
    get: (key: string) => store.get(key),
    set: (key: string, value: { count: number; resetTime: number }) =>
      store.set(key, value),
    clearExpired: () => {
      const now = Date.now();
      for (const [key, entry] of store.entries()) {
        if (now >= entry.resetTime) {
          store.delete(key);
        }
      }
    },
  };
}

export function isRateLimit(
  key: string,
  store: any,
  maxRequests: number,
  windowMs: number,
) {
  store?.clearExpired();
  const now = Date.now();
  let entry = store.get(key) || { count: 0, resetTime: now + windowMs };
  if (now < entry.resetTime) {
    entry.count++;
    if (entry.count > maxRequests) {
      return {
        check: true,
        entry: entry,
      };
    }
  } else {
    entry = { count: 1, resetTime: now + windowMs };
  }
  store.set(key, entry);
  return {
    check: false,
    entry: entry,
  };
}
