import { getToken } from "../services/authStorage";

const BASE_URL = "http://172.20.10.8:8080/api/products";

export interface BackendProductRequest {
  pName: string;
  pDetail: string;
  pAmount: number;
  pCondition: string;
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
  pCondition: string;
  pQuantity: number;
  category: string;
  location: string;
  s_id: number;
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
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function createProductOnlyApi(
  data: BackendProductRequest
): Promise<ProductResponse> {
  const requestBody = {
    pName: data.pName,
    pDetail: data.pDetail,
    pAmount: data.pAmount,
    pDiscount: 2000,
    pCondition: data.pCondition,
    pQuantity: 2,
    category: data.category,
    location: data.location,
    s_id: 3,
  };
  const token = await getToken();

  console.log("Creating product with:", requestBody);
  console.log("POST URL:", BASE_URL);

  let response: Response;

  try {
    response = await fetchWithTimeout(
      BASE_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      },
      15000
    );
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Request timed out. Check your server, IP address, or network connection."
      );
    }

    throw new Error(
      "Could not connect to server. Make sure your Spring Boot server is running and your phone can reach it."
    );
  }

  const responseText = await response.text();
  console.log("Create product status:", response.status);
  console.log("Create product response:", responseText);

  if (!response.ok) {
    throw new Error(responseText || "Failed to create product");
  }

  return JSON.parse(responseText);
}

export async function uploadProductImagesApi(
  productId: number,
  imageUris: string[]
): Promise<ProductResponse> {
  const formData = new FormData();
  const token = await getToken();


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

  console.log("Uploading images to:", `${BASE_URL}/${productId}/images`);
  console.log("Image count:", imageUris.length);

  let response: Response;

  try {
    response = await fetchWithTimeout(
      `${BASE_URL}/${productId}/images`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
      30000
    );
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("Image upload timed out.");
    }

    throw new Error("Could not connect to server for image upload.");
  }

  const responseText = await response.text();
  console.log("Upload images status:", response.status);
  console.log("Upload images response:", responseText);

  if (!response.ok) {
    throw new Error(responseText || "Failed to upload product images");
  }

  return JSON.parse(responseText);
}

export async function getAllProductsApi(): Promise<ProductResponse[]> {
  let response: Response;

  try {
    response = await fetchWithTimeout(
      `${BASE_URL}/all`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
      15000
    );
  } catch {
    throw new Error("Could not connect to server.");
  }

  const responseText = await response.text();
 


  if (!response.ok) {
    throw new Error(responseText || "Failed to fetch products");
  }

  return JSON.parse(responseText);
}