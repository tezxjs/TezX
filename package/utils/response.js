export let notFoundResponse = (ctx) => {
    const { method, pathname } = ctx;
    return ctx.text(`${method}: '${pathname}' could not find\n`, {
        status: 404,
    });
};
export function mergeHeaders(existing, init) {
    if (!existing)
        return new Headers(init);
    if (!init)
        return existing;
    const out = new Headers(existing);
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
export async function handleErrorResponse(err = new Error("Internal Server Error"), ctx) {
    if (err instanceof Error) {
        return ctx.status(500).text(err.message ?? "Internal Server Error");
    }
    return await handleErrorResponse(new Error(err), ctx);
}
