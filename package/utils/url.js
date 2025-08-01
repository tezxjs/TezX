export let getPathname = (url) => {
    const len = url.length;
    if (len === 0)
        return "/";
    const start = url.indexOf('/', url.charCodeAt(9) === 58 ? 13 : 8);
    if (start === -1)
        return "/";
    let end = url.indexOf('?', start);
    if (end === -1)
        end = url.indexOf('#', start);
    if (end === -1)
        end = len;
    return start === end ? "/" : url.slice(start, end);
};
export function queryParser(qs) {
    if (!qs?.length)
        return {};
    const startPos = qs.charCodeAt(0) === 63 ? 1 : 0;
    const len = qs.length;
    const query = {};
    let keyStart = startPos, valStart = -1;
    let i = startPos;
    const reuseArray = [];
    for (; i <= len; i++) {
        const ch = i < len ? qs.charCodeAt(i) : 38;
        if (ch === 61 && valStart === -1) {
            valStart = i + 1;
        }
        else if (ch === 38 || i === len) {
            const keyEnd = valStart === -1 ? i : valStart - 1;
            const key = qs.slice(keyStart, keyEnd);
            const val = valStart === -1 ? '' : qs.slice(valStart, i);
            const existing = query[key];
            if (existing !== undefined) {
                if (Array.isArray(existing)) {
                    existing.push(val);
                }
                else {
                    reuseArray.length = 0;
                    reuseArray[0] = existing;
                    reuseArray[1] = val;
                    query[key] = reuseArray.slice();
                }
            }
            else {
                query[key] = val;
            }
            keyStart = i + 1;
            valStart = -1;
        }
    }
    return query;
}
export function url2query(url) {
    let pathStart = url.indexOf('/', url.charCodeAt(9) === 58 ? 13 : 8);
    if (pathStart === -1)
        pathStart = url.length;
    let queryStart = url.indexOf('?', pathStart);
    if (queryStart === -1) {
        return {};
    }
    let qs = url.slice(queryStart + 1);
    return queryParser(qs);
}
