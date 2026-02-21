import { TezX } from "tezx";
import { RequestHeaders } from "../types/index.js";
import { buildTypeAPI } from "./type-gen.js";
import { API } from "../../api-types.js"
type RequestConfig = {
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean>;
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
    app: TezX,
    options?: {
        fetcher?: Fetcher;
        defaultHeaders?: RequestHeaders
    }
): API {
    console.log(buildTypeAPI(app.route))
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
            apply(_, __, args: [string | number]) {
                const arg = args[0];
                return createProxy([...paths, arg]);
            },
        })
    return createProxy()
}
