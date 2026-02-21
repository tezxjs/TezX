/*
  tezx-auth-core - Minimal starter (single-file)
  - Purpose: provide a NextAuth-like auth core for TezX
  - Install (example): pnpm add jose uuid
  - This file is a practical starting point: in-memory adapter, credentials provider,
    JWT session strategy, middleware and routes: /auth/signin, /auth/signout, /auth/session

  NOTE: This is a concise but functional demo — adapt to your project's adapters,
  provider implementations (OAuth flows), and storage for production.
*/

import { randomUUID } from "crypto";
import { SignJWT, jwtVerify, JWTPayload } from "jose";

// ---------------------- Types ----------------------

export type User = {
    id: string;
    name?: string;
    email?: string;
    password?: string; // hashed in real apps
    image?: string;
    [k: string]: any;
};

export type Session = {
    id: string;
    userId: string;
    expires: number; // epoch ms
    createdAt: number;
};

export type Adapter = {
    getUserById(userId: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    createUser(user: Partial<User>): Promise<User>;
    createSession(session: Partial<Session>): Promise<Session>;
    getSession(sessionId: string): Promise<Session | null>;
    deleteSession(sessionId: string): Promise<void>;
};

export type Credentials = Record<string, string>;

export type CredentialsAuthorize = (credentials: Credentials) => Promise<User | null>;

export type Provider = {
    id: string;
    type: "credentials" | "oauth" | string;
    authorize?: CredentialsAuthorize; // for credentials provider
    // oauth fields omitted in starter
};

export type AuthOptions = {
    secret: string; // used to sign JWTs
    providers: Provider[];
    adapter?: Adapter;
    session?: { strategy: "jwt" | "database"; maxAge?: number };
    cookieName?: string;
    jwt?: { expiresIn?: number }; // seconds
};

// ---------------------- In-memory adapter (demo) ----------------------

export function createMemoryAdapter(): Adapter {
    const users = new Map<string, User>();
    const sessions = new Map<string, Session>();

    return {
        async getUserById(userId) {
            return users.get(userId) ?? null;
        },
        async getUserByEmail(email) {
            for (const u of users.values()) if (u.email === email) return u;
            return null;
        },
        async createUser(user) {
            const id = user.id ?? randomUUID();
            const u: User = { id, ...user } as any;
            users.set(id, u);
            return u;
        },
        async createSession(session) {
            const id = session.id ?? randomUUID();
            const s: Session = { id, createdAt: Date.now(), expires: Date.now() + 1000 * 60 * 60 * 24 * 7, ...session } as any;
            sessions.set(id, s);
            return s;
        },
        async getSession(sessionId) {
            const s = sessions.get(sessionId) ?? null;
            if (!s) return null;
            if (s.expires < Date.now()) {
                sessions.delete(sessionId);
                return null;
            }
            return s;
        },
        async deleteSession(sessionId) {
            sessions.delete(sessionId);
        },
    };
}

// ---------------------- Cookie helpers ----------------------

function serializeCookie(name: string, value: string, opts: { path?: string; httpOnly?: boolean; maxAge?: number; secure?: boolean; sameSite?: "lax" | "strict" | "none" } = {}) {
    const parts = [`${name}=${encodeURIComponent(value)}`];
    if (opts.maxAge != null) parts.push(`Max-Age=${Math.floor(opts.maxAge)}`);
    parts.push(`Path=${opts.path ?? "/"}`);
    if (opts.httpOnly) parts.push("HttpOnly");
    if (opts.secure) parts.push("Secure");
    if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
    return parts.join("; ");
}

function parseCookies(cookieHeader?: string) {
    const obj: Record<string, string> = {};
    if (!cookieHeader) return obj;
    const parts = cookieHeader.split(";");
    for (const p of parts) {
        const [k, ...rest] = p.split("=");
        if (!k) continue;
        obj[k.trim()] = decodeURIComponent((rest || []).join("=").trim());
    }
    return obj;
}

// ---------------------- JWT helpers (using jose) ----------------------

async function signToken(payload: JWTPayload, secret: string, expiresInSec = 60 * 60 * 24 * 7) {
    const alg = "HS256";
    const key = new TextEncoder().encode(secret);
    const now = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg })
        .setIssuedAt(now)
        .setExpirationTime(now + expiresInSec)
        .sign(key);
    return token;
}

