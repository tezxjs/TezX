// benchmark.mjs

export function mergeHeaders(existing, init) {
    // যদি existing না থাকে, নতুন Headers বানাও — initHeaders দিয়ে ইনিশিয়ালাইজ করা যাবে

    if (!existing) return new Headers(init);

    // যদি কোন initHeaders না থাকে, রেফারেন্স ফিরিয়ে দাও (no copy)
    if (!init) return existing;
    // যদি initHeaders একটি Headers হলে, আমরা copy করে merge করব
    const out = new Headers(existing); // একবারে কপি — তারপর initHeaders apply
    for (const key in init) {
        const val = init[key];
        if (val && key.toLowerCase() === "set-cookie") {
            out.append(key, val);
        }
        else if (val) {
            out.set(key, val);
        }
    }
    return out;
}
// Dummy headers
const baseHeaders = new Headers({ "x-test": "1" });

// #newResponse version
function newResponse(body, type, init = {}) {
    let headers = mergeHeaders(baseHeaders, init.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", type);
    return new Response(body, {
        status: init.status ?? 200,
        statusText: init.statusText,
        headers,
    });
}

// createResponse version
function createResponse(body, type, init = {}) {
    const headers = mergeHeaders(baseHeaders, init.headers);
    if (type) headers.set("Content-Type", type);
    return new Response(body, {
        status: init.status ?? 200,
        statusText: init.statusText,
        headers,
    });
}

// Benchmark runner
function benchmark(fn, iterations = 1_000_000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn("Hello World", "text/plain", { headers: { "x-custom": "test" } });
    }
    const end = performance.now();
    return end - start;
}

const iterations = 1_000_000;

console.log("Running benchmark for", iterations, "iterations...");

const t1 = benchmark(newResponse, iterations);
console.log("#newResponse time:", t1.toFixed(2), "ms");

const t2 = benchmark(createResponse, iterations);
console.log("createResponse time:", t2.toFixed(2), "ms");
