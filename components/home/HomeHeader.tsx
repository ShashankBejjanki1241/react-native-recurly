import images from "@/constants/images";
import { icons } from "@/constants/icons";
import { HOME_USER } from "@/constants/data";
import { colors } from "@/constants/theme";
import type { HomeHeaderUserContent } from "@/types/auth";
import { router } from "expo-router";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

export type HomeHeaderProps = {
  /** Clerk-backed profile; null until `useUser` resolves. */
  user: HomeHeaderUserContent | null;
  isUserLoaded: boolean;
};

export function HomeHeader({ user, isUserLoaded }: HomeHeaderProps) {
  const displayName = user?.displayName ?? HOME_USER.name;
  const avatarSource =
    user?.imageUrl != null && user.imageUrl.length > 0
      ? { uri: user.imageUrl }
      : images.avatar;

  return (
    <View className="home-header">
      <View className="home-user">
        <Image
          source={avatarSource}
          className="home-avatar"
          resizeMode="cover"
          accessibilityLabel="Profile photo"
        />
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          {!isUserLoaded ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : null}
          <Text
            className="home-user-name"
            numberOfLines={2}
            accessibilityRole="header"
          >
            {displayName}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => router.push("/(tabs)/subscriptions")}
        hitSlop={12}
        className="home-add-hit"
        accessibilityRole="button"
        accessibilityLabel="Add or manage subscriptions"
      >
        <Image
          source={icons.add}
          className="home-add-icon"
          resizeMode="contain"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </Pressable>
    </View>
  );
}
