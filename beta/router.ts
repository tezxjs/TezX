import { HandlerType, HTTPMethod, RouteMatchResult, RouteRegistry } from "../src/types/index.js"
import { sanitizePathSplit } from "../src/utils/url.js"
import { colorText } from "../src/utils/colors.js"

type Route = {
    path: string;
    pattern: string[];
    method: string;
    handler: HandlerType;
};

export class Params implements RouteRegistry {
    private routes: Route[] = [];

    addRoute<T extends Record<string, any> = any>(
        method: HTTPMethod,
        path: string,
        handler: HandlerType<T>
    ): void {
        const index = this.routes.findIndex((r) => r.path === path && r.method === method);
        if (path.includes("?") || path.includes("*")) {
            console.log(colorText("⚠️ This router only supports static and dynamic ':' parameters.\n Optional parameters ('?') and wildcards ('*') are not supported.", 'red'));
            return;
        }
        if (index === -1) {
            const pattern = sanitizePathSplit(path)
            this.routes.push({
                method,
                pattern: pattern,
                path: path,
                handler
            });
        } else {
            // Optionally replace existing handler
            this.routes[index].handler = handler;
        }
    }
    search(method: HTTPMethod, path: string): RouteMatchResult {
        const segments = path?.split("/")?.filter(Boolean)

        return {
            match: [],
            method: method,
            params: {}
        }
    }
}



export function useParams({
    path,
    urlPattern,
}: {
    path: string;
    urlPattern: string;
}): {
    success: boolean;
    params: Record<string, string>;
} {
    let params: Record<string, string> = {};

    // ১. অতিরিক্ত "/" অপসারণ
    path = path.replace(/^\/+|\/+$/g, "");
    urlPattern = urlPattern.replace(/^\/+|\/+$/g, "");

    const pathSegments = path ? path.split("/") : [];
    const patternSegments = urlPattern ? urlPattern.split("/") : [];

    // যদি path এর length বেশি হয় pattern থেকে, মিল হবে না
    if (pathSegments.length > patternSegments.length) {
        return { success: false, params: {} };
    }

    let pathIndex = 0;

    for (let i = 0; i < patternSegments.length; i++) {
        const patternSegment = patternSegments[i];
        const pathSegment = pathSegments[pathIndex];

        if (!patternSegment) continue;

        // **Static segment:** priority highest
        if (!patternSegment.startsWith(":")) {
            if (patternSegment !== pathSegment) {
                return { success: false, params: {} };
            }
            pathIndex++;
            continue;
        }

        // **Dynamic param**
        const paramName = patternSegment.slice(1);
        if (!/^[a-zA-Z0-9_]+$/.test(paramName)) {
            return { success: false, params: {} };
        }

        if (pathSegment === undefined) {
            return { success: false, params: {} };
        }

        params[paramName] = pathSegment;
        pathIndex++;
    }

    // যদি path পুরো pattern এ না মিলে
    if (pathIndex < pathSegments.length) {
        return { success: false, params: {} };
    }

    return { success: true, params };
}

// console.log(useParams({ path: "/user/123/profile", urlPattern: "/user/:id/profile" }));
// // Returns: { success: true, params: { id: "123" } }

// useParams({ path: "/user/123", urlPattern: "/user/:id/profile" });
// // Returns: { success: false, params: {} }

// useParams({ path: "/user/123/profile", urlPattern: "/user/:id/:section" });
// // Returns: { success: true, params: { id: "123", section: "profile" } }
// report.ts

// Define test routes
const routes = [
    "/",
    "/users",
    "/users/:id",
    "/users/:id/profile",
    "/posts/:postId?",
    "/files/*",
    "/admin/settings",
    "/search/:term?",
    "/categories/:categoryId/products/:productId",
    "/about",
];

// // Add routes

// // Define test paths to match
const testPaths = [
    "/",
    "/users",
    "/users/123",
    "/users/123/profile",
    "/posts",
    "/posts/456",
    "/files/path/to/file.txt",
    "/admin/settings",
    "/search",
    "/search/nodejs",
    "/categories/12/products/999",
    "/notfound",
];

const router = new Params();
let x = function xx() {
    return {
        body: "3453455",
    };
};
// router.addRoute("ALL", "/*", [() => { }]);

// router.addRoute("ALL", "/hello/:h/", [x, x, x, x]);
// router.addRoute("ALL", "/hello/:h/", [x, x, x, x]);

// router.addRoute("GET", "/hello/:h/", [function xx() {
//   return {
//     body: "3453455"
//   }
// }]);
// console.log(router.search('GET', '/hello/f'))
// router.addRoute("GET", "/hello/:h/", [function yy() {
//   return {
//     body: 'ehllo'
//   }
// }]);

for (const route of routes) {
    router.addRoute("GET", route, [() => { }]);
}

// console.log(router)
// Benchmark parameters
const ITERATIONS = 100_000;
const TOTAL_MATCHES = testPaths.length * ITERATIONS;

console.log(
    `Benchmarking ${testPaths.length} routes, ${ITERATIONS} iterations each...`,
);

const start = performance.now();

for (let i = 0; i < ITERATIONS; i++) {
    for (const path of testPaths) {
        router.search("GET", path);
        router.search("ALL", path);
    }
}

const end = performance.now();
const duration = end - start;
function report(name: string, totalOps: number, totalTimeMs: number) {
    const totalTimeNs = totalTimeMs * 1e6; // ms → ns
    const avgNs = totalTimeNs / totalOps;
    const avgUs = avgNs / 1000;
    const opsSec = 1e9 / avgNs;

    console.log(`\n[${name}]`);
    console.log(`  Total ops     : ${totalOps.toLocaleString()}`);
    console.log(`  Total time    : ${totalTimeMs.toFixed(2)} ms`);
    console.log(
        `  Avg per op    : ${avgNs.toFixed(2)} ns (${avgUs.toFixed(6)} µs)`,
    );
    console.log(`  Throughput    : ${opsSec.toFixed(0)} ops/sec`);
}

// Benchmarking 12 routes, 100000 iterations each...

// [RadixRouter.search()]
//   Total ops: 1, 200,000
//   Total time: 170.72 ms
//   Avg per op: 142.26 ns(0.142263 µs)
// Throughput: 7029244 ops / sec
// 🚀 Server running at http://localhost:3002

report("RadixRouter.search()", TOTAL_MATCHES, duration);

console.log(`Completed ${TOTAL_MATCHES} matches in ${duration.toFixed(2)} ms`);
console.log(
    `Average per match: ${((duration / TOTAL_MATCHES) * 1000).toFixed(6)} µs`,
);
