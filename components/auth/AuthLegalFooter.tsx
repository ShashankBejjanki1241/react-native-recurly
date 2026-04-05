import { Text, View } from "react-native";

/**
 * Compliance copy; pair with your Privacy / Terms URLs when you publish.
 */
export function AuthLegalFooter() {
  return (
    <View className="auth-legal">
      <Text className="text-center text-xs font-sans-medium leading-5 text-muted-foreground">
        By continuing, you agree to your organization&apos;s terms and acknowledge
        Clerk processes sign-in on your behalf.
      </Text>
    </View>
  );
}
