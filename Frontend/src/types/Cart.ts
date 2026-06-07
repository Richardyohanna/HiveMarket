
export type CartRequest = {
    user_email: string;
    product_id: string;
    seller_email: string;
}

// src/types/Cart.ts



// matches your Spring Boot CartResponse DTO body
export interface CartResponse {
  user_email: string;
  product_id: string;
  seller_email: string;
}

export interface CartStoreType {
  cartItems:    import('./products').RecentListingItem[];
  loading:      boolean;
  error:        string | null;

  // actions
  fetchCart:       (email: string) => Promise<void>;
  addToCart:       (email: string, productId: string, sellerEmail: string) => Promise<void>;
  removeFromCart:  (email: string, productId: string, sellerEmail: string) => Promise<void>;
  clearLocalCart:  () => void;
  isInCart:        (productId: string | number) => boolean;

  // derived — used by _layout badge
  savedIds: string[];
}