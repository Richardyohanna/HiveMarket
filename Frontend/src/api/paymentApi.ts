import { localURL } from "@/localURL";
import { getToken } from "../services/authStorage";

const BASE_URL = `${localURL}/api/payments`; 

export async function initializePayment(data: {
  productId: string;
  buyerId: string;
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

export async function chargeCard(data: any) {

  const token = await getToken();

  const response = await fetch(
    `${BASE_URL}/charge/card`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function submitPin(
  pin: string,
  reference: string
) {

  const token = await getToken();

  const response = await fetch(
    `${BASE_URL}/submit-pin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pin,
        reference,
      }),
    }
  );

  return response.json();
}

export async function submitOtp(
  otp: string,
  reference: string
) {

  const token = await getToken();

  const response = await fetch(
    `${BASE_URL}/submit-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        otp,
        reference,
      }),
    }
  );

  return response.json();
}

export async function chargeBankTransfer(
  email: string,
  amount: number,
  reference: string,

) {

  const token = await getToken();

  if (token == null) {

    throw new Error("User not authenticated");

  }

  const response = await fetch(
    `${BASE_URL}/charge/bank-transfer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        amount,
        reference
      }),
    }
  );

  if (!response.ok) {

    throw new Error("Failed to initialize bank transfer");

  }

  return response.json();
}
