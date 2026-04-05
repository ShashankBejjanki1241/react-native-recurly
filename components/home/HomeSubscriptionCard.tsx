import { BrandIconImage } from "@/components/ui/BrandIconImage";
import { CurrencyText } from "@/components/ui/CurrencyText";
import { colors, spacing } from "@/constants/theme";
import type { HomeSubscriptionCardProps } from "@/types/home-components";
import { formatSubscriptionDate } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

const SUB_ICON = spacing[16];

function HomeSubscriptionCardInner({
  subscription,
  expanded,
  onPress,
  onCancelPress,
  isCancelling,
}: HomeSubscriptionCardProps) {
  const {
    icon,
    name,
    plan,
    category,
    paymentMethod,
    status,
    startDate,
    price,
    currency,
    billing,
    renewalDate,
    color,
  } = subscription;

  const canCancel =
    status === "active" && typeof onCancelPress === "function";

  const accentColor =
    typeof color === "string" && color.trim().length > 0 ? color : undefined;

  return (
    <View
      className={
        expanded ? "sub-card sub-card-expanded mb-3" : "sub-card mb-3"
      }
      style={
        !expanded && accentColor
          ? { borderLeftWidth: 4, borderLeftColor: accentColor }
          : undefined
      }
    >
      <Pressable
        onPress={onPress}
        className="sub-head"
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View className="sub-main">
          <BrandIconImage
            source={icon}
            size={SUB_ICON}
            className="rounded-lg"
          />
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>
              {name}
            </Text>
            <Text className="sub-meta" numberOfLines={1}>
              {[plan, category].filter(Boolean).join(" · ") || billing}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <CurrencyText
            value={price}
            currency={currency}
            className="sub-price"
            numberOfLines={1}
          />
          <Text className="sub-billing">{billing}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color={colors.primary}
          style={{ marginLeft: 8 }}
        />
      </Pressable>

      {expanded ? (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status</Text>
                <Text className="sub-value capitalize">{status ?? "—"}</Text>
              </View>
            </View>
            {paymentMethod ? (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Payment</Text>
                  <Text className="sub-value" numberOfLines={2}>
                    {paymentMethod}
                  </Text>
                </View>
              </View>
            ) : null}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Started</Text>
                <Text className="sub-value">
                  {formatSubscriptionDate(startDate)}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Renews</Text>
                <Text className="sub-value">
                  {formatSubscriptionDate(renewalDate)}
                </Text>
              </View>
            </View>
          </View>

          {canCancel ? (
            <Pressable
              onPress={onCancelPress}
              disabled={isCancelling}
              accessibilityState={{ disabled: !!isCancelling }}
              className={
                isCancelling
                  ? "sub-cancel sub-cancel-disabled"
                  : "sub-cancel"
              }
              accessibilityRole="button"
              accessibilityLabel="Cancel subscription"
            >
              <Text className="sub-cancel-text">
                {isCancelling ? "Cancelling…" : "Cancel subscription"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export const HomeSubscriptionCard = memo(HomeSubscriptionCardInner);
