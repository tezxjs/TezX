import { Context } from "../index.js";
import { HttpBaseResponse, ResponseHeaders } from "../types/index.js";

export let notFoundResponse = (ctx: Context) => {
  const { method, pathname } = ctx;
  return ctx.text(`${method}: '${pathname}' could not find\n`, {
    status: 404,
  });
};

export function mergeHeaders(existing?: Headers, init?: ResponseHeaders): Headers {
  // যদি existing না থাকে, নতুন Headers বানাও — initHeaders দিয়ে ইনিশিয়ালাইজ করা যাবে

  if (!existing) return new Headers(init as Record<string, string>);

  // যদি কোন initHeaders না থাকে, রেফারেন্স ফিরিয়ে দাও (no copy)
  if (!init) return existing;

  // যদি initHeaders একটি Headers হলে, আমরা copy করে merge করব
  const out = new Headers(existing); // একবারে কপি — তারপর initHeaders apply
  for (const key in init) {
    const val = init[key]!;
    if (val && key.toLowerCase() === "set-cookie") {
      out.append(key, val);
    }
    else if (val) {
      out.set(key, val);
    }
  }
  return out;
}


export async function handleErrorResponse(
  err: Error = new Error("Internal Server Error"),
  ctx: Context,
): Promise<HttpBaseResponse> {
  if (err instanceof Error) {
    return ctx.status(500).text(err.message ?? "Internal Server Error");
  }
  return await handleErrorResponse(new Error(err), ctx);
}

