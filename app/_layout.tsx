import "@/global.css";
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { getClerkPublishableKey, isClerkConfigured } from "@/lib/auth/clerk-config";
import { colors } from "@/constants/theme";
import { useEffect } from "react";
import { Text, View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Splash may already be unavailable (e.g. fast refresh). */
});

/** Prefer landing in the main tab stack; auth guard redirects to sign-in when needed. */
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

/** Postfixes align with `global.css` `@theme` font tokens (`font-sans-*` → these names). */
const recurlySansFontMap = {
  "sans-light": PlusJakartaSans_300Light,
  "sans-regular": PlusJakartaSans_400Regular,
  "sans-medium": PlusJakartaSans_500Medium,
  "sans-semibold": PlusJakartaSans_600SemiBold,
  "sans-bold": PlusJakartaSans_700Bold,
  "sans-extrabold": PlusJakartaSans_800ExtraBold,
  "sans-black": PlusJakartaSans_800ExtraBold,
} as const;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(recurlySansFontMap);

  useEffect(() => {
    if (!fontsLoaded && fontError == null) return;

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        /* Already hidden or native module not ready. */
      }
    };

    void hideSplash();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && fontError == null) {
    return null;
  }

  if (!isClerkConfigured()) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: colors.background,
        }}
      >
        <Text className="text-lg font-sans-bold text-primary">
          Clerk is not configured
        </Text>
        <Text className="mt-3 text-base font-sans-medium leading-6 text-muted-foreground">
          Add{" "}
          <Text className="font-sans-bold text-primary">
            EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
          </Text>{" "}
          to your `.env` (see `.env.example` and `docs/clerk-auth-setup.md`).
        </Text>
      </View>
    );
  }

  const publishableKey = getClerkPublishableKey();

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}
