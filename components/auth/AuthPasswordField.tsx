import { colors } from "@/constants/theme";
import type { AuthPasswordFieldProps } from "@/types/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export function AuthPasswordField({
  label,
  value,
  onChangeText,
  placeholder = "••••••••",
  editable = true,
  autoComplete = "password",
  errorText,
  inputAccessibilityLabel,
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View
        className={
          errorText ? "auth-password-wrap auth-password-wrap-error" : "auth-password-wrap"
        }
      >
        <TextInput
          className="auth-password-input"
          placeholder={placeholder}
          placeholderTextColor="rgba(0,0,0,0.35)"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={autoComplete === "new-password" ? "newPassword" : "password"}
          secureTextEntry={!visible}
          accessibilityLabel={inputAccessibilityLabel}
          returnKeyType="done"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          hitSlop={8}
          className="auth-password-toggle"
          onPress={() => setVisible((v) => !v)}
          disabled={!editable}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={colors.primary}
          />
        </Pressable>
      </View>
      {errorText ? (
        <Text
          className="auth-error"
          accessibilityLiveRegion="polite"
        >
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}
