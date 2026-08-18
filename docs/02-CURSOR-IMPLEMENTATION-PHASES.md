# Bala Ganapathy Pooja Store — Cursor Implementation Phases

Read `docs/01-PRODUCT-RESEARCH-AND-BLUEPRINT.md` before every phase.

Project name: `bala-ganapathy-pooja-store`  
Stack: Next.js App Router, TypeScript, Tailwind, Drizzle, PostgreSQL, Razorpay  
Do not use Vite. Do not build a client-only SPA.

## Progress

- [x] PHASE 0 — Project initialization ✅
- [x] PHASE 1 — Architecture and foundation ✅
- [x] PHASE 2 — Design system ✅
- [x] PHASE 3 — Header, navigation, footer shell ✅
- [x] PHASE 4 — Database, schema, seed ✅
- [x] PHASE 5 — Homepage ✅
- [x] PHASE 6 — Category and listing ✅
- [x] PHASE 7 — Product details ✅
- [x] PHASE 8 — Search ✅
- [x] PHASE 9 — Cart ✅
- [x] PHASE 10 — Authentication (phone OTP) ✅
- [x] PHASE 11 — Checkout (address, pincode, guest) ✅
- [x] PHASE 12 — Payment (Razorpay) ✅
- [x] PHASE 13 — Orders and tracking ✅
- [x] PHASE 14 — Static pages and contact ✅
- [x] PHASE 15 — Admin catalog and orders ✅
- [x] PHASE 16 — SEO ✅
- [x] PHASE 17 — Accessibility ✅
- [x] PHASE 18 — Performance ✅
- [x] PHASE 19 — Testing ✅
- [x] PHASE 20 — Production preparation ✅

---

## Global Cursor safety (prepend to every phase prompt)

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

Reuse existing code. Avoid unnecessary dependencies. Avoid duplicate components. Follow the established architecture in docs/01-PRODUCT-RESEARCH-AND-BLUEPRINT.md and this phases file. Keep files focused. Use TypeScript. Avoid hardcoded secrets. Avoid mock logic unless this phase explicitly allows a temporary adapter. Do not break previously completed functionality. Verify the implementation before finishing.
```

Also prepend the phase-specific prompt below.

---

## PHASE 0 — Project initialization ✅

**Objective:** Create the Next.js TypeScript App Router app named `bala-ganapathy-pooja-store`.

**Prerequisites:** Node.js LTS, empty `E-Commerce` workspace (or create the app in this folder if empty).

**Files/components:** `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `.env.example`, `.gitignore`, `README.md`

**Exact functionality:**
- `npx create-next-app@latest bala-ganapathy-pooja-store` with App Router, TypeScript, Tailwind, ESLint, `src/` directory, no `pages/` router.
- If the workspace root is already the project folder, initialize **in place** rather than nesting a second folder.
- App name / metadata title: Bala Ganapathy Pooja Store.
- `.env.example` listing future keys (empty values): `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `AUTH_SECRET`, `ADMIN_PHONE`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_SITE_URL`.
- README: how to run `pnpm dev` or `npm run dev`. Prefer **npm** unless the repo already uses pnpm.

**UI:** Default Next.js page may be replaced with a simple heading “Bala Ganapathy Pooja Store” so the app boots.

**Data / API / Dependencies:** None beyond create-next-app.

**Acceptance criteria:**
- `npm run dev` starts.
- `npm run build` succeeds.
- TypeScript strict mode on.

**Testing:** Build succeeds.

**Definition of Done:** App runs locally; env example exists; no extra libraries.

**Must NOT change:** Do not add UI libraries, state libraries, or fake product data yet.

### Cursor prompt — Phase 0

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 0 — Initialize the Next.js App Router TypeScript project for Bala Ganapathy Pooja Store.

Follow docs/01-PRODUCT-RESEARCH-AND-BLUEPRINT.md and docs/02-CURSOR-IMPLEMENTATION-PHASES.md Phase 0 only.

