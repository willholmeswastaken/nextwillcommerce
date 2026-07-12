# WillCommerce

A blazing-fast **Next.js 16.3** ecommerce template built with **Effect-TS**, **Better Auth**, and App Router Instant Navigations.

Clone it, seed the catalog, and ship a storefront that feels like an SPA — without abandoning server-driven rendering.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | `next@preview` (16.3) · React 19 · App Router |
| Backend | Effect 3.20+ (ManagedRuntime, Tag/Layer DI, Schema) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Better Auth (email/password, Drizzle adapter) |
| Payments | Stripe Checkout **or** mock checkout when keys are unset |
| UI | Tailwind CSS v4 · minimal client islands |

## Quick start

```bash
pnpm install
cp .env.example .env.local
# edit DATABASE_URL / BETTER_AUTH_SECRET as needed

pnpm db:setup   # drizzle push + seed demo catalog
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo catalog includes footwear, apparel, and accessories (e.g. `/products/aero-runner`).

### Environment

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
BETTER_AUTH_SECRET=generate-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000

# Required in production. Locally, mock checkout is used when unset.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Optional overrides
# ALLOW_MOCK_CHECKOUT=true          # force mock payments even in production
# ALLOW_DESTRUCTIVE_SEED=true       # allow db:seed wipe in production
```

Mock checkout is **dev-only by default**. In production, unset Stripe keys fail closed unless `ALLOW_MOCK_CHECKOUT=true`.

## Architecture

```
app/
├── (shop)/                 # Storefront routes (home, products, cart, checkout)
├── (auth)/                 # Sign-in / sign-up
├── account/orders/         # Protected order history
├── api/auth/[...all]/     # Better Auth handler
├── api/webhooks/stripe/    # Order fulfillment
└── server/
    ├── runtime.ts          # ManagedRuntime composition root
    ├── lib/                # Action helpers + typed errors
    └── features/           # product · cart · order · checkout · auth
lib/
├── auth.ts                 # betterAuth + drizzleAdapter + nextCookies
├── auth-client.ts          # createAuthClient
└── db.ts                   # Drizzle client
drizzle/
├── schema.ts               # Auth + catalog + cart + orders
└── seed.ts
proxy.ts                    # Optimistic /account/* cookie gate
```

**Pattern:** route files stay thin. Business logic lives in Effect services. Server Actions decode input with `Effect.Schema`, run through `ManagedRuntime`, and map tagged errors to `{ success, data | error }` results.

Every exported Server Action is treated as a public POST endpoint — auth and validation happen inside the Effect pipeline.

## Instant Navigations (Next.js 16.3)

Enabled in `next.config.ts`:

```ts
cacheComponents: true,
partialPrefetching: true,
```

Most storefront routes use the **Cache** strategy so navigations feel fully populated. Checkout demos **Stream**; confirmation uses **Block** for correctness:

| Route | Strategy | Why |
|-------|----------|-----|
| `/`, `/products`, `/products/[slug]` | **Cache** (`'use cache'` + tags) | Catalog is mostly static — await cached data, no skeleton demos |
| `/checkout` | **Stream** (Suspense shell) | Demo route — shell first, cart + payment stream in |
| `/order/confirmation/[id]` | **Block** (`export const instant = false`) | Must show authoritative paid state |

Catalog queries live in `app/(shop)/catalog.ts` and never read cookies/headers inside `'use cache'`. Session reads happen outside cache boundaries; pass `userId` in when needed.

## Auth (Better Auth)

- Self-hosted against the same Postgres DB via `drizzleAdapter`
- `nextCookies()` so Server Actions can set session cookies
- `proxy.ts` uses `getSessionCookie()` for optimistic `/account/*` redirects only
- Authoritative checks use `auth.api.getSession()` via the `AuthService` Effect tag
- Guest carts merge into the user cart on sign-in / sign-up

## Checkout

1. **Stripe path** — when `STRIPE_SECRET_KEY` is set, creates a Checkout Session and fulfills via webhook / success redirect. Inventory is decremented atomically when the order is marked paid; paid amount is verified against the order total.
2. **Mock path** — when Stripe is unset **and** not in production (or `ALLOW_MOCK_CHECKOUT=true`), creates a paid order immediately and decrements inventory (great for local demos).

Guest confirmation URLs include an opaque `token` query param. Account order detail requires ownership (`userId` match); guest orders are not visible under `/account`.

Local Stripe webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Scripts

```bash
pnpm dev          # Next.js dev server (Instant Insights overlay)
pnpm build        # Production build
pnpm db:push      # Apply Drizzle schema
pnpm db:seed      # Seed ~12 demo products
pnpm db:setup     # push + seed
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright storefront flow
```

## Performance playbook

1. Prefer Server Components; keep `'use client'` to interactive islands only
2. Cache catalog with `'use cache'` + `cacheTag` / `updateTag` — await it when possible so pages paint fully populated
3. Use `<Suspense>` only for runtime data (`params`, `searchParams`, `connection()`); avoid stacking `loading.tsx` + nested skeletons on catalog routes
4. One shell per route (Partial Prefetching) — use `<Link prefetch>` for deeper per-link prefetch
5. Never call `auth.api.getSession()` inside cached functions
6. Parallelize independent Effect fibers / promises on page load
7. Use `next/image` + `next/font` with `display: swap`

## Customization

- **Products** — edit `drizzle/seed.ts` or insert rows; revalidate with `updateTag('products')`
- **Categories** — add to `categories` + `product_categories`
- **Stripe** — set env vars; mock path disables automatically
- **OAuth** — add `socialProviders` to `lib/auth.ts` (Better Auth)

## Deploy

Works on Vercel + any Postgres (Neon, Supabase, RDS):

1. Set env vars (including `BETTER_AUTH_URL` to your production URL)
2. Run `pnpm db:push` against production
3. Optionally seed, then configure Stripe webhook → `/api/webhooks/stripe`

## License

MIT — use this as a starting point for your own store.
