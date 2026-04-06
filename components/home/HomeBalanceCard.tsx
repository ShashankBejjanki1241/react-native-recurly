/**
 * Presentation only: reads `HOME_BALANCE` from constants. Styling is entirely
 * `home-balance-*` classes in `global.css` (no inline layout/color).
 */
import { CurrencyText } from "@/components/ui/CurrencyText";
import { HOME_BALANCE } from "@/constants/data";
import { formatSubscriptionDate } from "@/lib/utils";
import { Text, View } from "react-native";

/** Home tab balance summary using static `HOME_BALANCE` fixture data. */
export function HomeBalanceCard() {
  const renewalLabel = formatSubscriptionDate(HOME_BALANCE.nextRenewalDate);

  return (
    <View className="home-balance-card">
      <Text className="home-balance-label">Monthly spending</Text>
      <View className="home-balance-row">
        <CurrencyText
          value={HOME_BALANCE.amount}
          currency="USD"
          className="home-balance-amount"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={{ flexShrink: 1, minWidth: 0 }}
        />
        <View className="home-balance-renewal">
          <Text className="home-balance-renewal-label">Next renewal</Text>
          <Text className="home-balance-date">{renewalLabel}</Text>
        </View>
      </View>
    </View>
  );
}
