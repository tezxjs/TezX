import { Config } from "../config/index.js";
export let notFoundResponse = (ctx) => {
    const { method, pathname } = ctx;
    return ctx.text(`${method}: '${pathname}' could not find\n`, {
        status: 404,
    });
};
export function mergeHeaders(existing, initHeaders) {
    if (!existing)
        return new Headers(initHeaders);
    if (!initHeaders)
        return existing;
    const out = new Headers(existing);
    const tmp = new Headers(initHeaders);
    for (const [k, v] of tmp) {
        if (k.toLowerCase() === "set-cookie")
            out.append(k, v);
        else
            out.set(k, v);
    }
    return out;
}
export async function handleErrorResponse(err = new Error("Internal Server Error"), ctx) {
    if (err instanceof Error) {
        Config.debugging.error(err?.message);
        return ctx.status(500).send(err.message ?? "Internal Server Error");
    }
    return await handleErrorResponse(new Error(err), ctx);
}
