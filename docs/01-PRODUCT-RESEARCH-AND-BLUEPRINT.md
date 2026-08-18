# Bala Ganapathy Pooja Store
# Product Research, UX Strategy, and Technical Blueprint

**Project name:** `bala-ganapathy-pooja-store`  
**Storefront:** Next.js + TypeScript + App Router  
**Status:** Research complete. Implementation MVP complete — Phases 0–20 ✅.  
**Date:** 18 August 2026

This document is the product and architecture source of truth. Cursor implementation phases live in `docs/02-CURSOR-IMPLEMENTATION-PHASES.md`.

---

## Assumptions (do not treat as facts)

The following were **not provided** by the business. They are working assumptions and must be confirmed before go-live.

| ID | Assumption | Impact if wrong |
| --- | --- | --- |
| A1 | The store is a physical Indian pooja shop going online for the first time. | Confirmed by brief. |
| A2 | Exact inventory is unknown. Category tree below is a **starter taxonomy**, not the real catalog. | Hide empty categories. Do not invent products. |
| A3 | Store city/address/hours/phone/WhatsApp/email are unknown. | Contact, maps, delivery copy, and GST invoices cannot be finalized. |
| A4 | Delivery coverage is unknown (local only vs pan-India). | Pincode table and shipping rules must be configured, not hardcoded. |
| A5 | GST registration status is unknown. | Invoice format and interstate selling depend on this. |
| A6 | The store sells pooja/spiritual products, **not** confirmed to sell nattu marunthu/herbals. | Do **not** add a Herbal Medicines category unless confirmed. |
| A7 | “Bala Ganapathy” suggests South Indian / Tamil cultural context. Bilingual Tamil+English product names are recommended, not required. | Language UI can start English-first with Tamil product titles. |
| A8 | Sri Ganapathy Herbals (Coimbatore Google Site) is a **competitor/reference**, not this business. Do not copy their address, products, or service areas. | Name similarity is coincidental unless the owner confirms otherwise. |
| A9 | No logo, photography, or brand guidelines exist yet. | Use a wordmark + photography guidelines until assets arrive. |
| A10 | No payment gateway account exists yet. | Razorpay can be integrated in test mode; live payments need KYC. |

---

## A. Product Overview

**Bala Ganapathy Pooja Store** is a production-quality, mobile-first e-commerce website for a physical Indian pooja/spiritual products shop that currently has no proper website.

The site must let a first-time Indian customer, mostly on a phone:

1. Find a product by name or category.
2. Understand price, pack size, and availability.
3. Add one or many items to a cart.
4. Check out without creating an account.
5. Pay with UPI (primary), cards, or netbanking.
6. Trust the store enough to pay (real address, phone, WhatsApp, policies).
7. Track the order and contact the shop if something is wrong.

This is **not** Giri. Giri is a 70-year national catalog. This store should feel like a known neighborhood pooja shop that is easy to buy from online.

Positioning:

- Traditional, trustworthy, professional.
- Premium enough to look legitimate; accessible enough for daily camphor and kumkum purchases.
- Spiritual without visual clutter.
- Conversion-focused.

---

## B. Business Requirements

### Confirmed

- Sell pooja/spiritual products online.
- Production-quality website, not a brochure.
- Mobile-first Indian customers.
- SEO-friendly product and category pages.
- Architecture that can grow from a small catalog to hundreds/thousands of products.
- Next.js App Router + TypeScript. No Vite. No SPA.

### Required customer capabilities

- Browse homepage → category → listing → product → cart → checkout → payment → confirmation → tracking.
- Browse homepage → search → product → cart → checkout.
- Login → account → orders → order details → track.

### Operational capabilities (MVP)

Because this is not Shopify, the store **must** be able to manage products, stock, and orders. A thin admin in the same Next.js app is a business requirement, not a nice-to-have.

### Out of scope unless later confirmed

- Herbal medicines / nattu marunthu
- Pandit booking / homam services
- Gemstones, energized rudraksha certification marketplace
- Wholesale / B2B portal
- International shipping
- Native mobile app
- Live chat
- Multi-vendor marketplace

---

## C. Target Users

### Primary: Home pooja buyer (first-time, mobile)

- Needs a specific item (camphor, agarbatti, vilakku oil, kumkum).
- Searches by Tamil or English name: *karpooram*, *camphor*, *agarbatti*.
- Wants price, pack size (50g / 100g), and whether it is in stock.
- Will abandon if forced to create a password account.
- Needs a phone number to call or WhatsApp if confused.
- Prefers UPI. May want COD if the store offers it.

### Secondary: Festival / kit buyer

- Buys before Vinayagar Chaturthi, Navaratri, Diwali, Varalakshmi, Karthigai.
- Wants a kit (“everything for this pooja”) more than 12 individual SKUs.
- Time-sensitive delivery. Must see cutoff / estimate before paying.

### Tertiary: Returning local customer

- Already knows the physical shop.
- Reorders daily consumables.
- Wants order history and saved address.
- May prefer WhatsApp for special requests; website for repeat catalog buys.

### Not a primary user for MVP

