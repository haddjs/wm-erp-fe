import { UserRole } from "@/types/user";

export const ROUTE_ROLES: Record<string, UserRole[]> = {
  "/": [1, 2, 3],
  "/items": [1, 2, 3],
  "/branches": [1, 2, 3],
  "/category": [1, 2, 3],
  "/monthly-procurement": [1, 2, 3],
  "/event-procurement": [1, 2, 3],
  "/expense": [1, 2],
  "/purchase-records": [1, 2, 3],
  "/logs": [1, 2, 3],
  "/users": [1],
  "/shopee": [1],
};
