/**
 * Security & Access Control Module for StartBill
 * 
 * Centralized authorization rules enforcing that authorized Administrators
 * (contact.startbill@gmail.com and the Canadian regional admin admin.canada@startbill.com)
 * can access administrative capabilities, manage users, subscriptions and system data.
 */

export const SUPER_ADMIN_EMAIL = 'contact.startbill@gmail.com';
export const CANADA_ADMIN_EMAIL = 'admin.canada@startbill.com';

export const ADMIN_EMAILS: readonly string[] = [
  SUPER_ADMIN_EMAIL.toLowerCase(),
  CANADA_ADMIN_EMAIL.toLowerCase(),
];

/**
 * Validates if a given email belongs to an authorized StartBill Administrator.
 * Performs trimming, case-insensitivity comparison, and null-safety.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(clean);
}

/**
 * Checks whether an authenticated user profile qualifies for Administrator access.
 */
export function isUserSuperAdmin(user?: { email?: string | null; role?: string } | null): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return isSuperAdminEmail(user.email);
}

