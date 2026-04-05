/**
 * Chooses which Clerk second factor to use after password when status is `needs_second_factor`.
 */
export type SignInMfaChoice =
  | { kind: "email_code"; safeIdentifier: string }
  | { kind: "phone_code"; safeIdentifier: string }
  | { kind: "totp" }
  | { kind: "backup_code" }
  | { kind: "unsupported_email_link"; safeIdentifier: string }
  | { kind: "none" };

const PRIORITY = ["email_code", "phone_code", "totp", "backup_code"] as const;

export function pickSignInSecondFactor(
  factors: readonly { strategy: string; safeIdentifier?: string }[],
): SignInMfaChoice {
  if (!factors.length) return { kind: "none" };

  for (const strategy of PRIORITY) {
    const f = factors.find((x) => x.strategy === strategy);
    if (!f) continue;
    if (strategy === "totp") return { kind: "totp" };
    if (strategy === "backup_code") return { kind: "backup_code" };
    const safe = typeof f.safeIdentifier === "string" ? f.safeIdentifier : "";
    if (strategy === "email_code") return { kind: "email_code", safeIdentifier: safe };
    return { kind: "phone_code", safeIdentifier: safe };
  }

  const link = factors.find((x) => x.strategy === "email_link");
  if (link) {
    const safe = typeof link.safeIdentifier === "string" ? link.safeIdentifier : "";
    return { kind: "unsupported_email_link", safeIdentifier: safe };
  }

  return { kind: "none" };
}
