import { saveToken } from "./authStorage";

const BASE_URL = "http://172.20.10.8:8080/api/auth";
// replace with your laptop IP address

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName?: string;
  email: string;
  password: string;
  enabled?: boolean;
}

export interface AuthResponse {
  token: string;
  email: string;
  role?: string;
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await response.text();

  saveToken(text); // Save the token for debugging purposes
  
  console.log("Login response text:", text);

  if (!response.ok) {
    throw new Error(text || "Login failed");
  }

  return JSON.parse(text);
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Registration failed");
  }

  return JSON.parse(text);
}