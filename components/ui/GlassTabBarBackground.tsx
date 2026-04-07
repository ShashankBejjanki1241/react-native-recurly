import { components } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";

const { tabBar } = components;

const GLASS_OVERLAY = "rgba(8, 17, 38, 0.52)";
const GLASS_BORDER = "rgba(255, 255, 255, 0.16)";
const WEB_FALLBACK_BG = "rgba(8, 17, 38, 0.92)";

/**
 * Frosted dark pill behind the bottom tab bar. Single blur instance — keeps scroll
 * content readable and matches a restrained “liquid glass” chrome treatment.
 */
export function GlassTabBarBackground() {
  const radius = tabBar.radius;

  if (Platform.OS === "web") {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            backgroundColor: WEB_FALLBACK_BG,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: GLASS_BORDER,
          },
        ]}
      />
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: radius, overflow: "hidden" },
      ]}
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 42 : 56}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            backgroundColor: GLASS_OVERLAY,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: GLASS_BORDER,
          },
        ]}
      />
      {/* Soft specular edge — very light, reads as glass without heavy gloss */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: radius,
          right: radius,
          height: StyleSheet.hairlineWidth * 2,
          backgroundColor: "rgba(255, 255, 255, 0.22)",
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
        }}
      />
    </View>
  );
}
