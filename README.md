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

Without `DATABASE_URL` the demo catalog, cookie cart, and cookie orders still run. Set `ADMIN_PHONE` to a 10-digit Indian mobile, request an OTP on `/login`, and use the code printed in the **server terminal** (`[otp] …`). That number opens `/admin`.

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
| `AUTH_SECRET` | Session HMAC. Required in production. |
| `ADMIN_PHONE` | 10-digit number that receives the admin role after OTP. |
| `RAZORPAY_KEY_ID` | Razorpay test/live key id (server). |
| `RAZORPAY_KEY_SECRET` | Razorpay secret. Never `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same id as `RAZORPAY_KEY_ID` for Checkout.js. |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature. Source of truth for captured payments. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, sitemap, Open Graph. |

OTP is **not** sent by SMS. In development the code is logged to the server console. Production login returns 503 until an SMS provider is wired — do not log OTP in production.

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
