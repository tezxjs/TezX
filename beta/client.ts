import { RequestHeaders } from "../../src/types/index.js";
// ---------- utility types ----------
type TrimSlashes<S extends string> =
    S extends '' ? '' :
    S extends `/${infer Rest}` ? TrimSlashes<Rest> :
    S extends `${infer Rest}/` ? TrimSlashes<Rest> :
    S;

type SplitPath<S extends string> =
    S extends '' ? [] :
    S extends `${infer Head}/${infer Tail}` ? [Head, ...SplitPath<Tail>] :
    [S];

// map method -> leaf API
type RequestConfig = {
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean>;
};

type MethodMap<M extends string> =
    M extends "GET" ? { get: (config?: RequestConfig) => Promise<any> } :
    M extends "POST" ? { post: (body?: any, config?: RequestConfig) => Promise<any> } :
    M extends "PUT" ? { put: (body?: any, config?: RequestConfig) => Promise<any> } :
    M extends "DELETE" ? { delete: (config?: RequestConfig) => Promise<any> } :
    M extends "PATCH" ? { patch: (body?: any, config?: RequestConfig) => Promise<any> } :
    {};

// ---------- build a single route type ----------
type BuildSingleRoute<Segs extends readonly string[], Method extends string> =
    Segs extends []
    ? MethodMap<Method>
    : Segs extends [infer H, ...infer R]
    ? H extends string
    ? R extends string[]
    ? H extends `*${infer Name}`
    ? { [K in `*${Name}`]: (arg: string | number) => BuildSingleRoute<R, Method> }
    : H extends `:${infer Name}?`
    ? { [K in `:${Name}?`]: (arg: string | number) => BuildSingleRoute<R, Method> }
    : H extends `:${infer Name}`
    ? { [K in `:${Name}`]: (arg: string | number) => BuildSingleRoute<R, Method> }
    : { [K in H]: BuildSingleRoute<R, Method> }
    : never
    : never
    : never;

// ---------- convert route to typed client ----------
type RouteToClient<R extends { method: string; pattern: string }> =
    R extends { method: infer M extends string; pattern: infer P extends string }
    ? BuildSingleRoute<SplitPath<TrimSlashes<P>>, M>
    : never;

// ---------- union -> intersection helper ----------
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

// ---------- final Client type ----------
type ClientFromRoutes<T extends readonly { method: string; pattern: string }[]> = UnionToIntersection<RouteToClient<T[number]>>;

// ---------- example routes ----------
const protectedRoutes = [
    { method: "GET", pattern: "/" },
    { method: "GET", pattern: "/user/:id" },
    { method: "GET", pattern: "/user/:id/profile" },
    { method: "POST", pattern: "/user" },
    { method: "PUT", pattern: "/user/:id" },
    { method: "GET", pattern: "/user/:id/:test?" },
    { method: "GET", pattern: "/account/:id/:test?/*sdf" },
] as const;


export type API = {
    "get": (config?: RequestConfig) => Promise<any>;
    "user": {
        ":id": {
            "get": (config?: RequestConfig) => Promise<any>;
            "profile": {
                "get": (config?: RequestConfig) => Promise<any>;
            };
            "put": (body?: any, config?: RequestConfig) => Promise<any>;
            ":test?": {
                "get": (config?: RequestConfig) => Promise<any>;
            };
        };
        "post": (body?: any, config?: RequestConfig) => Promise<any>;
    };
    "account": {
        ":id": {
            ":test?": {
                "*sdf": {
                    "get": (config?: RequestConfig) => Promise<any>;
                };
            };
        };
    };
};


type Fetcher = (url: string, options?: RequestInit) => Promise<any>;

// ================== RUNTIME ==================
function buildQuery(query?: RequestConfig["query"]) {
    if (!query) return "";
    let str = '';
    for (const key in query) {
        const val = query[key];
        if (val === undefined || val === null) continue;
        if (str) str += '&';
        str += encodeURIComponent(key) + '=' + encodeURIComponent(String(val));
    }
    return str ? `?${str}` : "";
}

export function Client(baseURL: string,
    options?: {
        fetcher?: Fetcher;
        defaultHeaders?: RequestHeaders
    }
): API {
    const fetcher: Fetcher = options?.fetcher ?? (async (url, fetchOptions) => {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...options?.defaultHeaders },
            ...fetchOptions,
        });
        return res.json();
    });
    let defaultHeaders = options?.defaultHeaders ?? {} as Record<string, string>;

    const createProxy = (paths: (string | number)[] = []): any =>
        new Proxy(() => { }, {
            get(_, prop) {
                const propStr = String(prop)
                if (propStr?.startsWith(":") || propStr?.startsWith("*")) {
                    return createProxy(paths)
                }
                const method = propStr.toUpperCase();

                if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method)) {
                    return async (bodyOrConfig?: any, config?: RequestConfig) => {
                        const isBodyMethod = method !== "GET" && method !== "DELETE";

                        const body = isBodyMethod ? bodyOrConfig : undefined;
                        const cfg = isBodyMethod ? config : bodyOrConfig;

                        const url = `${baseURL}/${paths.join("/")}${buildQuery(cfg?.query)}`;

                        return await fetcher(url, {
                            method, // ✅ FIXED
                            body: body
                                ? body instanceof FormData
                                    ? body
                                    : JSON.stringify(body)
                                : undefined,
                            headers: {
                                ...(isBodyMethod
                                    ? body instanceof FormData
                                        ? {}
                                        : { "Content-Type": "application/json" }
                                    : {}),
                                ...defaultHeaders,
                                ...cfg?.headers,
                            },
                        });
                    };
                }
                // For nested paths: api.user.profile → paths = ['user', 'profile']
                return createProxy([...paths, prop as string]) as API
            },
            // Allow api.id(123) → paths = ['id', 123]
            apply(_, __, args: [string | number]) {
                const arg = args[0];
                // if (paths.length > 0 && typeof paths[paths.length - 1] === 'string') {
                //     // replace the last placeholder segment with the actual arg
                //     const newPaths = [...paths.slice(0, -1), arg];
                //     return createProxy(newPaths);
                // }
                // Fallback (no previous prop), just append the arg
                return createProxy([...paths, arg]);
            },
        })
    return createProxy() as API
}

export const api = Client('http://localhost:3002',);
// api.user.
// // GET /user/345
// const user = await api.user[":id"].profile.get()

// // PUT /user/345
// const updated = await api.user[":id"](345).put({ name: "Updated" });

// // PATCH /user/345
// const patched = await api.user[":id"](345).patch({ status: "active" });

// // GET /user/345/profile
// const profile = await api.user[":id"](345).profile.get();

// // GET /account/123/xyz/something (wildcard *sdf)
// const wildcard = await api.account[":id"](123)[":test?"]("xyz")["*sdf"]("something").get();