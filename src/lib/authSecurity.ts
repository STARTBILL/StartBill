/**
 * Security & Access Control Module for StartBill
 * 
 * Centralized authorization rules enforcing that ONLY the Super Administrator
 * (contact.startbill@gmail.com) can access administrative capabilities,
 * regardless of the operational region (Canada, Afrique, Haïti).
 */

export const SUPER_ADMIN_EMAIL = 'contact.startbill@gmail.com';

/**
 * Validates if a given email belongs to the StartBill Super Administrator.
 * Performs trimming, case-insensitivity comparison, and null-safety.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Checks whether an authenticated user profile qualifies for Super Administrator access.
 */
export function isUserSuperAdmin(user?: { email?: string | null; role?: string } | null): boolean {
  if (!user) return false;
  return isSuperAdminEmail(user.email);
}
