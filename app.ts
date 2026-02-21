import { Router, TezX } from "./src/index.js";
import { logger, paginationHandler } from "./src/middleware"
const app = new TezX({});
app.use(logger())
app.static({
  files: [
    {
      fileSource: "./public/logo.png",
      route: "/test.jpg"
    }
  ]
});

app.get("/users/:fds", paginationHandler({
  getDataSource: async (ctx) => {
    return {
      data: [],
      total: 0
    } as any
  }
}));

app.get("/", async (ctx) => {
  // If cspUseNonce is enabled, nonce is available in ctx.cspNonce
  return ctx.text('test')
});

// Suppose each item is { id: number; name: string }
const router = new Router();
router.get("/router", (ctx) => {
  return ctx.json({ router: true });
});
app.use(router);
// app.use(sanitizeHeaders({
//   whitelist: ['Access-Control-Allow-Credentials']
// }))
app.get("/protected", async (ctx) => {
  return ctx.json({});
});

app.get("/about", (ctx) => ctx.json({ msg: "about" }));
app.get("/user/:id", (ctx) =>
  ctx.json({ msg: "user", params: ctx.req.params }),
);
app.get("/post/:postId", (ctx) =>
  ctx.json({ msg: "post", params: ctx.req.params }),
);
app.get("/files/*", (ctx) =>
  ctx.json({ msg: "files", params: ctx.req.params }),
);
app.get("/*", (ctx) => {
  console.log(ctx.req.params)
  return ctx.json({
    msg: "catchall", path: ctx.req.url
  })
});

// OPTIONAL / SKIPPED (if router supports optional expansion, can add :id? etc)
app.get("/optional/:id?", (ctx) =>
  ctx.json({ msg: "optional", params: ctx.req.params }),
);
// app.use("/optional/:id?", mw("mw:/optional/:id?"));

// POST HANDLERS
app.post("/user/:id", (ctx) =>
  ctx.json({ msg: "user-post", params: ctx.req.params }),
);
app.post("/post/:postId", async (ctx) => {
  console.log(new TextDecoder('utf-8').decode(await ((await ctx.req.formData()).get('test') as File).arrayBuffer()))
  return ctx.json({ msg: "post-post", params: ctx.req.params })
});

// ADDITIONAL STATIC
app.get("/static/one", (ctx) => ctx.json({ msg: "static-one" }));
app.get("/static/two", (ctx) => ctx.json({ msg: "static-two" }));
app.get("/static/three", (ctx) => ctx.json({ msg: "static-three" }));

// DYNAMIC + STATIC COMBOS
app.get("/test/:id", (ctx) =>
  ctx.json({ msg: "test-id", params: ctx.req.params }),
);
app.get("/test/:id/details", (ctx) =>
  ctx.json({ msg: "test-id-details", params: ctx.req.params }),
);

// WILDCARD COMBOS
app.get("/files/*/download", (ctx) =>
  ctx.json({ msg: "files-download", params: ctx.req.params }),
);
app.get("/files/*/preview", (ctx) =>
  ctx.json({ msg: "files-preview", params: ctx.req.params }),
);

// MULTI SEGMENT STATIC
app.get("/a/b/d", (ctx) => ctx.json({ msg: "a/b/d" }));
app.get("/a/b/d", (ctx) => ctx.json({ msg: "a/b/d" }));
app.get("/a/x/y", (ctx) => ctx.json({ msg: "a/x/y" }));

// MULTI SEGMENT DYNAMIC
app.get("/product/:pid/review/:rid", (ctx) =>
  ctx.json({ msg: "product-review", params: ctx.req.params }),
);
app.get("/category/:cid/item?/:iid?", (ctx) =>
  ctx.json({ msg: "category-item", params: ctx.req.params }),
);

// MIXED WILDCARD + DYNAMIC
app.get("/shop/:shopId/*", (ctx) =>
  ctx.json({ msg: "shop-wildcard", params: ctx.req.params }),
);

// MISC FALLBACK
app.get("/fallback/test", (ctx) => ctx.json({ msg: "fallback-test" }));
app.get("/fallback/*", (ctx) =>
  ctx.json({ msg: "fallback-wildcard", params: ctx.req.params }),
);

// ENDPOINT TOTAL: 30 routes (static + dynamic + wildcard + optional + post)
const PORT = 3002;
// Deno.serve({ port: Number(Deno.env.get("PORT") || 5000) }, (req, connInfo) => {
//   return app.serve(req, connInfo);
// });

Bun.serve({
  port: PORT,
  reusePort: true, // enables SO_REUSEPORT for clustering
  fetch: (req, server) => {
    return app.serve(req, server)
  },
});

console.log(`🚀 Server running at http://localhost:${PORT}`);


import { Client } from './src/client/index.js';
export const api = Client('http://localhost:3002', app);

// const id = api.account?.[":id"](345)[":test?"](345)["*sdf"](4353).get({ headers: {} })

// console.log(await id)