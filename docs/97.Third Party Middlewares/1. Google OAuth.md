
## @tezx/google-oauth2

Provides:

* **OAuth2 client initialization**
* **Auth URL generation**
* **Token verification middleware**
* **Full TypeScript support** with JSDoc annotations

---

### 🔧 Installation

```bash
npm install @tezx/google-oauth2 @googleapis/oauth2
```

Or with Yarn:

```bash
yarn add @tezx/google-oauth2 @googleapis/oauth2
```

---

### 🚀 Quick Start

```ts
import { TezX } from 'tezx';
import { GoogleOauthClient, getGoogleOAuthURL, verifyGoogleToken } from '@tezx/google-oauth2';

const app = new TezX({
  debugMode: true,
});

// 1. Initialize OAuth2 client
const client = GoogleOauthClient({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/auth/callback',
});

// 2. Route to start Google login
app.get('/auth/google', getGoogleOAuthURL({
  authClient: client,
  scopes: ['openid','email','profile'],
}), (ctx) => {
  return ctx.redirect(ctx.state.get('google'));
});

// 3. Callback route, verify token and establish session
app.get('/auth/callback', verifyGoogleToken({
  authClient: client,
  onError: (err) => {
    console.error('OAuth Error:', err);
    // handle error or redirect
  },
  onSuccess: (tokens) => {
    console.log('Tokens:', tokens);
  },
  Callbacks: {
    signIn: async (user) => {
      // e.g. allow only users from a domain
      return user.email.endsWith('@yourcompany.com');
    },
    jwt: async (token, user) => {
      // attach roles or custom claims
      token.role = user.email_verified ? 'member' : 'guest';
      return token;
    },
    session: async (session, user) => {
      // persist user profile in session
      session.user = {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture
      };
      return session;
    }
  }
}), async (ctx) => {
  // Now ctx.session is populated
  return ctx.json({ success: true });
});

```

---

## 📚 API Reference

### `GoogleOauthClient(config) → OAuth2Client`

Create a configured Google OAuth2 client.

```ts
import type { OAuth2Client } from 'google-auth-library';

interface GoogleOauthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * @param config.clientId     Google OAuth Client ID.
 * @param config.clientSecret Google OAuth Client Secret.
 * @param config.redirectUri  Registered redirect URI.
 * @returns OAuth2Client
 */
export function GoogleOauthClient(config: GoogleOauthConfig): OAuth2Client;
```

---

### `getGoogleOAuthURL(params) → Middleware`

Generate and store the Google authentication URL in `ctx.state`.

```ts
interface OAuthURLParams {
  authClient: OAuth2Client;
  scopes?: string[];               // default ['openid','email','profile']
  loginHint?: string;              // optional, e.g. user email
  prompt?: string;                 // default 'consent select_account'
  accessType?: 'online'|'offline'; // default 'offline'
  includeGrantedScopes?: boolean;  // default true
}

/**
 * Middleware that adds `state` header, generates auth URL, and redirects.
 * On success: ctx.state.get('google') contains the URL.
 */
export function getGoogleOAuthURL(params: OAuthURLParams): Middleware<any>;
```

---

### `verifyGoogleToken(params) → Middleware`

Validate the OAuth callback, exchange the code, verify ID token, and invoke your callbacks.

```ts
export type Callbacks = {
  /** Return false to reject sign‑in. */
  signIn?: (user: any) => Promise<boolean>;
  /** Modify or enrich the JWT token. */
  jwt?: (token: any, user?: any) => Promise<any>;
  /** Handle session creation / modification. */
  // access from ctx.session
  session?: (session: any, user: any) => Promise<any>;
};

interface VerifyParams {
  authClient: OAuth2Client;
  onError?: (error: string) => void;
  onSuccess?: (tokens: any, response: any) => void;
  Callbacks: Callbacks;
}

/**
 * Middleware that:
 * 1. Exchanges `code` for tokens  
 * 2. Validates `id_token` audience  
 * 3. Executes `signIn`, `jwt`, `session` callbacks  
 * 4. Calls onSuccess or onError  
 */
export function verifyGoogleToken(params: VerifyParams): Middleware<any>;
```

---

### 🎓 `User` & `Credentials` Types

```ts
/** Google user info returned by tokeninfo endpoint */
export type User = {
  sub: string;           // Google user ID
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  // ...other standard claims
};

/** OAuth2 token set returned by getToken() */
export interface Credentials {
  access_token?: string;
  refresh_token?: string;
  expiry_date?: number;
  id_token?: string;
  token_type?: string;
  scope?: string;
}
```

---

## 🛡 Security & Best Practices

* **State parameter**: Mitigate CSRF by using `state`.
* **Prompt & access\_type**: Use `offline` + `prompt='consent'` to receive refresh tokens.
* **Scope minimization**: Request only the scopes you need.
* **Token handling**: Securely store `refresh_token` if you need long‑lived access.

---
