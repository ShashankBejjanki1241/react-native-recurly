/**
 * Auth UI and home-header types (Clerk session is the runtime source of truth).
 */

/** Sign-up flow steps after email/password submit. */
export type AuthSignUpPhase = "form" | "verify";

/** Sign-in steps: credentials, then optional MFA / 2FA. */
export type AuthSignInPhase = "credentials" | "mfa";

/** Forgot-password flow: request code → verify → new password → MFA method choice → MFA code. */
export type AuthForgotPasswordStep =
  | "email"
  | "verify"
  | "new_password"
  | "mfa_choose"
  | "mfa";

/** Inline field validation / API messages for auth forms. */
export type AuthFieldErrors = {
  email?: string;
  password?: string;
  code?: string;
  form?: string;
};

/** Data passed from Clerk `useUser()` into the home header. */
export type HomeHeaderUserContent = {
  displayName: string;
  /** Profile image URL from Clerk, or null to use local placeholder asset. */
  imageUrl: string | null;
};

export type AuthBrandHeaderProps = {
  /** e.g. "Sign in" / "Sign up" */
  tagline: string;
};

/** Optional legal links under auth forms; omit all props to keep static copy only. */
export type AuthLegalFooterProps = {
  termsUrl?: string;
  privacyUrl?: string;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
};

export type AuthPasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  autoComplete?: "password" | "new-password";
  errorText?: string;
  /** Accessibility id for tests / screen readers */
  inputAccessibilityLabel: string;
};
