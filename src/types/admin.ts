export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  howToUse: string | null;
  categoryId: string;
  categoryName: string;
  status: "draft" | "active" | "archived";
  seoTitle: string | null;
  seoDescription: string | null;
  images: string[];
  isFeatured: boolean;
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    pricePaise: number;
    mrpPaise: number | null;
    weightGrams: number | null;
    stockQty: number;
    isActive: boolean;
  }>;
};
