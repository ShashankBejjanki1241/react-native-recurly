/**
 * Home tab: protected route — requires Clerk session (see `RequireAuth` on tabs + guard below).
 * Subscription rows still use static fixtures until API integration.
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
import { mapClerkUserToHomeHeader } from "@/lib/auth/map-clerk-user";
import { posthog } from "@/lib/posthog";
import { useAuth, useUser } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { tabBar } = components;

type HomeListRow =
  | { type: "header"; key: string }
  | { type: "balance"; key: string }
  | { type: "listHeading"; key: string; title: string; actionLabel?: string }
  | { type: "upcoming"; key: string }
  | { type: "subscription"; key: string; subscription: Subscription }
  | { type: "emptySubscriptions"; key: string };

/** Builds FlatList rows for the home dashboard (header, balance, subscriptions, etc.). */
function buildRows(homeSubscriptions: readonly Subscription[]): HomeListRow[] {
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
      actionLabel: "View all",
    },
  ];
  if (homeSubscriptions.length === 0) {
    rows.push({ type: "emptySubscriptions", key: "empty" });
  } else {
    for (const s of homeSubscriptions) {
      rows.push({ type: "subscription", key: s.id, subscription: s });
    }
  }
  return rows;
}

/** Home tab: subscription list, balance, and Clerk-backed header. */
export default function HomeTab() {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const headerUser = useMemo(() => mapClerkUserToHomeHeader(user), [user]);

  // Static fixtures: empty deps. When subscriptions come from API/state, pass that value into `buildRows` and list it in the dependency array.
  const homeRows = useMemo(
    () => buildRows(HOME_SUBSCRIPTIONS),
    [],
  );

  const bottomPad =
    insets.bottom + tabBar.height + tabBar.horizontalInset;

  /** Renders a single upcoming-renewal card inside the horizontal list. */
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

  /** Maps home list row types to dashboard sections (header, balance, subscriptions, etc.). */
  const renderItem: ListRenderItem<HomeListRow> = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "header":
          return (
            <View className="home">
              <HomeHeader user={headerUser} isUserLoaded={userLoaded} />
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
              actionHint="Opens the subscriptions tab"
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
            <View className="-mx-1 mb-4">
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
              onPress={() => {
                const isExpanding = expandedId !== item.subscription.id;
                setExpandedId((prev) =>
                  prev === item.subscription.id ? null : item.subscription.id,
                );
                posthog.capture("home_subscription_expanded", {
                  subscription_id: item.subscription.id,
                  subscription_name: item.subscription.name,
                  expanded: isExpanding,
                });
              }}
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
    [expandedId, headerUser, renderUpcomingItem, userLoaded],
  );

  /** Stable row key for the home `FlatList`. */
  const keyExtractor = useCallback((row: HomeListRow) => row.key, []);

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: bottomPad,
    }),
    [bottomPad],
  );

  const listProps = useMemo(
    () => ({
      data: homeRows,
      renderItem,
      keyExtractor,
      showsVerticalScrollIndicator: false,
      keyboardShouldPersistTaps: "handled" as const,
      contentContainerStyle,
      removeClippedSubviews: true,
    }),
    [contentContainerStyle, homeRows, keyExtractor, renderItem],
  );

  if (!authLoaded) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
        edges={["bottom"]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <FlatList {...listProps} />
    </SafeAreaView>
  );
}
