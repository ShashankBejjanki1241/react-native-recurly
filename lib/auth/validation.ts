const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

/** Returns true when `value` trims to a non-empty string matching a simple email pattern. */
export function isValidEmailFormat(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && EMAIL_RE.test(v);
}

/** Clerk often enforces 8+; we hint before submit. */
export const MIN_SIGN_UP_PASSWORD_LENGTH = 8;

/** True when password length meets `MIN_SIGN_UP_PASSWORD_LENGTH` (Clerk often enforces the same). */
export function isStrongEnoughPassword(value: string): boolean {
  return value.length >= MIN_SIGN_UP_PASSWORD_LENGTH;
}
