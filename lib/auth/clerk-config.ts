/**
 * Clerk publishable key — source of truth per Clerk Expo docs:
 * https://clerk.com/docs/quickstarts/expo
 *
 * Supports `EXPO_PUBLIC_*` (Expo) and `NEXT_PUBLIC_*` (if you reuse web env files).
 * Never commit real keys; use `.env` locally and EAS secrets for builds.
 */
export function getClerkPublishableKey(): string {
  const key =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
    "";
  return key;
}

export function isClerkConfigured(): boolean {
  return getClerkPublishableKey().length > 0;
}
