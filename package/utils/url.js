export let getPathname = (url) => {
    const len = url.length;
    if (len === 0)
        return "/";
    const start = url.indexOf("/", url.charCodeAt(9) === 58 ? 13 : 8);
    if (start === -1)
        return "/";
    let end = url.indexOf("?", start);
    if (end === -1)
        end = url.indexOf("#", start);
    if (end === -1)
        end = len;
    return start === end ? "/" : url.slice(start, end);
};
export function queryParser(qs) {
    if (!qs?.length)
        return {};
    if (qs[0] === "?")
        qs = qs.slice(1);
    const query = {};
    for (const part of qs.split("&")) {
        if (!part)
            continue;
        const [k, v = ""] = part.split("=");
        if (query[k] !== undefined) {
            if (Array.isArray(query[k]))
                query[k].push(v);
            else
                query[k] = [query[k], v];
        }
        else
            query[k] = v;
    }
    return query;
}
export function url2query(url) {
    const hashIndex = url.indexOf("#");
    if (hashIndex !== -1) {
        url = url.slice(0, hashIndex);
    }
    const queryIndex = url.indexOf("?");
    if (queryIndex === -1)
        return {};
    const qs = url.slice(queryIndex + 1);
    return queryParser(qs);
}
export function sanitizePathSplitBasePath(basePath, path, out) {
    const combined = `${basePath}/${path}`;
    const parts = out ?? [];
    let segStart = 0;
    let i = 0;
    const len = combined.length;
    while (i < len) {
        const code = combined.charCodeAt(i);
        if (code === 47 || code === 92) {
            if (segStart < i) {
                const seg = combined.slice(segStart, i);
                if (seg !== "..")
                    parts.push(seg);
            }
            segStart = i + 1;
        }
        i++;
    }
    if (segStart < len) {
        const seg = combined.slice(segStart, len);
        if (seg !== "..")
            parts.push(seg);
    }
    return parts;
}
export function sanitizePathSplit(path, out) {
    const parts = out ?? [];
    let segStart = 0;
    let i = 0;
    const len = path.length;
    while (i < len) {
        const code = path.charCodeAt(i);
        if (code === 47 || code === 92) {
            if (segStart < i) {
                const seg = path.slice(segStart, i);
                if (seg !== "..")
                    parts.push(seg);
            }
            segStart = i + 1;
        }
        i++;
    }
    if (segStart < len) {
        const seg = path.slice(segStart, len);
        if (seg !== "..")
            parts.push(seg);
    }
    return parts;
}
