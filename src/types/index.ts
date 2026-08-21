import type { HomeContent } from "@/content/home-content";

/** Integer paise. Never store or compute money as float. */
export type Paise = number;

export type UserRole = "customer" | "admin";

export type User = {
  id: string;
  phone: string;
  name: string;
  email?: string | null;
  role: UserRole;
  createdAt: Date;
};

export type Address = {
  id: string;
  userId?: string | null;
  guestKey?: string | null;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type ProductStatus = "draft" | "active" | "archived";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  howToUse?: string | null;
  categoryId: string;
  status: ProductStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images: string[];
  isFeatured: boolean;
};

export type Variant = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  pricePaise: Paise;
  mrpPaise?: Paise | null;
  weightGrams?: number | null;
  stockQty: number;
  isActive: boolean;
};

export type Cart = {
  id: string;
  userId?: string | null;
  sessionId: string;
  updatedAt: Date;
};

export type CartItem = {
  cartId: string;
  variantId: string;
  qty: number;
};

export type OrderStatus =
  | "pending_payment"
  | "placed"
  | "payment_confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "payment_failed";

export type PaymentStatus = "pending" | "captured" | "failed" | "refunded";

export type OrderTotals = {
  subtotalPaise: Paise;
  shippingPaise: Paise;
  grandTotalPaise: Paise;
};

export type Order = {
  id: string;
  publicNumber: string;
  userId?: string | null;
  phone: string;
  email?: string | null;
  addressSnapshot: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totals: OrderTotals;
  razorpayOrderId?: string | null;
};

export type OrderItem = {
  orderId: string;
  variantId: string;
  nameSnapshot: string;
  qty: number;
  pricePaise: Paise;
};

export type Payment = {
  id: string;
  orderId: string;
  razorpayPaymentId?: string | null;
  method?: string | null;
  amountPaise: Paise;
  status: PaymentStatus;
};

export type OrderEvent = {
  orderId: string;
  status: OrderStatus;
  at: Date;
  note?: string | null;
};

export type StoreSettings = {
  phones?: string[] | null;
  whatsapp?: string | null;
  address?: string | null;
  hours?: string | null;
  mapUrl?: string | null;
  announcement?: string | null;
  heroImage?: string | null;
  homeContent?: HomeContent | null;
  shippingRules?: {
    flatShippingPaise: number;
    label: string;
  } | null;
};

export type ServiceablePincode = {
  pincode: string;
  codAllowed: boolean;
  estimatedDays?: number | null;
};
