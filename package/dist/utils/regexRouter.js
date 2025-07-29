import { sanitizePathSplitBasePath } from "./low-level.js";
export function compileRegexRoute(seg) {
    const segments = typeof seg == 'string' ? seg.split("/").filter(Boolean) : seg;
    let regexStr = "^";
    const paramNames = [];
    for (let seg of segments) {
        if (seg.startsWith(":")) {
            const isOptional = seg.endsWith("?");
            const name = seg.replace(":", "").replace("?", "");
            paramNames.push(name);
            regexStr += isOptional
                ? `(?:\\/([^\\/]+))?`
                : `\\/([^\\/]+)`;
        }
        else if (seg.startsWith("*")) {
            const name = seg.slice(1) || "*";
            paramNames.push(name);
            regexStr += `\\/(.+)`;
        }
        else {
            regexStr += `\\/${seg}`;
        }
    }
    regexStr += "\\/?$";
    return {
        regex: new RegExp(regexStr),
        paramNames,
    };
}
export function addBaseToRegex(basePath, routeRegex) {
    basePath = "/" + sanitizePathSplitBasePath("/", basePath)?.join("/");
    if (basePath === "/")
        basePath = "";
    let body = routeRegex.source.replace(/^(\^)/, '').replace(/(\$)$/, '');
    body = body.replace(/\\\//g, "/");
    if (body.startsWith("/")) {
        body = body.slice(1);
    }
    const cleaned = body.replace(/^\/+|\/+$/g, "").replace(/\/?\?$/, "");
    const combined = basePath + "/" + cleaned + "/?";
    const finalRegex = new RegExp(`^${combined}$`);
    return finalRegex;
}
export function regexMatchRoute(regex, url, paramNames = []) {
    const match = url.match(regex);
    if (!match)
        return { success: false, params: {} };
    const params = {};
    paramNames.forEach((name, idx) => {
        params[name] = match[idx + 1] ?? null;
    });
    return { params, success: true };
}
