import "@/global.css";

import { colors } from "@/constants/theme";
import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Home tab — quick links for dev / onboarding flows.
 * Top/sides safe area: `(tabs)/_layout.tsx`. Bottom: this `SafeAreaView`.
 */
export default function HomeTab() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-5 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="min-h-[320px] items-center justify-center">
          <Text className="text-center text-xl font-sans-bold text-primary">
            Recurly
          </Text>
          <Text className="mt-2 max-w-[300px] text-center text-base font-sans-medium text-muted-foreground">
            Subscription management — dev shortcuts below.
          </Text>

          <Link
            href="/onboarding"
            className="mt-6 rounded-2xl bg-primary px-6 py-4"
          >
            <Text className="text-center font-sans-bold text-white">
              Onboarding
            </Text>
          </Link>
          <Link
            href="/(auth)/sign-in"
            className="mt-3 rounded-2xl border border-border bg-card px-6 py-3.5"
          >
            <Text className="text-center font-sans-semibold text-primary">
              Sign in
            </Text>
          </Link>
          <Link
            href="/(auth)/sign-up"
            className="mt-3 rounded-2xl border border-border bg-card px-6 py-3.5"
          >
            <Text className="text-center font-sans-semibold text-primary">
              Sign up
            </Text>
          </Link>

          <View className="mt-8 w-full max-w-sm border-t border-border pt-6">
            <Text className="mb-3 text-center text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground">
              Sample subscriptions
            </Text>
            <Link href="/Subscriptions/spotify" asChild>
              <Text className="text-center text-base font-sans-medium text-accent underline">
                Spotify
              </Text>
            </Link>
            <Link
              href={{ pathname: "/Subscriptions/[id]", params: { id: "Claude" } }}
              asChild
            >
              <Text className="mt-2 text-center text-base font-sans-medium text-accent underline">
                Claude Max
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