If the workspace is empty, create the app in the workspace root with create-next-app: App Router, TypeScript, Tailwind, ESLint, src directory. Project name bala-ganapathy-pooja-store. Do not use Vite. Do not add extra dependencies. Add .env.example with the keys listed in Phase 0. Replace the default marketing page with a simple store heading. Verify dev server and production build.
```

---

## PHASE 1 — Architecture and foundation ✅

**Objective:** Freeze folder structure, path aliases, env validation, and base types.

**Prerequisites:** Phase 0.

**Files:** `src/server/env.ts`, `src/types/index.ts`, `src/lib/cn.ts`, `src/lib/money.ts`, `src/lib/constants.ts`, `src/app/robots.ts` stub optional, `next.config.ts`

**Exact functionality:**
- Folder layout from the blueprint (`src/app`, `src/components`, `src/server`, `src/lib`, `src/types`).
- Zod env schema (server). Fail fast if required env missing **only when those features are used**; in this phase, `AUTH_SECRET` and `DATABASE_URL` may be optional until Phase 4. Document this.
- `formatPaise()` / `formatInr()`.
- Constants: store display name, default currency INR, page size 24.
- `cn()` only if `clsx` + `tailwind-merge` are added; otherwise a one-liner. Adding those two packages is allowed if used immediately.

**UI:** None.

**Acceptance criteria:** Imports resolve (`@/` alias). No runtime feature work.

**Must NOT change:** Homepage content beyond layout imports. No DB yet.

### Cursor prompt — Phase 1

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 1 — Architecture foundation only. Create the folder structure, path aliases, money helpers, store constants, and Zod env scaffolding from the blueprint. Do not add database, auth, or UI sections. Do not add unnecessary packages. Verify the build still succeeds.
```

---

## PHASE 2 — Design system ✅

**Objective:** Tokens and primitive components used by the whole store.

**Prerequisites:** Phase 1.

**Files:** `src/app/globals.css`, `src/components/ui/button.tsx`, `input.tsx`, `label.tsx`, `badge.tsx`, `container.tsx`, `section-heading.tsx`, `src/components/product/product-card.tsx` (presentational, mock props ok **only as Story-like examples in a `ui` preview is NOT required** — ProductCard typed props, no fake catalog).

**Exact functionality:**
- CSS variables from blueprint (maroon, ivory, gold accent, charcoal).
- Typography: load two fonts via `next/font` (one serif heading, one sans body). Optional Noto Sans Tamil later.
- Button variants: primary, secondary, ghost.
- ProductCard layout: image slot, title, price, mrp, stock. No duplicate prices.

**UI:** Update root layout to apply background, fonts, and a `Container` wrapper. Home page may show a row of primitive buttons as a temporary visual check — remove in Phase 5 if still there.

**Dependencies:** None new except fonts via `next/font`.

**Acceptance criteria:** Tokens exist; Button and ProductCard compile; contrast is readable.

**Must NOT change:** Do not install a component library (MUI, shadcn CLI dump of 40 files). A small local primitive set only. Do not implement header yet.

### Cursor prompt — Phase 2

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 2 — Design system only. Implement CSS tokens, next/font, and primitive components (Button, Input, Label, Badge, Container, SectionHeading, ProductCard) per the blueprint visual direction: traditional but modern, not cluttered. No header, no catalog, no extra UI libraries. Verify build.
```

---

## PHASE 3 — Header, navigation, footer shell ✅

**Objective:** Global storefront chrome.

**Prerequisites:** Phase 2.

**Files:** `src/app/(storefront)/layout.tsx` (or root layout), `header.tsx`, `footer.tsx`, `search-field.tsx` (navigates to `/search?q=`), `announcement-bar.tsx`, `mobile-nav.tsx`

**Exact functionality:**
- Header: logo wordmark “Bala Ganapathy Pooja Store”, search, account link, cart link (count 0 until Phase 9).
- Category row from constants (links to `/c/[slug]` even if pages 404 until Phase 6).
- Footer: shop links, help (track, contact), policy links, visit-the-store placeholders (TBD copy, no fake Coimbatore address).
- Mobile: collapse categories into a simple menu; search visible; 44px targets.
- No bottom navigation.

**UI:** Sticky header. Search submits to `/search`.

**Data:** Store name from constants. Contact placeholders: “Add store phone in settings” — not invented numbers.

**Acceptance criteria:** All main routes linked. Keyboard accessible menu. No fake address/phone.

**Must NOT change:** Design tokens. Do not implement search results.

### Cursor prompt — Phase 3

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 3 — Header, category row, footer, announcement bar. Follow the blueprint IA. Do not invent store address or phone numbers. Do not add bottom navigation. Search should navigate to /search?q=. Cart and account links can point to future routes. Reuse design-system components. Verify mobile layout and build.
```