- International NRI catalog shopper (Giri’s model).
- Wholesale temple buyer.
- Astrology / gemstone customer.

---

## D. MVP Scope

Ship a complete purchase path plus the trust pages a first-time payer needs.

**Storefront**

- Homepage, category listing, product detail, search
- Cart with quantity / remove
- Guest checkout (phone + address + pincode check)
- Razorpay payment (UPI, cards, netbanking, wallets via gateway)
- Order confirmation
- Order tracking by order number + phone
- About, Contact (address, map, phone, WhatsApp, hours), policies
- Mobile-first responsive UI
- SEO basics on product/category pages

**Platform**

- PostgreSQL catalog + orders
- Admin: products, variants, inventory, orders, order status
- Auth: phone OTP for customers; email/password or OTP for admin
- Image upload for products
- Seed catalog using placeholder products until real inventory is entered

**Explicitly not in MVP**

- Wishlist
- Reviews (schema ready, UI later)
- Newsletter
- Coupons engine
- COD (prepare data model; enable after RTO policy is decided)
- Bottom navigation bar
- Blog
- Multi-language UI toggle (Tamil product fields yes; full i18n later)
- Advanced recommendations / personalization

---

## E. Future Scope

**Should have (soon after MVP)**

- Customer accounts with order history and saved addresses
- COD with OTP, pincode allowlist, and order value cap
- Festival campaign banners and kit merchandising
- Related products
- Reviews/ratings after real orders exist
- GST-compliant invoice PDF
- WhatsApp order notifications
- Basic coupons (festival codes)

**Nice to have**

- Wishlist
- Newsletter / festival calendar emails
- Tamil UI
- Quick add from listing
- “Notify me” for out of stock
- Partial COD
- Shiprocket / Delhivery tracking sync

**Later**

- Wholesale
- Multi-warehouse
- App
- International shipping
- Personalized recommendations
- Subscription refill for consumables

---

## F. Competitor Research Findings

### Stores analyzed

| Store | URL | Why it matters |
| --- | --- | --- |
| Giri | https://giri.in | Established national pooja e-commerce. Strongest catalog UX. Primary reference. |
| Sri Ganapathy Herbals | https://sites.google.com/view/ganapathyherbals | Local physical shop with pooja + herbals. Shows what “no website” looks like. |
| Vedic Vaani | https://vedicvaani.com | National spiritual mall. Shows clutter to avoid. |
| Pujaroom (Cycle) | https://pujaroom.com | Best visual/IA quality among reviewed stores. |
| PoojaStore.in | https://poojastore.in | Small-catalog Indian store. Policies and kits are useful. |
| Swastik Pooja | https://swastikpooja.com | Large mixed catalog. Homepage anti-pattern. |
| Isha Life | https://ishalife.sadhguru.org | Premium photography and category discipline. Brand is not comparable. |

### F1. Giri.in (primary)

**What it is:** Shopify store for Giri Trading Agency. Huge catalog: samagri, idols, books, deity jewellery, golu, festival collections, ritual kits.

**What works**

- Customers can search by Tamil and English names (*karpooram / camphor*).
- Product titles include size/weight and alternate names. Good for search.
- Collection pages have availability + price filters.
- Weight/size variants matter (10g vs 1kg camphor).
- Festival collections (Aadi Perukku, Avani Avittam, Navaratri) match real Indian demand.
- Quick add on some cards.
- PDP includes availability, SKU, dimensions/weight, quantity, add to cart.
- Trust from brand longevity — not from UI.

**What does not work**

- Homepage and PLP repeat price 4–6 times. Looks broken.
- Catalog is overwhelming for a neighborhood shop to copy.
- Collections dump is alphabetical junk (“12% GST Tax New”). Bad IA.
- Category SEO pages are keyword-stuffed.
- Shipping policy is long, contradictory, and operator-centric.
- Many collection pages show mostly **Sold out**. Kills conversion.
- Reviews widget often empty (“No reviews”). Empty social proof is worse than none.
- Same-day Chennai delivery banner is irrelevant if we are not Giri/Chennai.
- International shipping, idol certification, partial shipment — complexity we must not take.

**Adopt:** bilingual titles, pack-size variants, in-stock filter, festival kits, weight on PDP, sticky add-to-cart on mobile.  
**Avoid:** mega-catalog IA, duplicate prices, stuffed SEO, showing seas of sold-out cards, copying their shipping prose.

### F2. Sri Ganapathy Herbals (Google Site)

**What it is:** Brochure site. About + product name list. No cart, no prices, no search, no checkout.

**What works**

- Clear physical-store identity.
- Tamil product names (Pachai Karpooram, etc.).
- Named service areas. Honest local delivery.
- Mix of trust copy: quality, tradition, staff help.
- Mission is human, not marketplace-speak.

**What does not work**

- Not e-commerce. Cannot buy.
- No photos, prices, stock, or hours on a dedicated contact pattern.
- Herbals and pooja mixed without shoppable structure.
- Google Sites branding undermines professionalism.

