import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { HomeContent } from "@/content/home-content";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "placed",
  "payment_confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "payment_failed",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "captured",
  "failed",
  "refunded",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: varchar("phone", { length: 15 }).notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  role: userRoleEnum("role").default("customer").notNull(),
  createdAt: timestamps.createdAt,
});

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  guestKey: text("guest_key"),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: varchar("pincode", { length: 6 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamps.createdAt,
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamps.createdAt,
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  howToUse: text("how_to_use"),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "restrict" })
    .notNull(),
  status: productStatusEnum("status").default("draft").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  searchKeywords: text("search_keywords")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  images: text("images")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const variants = pgTable("variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  pricePaise: integer("price_paise").notNull(),
  mrpPaise: integer("mrp_paise"),
  weightGrams: integer("weight_grams"),
  stockQty: integer("stock_qty").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id").notNull().unique(),
  updatedAt: timestamps.updatedAt,
});

export const cartItems = pgTable(
  "cart_items",
  {
    cartId: uuid("cart_id")
      .references(() => carts.id, { onDelete: "cascade" })
      .notNull(),
    variantId: uuid("variant_id")
      .references(() => variants.id, { onDelete: "restrict" })
      .notNull(),
    qty: integer("qty").notNull(),
  },
  (table) => [primaryKey({ columns: [table.cartId, table.variantId] })],
);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicNumber: text("public_number").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  phone: varchar("phone", { length: 15 }).notNull(),
  email: text("email"),
  addressSnapshot: jsonb("address_snapshot").notNull(),
  status: orderStatusEnum("status").default("pending_payment").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  subtotalPaise: integer("subtotal_paise").notNull(),
  shippingPaise: integer("shipping_paise").notNull(),
  grandTotalPaise: integer("grand_total_paise").notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  variantId: uuid("variant_id").references(() => variants.id, {
    onDelete: "restrict",
  }),
  nameSnapshot: text("name_snapshot").notNull(),
  qty: integer("qty").notNull(),
  pricePaise: integer("price_paise").notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  razorpayPaymentId: text("razorpay_payment_id"),
  method: text("method"),
  amountPaise: integer("amount_paise").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamps.createdAt,
});

export const orderEvents = pgTable("order_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  status: orderStatusEnum("status").notNull(),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
  note: text("note"),
});

export const storeSettings = pgTable("store_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  phones: text("phones")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  whatsapp: text("whatsapp"),
  address: text("address"),
  hours: text("hours"),
  mapUrl: text("map_url"),
  announcement: text("announcement"),
  heroImage: text("hero_image"),
  homeContent: jsonb("home_content").$type<HomeContent>(),
  shippingRules: jsonb("shipping_rules").$type<{
    flatShippingPaise: number;
    label: string;
  }>(),
  updatedAt: timestamps.updatedAt,
});

export const serviceablePincodes = pgTable("serviceable_pincodes", {
  pincode: varchar("pincode", { length: 6 }).primaryKey(),
  codAllowed: boolean("cod_allowed").default(false).notNull(),
  estimatedDays: integer("estimated_days"),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  carts: many(carts),
  orders: many(orders),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(variants),
}));

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
  cartItems: many(cartItems),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  variant: one(variants, {
    fields: [cartItems.variantId],
    references: [variants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
  events: many(orderEvents),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(variants, {
    fields: [orderItems.variantId],
    references: [variants.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));
