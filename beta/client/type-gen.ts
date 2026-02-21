
const protectedRoutes = [
    { method: "GET", pattern: "/" },
    { method: "GET", pattern: "/user/:id" },
    { method: "GET", pattern: "/user/:id/profile" },
    { method: "POST", pattern: "/user" },
    { method: "PUT", pattern: "/user/:id" },
    { method: "GET", pattern: "/user/:id/:test?" },
    { method: "GET", pattern: "/account/:id/:test?/*sdf" },
] as const;

// Helper: split a path into segments
function splitPath(path: string) {
    return path.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
}

// Merge route segments into nested object
function addRoute(obj: any, segments: string[], method: string) {
    if (segments.length === 0) {
        // leaf: add method
        switch (method) {
            case "GET": obj.get = "(config?: RequestConfig) => Promise<any>"; break;
            case "POST": obj.post = "(body?: any, config?: RequestConfig) => Promise<any>"; break;
            case "PUT": obj.put = "(body?: any, config?: RequestConfig) => Promise<any>"; break;
            case "DELETE": obj.delete = "(config?: RequestConfig) => Promise<any>"; break;
            case "PATCH": obj.patch = "(body?: any, config?: RequestConfig) => Promise<any>"; break;
        }
        return;
    }

    const [head, ...rest] = segments;
    if (!obj[head]) obj[head] = {};
    addRoute(obj[head], rest, method);
}

// Convert nested object to TS type string
function objectToType(obj: any, indent = "  "): string {
    let str = "{\n";
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === "string") {
            str += `${indent}"${key}": ${val};\n`;
        } else {
            str += `${indent}"${key}": ${objectToType(val, indent + "  ")};\n`;
        }
    }
    str += indent.slice(2) + "}";
    return str;
}

// Build nested object
export function buildTypeAPI(routes: { readonly method: "GET"; readonly pattern: "/"; }[]) {
    const apiObj: any = {};
    for (const route of routes) {
        const segments = splitPath(route.pattern);
        addRoute(apiObj, segments, route.method);
    }

    // Generate TS code
    const tsCode = `export type RequestConfig = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
};

export type API = ${objectToType(apiObj)};
`;
    Bun.write(`./api-types.ts`, tsCode)
}

// fs.writeFileSync("api-types.ts", tsCode);

// console.log("✅ api-types.ts generated!");