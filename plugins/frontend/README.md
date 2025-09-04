# Frontend plugin (plugins/frontend)

This plugin embeds and serves the single-page application (SPA) built with Vite and exposes a minimal JSON API for passing runtime environment values to the SPA.

## What this plugin does

- Embeds compiled frontend assets (the `dist/` output of the Vite app) into the Rust binary using `rust-embed`.
- Serves static files under the `/frontend/{*file}` route with proper content-type and ETag support.
- Falls back to `index.html` for unknown routes so client-side routing (SPA) works.
- Exposes a tiny API endpoint at `/frontend/api/env` that returns runtime environment values the frontend needs (for example: feature flags and monitor configuration).

Files of interest

- `plugins/frontend/frontend.rs` — plugin implementation (serving, ETag handling, API handler).
- `frontend/` — the Vite project for the SPA. The plugin expects the built files in `frontend/dist`.

## How embedding works (build + compile)

1. Build the Vite app so the `dist/` folder is produced:

```bash
# pnpm is used in this repository; npm or yarn are fine too
pnpm -C ./frontend install
pnpm -C ./frontend build
```

2. The plugin's `WebAssets` type uses `#[derive(RustEmbed)]` with `#[folder = "../../frontend/dist"]` (path is relative to `plugins/frontend`). When the Rust project is compiled, `rust-embed` packages files from that `dist/` folder into the binary.

Notes:
- Because assets are embedded at compile time, you must rebuild the Rust binary after building the frontend so the new assets get included.
- The plugin also generates an ETag at startup to help with client-side caching (clients can use `If-None-Match` to get a 304 when unchanged).

## Making the SPA work (routing & asset base)

To ensure the SPA loads assets and handles client-side routes correctly, do the following in your Vite configuration:

- Set `base` to the plugin route prefix so asset URLs are absolute and resolve to `/frontend/` when embedded and served by the plugin.

Example `vite.config.ts` snippet:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/frontend/',
  // ...other config
})
```

Why this matters:
- The plugin serves files from `/frontend/{*file}` and falls back to `/frontend/index.html`. If the SPA's asset paths are relative to the root (or wrong base), resources like `/assets/...` will 404 when the plugin serves from `/frontend/`.

Development tips:
- For local development it's common to run the Vite dev server and either:
  - Run the Vite server independently (e.g. `pnpm dev`) and configure the backend to proxy `/frontend` to the Vite dev server; or
  - Set the frontend to request runtime data from the backend explicitly (e.g. `fetch('/frontend/api/env')`) while the dev server serves the SPA.

## How the plugin serves files and supports SPA routing

- Route mapping in `frontend.rs`:
  - `/frontend/{*file}` — serves static files from embedded `dist/` files.
  - `/frontend` — redirects to `/frontend/live` (project-specific default route).
  - `/frontend/api/env` — returns JSON with environment values for the frontend.
- The handler checks `If-None-Match` against a server-generated ETag and responds `304 Not Modified` when appropriate.
- If a requested path isn't found among embedded assets, the plugin serves `index.html` instead so client-side routes like `/frontend/live/some-id` work.

## Passing runtime environment to the JavaScript frontend

The plugin exposes `/frontend/api/env` which returns a JSON object. The current implementation returns an object similar to:

```json
{
  "flags": { /* Flags struct serialized to JSON */ },
  "monitorConfig": { /* monitor configurations or empty map */ }
}
```

Example usage from the SPA (plain JS / fetch):

```js
async function loadEnv() {
  const res = await fetch('/frontend/api/env');
  if (!res.ok) throw new Error('Failed to load env');
  const env = await res.json();
  // use env.flags and env.monitorConfig in your app
  return env;
}

loadEnv().then(env => {
  // initialize app using env
}).catch(console.error);
```

Notes on CORS and same-origin policies:
- When the plugin serves the SPA and the API from the same origin (i.e. same host and port), no CORS changes are needed. If you run the frontend dev server on a different port, either enable CORS on the backend for that origin or proxy requests through the backend.

## Cache, ETag and deployment notes

- The plugin sets an ETag generated at startup. After you rebuild and redeploy the Rust binary, the ETag will change and clients will refetch assets.
- If you add additional caching layers (CDN, reverse proxy), ensure they honor `ETag`/`If-None-Match` headers or implement your own invalidation strategy.

## Quick checklist for releasing the frontend with the plugin

1. Edit `frontend/vite.config.ts` and set `base: '/frontend/'` (or a value that matches how you mount the plugin).
2. Build the frontend: `pnpm install && pnpm build` inside `frontend/`.
3. Rebuild the Rust project so `rust-embed` captures the new `dist/` files.
4. Deploy the new binary.

## Troubleshooting

- 404 for JS/CSS assets: check `base` in Vite and confirm asset URLs start with `/frontend/`.
- SPA client routes returning 404: ensure plugin fallback returns `index.html` (this plugin does by design).