**Adopt:** local trust, Tamil names, service-area honesty, visit-the-store block.  
**Avoid:** brochure-only website. Do not copy their inventory or Coimbatore service areas unless this business confirms they are the same shop (they should be treated as different).

### F3. Pujaroom

**What works:** category-first homepage, strong photography, reviews with city, trust stats, FAQs, pan-India delivery statement, UPI/cards/netbanking listed, order tracking mentioned. Calm, premium, uncluttered.

**What does not work:** several homepage products are Sold out; assortment is premium brass/wood, not daily consumables; price point is not a neighborhood samagri shop.

**Adopt:** visual calm, category tiles, review-with-city, trust strip, photography standard.  
**Avoid:** featuring OOS products; positioning as luxury-only.

### F4. Vedic Vaani

**What works:** category entry points, add-to-cart on cards, festival merchandising, footer trust badges.

**What does not work:** clutter; high-ticket gemstones/rudraksha/shaligram; flash sales; long mystical titles; puja services mixed with products.

**Adopt:** nothing structural except “don’t hide add to cart.”  
**Avoid:** spiritual-mall merchandising and service marketplace.

### F5. PoojaStore.in

**What works:** small catalog, kits for festivals, COD + UPI + cards, 7-day return with consumables excluded, tracking after dispatch, bulk/custom as contact not a module.

**What does not work:** newsletter popup, truncated titles, ₹ after price, thin IA, Lucknow-only identity with weak store presence.

**Adopt:** consumable return rules, kit idea, simple policy set.  
**Avoid:** popups, sloppy product cards.

### F6. Swastik Pooja

Anti-pattern: homepage product dump, mixed unrelated collections, password login, keyword-stuffed footer. Do not follow.

### F7. Indian e-commerce UX facts used (Razorpay 2026 research)

- Forced account creation causes ~26% checkout drop-off.
- Guest checkout + phone OTP is the correct default.
- UPI Intent flow (open GPay/PhonePe) beats typing a VPA.
- Uncontrolled COD causes RTO losses. OTP + pincode + cap if COD is enabled.
- Keep checkout fields ≤ 8. Autofill pincode → city/state.

---

## Page-by-page competitor notes (most relevant)

### Giri Homepage

- Purpose: merchandising a huge catalog + current festival.
- Primary user: repeat spiritual shopper who already trusts Giri.
- Main CTA: Add to cart / shop collection.
- Layout: announcement, header, dense product rails. Weak hierarchy.
- Strength: range. Weakness: noise, duplicate prices, not local.
- We adopt festival merchandising **one rail at a time**, not twelve.

### Giri Collection / PLP (`/collections/camphor`, `/collections/all`)

- Purpose: browse a product type.
- Components: filters (availability, type, price), product cards, SEO essay below grid.
- Strength: filter by in-stock. Weakness: OOS majority, price duplication, essays stuffed with keywords.
- We adopt in-stock default. We avoid SEO walls of text.

### Giri PDP (camphor example)

- Purpose: convert a known SKU.
- Components: gallery, title with synonyms, vendor, availability, price, qty, add to cart, specs table (W/H/D/weight), SKU, description, empty reviews, subscribe.
- Strength: specs and pack identity. Weakness: bullet-spam description, empty reviews, price repeated.
- We adopt specs, pack size, availability, how-to-use in 3–5 lines. We avoid fake review widgets.

### Ganapathy Herbals “site”

- Purpose: explain the shop exists.
- Main CTA: implied visit / call / delivery request — but no CTA component.
- We replace this entire pattern with a real storefront plus a Contact/Visit block.

---

## G. Recommended UX Strategy

**North star:** “I can buy tomorrow’s pooja items on my phone in under three minutes, and I know which shop I paid.”

Principles:

1. **Local shop, not spiritual mall.** Short nav. Real contact. No gemstones.
2. **Name-first search.** Karpooram, kungumam, vilakku, agarbatti must work.
3. **Pack size is a product fact.** 50g vs 100g is a variant, not a new mystery SKU with a different URL if it is the same product; use variants. Distinct products (tablets vs crystals) are separate PDPs.
4. **Guest checkout default.** Account is optional after purchase.
5. **Trust before pay.** Address, hours, WhatsApp, policies, and delivery estimate visible before Razorpay opens.
6. **Honest stock.** Never hero an out-of-stock product.
7. **Festival without clutter.** One seasonal banner + one kit rail. Remove after the festival.
8. **No bottom nav for MVP.** Header search + cart icon + category row is enough. Bottom nav duplicates chrome and is an app pattern. Revisit only if analytics show nav failure.
9. **WhatsApp is a contact channel, not a second checkout.** Deep-link `wa.me` with optional product URL. Do not split orders across WhatsApp and cart in MVP.
10. **English UI, bilingual catalog.** Buttons in English. Product titles can include Tamil.

---

## H. Complete Information Architecture