---

## PHASE 4 — Database, schema, seed ✅

**Objective:** Real catalog data layer so later pages are not mocked.

**Prerequisites:** Phase 1–3. Local Postgres **or** Neon. If DB is unavailable, document required Docker/Neon setup and still add schema + seed script.

**Files:** `drizzle.config.ts`, `src/server/db/schema.ts`, `src/server/db/index.ts`, `src/server/queries/products.ts`, `drizzle/seed.ts`

**Exact functionality:**
- Tables: users, addresses, categories, products, variants, carts, cart_items, orders, order_items, payments, order_events, store_settings, serviceable_pincodes.
- Money in paise.
- Seed **clearly fake** demo products labeled as demo (e.g. “Demo Camphor 50g”) in assumed categories. Do not pretend they are real Bala Ganapathy inventory.
- Queries: getProductBySlug, listProducts, listCategories.

**Dependencies:** `drizzle-orm`, `drizzle-kit`, postgres driver. Add only these.

**API:** None public yet.

**Acceptance criteria:** `drizzle-kit generate` + migrate + seed documented in README. Queries typecheck.

**Must NOT change:** Header/footer. Do not expose admin yet.

**Temporary adapter:** If no DATABASE_URL, queries may throw a clear error; do **not** silently mock products.

### Cursor prompt — Phase 4

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 4 — Add PostgreSQL + Drizzle schema, migrations, seed, and product queries from the blueprint data models. Seed only demo products clearly marked as demo. Do not invent real business inventory. Do not add UI pages except fixing types. Update README with migrate/seed commands. Do not add Prisma. Verify generate/migrate/seed/build.
```

---

## PHASE 5 — Homepage ✅

**Objective:** Implement recommended homepage structure.

**Prerequisites:** Phase 3–4.

**Files:** `src/app/page.tsx`, `src/components/home/*`

**Exact functionality:** Sections in order: announcement (from settings or hidden), header (existing), category chips, one hero, category grid, daily essentials rail, festival rail (hide if empty), trust strip, visit store placeholders, footer.

**UI:** Hero must not use stolen competitor images. Use a solid/warm banner with text CTA if no asset exists.

**Data:** Featured products from seed (isFeatured flag — add column if missing).

**Acceptance criteria:** No sold-out items in featured rails. No newsletter popup. No blog. No fake testimonials.

**Must NOT change:** Header structure.

### Cursor prompt — Phase 5

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 5 — Homepage only, using the exact section order in the blueprint. Pull categories and featured products from the database queries. Hide empty rails. Do not copy Giri layout. Do not add newsletter popup, blog, or fake reviews. Verify mobile and build.
```

---

## PHASE 6 — Category and listing ✅

**Objective:** `/shop` and `/c/[slug]` with sort, in-stock filter, pagination.

**Prerequisites:** Phase 4–5.

**Files:** `src/app/shop/page.tsx`, `src/app/c/[slug]/page.tsx`, `src/components/catalog/*`

**Exact functionality:**
- Grid of ProductCards linking to `/p/[slug]`.
- Sort: featured, price asc/desc, newest.
- Filter: in stock (default on if many OOS).
- Pagination 24.
- Breadcrumbs.
- Empty and not-found category states.

**SEO:** `generateMetadata` for category.

**Must NOT change:** Homepage rails except linking to these routes.

### Cursor prompt — Phase 6

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 6 — Product listing for /shop and /c/[slug]. Filters, sort, pagination, metadata, empty/error states per blueprint. Reuse ProductCard. No quick-add, no wishlist. Default to showing in-stock products. Verify with seed data and build.
```

---

## PHASE 7 — Product details ✅

**Objective:** PDP with gallery, variants, qty, add to cart **UI wired only if cart API exists; otherwise button calls a stub that will be replaced in Phase 9.** Prefer implementing add-to-cart client against `/api/cart` created in Phase 9 — **if cart is not ready, the button should be a Client Component that will be connected in Phase 9, with a clearly named `AddToCartButton`.**

**Better sequencing:** Implement PDP fully; Add to cart can POST to cart API. If you must split, create a minimal cart POST in this phase (allowed) so the button is real.

**Files:** `src/app/p/[slug]/page.tsx`, gallery, variant selector, qty, sticky mobile CTA.

**Exact functionality:** Specs, how to use, availability, price/MRP, pincode field (can wait for Phase 11 if API missing — show static “Delivery information confirmed at checkout” rather than fake ETAs).

**SEO:** Product metadata + JSON-LD Product.

**Must NOT change:** Listing card API.

**Do not:** Empty review widget.

### Cursor prompt — Phase 7

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 7 — Product detail page /p/[slug]. Gallery, variants, quantity, price, stock, specs, how-to-use, sticky mobile add-to-cart, Product JSON-LD. Do not add a reviews block. Do not fake delivery dates. Reuse primitives. Verify not-found, out-of-stock, and build.
```

---

## PHASE 8 — Search ✅

**Objective:** `/search?q=` using product name, tamilName if column exists, slug.

**Prerequisites:** Phase 6.

**Files:** `src/app/search/page.tsx`, update search SQL (`ilike`).

**Exact functionality:** Result count, grid, empty state with category shortcuts. `noindex` on search pages.

**Must NOT change:** Header search behavior except ensuring GET form works.

### Cursor prompt — Phase 8

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 8 — Search results page. Query name and slug from the database. Empty state and noindex per blueprint. No extra search SaaS. Verify Tamil/English demo names from seed if present. Verify build.
```

---

## PHASE 9 — Cart ✅

**Objective:** Server cart + `/cart` page.

**Prerequisites:** Phase 7.

**Files:** `src/app/api/cart/**`, `src/server/cart.ts`, `src/app/cart/page.tsx`, `AddToCartButton`, header cart count.

**Exact functionality:** Add, change qty, remove, persist via httpOnly cart cookie, re-fetch prices from DB, stock checks, empty state, checkout button to `/checkout` (page can 404 until Phase 11).

**Must NOT change:** Product schema except if a cart relation is missing.

### Cursor prompt — Phase 9

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 9 — Server-side cart with cookie, API, cart page, quantity controls, remove, header count, stock validation. No wishlist. No coupons. Wire PDP add-to-cart. Verify empty/error states and build.
```

---

## PHASE 10 — Authentication (phone OTP) ✅

**Objective:** `/login` OTP session; guest still works.

**Prerequisites:** Phase 1 env `AUTH_SECRET`.

**Files:** `src/app/login/page.tsx`, `src/app/api/auth/otp/*`, `src/server/auth.ts`, `src/middleware.ts` (protect `/account` and `/admin` only).

**Exact functionality:**
- Send OTP, verify, set httpOnly session.
- **Dev adapter allowed:** if no SMS provider env, log OTP to server console in development only. Never in production builds.
- Merge guest cart on login.
- Rate limit send/verify.

**Dependencies:** SMS SDK only if keys present; otherwise dev console adapter.

**Must NOT change:** Force login on checkout.

### Cursor prompt — Phase 10

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 10 — Phone OTP auth, session cookie, login page, cart merge. Do not require login for cart or checkout. Development-only console OTP if SMS keys are missing; never expose OTP in the client. Rate-limit OTP endpoints. Verify build.
```

---

## PHASE 11 — Checkout (address, pincode, guest) ✅

**Objective:** `/checkout` complete except charging.

**Prerequisites:** Phase 9.

**Files:** `src/app/checkout/page.tsx`, pincode API, order create `pending_payment`.

**Exact functionality:** Guest form: name, phone, address, pincode serviceability, shipping rule from settings (use a simple flat shipping in settings seed, e.g. demo ₹50, not a guessed business rate — label as demo). Create order + snapshot items. Stock reservation. Order summary. Pay button can be disabled until Phase 12, or labeled “Continue to payment”.

**UI:** Single page, sticky pay, mobile first, ≤8 fields.

**Must NOT change:** Cart calculations except extracting shared totals helper.

### Cursor prompt — Phase 11

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 11 — Guest checkout page: contact, address, pincode validation, shipping from settings, order summary, create pending_payment order, reserve stock. Do not force account creation. Do not invent real delivery coverage; use seed pincodes. Do not integrate Razorpay yet. Verify unserviceable pincode and stock-changed errors. Verify build.
```

---

## PHASE 12 — Payment (Razorpay) ✅

**Objective:** Pay pending orders; webhook is source of truth.

**Prerequisites:** Phase 11. Razorpay test keys.

**Files:** `src/app/api/payments/razorpay/route.ts`, `webhook/route.ts`, checkout Pay client, confirmation redirect.

**Exact functionality:** Create Razorpay order from server total. Load checkout script only on checkout. Verify signature. Webhook marks `payment_confirmed` / `processing`. Idempotent webhook. Failed payment stays retryable.

**Dependencies:** `razorpay` package.

**Must NOT change:** Amount on client. No card fields on our site.

### Cursor prompt — Phase 12

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 12 — Razorpay Standard Checkout for pending orders. Server-created orders only. Webhook signature verification. Confirmation page on success. Secrets only in server env. Test-mode keys. Do not add Magic Checkout or COD. Verify failed payment retry and build.
```

---

## PHASE 13 — Orders and tracking ✅

**Objective:** Confirmation, guest track, order timeline, account order list if session exists.

**Prerequisites:** Phase 12.

**Files:** `src/app/order/confirmation/[id]/page.tsx`, `src/app/track/page.tsx`, `src/app/account/orders/page.tsx`, timeline component.

**Exact functionality:** Statuses from blueprint. Guest track: order number + phone. IDOR protection. `noindex` confirmation.

**Must NOT change:** Payment webhook except writing `order_events`.

### Cursor prompt — Phase 13

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 13 — Order confirmation, guest tracking (order number + phone), timeline statuses, account orders if logged in. Prevent IDOR. noindex confirmation. No courier integration. Verify not-found and build.
```

---

## PHASE 14 — Static pages and contact ✅

**Objective:** About, Contact, four policies.

**Prerequisites:** Phase 3.

**Files:** `src/app/about/page.tsx`, `contact/page.tsx`, `policies/*/page.tsx`

**Exact functionality:** Contact uses **placeholders** or `store_settings` fields. Map iframe only if `mapUrl` in settings. WhatsApp link only if number in settings. Policy content: sensible Indian e-commerce defaults, consumables non-returnable, marked “Owner must review”.

**Must NOT copy** Giri or Ganapathy Herbals addresses.

### Cursor prompt — Phase 14

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 14 — About, Contact, Shipping, Returns, Privacy, Terms. Use store_settings; do not invent address/phone. Consumables non-returnable. Owner-review note on policies. Reuse layout/footer links. Verify build.
```

