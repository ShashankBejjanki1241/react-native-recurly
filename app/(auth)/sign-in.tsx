import "@/global.css";

import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { formatClerkError } from "@/lib/auth/clerk-errors";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter, type Href } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const busy = fetchStatus === "fetching";

  const onSubmit = useCallback(async () => {
    if (!signIn) return;
    setFormError("");
    const id = email.trim();
    if (!id || !password) {
      setFormError("Enter email and password.");
      return;
    }

    const created = await signIn.create({ identifier: id });
    if (created.error) {
      setFormError(formatClerkError(created.error));
      return;
    }

    const auth = await signIn.password({ password, identifier: id });
    if (auth.error) {
      setFormError(formatClerkError(auth.error));
      return;
    }

    if (signIn.status !== "complete") {
      setFormError(
        `Sign-in needs another step (${signIn.status}). Enable only email + password in Clerk or add MFA handling.`,
      );
      return;
    }

    const done = await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const path = decorateUrl("/(tabs)");
        if (Platform.OS === "web" && path.startsWith("http")) {
          window.location.assign(path);
          return;
        }
        router.replace(path as Href);
      },
    });
    if (done.error) {
      setFormError(formatClerkError(done.error));
    }
  }, [email, password, router, signIn]);

  if (!signIn) {
    return (
      <AuthScreenShell>
        <View className="auth-brand-block items-center py-12">
          <ActivityIndicator size="large" color="#ea7a53" />
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell>
      <View className="auth-brand-block">
        <View className="auth-logo-wrap justify-center">
          <View className="auth-logo-mark">
            <Text className="auth-logo-mark-text">R</Text>
          </View>
          <View>
            <Text className="auth-wordmark">Recurly</Text>
            <Text className="auth-wordmark-sub">Sign in</Text>
          </View>
        </View>
      </View>

      <Text className="auth-title text-center">Welcome back</Text>
      <Text className="auth-subtitle">
        Use the email and password for your Clerk account.
      </Text>

      <View className="auth-card">
        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <TextInput
              className="auth-input"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={email}
              onChangeText={setEmail}
              editable={!busy}
            />
          </View>
          <View className="auth-field">
            <Text className="auth-label">Password</Text>
            <TextInput
              className="auth-input"
              autoCapitalize="none"
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor="rgba(0,0,0,0.35)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!busy}
            />
          </View>

          {formError ? (
            <Text className="auth-error">{formError}</Text>
          ) : null}

          <Pressable
            className={busy ? "auth-button auth-button-disabled" : "auth-button"}
            disabled={busy}
            onPress={() => void onSubmit()}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            {busy ? (
              <ActivityIndicator color="#081126" />
            ) : (
              <Text className="auth-button-text">Sign in</Text>
            )}
          </Pressable>
        </View>
      </View>

      <View className="auth-link-row">
        <Text className="auth-link-copy">No account?</Text>
        <Link href="/(auth)/sign-up" replace asChild>
          <Pressable hitSlop={8}>
            <Text className="auth-link">Create one</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
