import type { UserRole } from "@/types/user";

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