```
/
├── /shop                              All products
├── /c/[categorySlug]                  Category listing
├── /p/[productSlug]                   Product detail
├── /search?q=                         Search results
├── /cart
├── /checkout
├── /checkout/payment                  (only if Razorpay is deferred; prefer overlay)
├── /order/confirmation/[orderId]
├── /track                             Track with order no + phone
├── /account                           (SHOULD HAVE; stub in MVP ok)
│   ├── /orders
│   ├── /orders/[orderId]
│   └── /addresses
├── /about
├── /contact
├── /policies/shipping
├── /policies/returns
├── /policies/privacy
├── /policies/terms
├── /login
└── /admin                             (noindex)
    ├── /products
    ├── /products/new
    ├── /products/[id]
    ├── /orders
    ├── /orders/[id]
    └── /settings                      delivery pin codes, store info
```

### Header IA (desktop + mobile)

- Logo (home)
- Search (dominant on mobile)
- Account
- Cart with count
- Primary categories: Daily Pooja · Idols · Lamps · Incense & Camphor · Kits · Festivals · More

**More** contains: Books, Malas, Oils & Ghee, Kumkum & Turmeric, All products, About, Contact.

Do not build a Giri-style mega-menu.

### Footer IA

- Shop (top categories)
- Help (Track order, Contact, FAQ lite)
- Policies
- Visit the store (address, hours, phone, WhatsApp)
- Social links only if accounts exist

### Starter category taxonomy (ASSUMPTION — hide if empty)

| Category | Slug | Notes |
| --- | --- | --- |
| Daily Pooja Essentials | `daily-pooja` | Catch-all for samagri |
| Idols & Deities | `idols` | |
| Lamps & Diyas | `lamps-diyas` | |
| Incense, Dhoop & Camphor | `incense-camphor` | High-frequency |
| Oils, Ghee & Wicks | `oils-ghee` | Shipping restrictions possible (DG/oil) |
| Kumkum, Turmeric & Vibhuti | `kumkum-turmeric` | |
| Pooja Kits | `pooja-kits` | Festival and daily kits |
| Malas & Accessories | `malas-accessories` | Bells, plates, kalash, malas |
| Religious Books | `books` | |
| Festival Specials | `festivals` | Time-boxed; current festival only |

Optional later, only if inventory exists: Flowers/Garlands (perishable — local delivery only), Brass vessels as a filter under Accessories, Havan/Homam samagri.

**Do not include for MVP unless confirmed:** Herbals, Vastu yantras, Gemstones, Deity dresses, Pandit services.

---

## I. Complete Screen / Page List

Shared chrome on all public pages: announcement (optional), header, footer. Admin has a separate shell.

Loading / empty / error patterns are standardized:

- **Loading:** skeleton matching layout, not a centered spinner as the only state.
- **Empty:** one sentence + CTA (Shop daily pooja / Contact WhatsApp).
- **Error:** apology + retry + WhatsApp/phone.
- **Mobile:** single column; sticky CTA on PDP and checkout; 44px targets; search opens as overlay/page.

### 1. Homepage — `/`

- **Purpose:** Orient, trust, and route to a product in one tap.
- **Primary user:** First-time mobile visitor.
- **Main CTA:** Shop categories / featured product.
- **Components:** AnnouncementBar, Header, CategoryRow, HeroBanner (one), CategoryGrid, ProductRail (Daily essentials), ProductRail (Festival kits, seasonal), TrustStrip, VisitStore, Footer.
- **Data:** featured categories, featured products, active campaign, store settings.
- **Actions:** search, open category, open product, open cart, tap WhatsApp.
- **Nav:** all header links.
- **SEO:** unique title/description; Organization schema.
- **Do not include:** blog, popup newsletter, infinite product dump, sold-out heroes.

### 2. All products — `/shop`

- **Purpose:** Browse everything with filters.
- **Components:** breadcrumbs, heading, FilterBar, SortSelect, ProductGrid, Pagination.
- **Data:** paginated products, facet counts.
- **Actions:** filter in-stock, category, price; sort; paginate; open PDP.
- **SEO:** index; CollectionPage schema.

### 3. Category — `/c/[categorySlug]`

- Same as shop, scoped to category. Unique H1 and intro (2 sentences max, not a keyword essay).
- **Empty:** “We don’t have items in this category online yet. WhatsApp us.”

### 4. Search — `/search?q=`

- **Purpose:** Name lookup.
- **Components:** query echo, result count, ProductGrid. No heavy filters until result count > 24.
- **Empty:** suggestions + category shortcuts + WhatsApp.
- **SEO:** `noindex` for empty/spam queries; index only if needed later. Safer: `noindex,follow` on search.

### 5. Product detail — `/p/[productSlug]`

- **Purpose:** Convert.
- **Components:** gallery, title, price/MRP/discount, availability, variant picker (weight/pack), quantity, Add to cart, Buy now, short description, specs, how to use, delivery checker (pincode), related products (SHOULD), breadcrumbs.
- **Sticky mobile bar:** price + Add to cart.
- **Data:** product, variants, stock, related, store delivery rules.
- **SEO:** Product schema, OG image, canonical, breadcrumb schema.
- **Avoid:** empty review block; 15 poetic bullets.

### 6. Cart — `/cart`

