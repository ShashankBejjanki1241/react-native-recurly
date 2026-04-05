import type { HomeHeaderUserContent } from "@/types/auth";

type ClerkLikeUser = {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  imageUrl?: string | null;
};

/**
 * Map Clerk `User` to a stable display payload for the home header.
 */
export function mapClerkUserToHomeHeader(
  user: ClerkLikeUser | null | undefined,
): HomeHeaderUserContent | null {
  if (!user) return null;

  const fromParts = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const displayName =
    (user.fullName && user.fullName.trim()) ||
    fromParts ||
    user.primaryEmailAddress?.emailAddress?.trim() ||
    "Account";

  return {
    displayName,
    imageUrl: typeof user.imageUrl === "string" && user.imageUrl.length > 0
      ? user.imageUrl
      : null,
  };
}
