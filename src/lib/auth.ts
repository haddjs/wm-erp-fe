import {
  LoginPayload,
  LoginResponse,
  RefreshTokenResponse,
  RegisterPayload,
  RegisterResponse,
  UserProfile,
} from "@/types/auth";
import { apiFetch } from "./api";

export async function register(
  payload: RegisterPayload,
): Promise<{ data: RegisterResponse }> {
  return apiFetch("/authentications/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(
  payload: LoginPayload,
): Promise<{ data: LoginResponse }> {
  const res = await apiFetch("/authentications/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.data?.access_token) {
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
  }

  return res;
}

export async function logout(): Promise<{ data: null }> {
  const res = await apiFetch("/authentications/logout", {
    method: "POST",
  });

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  return res;
}

export async function refreshToken(): Promise<{ data: RefreshTokenResponse }> {
  const refresh_token = localStorage.getItem("refresh_token");

  if (!refresh_token) {
    throw new Error("No refresh token available");
  }

  const res = await apiFetch("/authentications/refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token }),
  });

  if (res.data?.access_token) {
    localStorage.setItem("access_token", res.data.access_token);
  }

  return res;
}

export async function getUserProfile(): Promise<{ data: UserProfile }> {
  return apiFetch("/users/profile");
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("access_token");
  return !!token;
}

export function clearAuthData(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
