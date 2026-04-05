import "@/global.css";

import { colors } from "@/constants/theme";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Settings tab — account, notifications, appearance (placeholder).
 * Top/sides safe area: `(tabs)/_layout.tsx`. Bottom: this `SafeAreaView`.
 */
export default function SettingsTab() {
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
      <Text className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm font-sans-medium text-muted-foreground">
        More options coming soon.
      </Text>
    </SafeAreaView>
  );
}
