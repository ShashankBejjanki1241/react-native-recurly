import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

type ListHeadingProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ListHeading({
  title,
  actionLabel,
  onActionPress,
}: ListHeadingProps) {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          className="list-action"
          hitSlop={10}
          android_ripple={{
            color: "rgba(8, 17, 38, 0.12)",
            borderless: false,
          }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          accessibilityHint="Opens the subscriptions tab"
        >
          <Text className="list-action-text">{actionLabel}</Text>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={colors.primary}
            style={{ marginLeft: 2 }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </Pressable>
      ) : null}
    </View>
  );
}
