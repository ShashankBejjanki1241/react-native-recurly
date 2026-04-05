import { formatCurrency } from "@/lib/formatCurrency";
import { Text, type TextProps } from "react-native";

export type CurrencyTextProps = Omit<TextProps, "children"> & {
  value: number;
  currency?: string;
};

/**
 * Single-line money label so the amount (and symbol) does not wrap across lines
 * in tight flex rows (upcoming cards, list headers).
 */
export function CurrencyText({
  value,
  currency = "USD",
  className,
  style,
  numberOfLines = 1,
  ...rest
}: CurrencyTextProps) {
  return (
    <Text
      className={className}
      style={[{ flexShrink: 0 }, style]}
      numberOfLines={numberOfLines}
      {...rest}
    >
      {formatCurrency(value, currency)}
    </Text>
  );
}
