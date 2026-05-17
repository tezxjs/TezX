import { performance } from "node:perf_hooks";

// Your version
export function customGetPathname(url) {
    const len = url.length;
    if (len === 0) return "/";

    const start = url.indexOf("/", url.charCodeAt(9) === 58 ? 13 : 8);
    if (start === -1) return "/";

    let end = url.indexOf("?", start);
    if (end === -1) end = url.indexOf("#", start);
    if (end === -1) end = len;

    return start === end ? "/" : url.slice(start, end);
}

// URL version
export function nodeGetPathname(url) {
    return new URL(url, "http://x").pathname;
}

// fast version
export function fastGetPathname(url) {
    const q = url.indexOf("?");
    const h = url.indexOf("#");

    let end = -1;

    if (q === -1) end = h;
    else if (h === -1) end = q;
    else end = q < h ? q : h;

    return end === -1 ? url : url.slice(0, end);
}

// benchmark runner
function run(fn, name, input, times = 1e6) {
    const start = performance.now();

    for (let i = 0; i < times; i++) {
        fn(input);
    }

    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}

// test input
const testUrl = "https://example.com/api/user?id=123#section";

console.log("Running benchmarks...\n");

run(customGetPathname, "customGetPathname", testUrl);
run(nodeGetPathname, "node URL()", testUrl);
run(fastGetPathname, "fastGetPathname", testUrl);