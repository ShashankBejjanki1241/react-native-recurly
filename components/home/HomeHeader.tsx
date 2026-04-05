import images from "@/constants/images";
import { icons } from "@/constants/icons";
import { HOME_USER } from "@/constants/data";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

export function HomeHeader() {
  return (
    <View className="home-header">
      <View className="home-user">
        <Image
          source={images.avatar}
          className="home-avatar"
          resizeMode="cover"
          accessibilityLabel="Profile photo"
        />
        <Text
          className="home-user-name"
          numberOfLines={2}
          accessibilityRole="header"
        >
          {HOME_USER.name}
        </Text>
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
