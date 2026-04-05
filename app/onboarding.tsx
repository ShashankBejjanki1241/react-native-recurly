import "@/global.css";

import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEATURES = [
  {
    icon: "calendar-outline" as const,
    title: "Never miss a renewal",
    body: "Upcoming charges, trials, and cancel-by dates in one clear timeline.",
  },
  {
    icon: "wallet-outline" as const,
    title: "See where money goes",
    body: "Monthly and yearly spend across subscriptions, without spreadsheet pain.",
  },
  {
    icon: "notifications-outline" as const,
    title: "Nudges that respect you",
    body: "Reminders before renewals — quiet by default, useful when it matters.",
  },
] as const;

function triggerLightHaptic() {
  if (Platform.OS === "web") return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function OnboardingScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-5 pb-10 pt-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-xs font-sans-semibold uppercase tracking-widest text-muted-foreground">
            Recurly
          </Text>
          <Link href="/" replace asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              hitSlop={12}
              onPress={triggerLightHaptic}
            >
              <Text className="text-sm font-sans-semibold text-accent">
                Skip
              </Text>
            </Pressable>
          </Link>
        </View>

        <View className="mt-6">
          <Text className="text-3xl font-sans-extrabold leading-tight text-primary">
            Subscriptions,{"\n"}without the chaos.
          </Text>
          <Text className="mt-4 max-w-md text-base font-sans-medium leading-6 text-muted-foreground">
            One place to track plans, renewals, and spend — so you stay in control
            without living in your email inbox.
          </Text>
        </View>

        <View className="mt-10 gap-4">
          {FEATURES.map((item) => (
            <View
              key={item.title}
              className="flex-row gap-4 rounded-2xl border border-border bg-card px-4 py-4"
            >
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={colors.accent}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-base font-sans-bold text-primary">
                  {item.title}
                </Text>
                <Text className="mt-1 text-sm font-sans-medium leading-5 text-muted-foreground">
                  {item.body}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-auto min-h-8" />

        <View className="gap-3 pt-6">
          <Link href="/(auth)/sign-up" replace asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create an account"
              className="rounded-2xl bg-primary px-6 py-4 active:opacity-90"
              onPressIn={triggerLightHaptic}
            >
              <Text className="text-center text-base font-sans-bold text-white">
                Create account
              </Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/sign-in" replace asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              className="rounded-2xl border border-border bg-card px-6 py-4 active:opacity-90"
              onPressIn={triggerLightHaptic}
            >
              <Text className="text-center text-base font-sans-semibold text-primary">
                I already have an account
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
