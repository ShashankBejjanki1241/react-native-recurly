import "@/global.css";

import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

/**
 * Auth route group: sign-in / sign-up. Signed-in users are sent to the main app.
 * @see https://clerk.com/docs/quickstarts/expo
 */
export default function AuthGroupLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