---

## PHASE 15 — Admin catalog and orders ✅

**Objective:** Shop can replace demo products.

**Prerequisites:** Phase 4, 10, 13.

**Files:** `src/app/admin/**`, admin nav, product forms, order status updater, settings (contact, pincodes).

**Exact functionality:** CRUD products/variants/images, stock, order status transitions, middleware `role=admin`. `noindex`. Seed one admin via `ADMIN_PHONE` env.

**Must NOT change:** Storefront visual design except using real data.

### Cursor prompt — Phase 15

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 15 — Admin: products, inventory, orders, store settings, pincodes. Protect with admin role. noindex. Image upload with type/size checks. Do not build a second app. Verify an admin can replace demo catalog. Verify build.
```

---

## PHASE 16 — SEO ✅

**Objective:** Metadata, sitemap, robots, JSON-LD, canonical, OG.

**Prerequisites:** Phase 5–7, 14.

**Files:** `src/app/sitemap.ts`, `robots.ts`, metadata in product/category/static pages, `JsonLd` component.

**Exact functionality:** Per blueprint section W. Exclude cart/checkout/admin/search.

**Must NOT:** Keyword stuffing, fake FAQ spam.

### Cursor prompt — Phase 16

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 16 — SEO: Metadata API, sitemap, robots, Product/Breadcrumb/Organization JSON-LD, canonical, Open Graph. No keyword stuffing. Verify sitemap excludes private routes and build.
```

