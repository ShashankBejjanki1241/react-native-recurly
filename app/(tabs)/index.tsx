/**
 * Home tab: layout + list composition only. Data is imported from `constants/data`
 * (static until backend). No fetch, cache, or loading UI here.
 */
import "@/global.css";

import { HomeBalanceCard } from "@/components/home/HomeBalanceCard";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeSubscriptionCard } from "@/components/home/HomeSubscriptionCard";
import { ListHeading } from "@/components/home/ListHeading";
import { UpcomingSubscriptionCard } from "@/components/home/UpcomingSubscriptionCard";
import {
  HOME_SUBSCRIPTIONS,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, ListRenderItem, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { tabBar } = components;

type HomeListRow =
  | { type: "header"; key: string }
  | { type: "balance"; key: string }
  | { type: "listHeading"; key: string; title: string; actionLabel?: string }
  | { type: "upcoming"; key: string }
  | { type: "subscription"; key: string; subscription: Subscription }
  | { type: "emptySubscriptions"; key: string };

function buildRows(): HomeListRow[] {
  const rows: HomeListRow[] = [
    { type: "header", key: "header" },
    { type: "balance", key: "balance" },
    {
      type: "listHeading",
      key: "h-upcoming",
      title: "Upcoming",
      actionLabel: "View all",
    },
    { type: "upcoming", key: "upcoming" },
    {
      type: "listHeading",
      key: "h-all",
      title: "All Subscriptions",
      actionLabel: "See all",
    },
  ];
  if (HOME_SUBSCRIPTIONS.length === 0) {
    rows.push({ type: "emptySubscriptions", key: "empty" });
  } else {
    for (const s of HOME_SUBSCRIPTIONS) {
      rows.push({ type: "subscription", key: s.id, subscription: s });
    }
  }
  return rows;
}

const HOME_ROWS = buildRows();

export default function HomeTab() {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const bottomPad =
    insets.bottom + tabBar.height + tabBar.horizontalInset;

  const renderUpcomingItem = useCallback(
    ({ item }: { item: UpcomingSubscription }) => (
      <UpcomingSubscriptionCard
        data={{
          name: item.name,
          price: item.price,
          daysLeft: item.daysLeft,
          icon: item.icon,
          currency: item.currency,
        }}
      />
    ),
    [],
  );

  const renderItem: ListRenderItem<HomeListRow> = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "header":
          return (
            <View className="home">
              <HomeHeader />
            </View>
          );
        case "balance":
          return <HomeBalanceCard />;
        case "listHeading":
          return (
            <ListHeading
              title={item.title}
              actionLabel={item.actionLabel}
              onActionPress={
                item.actionLabel
                  ? () => router.push("/(tabs)/subscriptions")
                  : undefined
              }
              accessibilityHint="Opens the subscriptions tab"
            />
          );
        case "upcoming":
          if (UPCOMING_SUBSCRIPTIONS.length === 0) {
            return (
              <Text className="upcoming-empty-state">
                No upcoming renewals yet.
              </Text>
            );
          }
          return (
            <View className="-mx-1 mb-1">
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(u) => u.id}
                renderItem={renderUpcomingItem}
                contentContainerClassName="pb-1 pl-0.5 pr-5"
              />
            </View>
          );
        case "subscription":
          return (
            <HomeSubscriptionCard
              subscription={item.subscription}
              expanded={expandedId === item.subscription.id}
              onPress={() =>
                setExpandedId((prev) =>
                  prev === item.subscription.id ? null : item.subscription.id,
                )
              }
            />
          );
        case "emptySubscriptions":
          return (
            <Text className="home-empty-state">
              No subscriptions yet. Add one from the wallet tab.
            </Text>
          );
        default:
          return null;
      }
    },
    [expandedId, renderUpcomingItem],
  );

  const keyExtractor = useCallback((row: HomeListRow) => row.key, []);

  const listProps = useMemo(
    () => ({
      data: HOME_ROWS,
      renderItem,
      keyExtractor,
      showsVerticalScrollIndicator: false,
      keyboardShouldPersistTaps: "handled" as const,
      contentContainerStyle: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: bottomPad,
      },
      removeClippedSubviews: true,
    }),
    [bottomPad, keyExtractor, renderItem],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <FlatList {...listProps} />
    </SafeAreaView>
  );
}
