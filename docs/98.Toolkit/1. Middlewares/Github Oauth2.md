
# 📦 `@tezx/github-oauth2`

GitHub OAuth2.0 middleware for the [TezX](https://github.com/tezxjs/TezX) web framework. Securely authenticate users via GitHub, and define custom sign-in, session, and token handling logic.

---

## ✅ Setup GitHub OAuth App

Go to: [https://github.com/settings/developers](https://github.com/settings/developers)

1. Click **"New OAuth App"**
2. Name: `My GitHub Login App`
3. Homepage URL: `http://localhost:3000`
4. Authorization callback URL: `http://localhost:3000/auth/github/callback`
5. Save and copy `Client ID` and `Client Secret`

## 📥 Installation

```bash
npm install @tezx/github-oauth2
```

#### **Template**

```bash
npm create tezx@latest github-auth -- --template github-oauth2 --y
```

---

## 📄 Example Usage

```ts
import { TezX } from 'tezx';
import {
  GitHubOauthClient,
  getGithubOAuthURL,
  verifyGithubToken
} from '@tezx/github-oauth2';

const app = new TezX({
  debugMode: true
});

// Initialize OAuth client
const client = GitHubOauthClient({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000'
});

// Step 1: Redirect user to GitHub login
app.get('github', getGithubOAuthURL({
  authClient: client,
}), (ctx) => {
  return ctx.redirect(ctx.github.oauth_url);
});

// Step 2: Verify GitHub token and handle user session
app.get('/', verifyGithubToken({
  authClient: client,
  Callbacks: (ctx) => {
    return {
      session: async (session, user) => {
        console.log('Session:', session);
        console.log('User:', user);
        return session;
      }
    };
  }
}), async (ctx) => {
  return ctx.json({ success: ctx.github.user });
});
```

---

## 🧩 API Reference

### `GitHubOauthClient(config: GithubOauthClient): GitHubAuthClient`

Creates an OAuth client instance.

#### Parameters

| Name         | Type   | Description                    |
| ------------ | ------ | ------------------------------ |
| clientId     | string | GitHub OAuth App client ID     |
| clientSecret | string | GitHub OAuth App client secret |
| redirectUri  | string | URI GitHub should redirect to  |

---

### `getGithubOAuthURL(options: OAuthURLParams)`

Generates the GitHub OAuth URL and stores it in `ctx.github.oauth_url`.

#### Parameters

| Name        | Type              | Description                                                      |
| ----------- | ----------------- | ---------------------------------------------------------------- |
| authClient  | GitHubOauthClient | The OAuth client instance                                        |
| scopes      | string\[]         | (Optional) OAuth scopes (default: `['read:user', 'user:email']`) |
| state       | string            | (Optional) CSRF protection state value                           |
| allowSignup | boolean           | (Optional) Allow GitHub signups (default: true)                  |

---

### `verifyGithubToken(options: { authClient: GitHubOauthClient, Callbacks: Callbacks })`

Middleware to validate the token returned from GitHub and handle user info.

#### Parameters

| Name       | Type                       | Description                  |
| ---------- | -------------------------- | ---------------------------- |
| authClient | GitHubOauthClient          | The initialized OAuth client |
| Callbacks  | `(ctx) => CallbacksReturn` | Optional lifecycle methods   |

---

### 🌀 `CallbacksReturn`

| Method                   | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `signIn(user)`           | Called after user is authenticated. Return `true` to allow login. |
| `jwt(token, user?)`      | Customize JWT token if applicable.                                |
| `session(session, user)` | Customize the session object before sending to client.            |

---
