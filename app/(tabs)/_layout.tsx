import { tabs } from "@/constants/data";
import { Image } from "expo-image";
import { Tabs } from "expo-router";
import cn from "clsx";
import type { ImageSourcePropType } from "react-native";
import { View } from "react-native";

type TabIconProps = {
  focused: boolean;
  icon: ImageSourcePropType;
};

const TabLayout = () => {
  const TabIcon = ({ focused, icon }: TabIconProps) => (
    <View className="tabs-icon">
      <View className={cn("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} className="tabs-glyph" />
      </View>
    </View>
  );

  return (
    <Tabs screenOptions={{ headerShown: false }}>
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
  );
};

export default TabLayout;
