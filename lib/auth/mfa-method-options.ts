import type { SignInMfaChoice } from "@/lib/auth/pick-sign-in-second-factor";

/** Second-factor methods the user can pick (excludes sentinel kinds from `pickSignInSecondFactor`). */
export type SignInMfaSelectableChoice = Exclude<
  SignInMfaChoice,
  { kind: "none" } | { kind: "unsupported_email_link" }
>;

/**
 * Maps Clerk `supportedSecondFactors` into UI options. Skips `email_link` (not supported in-app).
 * Returns an error message when there is nothing the user can select.
 */
export function buildMfaMethodOptions(
  factors: readonly { strategy: string; safeIdentifier?: string }[],
): { options: SignInMfaSelectableChoice[]; error?: string } {
  const options: SignInMfaSelectableChoice[] = [];
  let sawEmailLink = false;

  for (const f of factors) {
    if (f.strategy === "email_link") {
      sawEmailLink = true;
      continue;
    }
    const safe = typeof f.safeIdentifier === "string" ? f.safeIdentifier : "";
    if (f.strategy === "email_code") {
      options.push({ kind: "email_code", safeIdentifier: safe });
    } else if (f.strategy === "phone_code") {
      options.push({ kind: "phone_code", safeIdentifier: safe });
    } else if (f.strategy === "totp") {
      options.push({ kind: "totp" });
    } else if (f.strategy === "backup_code") {
      options.push({ kind: "backup_code" });
    }
  }

  if (options.length === 0) {
    if (sawEmailLink) {
      return {
        options: [],
        error:
          "This account uses email link for the second step. Use codes or an authenticator app in Clerk instead.",
      };
    }
    return {
      options: [],
      error:
        "Two-step verification is required, but no supported method was returned. Check MFA in Clerk.",
    };
  }

  return { options };
}
