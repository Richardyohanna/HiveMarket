import { getToken } from "../services/authStorage";

const BASE_URL = "http://192.168.0.132:8080/api/products";

export interface BackendProductRequest {
  pName: string;
  pDetail: string;
  pAmount: number;
  pDiscount?: number;
  pCondition: string;
  pQuantity: number;
  category: string;
  location: string;
}

export interface ProductResponse {
  id: number;
  pName: string;
  pDetail: string;
  pAmount: number;
  pDiscount: number | null;
  pCondition: string;
  pQuantity: number;
  category: string;
  location: string;
  sellerEmail: string | null;
  sellerName: string | null;
  sellerProfilePicture: string | null;
  status: "PENDING" | "READY" | "FAILED";
  imageUrls: string[];
  createdAt: string;
}

async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  timeout = 15000
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function createProductOnlyApi(
  data: BackendProductRequest
): Promise<ProductResponse> {
  const token = await getToken();

  if (!token) {
    throw new Error("No token found");
  }

  const requestBody = {
    pName: data.pName,
    pDetail: data.pDetail,
    pAmount: data.pAmount,
    pDiscount: data.pDiscount ?? 0,
    pCondition: data.pCondition,
    pQuantity: data.pQuantity,
    category: data.category,
    location: data.location,
  };

  const response = await fetchWithTimeout(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || "Failed to create product");
  }

  return JSON.parse(responseText);
}

export async function uploadProductImagesApi(
  productId: number,
  imageUris: string[]
): Promise<ProductResponse> {
  const token = await getToken();

  if (!token) {
    throw new Error("No token found");
  }

  const formData = new FormData();

  imageUris.forEach((uri, index) => {
    const fileName = uri.split("/").pop() || `image_${index}.jpg`;
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";

    formData.append("images", {
      uri,
      name: fileName,
      type:
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
          ? "image/png"
          : `image/${ext}`,
    } as any);
  });

  const response = await fetchWithTimeout(`${BASE_URL}/${productId}/images`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, 30000);

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || "Failed to upload product images");
  }

  return JSON.parse(responseText);
}

export async function getAllProductsApi(): Promise<ProductResponse[]> {
  const response = await fetchWithTimeout(`${BASE_URL}/all`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || "Failed to fetch products");
  }

  return JSON.parse(responseText);
}