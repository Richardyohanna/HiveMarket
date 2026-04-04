const BASE_URL = "http://172.20.10.8:8080/api/payments"; // replace with your IP

export async function initializePayment(data: {
  productId: number;
  buyerId: number;
  customerEmail: string;
  amount: number;
}) {
  const response = await fetch(`${BASE_URL}/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to initialize payment");
  }

  return response.json();
}

export async function verifyPayment(reference: string) {
  const response = await fetch(
    `${BASE_URL}/verify?reference=${encodeURIComponent(reference)}`
  );

  if (!response.ok) {
    throw new Error("Failed to verify payment");
  }

  return response.json();
}