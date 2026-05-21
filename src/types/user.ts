export type UserRole = 1 | 2 | 3;

export const UserRoleLabel: Record<UserRole, string> = {
  1: "Admin",
  2: "General Affairs",
  3: "Finance",
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type AdminCreateUserPayload = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
};

export type UpdateNamePayload = {
  name: string;
};

export type UpdatePasswordPayload = {
  old_password: string;
  new_password: string;
};

export type PaginatedUsers = {
  data: User[];
  paging: {
    current_page: number;
    total_pages: number;
    total_data: number;
    limit: number;
    has_next: boolean;
  };
};
