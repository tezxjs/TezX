import { Context, Middleware } from "./src";

type RequestMetricsOptions = {
  /**
   * 📝 Logging function for metrics.
   */
  logMetrics?: (metrics: Record<string, any>) => void;

  /**
   * ⏱️ Enable tracking of response times.
   * @default true
   */
  trackResponsePath?: boolean;
  /**
   * 🔢 Enable tracking of status code distribution.
   * @default true
   */
  trackStatusCodes?: boolean;

  /**
   * 🌟 Add custom metrics dynamically.
   */
  customMetrics?: Record<string, (ctx: Context) => number | string>;
};

/**
 * Middleware to collect and track request metrics dynamically.
 * @param options - Custom options for metrics behavior.
 */
export const requestMetrics = (
  options: RequestMetricsOptions = {},
): Middleware => {
  const {
    logMetrics = (metrics) => console.log("[METRICS]", metrics),
    trackResponsePath = true,
    trackStatusCodes = true,
    customMetrics = {},
  } = options;

  const metricsCollector: {
    totalRequests: number;
    responseTimes: { path: string; delay: string; status: number }[];
    averageResponseTime: string;
    statusCodes: {
      "2xx": number;
      "3xx": number;
      "4xx": number;
      "5xx": number;
    };
    customMetrics: Record<string, any>;
  } = {
    totalRequests: 0,
    responseTimes: [],
    averageResponseTime: "0ms",
    statusCodes: {
      "2xx": 0,
      "3xx": 0,
      "4xx": 0,
      "5xx": 0,
    },
    customMetrics: {} as Record<string, any>,
  };
  return async (ctx, next) => {
    // Increment total requests
    if (metricsCollector?.["totalRequests"] !== undefined) {
      metricsCollector["totalRequests"] += 1;
    }
    // Track response time
    const start = performance.now();

    try {
      await next();
    } finally {
      if (trackResponsePath) {
        const duration = performance.now() - start;
        let responseTime = `${duration.toFixed(2)}ms`;
        metricsCollector.responseTimes.push({
          path: ctx.pathname,
          status: ctx.getStatus,
          delay: responseTime,
        });

        let p = Number(metricsCollector.averageResponseTime) || 0;

        metricsCollector.averageResponseTime = `${(
          (p * (metricsCollector.totalRequests - 1) + duration) /
          metricsCollector.totalRequests
        ).toFixed(2)}ms`;
      }

      if (trackStatusCodes && ctx.getStatus) {
        const range = `${Math.floor(ctx.getStatus / 100)}xx`;
        if (metricsCollector.statusCodes[range] !== undefined) {
          metricsCollector.statusCodes[range]++;
        }
      }

      // Update custom metrics
      for (const [key, metricFn] of Object.entries(customMetrics)) {
        metricsCollector.customMetrics[key] = metricFn(ctx);
      }

      // Log metrics after each request
      logMetrics(metricsCollector);
    }
  };
};
