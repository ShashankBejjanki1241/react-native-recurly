import { BrandIconImage } from "@/components/ui/BrandIconImage";
import { CurrencyText } from "@/components/ui/CurrencyText";
import { spacing } from "@/constants/theme";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatUpcomingDaysLeft } from "@/lib/utils";
import { memo, useMemo } from "react";
import { Text, View } from "react-native";

const UPCOMING_ICON = spacing[12];

/** Compact upcoming-renewal row with brand icon, price, and days-left label. */
function UpcomingSubscriptionCardInner({
  data,
}: UpcomingSubscriptionCardProps) {
  const { name, price, daysLeft, icon, currency } = data;
  const daysLabel = formatUpcomingDaysLeft(daysLeft);

  const a11yLabel = useMemo(
    () =>
      `${name}, ${formatCurrency(price, currency ?? "USD")}, ${daysLabel}`,
    [name, price, currency, daysLabel],
  );

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={a11yLabel}
      className="upcoming-card"
    >
      <View className="upcoming-row">
        <BrandIconImage
          source={icon}
          size={UPCOMING_ICON}
          className="rounded-lg"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <View className="upcoming-copy">
          <CurrencyText
            value={price}
            currency={currency}
            className="upcoming-price"
            maxFontSizeMultiplier={1.35}
          />
          <Text
            className="upcoming-meta"
            numberOfLines={1}
            ellipsizeMode="tail"
            maxFontSizeMultiplier={1.3}
          >
            {daysLabel}
          </Text>
        </View>
      </View>
      <Text
        className="upcoming-name"
        numberOfLines={2}
        ellipsizeMode="tail"
        maxFontSizeMultiplier={1.35}
      >
        {name}
      </Text>
    </View>
  );
}

export const UpcomingSubscriptionCard = memo(UpcomingSubscriptionCardInner);
