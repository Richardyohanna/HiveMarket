export type ProductCondition =
  | "NEW"
  | "LIKE NEW"
  | "UK USED"
  | "GOOD"
  | "FAIR"
  | "USED";

export interface CreateProductPayload {
  pName: string;
  pDetail: string;
  pAmount: number;
  pCondition: ProductCondition;
  category: string;
  location: string;
  images: string[];
}

export interface ProductResponse {
  id: number;
  pName: string;
  pDetail: string;
  pAmount: number;
  pDiscount: number;
  pCondition: ProductCondition;
  pQuantity: number;
  category: string;
  location: string;
  s_id: number;
  status: "PENDING" | "READY" | "FAILED";
  imageUrls: string[];
}

export interface CreateProductResult {
  success: boolean;
  productId?: number;
}

export interface RecentListingItem {
  id: string;
  pImage: string;
  pName: string;
  pDetail: string;
  pAmount: string;
  pTimePosted: string;
  pQuality: string;
  location?: string;
  pDiscount?: string;
  status?: "PENDING" | "READY" | "FAILED";
}

export interface ProductStore {
  productName: string;
  description: string;
  price: string;
  category: string;
  condition: ProductCondition;
  location: string;
  images: string[];

  recentListings: RecentListingItem[];

  loading: boolean;
  error: string | null;
  successMessage: string | null;

  setProductName: (value: string) => void;
  setDescription: (value: string) => void;
  setPrice: (value: string) => void;
  setCategory: (value: string) => void;
  setCondition: (value: ProductCondition) => void;
  setLocation: (value: string) => void;

  addImages: (newImages: string[]) => void;
  removeImage: (index: number) => void;
  clearForm: () => void;

  setRecentListings: (products: RecentListingItem[]) => void;
  addRecentListing: (product: RecentListingItem) => void;
  updateRecentListing: (
    id: string,
    updated: Partial<RecentListingItem>
  ) => void;

  loadRecentListings: () => Promise<void>;
  createProduct: () => Promise<CreateProductResult>;
}