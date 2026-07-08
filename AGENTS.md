<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Storefront is a single Next.js 16.3 app (WillCommerce) backed by PostgreSQL. Standard commands live in `README.md` and `package.json` scripts; only the non-obvious caveats are below.

### Services / prerequisites
- **PostgreSQL** must be running before any DB command or the dev server: `sudo pg_ctlcluster 16 main start`. DB is `ecommerce`, connected via `postgresql://postgres:postgres@localhost:5432/ecommerce` (already set in `.env.local`, which is gitignored and created during setup — recreate it from `.env.example` if missing).
- After a fresh DB, run `pnpm db:push` then `pnpm db:seed` (or `pnpm db:setup`) to create tables and seed the catalog.

### Non-obvious gotchas
- **`drizzle-kit` does NOT read `.env.local`.** `pnpm db:push` fails with "connection url required" unless `DATABASE_URL` is exported first, e.g. `export $(grep -v '^#' .env.local | grep -v '^$' | xargs) && pnpm db:push`. `pnpm db:seed` is fine because it passes `--env-file=.env.local`.
- **Run the dev server via `localhost:3000`, not `127.0.0.1:3000`.** In dev, Next.js blocks cross-origin `_next` requests from `127.0.0.1`, which silently breaks Server Actions (e.g. add-to-cart).
- **e2e (`pnpm test:e2e`) targets a production build, not the dev server.** The Playwright `webServer` is `pnpm start` (needs `pnpm build` first) and uses `baseURL=127.0.0.1`. If a `pnpm dev` server is already on port 3000, `reuseExistingServer` reuses it and Server Actions fail due to the cross-origin block above — stop the dev server before running e2e.
- **Mock checkout under `pnpm start` requires `ALLOW_MOCK_CHECKOUT=true`.** `next start` sets `NODE_ENV=production`, where mock checkout fails closed unless Stripe keys are set or `ALLOW_MOCK_CHECKOUT=true` (added to `.env.local` during setup). `next start` does load `.env.local` at runtime.
- **Known failing e2e test (pre-existing test bug, not env):** `add to cart and mock checkout` fails on a Playwright strict-mode violation — `getByText(/Thanks for your purchase/i)` matches both the `<h1>` and Next.js's `__next-route-announcer__` alert. The checkout itself succeeds (order reaches the paid confirmation page).