async function verifyToken(token: string, secret: string) {
    const key = new TextEncoder().encode(secret);
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as JWTPayload;
    } catch (err) {
        return null;
    }
}

// ---------------------- Basic password util (demo only) ----------------------

// In production use bcrypt / argon2
function simpleHash(pw: string) {
    // NOT SECURE. Demo only.
    let h = 0;
    for (let i = 0; i < pw.length; i++) h = (h << 5) - h + pw.charCodeAt(i);
    return String(h >>> 0);
}

// ---------------------- Providers ----------------------

export function CredentialsProvider(options: { id?: string; name?: string; authorize: CredentialsAuthorize }): Provider {
    return {
        id: options.id ?? "credentials",
        type: "credentials",
        authorize: options.authorize,
    };
}

// ---------------------- createAuth core ----------------------

export function createAuth(options: AuthOptions) {
    const adapter = options.adapter ?? createMemoryAdapter();
    const cookieName = options.cookieName ?? "tezx_session";
    const jwtOpts = { expiresIn: options.jwt?.expiresIn ?? (options.session?.maxAge ?? 60 * 60 * 24 * 7) };

    // route handlers container
    async function handleSignin(req: Request) {
        // expects application/json body for credentials
        const body = await req.json().catch(() => ({}));
        const provider = options.providers.find((p) => p.type === "credentials");
        if (!provider || !provider.authorize) return new Response(JSON.stringify({ error: "No credentials provider" }), { status: 400 });

        const user = await provider.authorize(body as Credentials);
        if (!user) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

        // create session: JWT strategy — create token and set cookie
        if (options.session?.strategy === "database") {
            const s = await adapter.createSession({ userId: user.id, expires: Date.now() + (options.session?.maxAge ?? 60 * 60 * 24 * 7) * 1000 });
            const cookie = serializeCookie(cookieName, s.id, { httpOnly: true, maxAge: (options.session?.maxAge ?? 60 * 60 * 24 * 7), sameSite: "lax" });
            return new Response(JSON.stringify({ ok: true, sessionId: s.id, user }), { status: 200, headers: { "Set-Cookie": cookie, "Content-Type": "application/json" } });
        } else {
            // jwt
            const token = await signToken({ sub: user.id, name: user.name, email: user.email }, options.secret, jwtOpts.expiresIn);
            const cookie = serializeCookie(cookieName, token, { httpOnly: true, maxAge: jwtOpts.expiresIn, sameSite: "lax" });
            return new Response(JSON.stringify({ ok: true, token, user }), { status: 200, headers: { "Set-Cookie": cookie, "Content-Type": "application/json" } });
        }
    }

    async function handleSignout(req: Request) {
        const cookieHeader = req.headers.get("cookie");
        const cookies = parseCookies(cookieHeader ?? undefined);
        const val = cookies[cookieName];
        if (!val) return new Response(JSON.stringify({ ok: true }), { status: 200 });

        if (options.session?.strategy === "database") {
            await adapter.deleteSession(val).catch(() => { });
        }
        // clear cookie
        const cookie = serializeCookie(cookieName, "", { httpOnly: true, maxAge: 0, path: "/" });
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Set-Cookie": cookie, "Content-Type": "application/json" } });
    }

    async function handleSession(req: Request) {
        const cookieHeader = req.headers.get("cookie");
        const cookies = parseCookies(cookieHeader ?? undefined);
        const val = cookies[cookieName];
        if (!val) return new Response(JSON.stringify({ ok: false, session: null }), { status: 200 });

        if (options.session?.strategy === "database") {
            const s = await adapter.getSession(val).catch(() => null);
            if (!s) return new Response(JSON.stringify({ ok: false, session: null }), { status: 200 });
            const user = await adapter.getUserById(s.userId);
            return new Response(JSON.stringify({ ok: true, session: { ...s, user } }), { status: 200 });
        } else {
            const payload = await verifyToken(val, options.secret);
            if (!payload || !payload.sub) return new Response(JSON.stringify({ ok: false, session: null }), { status: 200 });
            const user = await adapter.getUserById(String(payload.sub));
            return new Response(JSON.stringify({ ok: true, session: { tokenPayload: payload, user } }), { status: 200 });
        }
    }

    // main middleware/router function for TezX: returns a handler for /auth/* routes
    function routes() {
        // A function that accepts a Request and returns Response. TezX can mount it.
        return async function authRouteHandler(req: Request): Promise<Response> {
            const url = new URL(req.url);
            const pathname = url.pathname.replace(/\/+$/, "");
            if (pathname.endsWith("/auth/signin") && req.method === "POST") return handleSignin(req);
            if (pathname.endsWith("/auth/signout") && req.method === "POST") return handleSignout(req);
            if (pathname.endsWith("/auth/session") && req.method === "GET") return handleSession(req);

            return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
        };
    }

    // guard middleware for protected routes — TezX-style middleware
    function guard() {
        return async function authGuard(ctx: any, next: () => Promise<void>) {
            const cookieHeader = ctx.req.headers?.get ? ctx.req.headers.get("cookie") : ctx.req.headers?.cookie;
            const cookies = parseCookies(cookieHeader ?? undefined);
            const val = cookies[cookieName];
            if (!val) {
                ctx.res = new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });
                return; // short-circuit: you may also throw
            }

            if (options.session?.strategy === "database") {
                const s = await adapter.getSession(val);
                if (!s) {
                    ctx.res = new Response(JSON.stringify({ error: "session not found" }), { status: 401, headers: { "Content-Type": "application/json" } });
                    return;
                }
                const user = await adapter.getUserById(s.userId);
                ctx.state = ctx.state ?? {};
                ctx.state.user = user;
                await next();
            } else {
                const payload = await verifyToken(val, options.secret);
                if (!payload || !payload.sub) {
                    ctx.res = new Response(JSON.stringify({ error: "invalid token" }), { status: 401, headers: { "Content-Type": "application/json" } });
                    return;
                }
                const user = await adapter.getUserById(String(payload.sub));
                ctx.state = ctx.state ?? {};
                ctx.state.user = user;
                await next();
            }
        };
    }

    return {
        routes,
        guard,
        // utilities
        async getSessionFromRequest(req: Request) {
            const cookieHeader = req.headers.get("cookie");
            const cookies = parseCookies(cookieHeader ?? undefined);
            const val = cookies[cookieName];
            if (!val) return null;
            if (options.session?.strategy === "database") {
                const s = await adapter.getSession(val);
                if (!s) return null;
                const user = await adapter.getUserById(s.userId);
                return { session: s, user };
            } else {
                const payload = await verifyToken(val, options.secret);
                if (!payload || !payload.sub) return null;
                const user = await adapter.getUserById(String(payload.sub));
                return { tokenPayload: payload, user };
            }
        },
        // expose adapters for tests
        _adapter: adapter,
    };
}

// ---------------------- Usage Example (commented) ----------------------

/*
// Example: create app integration (pseudo-TezX)
import { createAuth, CredentialsProvider } from './index';

const auth = createAuth({
  secret: process.env.AUTH_SECRET ?? 'dev-secret',
  providers: [
    CredentialsProvider({ authorize: async (creds) => {
      // very simple: if password matches hashed value
      const u = await adapter.getUserByEmail(creds.email);
      if (!u) return null;
      if (u.password === simpleHash(creds.password)) return u;
      return null;
    } }),
  ],
  adapter: createMemoryAdapter(),
  session: { strategy: 'jwt', maxAge: 60*60*24*7 }
});

// Mount routes: (TezX hypothetical)
app.use('/auth', async (req, res, next) => {
  // if TezX expects a function that returns Response for pure route mounting,
  // you can delegate to auth.routes()
});

// Protect route
app.get('/profile', auth.guard(), async (ctx) => {
  return new Response(JSON.stringify({ user: ctx.state.user }));
});
*/
