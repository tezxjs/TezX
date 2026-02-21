import { HandlerType, HTTPMethod, Middleware, RouteRegistry } from "../src/types/index.js";
import { sanitizePathSplit } from "../src/utils/url.js"
import { colorText } from "../src/utils/colors.js"

type Handlers = Record<HTTPMethod, HandlerType>;

export type TriMiddleware = {
    children?: Record<string, TriMiddleware>;   // Static children
    paramChild?: TriMiddleware;             // :param child
    wildcardChild?: TriMiddleware;          // * or *name child
    handlers?: Handlers;
    pathname: string;
    isParam: boolean;
    paramName?: string;
    isWildcard?: boolean;
    wildcardName?: string;
};
export class Params implements RouteRegistry {
    private routes: TriMiddleware = {
        children: {},
        pathname: "/",
        isParam: false,
    };
    constructor() {
    }

    /**
     * Add a route (supports static > :param > * wildcard priority)
     */
    addRoute<T extends Record<string, any> = any>(
        method: HTTPMethod,
        path: string,
        handler: HandlerType<T>
    ): void {
        if (path.includes("?")) {
            console.log("\x1b[41m%s\x1b[0m", "⚠️ Optional params ('?') are not supported in this router");
            return;
        }

        // Remove leading/trailing slash
        const segments = sanitizePathSplit(path);

        let node = this.routes;

        for (let seg of segments) {
            // Wildcard
            if (seg.startsWith("*")) {
                const wildcardName = seg.length > 1 ? seg.slice(1) : "*";
                if (!node.wildcardChild) {
                    node.wildcardChild = {
                        children: {},
                        pathname: seg,
                        isParam: false,
                        isWildcard: true,
                        wildcardName,
                    };
                }
                node = node.wildcardChild;
                break; // wildcard consumes rest of path
            }

            // Param
            if (seg.startsWith(":")) {
                const paramName = seg.slice(1);
                if (!node.paramChild) {
                    node.paramChild = {
                        children: {},
                        pathname: seg,
                        isParam: true,
                        paramName,
                    };
                }
                node = node.paramChild;
                continue;
            }

            // Static
            if (!node.children) node.children = {};
            if (!node.children[seg]) {
                node.children[seg] = {
                    children: {},
                    pathname: seg,
                    isParam: false,
                };
            }
            node = node.children[seg]!;
        }

        if (!node.handlers) node.handlers = {} as any;
        node.handlers![method] = handler;
        // if (!node.handlers) node.handlers = {};
        // if (!node.handlers[method]) node.handlers[method] = [];
        // node.handlers[method]!.push(...handlers);
    }

    /**
     * Match a path and extract params
     */
    search(path: string, method: HTTPMethod = "GET"): {
        success: boolean;
        params: Record<string, string>;
        handler?: HandlerType;
    } {
        const segments = path?.split("/")?.filter(Boolean)
        const params: Record<string, string> = {};

        let node = this.routes;
        let middlewares = [];


        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];

            // Collect ALL handlers at this node
            if (node.handlers?.ALL) middlewares.push(...node.handlers.ALL);

            // for (let i = 0; i < node?.handlers?.ALL!?.length; i++) {
            //     middlewares.push(node.handlers?.ALL[i]);
            // }
            // Static priority
            if (node.children && node.children[seg]) {
                node = node.children[seg]!;
                continue;
            }

            // Param next
            if (node.paramChild) {
                node = node.paramChild;
                if (node.paramName) params[node.paramName] = seg;
                continue;
            }

            // Wildcard last
            if (node.wildcardChild) {
                node = node.wildcardChild;
                if (node.wildcardName) {
                    params[node.wildcardName] = segments.slice(i).join("/");
                }
                break;
            }

            // No match
            return { success: false, params: {}, handler: middlewares };
        }

        if (!node.handlers || !node.handlers[method]) {
            return {
                params: {},
                success: false,
                handler: middlewares
            };
        }
        if (node.handlers?.ALL) middlewares.push(...node.handlers.ALL);
        if (node.handlers?.[method]) middlewares.push(...node.handlers[method]);
        // for (let i = 0; i < node.handlers?.ALL?.length; i++) {
        //     middlewares.push(node.handlers.ALL[i])
        // }
        // for (let i = 0; i < node.handlers?.[method]?.length; i++) {
        //     middlewares.push(node.handlers[method][i])
        // }
        return {
            success: true,
            params,
            handler: middlewares
        };
    }

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
router.addRoute("ALL", '/', [function test() { console.log(354) }])
router.addRoute("GET", "/home", [() => console.log("Home")]);               // depth 2
router.addRoute("GET", "/home/test", [function home() { console.log("Home") }]);               // depth 2
router.addRoute("GET", "/home/:test/test", [function home() { console.log("Home") }]);               // depth 2

router.addRoute("GET", "/user/:id/profile", [({ id }) => console.log(id)]); // depth 3
router.addRoute("GET", "/files/*path", [({ path }) => console.log(path)]);  // depth 3
console.log(router.search('/home/test/345'))

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

// for (const route of routes) {
//     router.addRoute("GET", route, [() => { }]);
// }

// // console.log(router)
// // Benchmark parameters
// const ITERATIONS = 100_000;
// const TOTAL_MATCHES = testPaths.length * ITERATIONS;

// console.log(
//     `Benchmarking ${testPaths.length} routes, ${ITERATIONS} iterations each...`,
// );

// const start = performance.now();

// for (let i = 0; i < ITERATIONS; i++) {
//     for (const path of testPaths) {
//         router.search("GET", path);
//         router.search("ALL", path);
//     }
// }

// const end = performance.now();
// const duration = end - start;
// function report(name: string, totalOps: number, totalTimeMs: number) {
//     const totalTimeNs = totalTimeMs * 1e6; // ms → ns
//     const avgNs = totalTimeNs / totalOps;
//     const avgUs = avgNs / 1000;
//     const opsSec = 1e9 / avgNs;

//     console.log(`\n[${name}]`);
//     console.log(`  Total ops     : ${totalOps.toLocaleString()}`);
//     console.log(`  Total time    : ${totalTimeMs.toFixed(2)} ms`);
//     console.log(
//         `  Avg per op    : ${avgNs.toFixed(2)} ns (${avgUs.toFixed(6)} µs)`,
//     );
//     console.log(`  Throughput    : ${opsSec.toFixed(0)} ops/sec`);
// }

// // Benchmarking 12 routes, 100000 iterations each...

// // [RadixRouter.search()]
// //   Total ops: 1, 200,000
// //   Total time: 170.72 ms
// //   Avg per op: 142.26 ns(0.142263 µs)
// // Throughput: 7029244 ops / sec
// // 🚀 Server running at http://localhost:3002

// report("RadixRouter.search()", TOTAL_MATCHES, duration);

// console.log(`Completed ${TOTAL_MATCHES} matches in ${duration.toFixed(2)} ms`);
// console.log(
//     `Average per match: ${((duration / TOTAL_MATCHES) * 1000).toFixed(6)} µs`,
// );