---

## PHASE 17 — Accessibility ✅

**Objective:** Meet the blueprint a11y bar on existing screens.

**Prerequisites:** Storefront pages exist.

**Files:** Existing components — skip link, focus styles, labels, alt enforcement in admin.

**Must NOT:** Redesign visually except contrast fixes.

### Cursor prompt — Phase 17

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 17 — Accessibility pass on existing UI: skip link, landmarks, focus, labels, 44px targets, reduced motion, alt text. Do not add new features. Verify keyboard paths for search, cart qty, checkout fields, and build.
```

---

## PHASE 18 — Performance ✅

**Objective:** Image pipeline, code splitting, ISR, LCP.

**Prerequisites:** PDP and home.

**Files:** `next.config.ts` images, dynamic import Razorpay, `revalidate` on product pages, admin on-demand revalidate.

**Must NOT:** Add a new CDN product unless already on Vercel.

### Cursor prompt — Phase 18

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 18 — Performance: next/image everywhere, reserved image space, lazy below-fold rails, Razorpay script only on checkout, ISR/revalidate for catalog. Do not add new features. Verify production build bundle does not include Razorpay on the homepage.
```

---

## PHASE 19 — Testing ✅

**Objective:** Critical path tests.

**Prerequisites:** Phases 9–13.