- **Purpose:** Review and proceed.
- **Components:** line items (image, name, variant, price, qty stepper, remove), summary (subtotal, shipping estimate placeholder, grand total), Checkout CTA, continue shopping.
- **Empty:** “Your cart is empty” + Shop daily pooja.
- **No save-for-later in MVP.**

### 7. Login — `/login`

- **Purpose:** OTP login for returning users and post-purchase account.
- **Components:** phone input, send OTP, OTP input, resend.
- **Checkout must not require this.** Deep link `?next=/account/orders`.

### 8. Checkout — `/checkout`

- **Purpose:** Capture contact + address + delivery, then pay.
- **Steps on one page (mobile sections):** (1) Phone + name (2) Address + pincode validation (3) Delivery option + summary (4) Pay.
- **Guest default.** “Save this order to an account” after success.
- **Components:** stepper, address form, pincode serviceability message, order summary, Pay button, COD radio only if enabled.
- **Error:** unserviceable pincode, invalid phone, stock changed, payment fail.

### 9. Order confirmation — `/order/confirmation/[orderId]`

- **Purpose:** Reassure.
- **Components:** success, order number, payment status, items, address, Track CTA, WhatsApp help, optional “save account”.
- **SEO:** `noindex`.

### 10. Track order — `/track` and `/account/orders/[orderId]`

- **Purpose:** Status without calling the shop.
- **Guest:** order number + phone.
- **Components:** timeline, courier link if any, contact.
- **Empty/error:** not found + WhatsApp.

### 11. Account orders — `/account/orders`

- SHOULD HAVE. List of orders. Auth required.

### 12. About — `/about`

- Store story (short), what we sell, that it is a physical shop. No fake 70-year claims.

### 13. Contact — `/contact`

- Address, Google Maps embed, phone, WhatsApp, email, hours, directions.
- Form optional; WhatsApp/phone primary for MVP.
- **Assumption:** exact details TBD.

### 14–17. Policies

Shipping, Returns/Cancellation, Privacy, Terms. Consumables generally non-returnable. Damaged-in-transit with photo within 48h. Legal copy must be reviewed by the owner.

### 18. Admin pages

Noindex. Authz role `admin`. Product CRUD, inventory, order status, store settings (phones, hours, pin codes, Razorpay mode).

---

## J. Complete User Flows

### Flow 1 — Intent purchase

Homepage → Search “camphor” → PDP → variant 50g → qty 2 → Add to cart → Cart → Checkout (guest phone) → Address → Pincode OK → Razorpay UPI → Confirmation → Track

### Flow 2 — Browse purchase

Homepage → Category Incense & Camphor → Filter in stock → PDP → Add to cart → Buy now (skip cart) → Checkout → Pay

### Flow 3 — Festival kit

Homepage festival rail → Kit PDP → Add to cart → maybe add extra agarbatti from related → Checkout

### Flow 4 — Returning customer

Login OTP → Account orders → Order details → Track → Reorder (FUTURE)  
MVP returning: same phone at checkout prefills if session exists.

### Flow 5 — Unserviceable pincode

Checkout → pincode not in list → message “We don’t deliver here yet. WhatsApp to ask.” → cannot pay

### Flow 6 — Payment failure

Razorpay fail → stay on checkout → retry → order remains `pending_payment` then `failed` if webhook says so

### Flow 7 — Contact instead of buy

Any page footer/header WhatsApp → chat with product URL. Staff fulfills offline. **Do not** sync offline orders in MVP.

---

## K. Design System

**Feel:** temple-warm, modern, quiet. Kumkum and turmeric as accents, not as wallpaper.

### Color (recommended tokens)

| Token | Role | Direction |
| --- | --- | --- |
| `--color-brand` | Primary buttons, links | Deep maroon / kumkum `#7A1F2B` range |
| `--color-accent` | Price, festival chip | Turmeric gold, used sparingly |
| `--color-bg` | Page | Warm ivory / sandal `#FBF7F1` |
| `--color-surface` | Cards | White |
| `--color-text` | Body | Charcoal, not pure black |
| `--color-muted` | Meta | Warm gray |
| `--color-success` | In stock | Forest, not neon |
| `--color-danger` | Errors / OOS | Deep red, distinct from brand |
| `--color-border` | Hairlines | Warm taupe |

Do not use purple “spiritual” gradients, mandala backgrounds behind grids, or gold foil textures on buttons.

### Typography

- Headings: a readable serif (e.g. Source Serif 4 or Fraunces) — modest, not decorative blackletter.
- UI/body: Plus Jakarta Sans or Source Sans 3.
- Product price: same sans, tabular figures if possible.
- Tamil: a well-hinted Tamil webfont when titles include Tamil (e.g. Noto Sans Tamil). Load only if needed.

### Spacing, radius, elevation

- 4/8 spacing scale. Section padding 48–64 desktop, 24–32 mobile.
- Radius 8px cards/buttons, 999 chips.
- No heavy shadows. 1px border + slight surface difference.

### Components

- Button: primary (maroon fill), secondary (outline), ghost, WhatsApp (green only on contact actions).
- Product card: 4:5 or 1:1 image, title 2 lines max, price, MRP strike, in-stock dot. **No** duplicate prices. Quick add is SHOULD, not MVP.
- Inputs: 44px height, visible labels, error under field.
- Icons: lucide-react, 24px default, 44px hit area.

