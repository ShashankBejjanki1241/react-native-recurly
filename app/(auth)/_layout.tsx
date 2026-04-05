import "@/global.css";

import { colors } from "@/constants/theme";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Expo Router layout for `(auth)`: Clerk loading UI, stack for sign-in/up/reset, redirect to tabs when signed in.
 * @see https://clerk.com/docs/quickstarts/expo
 */
export default function AuthGroupLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
        accessibilityLabel="Loading sign-in"
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      initialRouteName="sign-in"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
