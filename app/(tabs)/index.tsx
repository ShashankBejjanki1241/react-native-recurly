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
        contentContainerClassName="flex-grow px-6 pb-12 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="min-h-[320px] w-full max-w-md self-center items-center justify-center px-1">
          <Text className="text-center text-4xl font-sans-extrabold tracking-[-0.5px] text-primary">
            Recurly
          </Text>
          <Text className="mt-3 max-w-[300px] text-center text-base font-sans-medium leading-6 tracking-wide text-muted-foreground">
            Subscription management — dev shortcuts below.
          </Text>

          <View className="mt-8 w-full max-w-sm gap-3">
            <Link
              href="/onboarding"
              className="rounded-2xl bg-primary px-6 py-4"
            >
              <Text className="text-center text-base font-sans-bold tracking-wide text-white">
                Onboarding
              </Text>
            </Link>
            <Link
              href="/(auth)/sign-in"
              className="rounded-2xl border border-border bg-card px-6 py-3.5"
            >
              <Text className="text-center text-base font-sans-semibold tracking-wide text-primary">
                Sign in
              </Text>
            </Link>
            <Link
              href="/(auth)/sign-up"
              className="rounded-2xl border border-border bg-card px-6 py-3.5"
            >
              <Text className="text-center text-base font-sans-semibold tracking-wide text-primary">
                Sign up
              </Text>
            </Link>
          </View>

          {/*
            Sample subscriptions (static examples, no links) — restore if needed.
            <View className="mt-10 w-full max-w-sm rounded-2xl border border-border bg-card p-5">
              <Text className="mb-4 text-center text-[11px] font-sans-bold uppercase tracking-[0.18em] text-muted-foreground">
                Sample subscriptions
              </Text>
              <View className="gap-2.5">
                <View className="rounded-xl bg-muted px-4 py-3.5">
                  <Text className="text-center text-base font-sans-semibold tracking-wide text-primary">
                    Spotify
                  </Text>
                </View>
                <View className="rounded-xl bg-muted px-4 py-3.5">
                  <Text className="text-center text-base font-sans-semibold tracking-wide text-primary">
                    Claude Max
                  </Text>
                </View>
              </View>
            </View>
          */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