### Photography

- Real product photos on white or light wood. No stolen Giri images.
- Festival banners: one photograph + short text. Not clipart gods as UI chrome.

---

## L. Technical Architecture

**Choice: Next.js App Router (full-stack), not Vite SPA, not a separate Nest API for MVP.**

Why Next.js (and why not Vite):

- Product and category pages must be indexable. RSC + server fetch + Metadata API are native.
- Catalog can grow to thousands of SKUs; ISR/SSG+ISR and CDN caching matter.
- Payments and auth secrets must stay on the server.
- One repo: storefront + admin + API routes. Right size for this business.

Rendering:

- Server Components by default (pages, product queries, header chrome where possible).
- Client Components only for cart interactions, checkout forms, Razorpay SDK, search overlay, quantity steppers.

Data:

- PostgreSQL (Neon or Supabase Postgres).
- Drizzle ORM (typed, SQL-shaped, lighter than Prisma for this app).
- Server-side data access in `src/server/` called from RSC and route handlers. No React Query in MVP.

Auth:

- Custom phone OTP + httpOnly session cookie (or Auth.js credentials with OTP). Passwords are a poor fit for customers.
- Admin: separate `role`.

Payments:

- Razorpay **Orders API + Standard Checkout**. Webhook is source of truth.
- Magic Checkout is **not** MVP (extra APIs, COD scoring). Revisit later.

Hosting:

- Vercel for Next.js.
- Managed Postgres.
- Product images: Vercel Blob or Cloudinary; always `next/image`.

---

## M. Folder Structure

```
bala-ganapathy-pooja-store/
  app/
    (storefront)/
      layout.tsx
      page.tsx
      shop/page.tsx
      c/[slug]/page.tsx
      p/[slug]/page.tsx
      search/page.tsx
      cart/page.tsx
      checkout/page.tsx
      order/confirmation/[id]/page.tsx
      track/page.tsx
      about/page.tsx
      contact/page.tsx
      policies/[slug]/page.tsx
      login/page.tsx
      account/...
    (admin)/
      admin/...
    api/
      auth/
      cart/
      checkout/
      payments/razorpay/route.ts
      payments/razorpay/webhook/route.ts
      search/
    robots.ts
    sitemap.ts
  src/
    components/          UI primitives + domain components
    server/              db, queries, auth, payments
    lib/                 cn, formatMoney, constants
    styles/              tokens.css
    types/
  drizzle/
  public/
  docs/
```

App Router may keep `src/app` instead of split `app/` + `src/`. **Pick one in Phase 0 and do not mix:** recommended `src/app` + `src/components` + `src/server`.

---

## N. Dependency List

### Required

| Package | Purpose | Reason |
| --- | --- | --- |
| `next` | Framework | Mandated App Router storefront |
| `react` `react-dom` | UI | Next.js peer |
| `typescript` | Types | Mandated |
| `tailwindcss` `@tailwindcss/postcss` | Styling | Maintainable tokens + utilities |
| `drizzle-orm` | DB access | Typed SQL without Prisma generate friction |
| `postgres` or `@neondatabase/serverless` | Driver | Matches host |
| `drizzle-kit` | Migrations | Schema control |
| `zod` | Validation | Forms, env, API bodies |
| `lucide-react` | Icons | Tree-shakeable, no icon font |
| `server-only` | Boundary | Prevent leaking server code |
| `razorpay` | Server SDK | Order create + signature verify |

### Optional but recommended

| Package | Purpose | When |
| --- | --- | --- |
| `clsx` `tailwind-merge` | `cn()` helper | If className composition gets messy |
| `@vercel/blob` | Image upload | If hosted on Vercel |
| `next-themes` | **Not needed** | Single warm theme |
| `resend` | Email receipts | SHOULD HAVE |
| SMS provider SDK (MSG91/Twilio) | OTP | Required for real OTP; mock only in dev if explicitly allowed |

### Do not add in MVP

Redux, Zustand (unless cart client state becomes painful — prefer server cart), TanStack Query, axios (use `fetch`), Material UI, Chakra, Bootstrap, i18next, Magento, Medusa, Shopify SDK, socket.io, bottom-nav kits, analytics suites beyond a single GA/Plausible script.

Auth.js (`next-auth`): optional. A small OTP session in `src/server/auth` is fewer moving parts. Use Auth.js only if session edge cases justify it.

---

## O. Data Models (logical)

