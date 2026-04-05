/**
 * Auth UI and home-header types (Clerk session is the runtime source of truth).
 */

/** Sign-up flow steps after email/password submit. */
export type AuthSignUpPhase = "form" | "verify";

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
