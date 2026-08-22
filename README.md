# Bala Ganapathy Pooja Store

Next.js App Router storefront (and admin) for Bala Ganapathy Pooja Store.

## Getting started

1. Copy `.env.example` to `.env.local`.
2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without `DATABASE_URL` the demo catalog, cookie cart, and cookie orders still run. Set `ADMIN_PHONE` to a 10-digit Indian mobile. Sign in on `/login` with that number and a 4-digit PIN. If the admin user has no PIN yet, set `ADMIN_PIN` in `.env.local` to the same 4 digits, sign in once, then remove `ADMIN_PIN`. That number opens `/admin`.

## Scripts

```bash
npm run dev         # development server
npm run build       # production build
npm run start       # serve the production build
npm run lint        # ESLint
npm run test        # Vitest (money, totals, pincode, signatures)
npm run test:e2e    # Playwright purchase path (no live Razorpay)
npm run db:up       # start local Postgres (Docker)
npm run db:generate # create SQL migrations
npm run db:migrate  # apply migrations
npm run db:seed     # insert demo catalog
```

## Environment variables

Copy `.env.example` to `.env.local`. Validated in `src/server/env.ts`.

| Key | Used for |
| --- | --- |
| `DATABASE_URL` | Postgres. Optional in local demo; required to persist catalog/orders. |
| `AUTH_SECRET` | Session HMAC and PIN pepper. Required in production. |
| `ADMIN_PHONE` | 10-digit number that receives the admin role after PIN sign-in. |
| `ADMIN_PIN` | Optional one-time 4-digit bootstrap if the admin row has no PIN yet. Remove after first sign-in. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Identity client id for “Continue with Google”. Optional. |
| `RAZORPAY_KEY_ID` | Razorpay test/live key id (server). |
| `RAZORPAY_KEY_SECRET` | Razorpay secret. Never `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same id as `RAZORPAY_KEY_ID` for Checkout.js. |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature. Source of truth for captured payments. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, sitemap, Open Graph. |

PIN is stored as a one-way scrypt hash with a pepper from `AUTH_SECRET`. It is never logged. Production does not use SMS OTP.

Google sign-in verifies the ID token on the server. Existing accounts (matched by Google id or verified email) are signed in without a PIN. New Google users still add an Indian mobile, then set a PIN so they can also sign in with the number.

## Database

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

Seed data is **demo catalog only**. Replace it in `/admin` before go-live.

## Go-live checklist

- [ ] Razorpay KYC complete; switch from test keys to live keys.
- [ ] Dashboard webhook: `https://<domain>/api/payments/razorpay/webhook` with `RAZORPAY_WEBHOOK_SECRET`.
- [ ] `AUTH_SECRET` set to a long random value. `ADMIN_PHONE` is the owner’s number.
- [ ] Real inventory, photos, prices, and stock entered in admin (demo SKUs removed or archived).
- [ ] Real serviceable pincodes (demo 110001 / 400001 / 560001 are not the shop’s coverage).
- [ ] Store settings: address, hours, phone, WhatsApp, map URL. Do not invent them.
- [ ] Policy pages reviewed by the owner (they are marked “Owner must review”).
- [ ] GST / CA: invoices and tax copy only after registration is confirmed.
- [ ] Domain, HTTPS, `NEXT_PUBLIC_SITE_URL`, Google Search Console sitemap submit.
- [ ] Backups for Postgres. Do not enable COD or reviews unless asked.
- [ ] `npm run build` and `npm run start` on the production environment.

## Tests

```bash
npm run test
npx playwright install chromium
npm run test:e2e
```

Playwright signs in with a session cookie and stops at order confirmation. It does not open Razorpay Checkout.
