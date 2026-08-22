import type { PolicySection } from "@/components/policies/policy-page";
import { STORE_NAME } from "@/lib/constants";

export const SHIPPING_SECTIONS: PolicySection[] = [
  {
    heading: "Where we deliver",
    paragraphs: [
      "We deliver only to pincodes listed in store settings. Enter your pin at checkout. If it is not listed, that order cannot be placed online.",
      "We do not claim pan-India or same-day delivery unless the owner adds that coverage. Demo pins used while the shop is being set up are not a promise of service in those cities.",
    ],
  },
  {
    heading: "Charges and time",
    paragraphs: [
      "Shipping is a flat charge from store settings, shown in the cart and again at checkout, in Indian rupees. The amount is calculated on the server, not typed in by the browser.",
      "We do not publish courier names or delivery ETAs here. Packing happens at the physical shop after payment is confirmed.",
    ],
  },
  {
    heading: "Oils and similar goods",
    paragraphs: [
      "Oils, ghee, and some liquids may be restricted by courier rules. If an item cannot ship to your pin, the shop will say so — we will not invent a workaround on this page.",
    ],
  },
];

export const RETURNS_SECTIONS: PolicySection[] = [
  {
    heading: "Consumables are not returnable",
    paragraphs: [
      "Kumkum, turmeric, vibhuti, camphor, incense, dhoop, wicks, oils, ghee, and other packed consumables cannot be returned once the order is packed or dispatched. This includes opened packs and unused packs that have left the shop.",
      "Pooja kits that include consumables follow the same rule for those items.",
    ],
  },
  {
    heading: "Damaged in transit",
    paragraphs: [
      "If a parcel arrives damaged, contact the shop within 48 hours of delivery with photos of the outer pack, the inner pack, and the item. We need those photos to raise the issue.",
      "Do not discard the packaging until the shop confirms. Replacement or refund, if any, is decided by the owner after review — this draft does not promise either.",
    ],
  },
  {
    heading: "Cancellation",
    paragraphs: [
      "You may ask to cancel only while the order is still waiting for payment, or after payment but before it is packed at the store.",
      "Once packed or handed to a courier, cancellation is not available on this site. Unused idols, lamps, or books may be discussed with the shop; that is not an automatic return window.",
    ],
  },
  {
    heading: "Refunds",
    paragraphs: [
      "Money collected through Razorpay, if refunded, goes back on the original payment method in 3–5 working days. After that, the bank or UPI app may take a little longer to show the credit. Cash on delivery is not offered on this site.",
    ],
  },
];

export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    heading: "What we collect",
    paragraphs: [
      `${STORE_NAME} collects a mobile number and a hashed 4-digit PIN to sign you in, and to find your orders. If you use Google, we store the Google account id and verified email. If you save an address, we store the name, phone, street, city, state, and pincode you enter.`,
      "Order lines, totals in paise, and payment status are stored so you can track the order. We do not ask for card numbers on this website.",
    ],
  },
  {
    heading: "Payments",
    paragraphs: [
      "Card, UPI, and netbanking details are entered on Razorpay’s checkout, not on our pages. Razorpay tells us whether payment succeeded. We store Razorpay order and payment ids needed to match that result.",
    ],
  },
  {
    heading: "What we do not do",
    paragraphs: [
      "We do not sell your phone number or address. We do not use your data for ads. Guest tracking requires both the order number and the phone used at checkout; one without the other is not enough.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "Account, address, and order records are kept so the shop can fulfil and support orders. Exact retention should be set by the owner before go-live. Contact the shop if you want a number or address removed where the law allows.",
    ],
  },
];

export const TERMS_SECTIONS: PolicySection[] = [
  {
    heading: "Using this site",
    paragraphs: [
      `These terms apply when you browse or buy from ${STORE_NAME} online. The catalog is a neighbourhood pooja shop’s stock, not a marketplace of other sellers.`,
      "You must be able to complete a purchase in India. Prices are shown in Indian rupees from integer paise. Stock can change; we do not sell what we cannot fulfil.",
    ],
  },
  {
    heading: "Orders and payment",
    paragraphs: [
      "Adding to cart, saving an address, and checkout require signing in with your mobile number and PIN (or Google). An order is created only after you confirm the saved address.",
      "Payment is taken by Razorpay when the shop has enabled it. Until payment is confirmed, the order stays pending. Failed payments can be retried from the confirmation page.",
    ],
  },
  {
    heading: "Products",
    paragraphs: [
      "Names, photos, and pack sizes are as listed. Demo catalog items are stand-ins until the owner replaces them. Ritual use and outcomes are not guaranteed.",
      "We do not sell herbal medicines on this site unless the owner later adds that category.",
    ],
  },
  {
    heading: "Law",
    paragraphs: [
      "These terms are meant for India. The owner must replace this draft with reviewed terms, including GST and consumer-law wording, before relying on it.",
    ],
  },
];
