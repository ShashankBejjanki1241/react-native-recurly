import { RequireAuth } from "@/components/auth/RequireAuth";
import { GlassTabBarBackground } from "@/components/ui/GlassTabBarBackground";
import { tabs } from "@/constants/data";
import { colors, components, spacing } from "@/constants/theme";
import { Image } from "expo-image";
import { Tabs } from "expo-router";
import type { ImageSourcePropType } from "react-native";
import { Platform, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { tabBar } = components;

type TabIconProps = {
  focused: boolean;
  icon: ImageSourcePropType;
};

/** Bottom tab navigator with custom icons and safe-area chrome. */
const TabLayout = () => {
  const insets = useSafeAreaInsets();

  /** Renders a single tab bar icon with focused / unfocused styling. */
  const TabIcon = ({ focused, icon }: TabIconProps) => (
    <View className="tabs-icon">
      <View
        className={
          focused ? "tabs-pill tabs-active" : "tabs-pill tabs-pill-idle"
        }
      >
        <Image
          source={icon}
          className="tabs-glyph"
          style={{
            width: spacing[6],
            height: spacing[6],
            opacity: focused ? 1 : 0.55,
          }}
          contentFit="contain"
        />
      </View>
    </View>
  );

  return (
    <RequireAuth>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top", "left", "right"]}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            sceneStyle: {
              flex: 1,
              backgroundColor: colors.background,
            },
            tabBarBackground: () => <GlassTabBarBackground />,
            tabBarStyle: {
              position: "absolute",
              bottom: Math.max(insets.bottom, tabBar.horizontalInset),
              height: tabBar.height,
              marginHorizontal: tabBar.horizontalInset,
              borderRadius: tabBar.radius,
              backgroundColor: "transparent",
              borderTopWidth: 0,
              borderWidth: 0,
              elevation: Platform.OS === "android" ? 14 : 0,
              shadowColor: "#081126",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: Platform.OS === "ios" ? 0.22 : 0,
              shadowRadius: 20,
            },
            tabBarItemStyle: {
              paddingVertical: (tabBar.height - tabBar.iconFrame) / 2,
            },
            tabBarIconStyle: {
              width: tabBar.iconFrame,
              height: tabBar.iconFrame,
              alignItems: "center",
            },
          }}
        >
          {tabs.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.title,
                tabBarIcon: ({ focused }) => (
                  <TabIcon focused={focused} icon={tab.icon} />
                ),
              }}
            />
          ))}
        </Tabs>
      </SafeAreaView>
    </RequireAuth>
  );
};

export default TabLayout;