**User:** id, phone, name, email?, role (`customer` \| `admin`), createdAt  
**Address:** id, userId?, guestKey?, name, phone, line1, line2, city, state, pincode, isDefault  
**Category:** id, name, slug, description, image, sortOrder, isActive  
**Product:** id, name, slug, description, howToUse, categoryId, status, seoTitle, seoDescription, images[]  
**Variant:** id, productId, sku, name (e.g. 50g), pricePaise, mrpPaise?, weightGrams?, stockQty, isActive  
**Cart:** id, userId?, sessionId, updatedAt  
**CartItem:** cartId, variantId, qty  
**Order:** id, publicNumber, userId?, phone, email?, addressSnapshot, status, paymentStatus, totals, razorpayOrderId, coupon?  
**OrderItem:** orderId, variantId, nameSnapshot, qty, pricePaise  
**Payment:** id, orderId, razorpayPaymentId, method, amount, status, rawPayload  
**OrderEvent:** orderId, status, at, note  
**StoreSettings:** phones, whatsapp, address, hours, mapUrl, shippingRules  
**ServiceablePincode:** pincode, codAllowed, estimatedDays  

Money stored as **integer paise**. Never float.

Reviews, wishlist, coupons: tables only when those phases are scheduled — not in Phase 1 schema unless adding nullable stubs is cheaper. Prefer **not** to stub unused tables.

---

## P. API Requirements

Prefer Server Actions for cart mutations **or** Route Handlers. Pick Route Handlers for payments/webhooks; Server Actions for cart/qty is fine.

