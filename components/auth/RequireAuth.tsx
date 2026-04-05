import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import type { ReactNode } from "react";

/**
 * Navigation guard: only render children when Clerk session is active.
 * Unauthenticated users are sent to sign-in.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <>{children}</>;
}
