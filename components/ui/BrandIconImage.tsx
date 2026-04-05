import * as ReactNative from "react-native";

export type BrandIconImageProps = Omit<
  ReactNative.ImageProps,
  "source" | "resizeMode"
> & {
  source: ReactNative.ImageSourcePropType;
  /** Square edge length in px (use `spacing[n]` from theme). */
  size: number;
};

/**
 * Static brand PNG from `assets/icons` — explicit `width`/`height` for consistent
 * iOS / Android / web layout (avoids `expo-image` + className sizing gaps on native).
 */
export function BrandIconImage({
  source,
  size,
  style,
  className,
  ...rest
}: BrandIconImageProps) {
  return (
    <ReactNative.Image
      source={source}
      style={[{ width: size, height: size, flexShrink: 0 }, style]}
      className={className}
      resizeMode="contain"
      {...rest}
    />
  );
}
