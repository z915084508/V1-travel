export const staffRoles = ["admin", "manager", "advisor", "operations", "viewer"] as const;
export type Role = (typeof staffRoles)[number];
export type Account = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  locale: "zh" | "es" | "en";
  kind: "customer" | "staff";
  role: Role | null;
  status: "active" | "invited" | "disabled";
};
export function isRole(value: string): value is Role {
  return staffRoles.includes(value as Role);
}
export function canAccessStaff(account: Account | null): boolean {
  return account?.kind === "staff" && account.status === "active" && !!account.role && isRole(account.role);
}
export function canManageStaff(account: Account | null): boolean {
  return canAccessStaff(account) && account?.role === "admin";
}
export function validPassword(value: string): boolean {
  return value.length >= 10 && value.length <= 128;
}
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
export function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