| Endpoint | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/cart` | GET | session cookie | Get cart |
| `/api/cart/items` | POST | cookie | Add |
| `/api/cart/items` | PATCH | cookie | Qty |
| `/api/cart/items` | DELETE | cookie | Remove |
| `/api/checkout` | POST | cookie | Create order from cart, reserve stock |
| `/api/payments/razorpay` | POST | cookie | Create Razorpay order for our order |
| `/api/payments/razorpay/webhook` | POST | signature | Payment truth |
| `/api/auth/otp/send` | POST | public, rate limited | Send OTP |
| `/api/auth/otp/verify` | POST | public, rate limited | Set session |
| `/api/track` | POST | public | Lookup by order number + phone |
| `/api/pincode/[pin]` | GET | public | Serviceability |
| `/api/search` | GET | public | Optional; RSC can query DB directly |

Product listing should be RSC querying DB, not a public REST catalog, to keep it simple. Add a public API later if needed.

---

## Q. Authentication

- Customer: phone + OTP. Session httpOnly, `Secure`, `SameSite=Lax`, rotating CSRF for mutations.
- Guest cart: `cart_id` cookie bound to server cart. On login, merge guest cart into user cart.
- Admin: `role=admin`. `/admin` middleware. Unique admin phone or email allowlist in env.
- OTP: 5-minute expiry, 5 attempts, rate limit per phone and IP.
- No social login in MVP.

---

## R. Cart Architecture

- Server is source of truth (price, stock).
- Cookie identifies cart.
- Add-to-cart checks stock.
- Checkout re-validates stock and price (anti-tamper).
- Client state is only UI (drawer open, optimistic qty) and must reconcile with server.

---

## S. Checkout Architecture

Single page, three sections, one Pay action.

1. Contact: name, phone (prefill if logged in).
2. Address: pincode first → city/state autocomplete from pincode table or India pincode dataset (keep a simple table).
3. Review: lines, shipping charge (rule-based: free over X / flat / local vs rest — **configurable**, not guessed), tax line if GST enabled.
4. Pay: Razorpay Standard Checkout popup/redirect.

Guest allowed. Stock reserved on order create (`pending_payment`) and released on timeout/failure (e.g. 15–30 min job or on webhook failure).

Buy now = create cart with one SKU or skip to checkout with a temporary cart. Simplest: add to cart then jump to `/checkout`.

---

## T. Payment Architecture

**Razorpay Standard Checkout**

- Server creates Razorpay order with amount from **our** order total.
- Client opens Checkout with `order_id`.
- Webhook `payment.captured` marks paid, moves order to `processing`.
- Never trust client `handler` alone.
- UPI / cards / netbanking / wallets enabled in Razorpay dashboard.
- COD: separate `paymentMethod=cod`, no Razorpay capture; SHOULD HAVE.

**KYC (business, not code):** PAN, business proof (GST/Udyam/Shop Act), bank proof, authorised signatory ID. Live keys only after activation. Use test keys in development.

---

## U. Order Management

Admin can: view orders, mark packed/shipped, paste tracking URL, cancel before ship, refund via Razorpay dashboard (MVP: manual refund, record status).

Customer cancel: only `pending_payment` or `processing` before packed, per policy.

---

## V. Order Tracking

Statuses:

`placed` → `payment_confirmed` → `processing` → `packed` → `shipped` → `out_for_delivery` → `delivered`  
Also: `cancelled`, `payment_failed`

UI: vertical timeline, current step highlighted, date/time, courier link if shipped. Language: “Packed at the store”, not warehouse jargon.

---

## W. SEO Strategy

- URLs: `/p/giri-style-human-slug` → `/p/pachai-karpooram-50g` (product slug unique; variants via query or selector, canonical to product).
- Metadata API per product/category.
- Canonical on all indexables.
- `sitemap.ts`: products, categories, static pages. Exclude admin, cart, checkout, search, account.
- `robots.ts`: disallow `/admin`, `/checkout`, `/cart`, `/api`.
- JSON-LD: Organization, BreadcrumbList, Product (price, availability, sku), later AggregateRating when reviews exist.
- Open Graph + Twitter on PDP.
- H1 = product name. Do not keyword-stuff body copy.
- Images: descriptive alt (“Pachai karpooram 50g pack”).
- Indexing: submit Search Console after production domain exists.

---

## X. Accessibility Strategy

- Semantic landmarks, skip link, one H1.
- Keyboard: menu, search, cart qty, checkout, Razorpay is third-party.
- Focus visible (2px maroon outline).
- Contrast on ivory background; gold text never on ivory for body.
- Alt text required in admin.
- Form errors linked with `aria-describedby`.
- Touch targets ≥ 44px.
- `prefers-reduced-motion`.
- Quantity steppers are buttons with names, not divs.

---

## Y. Security Strategy

- Env secrets never `NEXT_PUBLIC_` except Razorpay key **id**.
- Webhook raw-body signature verify (`timingSafeEqual`).
- Zod on all inputs. Parameterized SQL via Drizzle.
- Rate limit OTP and checkout.
- Middleware for admin.
- HTTPS, secure cookies.
- PCI: no card data on our servers.
- Stock and price computed server-side.
- OWASP: XSS (React default + no `dangerouslySetInnerHTML` for user content), CSRF on mutations, IDOR on orders (lookup requires phone + order number or session ownership).
- Image upload type/size checks.

---

## Z. Performance Strategy

- `next/image` + sized product images; AVIF/WebP.
- Lazy rails below fold.
- RSC to keep JS small; do not load Razorpay on homepage.
- Dynamic import Razorpay script on checkout only.
- ISR for category/product pages (revalidate 60–300s) + on-demand revalidate on admin save.
- Pagination, not infinite scroll (better for SEO and back-button).
- Core Web Vitals: LCP product image, INP on add-to-cart, CLS reserved image space.
- CDN via Vercel.

---

## Homepage recommended order (final)

1. Optional announcement (festival or delivery) — hide if empty  
2. Header (logo, search, account, cart)  
3. Horizontal category chips  
4. One hero  
5. Shop by category grid  
6. Daily essentials rail  
7. Festival / kits rail (hide if none)  
8. Trust strip (secure pay, shipping policy short, genuine products, easy contact)  
9. Visit the store (map thumbnail, address, hours, call, WhatsApp)  
10. Footer  

Not on homepage MVP: blog, Instagram grid, newsletter popup, testimonials until real, stats like “4,50,000 devotees”.

---

## Product listing (final)

- Image, name (2 lines), price, optional MRP/discount, in/out stock.
- Sort: default (featured), price low/high, newest.
- Filters: in stock, subcategory if any, price range only if catalog is large.
- Pagination (24 per page).
- Quick add: SHOULD HAVE, not MVP (variant ambiguity).
- Wishlist: not MVP.

## PDP (final)

Gallery, name, price, MRP, stock, variant, qty, Add to cart, Buy now, pincode check,  short description, specs (weight, pack), how to use, delivery promise from settings, related SHOULD HAVE.

## Checkout decisions (final)

| Topic | Decision |
| --- | --- |
| Guest checkout | MUST, default |
| Login | Optional, OTP |
| Mobile OTP | MUST for login; SHOULD verify phone at checkout even for guest |
| Address | MUST |
| Pincode validation | MUST |
| Delivery estimate | MUST, from pincode table or default copy |
| Shipping charges | MUST, configurable rules |
| Coupons | NOT MVP |
| GST line | SHOULD; hide if business unregistered |
| Payment | Razorpay Standard Checkout |
| COD | SHOULD HAVE, not MVP |
| Order summary | MUST |
| Confirmation | MUST |

## Location / contact placement

- Header: phone (desktop), WhatsApp icon.
- Footer: full address, hours, phone, WhatsApp, policies.
- Homepage: Visit the store section.
- Contact page: map + details.
- PDP: “Need help choosing? WhatsApp” secondary link.
- Confirmation: WhatsApp help.

Do not put a floating WhatsApp bubble that covers Add to cart. If a float is used later, sit it above the sticky CTA.

## Mobile

- Search is the most important header control.
- Sticky PDP add-to-cart.
- Sticky checkout Pay.
- Filters: bottom sheet, not left sidebar.
- No bottom nav in MVP.
- Product image 1:1, padding for title.

## Cross-check

| Risk | Resolution |
| --- | --- |
| Missing screens | Admin + track-guest + policies included |
| Duplicate search | Header overlay can route to `/search`; one results page |
| Wishlist/blog/chat | Cut from MVP |
| Vite vs Next | Next only |
| React Query + RSC | RSC + fetch/db only |
| SEO vs checkout | Checkout/cart noindex |
| Payment without webhook | Webhook required in payment phase |
| COD RTO | COD delayed |
| Empty reviews | No review UI until real |
| Unknown inventory | Seed placeholders; admin to replace |
| Security of order track | Phone + order number |

---

## Legal / payments note

GST, invoices, interstate sale, and Razorpay KYC are **business setup**, not frontend decoration. The app should support GST fields when a GSTIN exists. Confirm with a CA before charging tax.
