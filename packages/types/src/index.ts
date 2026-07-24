export type UserRole = "ADMIN" | "STAFF" | "DRIVER" | "CUSTOMER";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
