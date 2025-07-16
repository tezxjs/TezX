export function generateID() {
    const timestamp = Date.now().toString(16);
    const random = Math.floor(Math.random() * 0xffffffffffff)
        .toString(16)
        .padStart(12, "0");
    let pid = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
    if (typeof Deno !== "undefined" && typeof Deno.pid === "number") {
        pid = (Deno.pid % 0xffff).toString(16).padStart(4, "0");
    }
    else if (typeof process !== "undefined" && typeof process.pid === "number") {
        pid = (process.pid % 0xffff).toString(16).padStart(4, "0");
    }
    return `${timestamp}-${random}-${pid}`;
}
