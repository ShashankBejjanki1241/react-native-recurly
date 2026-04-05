import type { AuthBrandHeaderProps } from "@/types/auth";
import { Text, View } from "react-native";

export function AuthBrandHeader({ tagline }: AuthBrandHeaderProps) {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap justify-center">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">R</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Recurly</Text>
          <Text className="auth-wordmark-sub">{tagline}</Text>
        </View>
      </View>
    </View>
  );
}
