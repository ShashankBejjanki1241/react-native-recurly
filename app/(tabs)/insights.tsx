import "@/global.css";

import { colors } from "@/constants/theme";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Insights tab — spending trends, renewal calendar, etc. (placeholder).
 * Top/sides safe area: `(tabs)/_layout.tsx`. Bottom: this `SafeAreaView`.
 */
export default function InsightsTab() {
  return (
    <SafeAreaView
      className="flex-1 px-5 py-6"
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <Text className="text-2xl font-sans-bold text-primary">Insights</Text>
      <Text className="mt-2 max-w-md text-base font-sans-medium leading-6 text-muted-foreground">
        Charts and summaries for subscription spend will live here.
      </Text>
      <Text className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm font-sans-medium text-muted-foreground">
        No data yet — connect accounts or add subscriptions to see insights.
      </Text>
    </SafeAreaView>
  );
}
