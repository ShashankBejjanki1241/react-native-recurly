import "@/global.css";
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Splash may already be unavailable (e.g. fast refresh). */
});

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

  return <Stack screenOptions={{ headerShown: false }} />;
}
