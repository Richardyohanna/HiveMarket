import { create } from "zustand";
import {
  createProductOnlyApi,
  getAllProductsApi,
  uploadProductImagesApi,
} from "../api/productApi";
import {
  CreateProductResult,
  ProductCondition,
  ProductStore,
  RecentListingItem,
} from "../types/products";

export function formatTimeAgo(dateString: string): string {
  const now = new Date().getTime();
  const posted = new Date(dateString).getTime();
  const diffMs = now - posted;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const initialState = {
  productName: "",
  description: "",
  price: "",
  category: "Select category",
  condition: "NEW" as ProductCondition,
  location: "",
  images: [],
  recentListings: [] as RecentListingItem[],
  loading: false,
  error: null as string | null,
  successMessage: null as string | null,
};

export const useProductStore = create<ProductStore>((set, get) => ({
  ...initialState,

  setProductName: (value: string) => set({ productName: value }),
  setDescription: (value: string) => set({ description: value }),
  setPrice: (value: string) => set({ price: value }),
  setCategory: (value: string) => set({ category: value }),
  setCondition: (value: ProductCondition) => set({ condition: value }),
  setLocation: (value: string) => set({ location: value }),

  addImages: (newImages: string[]) =>
    set((state) => ({
      images: [...state.images, ...newImages].slice(0, 10),
    })),

  removeImage: (index: number) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
    })),

  clearForm: () =>
    set((state) => ({
      productName: "",
      description: "",
      price: "",
      category: "Select category",
      condition: "NEW",
      location: "",
      images: [],
      loading: false,
      error: null,
      successMessage: null,
      recentListings: state.recentListings,
    })),

  setRecentListings: (products: RecentListingItem[]) =>
    set({ recentListings: products }),

  addRecentListing: (product: RecentListingItem) =>
    set((state) => ({
      recentListings: [product, ...state.recentListings],
    })),

  updateRecentListing: (id: string, updated: Partial<RecentListingItem>) =>
    set((state) => ({
      recentListings: state.recentListings.map((item) =>
        item.id === id ? { ...item, ...updated } : item
      ),
    })),

  loadRecentListings: async () => {
    try {
      set({ loading: true, error: null });

      const products = await getAllProductsApi();

      const mappedProducts: RecentListingItem[] = products.map((item) => ({
        id: String(item.id),
        pImage: item.imageUrls?.[0] || "",
        pName: item.pName,
        pDetail: item.pDetail,
        pAmount: String(item.pAmount),
        pDiscount: String(item.pDiscount ?? ""),
        pTimePosted: item.createdAt ? formatTimeAgo(item.createdAt) : "Just now",
        pQuality: item.pCondition,
        location: item.location,
        sellerEmail: item.sellerEmail,
        sellerName: item.sellerName,
        sellerProfilePicture: item.sellerProfilePicture,
        status: item.status,
      }));

      set({
        recentListings: mappedProducts,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch products",
      });
    }
  },

  createProduct: async (): Promise<CreateProductResult> => {
    const {
      productName,
      description,
      price,
      category,
      condition,
      location,
      images,
    } = get();

    if (!productName.trim()) {
      set({ error: "Product name is required", successMessage: null });
      return { success: false };
    }

    if (category === "Select category") {
      set({ error: "Please select a category", successMessage: null });
      return { success: false };
    }

    if (!price.trim()) {
      set({ error: "Price is required", successMessage: null });
      return { success: false };
    }

    if (isNaN(Number(price))) {
      set({ error: "Price must be a valid number", successMessage: null });
      return { success: false };
    }

    if (!description.trim()) {
      set({ error: "Product description is required", successMessage: null });
      return { success: false };
    }

    if (!location.trim()) {
      set({ error: "Location is required", successMessage: null });
      return { success: false };
    }

    if (images.length === 0) {
      set({ error: "Please add at least one image", successMessage: null });
      return { success: false };
    }

    try {
      set({
        loading: true,
        error: null,
        successMessage: null,
      });

      const currentImages = [...images];

      const createdProduct = await createProductOnlyApi({
        pName: productName,
        pDetail: description,
        pAmount: Number(price),
        pDiscount: 0,
        pCondition: condition,
        pQuantity: 1,
        category,
        location,
      });

      const optimisticItem: RecentListingItem = {
        id: String(createdProduct.id),
        pImage: currentImages[0] || "",
        pName: createdProduct.pName,
        pDetail: createdProduct.pDetail,
        pAmount: String(createdProduct.pAmount),
        pTimePosted: createdProduct.createdAt
          ? formatTimeAgo(createdProduct.createdAt)
          : "Just now",
        pQuality: createdProduct.pCondition,
        sellerEmail: createdProduct.sellerEmail,
        sellerName: createdProduct.sellerName,
        sellerProfilePicture: createdProduct.sellerProfilePicture,
        status: "PENDING",
      };

      set((state) => ({
        recentListings: [optimisticItem, ...state.recentListings],
        productName: "",
        description: "",
        price: "",
        category: "Select category",
        condition: "NEW",
        location: "",
        images: [],
        loading: false,
        error: null,
        successMessage: "Post created. Images are uploading...",
      }));

      uploadProductImagesApi(createdProduct.id, currentImages)
        .then((updatedProduct) => {
          set((state) => ({
            recentListings: state.recentListings.map((item) =>
              item.id === String(createdProduct.id)
                ? {
                    ...item,
                    pImage: updatedProduct.imageUrls?.[0] || item.pImage,
                    status: "READY",
                  }
                : item
            ),
            successMessage: "Product uploaded successfully",
            error: null,
          }));
        })
        .catch((error) => {
          set((state) => ({
            recentListings: state.recentListings.map((item) =>
              item.id === String(createdProduct.id)
                ? { ...item, status: "FAILED" }
                : item
            ),
            error:
              error instanceof Error
                ? error.message
                : "Product created, but image upload failed",
            successMessage: null,
          }));
        });

      return { success: true, productId: createdProduct.id };
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Something went wrong",
        successMessage: null,
      });

      return { success: false };
    }
  },
}));