**Files:** Playwright e2e: home → search → pdp → cart → checkout (stop before live pay or use Razorpay test). Unit: money, pincode, totals, webhook signature.

**Dependencies:** Playwright, Vitest if unit tests — add only now.

**Must NOT:** Test coverage theater on primitives.

### Cursor prompt — Phase 19

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 19 — Add Vitest for money/totals/webhook verify and Playwright for the purchase path using demo seed data. Do not flakily depend on live Razorpay. Verify tests pass and build.
```

---

## PHASE 20 — Production preparation ✅

**Objective:** Go-live checklist, not new features.

**Prerequisites:** All MVP phases.

**Files:** README production section, `.env.example` complete, error pages `not-found.tsx` `error.tsx`.

**Exact functionality:** Document Razorpay KYC, GST/CA, real inventory, real pincodes, domain, Search Console, WhatsApp number, backup, webhook URL. Production `OTP` must not use console adapter. `next build` on production env.

**Must NOT:** Enable COD or reviews unless explicitly requested.

### Cursor prompt — Phase 20

```
First inspect the existing project and relevant documentation. Do not modify unrelated files.

PHASE 20 — Production preparation: error/not-found pages, README go-live checklist (Razorpay KYC, webhooks, real catalog, pincodes, contact details, no console OTP in production). No new storefront features. Verify production build.
```

---

## Suggested SHOULD-HAVE phases (after MVP)

- **21** Customer addresses + order history polish  
- **22** COD + OTP + pincode allowlist + value cap  
- **23** Related products + festival banner CMS  
- **24** Reviews  
- **25** GST invoice PDF  
- **26** Coupons  
- **27** WhatsApp status templates  

Do not start these until Phase 20 is done.

---

## How to use this file

Copy **one** phase prompt into Cursor. Wait until Definition of Done. Then the next phase. Never paste multiple phases at once.
