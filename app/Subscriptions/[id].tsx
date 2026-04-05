import { RequireAuth } from "@/components/auth/RequireAuth";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Deep-linked subscription detail placeholder (protected). */
const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RequireAuth>
      <SafeAreaView className="flex-1" edges={["top", "bottom"]} style={{ flex: 1 }}>
        <View className="flex-1 bg-background p-5">
          <Text className="text-xl font-sans-bold text-primary">
            Subscription details
          </Text>
          <Text className="mt-2 font-sans-medium text-muted-foreground">
            ID: {id}
          </Text>
          <Link href="/(tabs)/subscriptions" asChild>
            <Pressable className="mt-6" accessibilityRole="link">
              <Text className="text-base font-sans-semibold text-accent">
                Back to subscriptions
              </Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </RequireAuth>
  );
};

export default SubscriptionDetails;
