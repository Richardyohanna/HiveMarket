// src/store/cartStore.ts
/*
import { create } from "zustand";
import {
  addCartApi,
  getAllCartProductsApi,
  removeFromCartApi,
} from "../api/cartAPi";
import { RecentListingItem } from "../types/products";
import { formatTimeAgo } from "./productStore";

interface CartStore {
  cartItems:   RecentListingItem[];
  loading:     boolean;
  error:       string | null;

  // savedIds is derived from cartItems — used by _layout badge & isInCart
  savedIds: string[];

  // ── actions ──────────────────────────────────────────────────────────────
  fetchCart:      (email: string) => Promise<void>;
  addToCart:      (email: string, productId: string, sellerEmail: string) => Promise<void>;
  removeFromCart: (email: string, productId: string, sellerEmail: string) => Promise<void>;
  clearLocalCart: () => void;
  isInCart:       (productId: string | number) => boolean;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cartItems: [],
  loading:   false,
  error:     null,

  // savedIds kept in sync whenever cartItems changes
  get savedIds() {
    return get().cartItems.map((item) => String(item.id));
  },

  // ── Fetch all cart items for this user from the server ───────────────────
  fetchCart: async (email: string) => {
    try {
      set({ loading: true, error: null });

      const products = await getAllCartProductsApi(email);

      console.log("This is the cart products data received from backend:", products, "for email:", email);
      
      const mapped: RecentListingItem[] = products.map((p) => ({
        id:                   p.id,
        pImage:               p.imageUrls?.[0] || "",
        imageUrls:            p.imageUrls || [],
        pName:                p.pName,
        pDetail:              p.pDetail,
        pAmount:              String(p.pAmount),
        pDiscount:            String(p.pDiscount ?? ""),
        pQuantity:            p.pQuantity ?? 1,
        pTimePosted:          p.createdAt ? formatTimeAgo(p.createdAt) : "Just now",
        pQuality:             p.pCondition,
        location:             p.location,
        sellerEmail:          p.sellerEmail ?? "",
        sellerName:           p.sellerName  ?? "",
        sellerProfilePicture: p.sellerProfilePicture ?? "",
        reactions:            p.reactions,
        isReacted:           p.isReacted,
        category:             p.category,
        status:               p.status,
        createdAt:            p.createdAt,
        views:                p.views     ?? 0,
        purchases:            p.purchases ?? 0,
        rating:               p.rating    ?? 0,
      }));

      set({ cartItems: mapped, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load cart",
      });
    }
  },

  // ── Add a product to cart (optimistic + server sync) ─────────────────────
  addToCart: async (email: string, productId: string, sellerEmail: string) => {
    try {
      set({ error: null });
      await addCartApi({ user_email: email, product_id: productId , seller_email:sellerEmail });
      // Re-fetch so the list is up to date
      await get().fetchCart(email);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to add to cart" });
      throw error; // let the UI handle it
    }
  },

  // ── Remove a product from cart ────────────────────────────────────────────
  removeFromCart: async (email: string, productId: string, sellerEmail: string) => {
    // Optimistic removal so UI feels instant
    set((s) => ({
      cartItems: s.cartItems.filter((item) => String(item.id) !== String(productId)),
    }));

    try {
      await removeFromCartApi({ user_email: email, product_id: productId , seller_email: sellerEmail });
    } catch (error) {
      // If server fails, re-fetch to restore correct state
      await get().fetchCart(email);
      set({ error: error instanceof Error ? error.message : "Failed to remove" });
    }
  },

  // ── Clear cart locally (e.g. on logout) ──────────────────────────────────
  clearLocalCart: () => set({ cartItems: [], error: null }),

  // ── Check if a product is already in the cart ────────────────────────────
  isInCart: (productId) =>
    get().cartItems.some((item) => String(item.id) === String(productId)),
}));  */