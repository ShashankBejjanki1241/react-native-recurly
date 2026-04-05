import "@/global.css";

import { colors } from "@/constants/theme";
import { formatClerkError } from "@/lib/auth/clerk-errors";
import { useClerk, useUser } from "@clerk/expo";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Settings tab — account, notifications, appearance (placeholder).
 * Top/sides safe area: `(tabs)/_layout.tsx`. Bottom: this `SafeAreaView`.
 */
export default function SettingsTab() {
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  /** Signs out via Clerk; errors stay on-screen and navigation relies on `RequireAuth`. */
  const onSignOut = async () => {
    setSignOutError(null);
    setSigningOut(true);
    try {
      await signOut();
    } catch (e: unknown) {
      const err =
        e && typeof e === "object" && ("message" in e || "errors" in e)
          ? (e as { message?: string; errors?: { message?: string }[] })
          : {
              message:
                e instanceof Error ? e.message : "Could not sign out. Try again.",
            };
      setSignOutError(formatClerkError(err));
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 px-5 py-6"
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <Text className="text-2xl font-sans-bold text-primary">Settings</Text>
      <Text className="mt-2 max-w-md text-base font-sans-medium leading-6 text-muted-foreground">
        Profile, billing, and app preferences will live here.
      </Text>

      <View className="mt-8 rounded-2xl border border-border bg-card p-5">
        <Text className="text-xs font-sans-semibold uppercase tracking-widest text-muted-foreground">
          Account
        </Text>
        {isLoaded ? (
          <Text className="mt-2 text-base font-sans-semibold text-primary">
            {user?.primaryEmailAddress?.emailAddress ?? "Signed in"}
          </Text>
        ) : (
          <View className="mt-2">
            <ActivityIndicator color={colors.accent} />
          </View>
        )}
        {signOutError ? (
          <Text
            className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-sans-medium text-destructive"
            accessibilityRole="alert"
          >
            {signOutError}
          </Text>
        ) : null}
        <Pressable
          className="auth-button mt-5"
          disabled={signingOut}
          onPress={() => void onSignOut()}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          {signingOut ? (
            <ActivityIndicator color="#081126" />
          ) : (
            <Text className="auth-button-text">Sign out</Text>
          )}
        </Pressable>
      </View>

      <Text className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm font-sans-medium text-muted-foreground">
        More options coming soon.
      </Text>
    </SafeAreaView>
  );
}
