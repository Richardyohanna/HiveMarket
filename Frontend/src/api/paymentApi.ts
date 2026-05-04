import { localURL } from "@/localURL";
import { getToken } from "../services/authStorage";

const BASE_URL = `${localURL}/api/payments`; // replace with your IP

export async function initializePayment(data: {
  productId: number;
  buyerId: number;
  customerEmail: string;
  amount: number;
}) {

  const token = await getToken();

  if(token == null){

    alert("Please login to register to be able to buy products");

    throw new Error("User not authenticated");
  }

  const response = await fetch(`${BASE_URL}/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data), 
  });

  if (!response.ok) {
    throw new Error("Failed to initialize payment");
  }

  return response.json();
}

export async function verifyPayment(reference: string) {
  const token = await getToken();

  if(token == null){

    throw new Error("User not authenticated");

  }
  
  const response = await fetch(
    `${BASE_URL}/verify?reference=${encodeURIComponent(reference)}`
  );

  if (!response.ok) {
    throw new Error("Failed to verify payment");
  }

  return response.json();
}