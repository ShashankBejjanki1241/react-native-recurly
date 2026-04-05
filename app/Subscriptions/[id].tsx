import { RequireAuth } from "@/components/auth/RequireAuth";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RequireAuth>
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
    </RequireAuth>
  );
};

export default SubscriptionDetails;
