import "@/global.css";

import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthLegalFooter } from "@/components/auth/AuthLegalFooter";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { formatClerkError } from "@/lib/auth/clerk-errors";
import { isValidEmailFormat } from "@/lib/auth/validation";
import type { AuthFieldErrors } from "@/types/auth";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  const busy = fetchStatus === "fetching";

  const clearField = useCallback((key: keyof AuthFieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const onSubmit = useCallback(async () => {
    if (!signIn) return;
    const nextErrors: AuthFieldErrors = {};
    const id = email.trim();

    if (!id) nextErrors.email = "Email is required.";
    else if (!isValidEmailFormat(id)) nextErrors.email = "Enter a valid email address.";

    if (!password) nextErrors.password = "Password is required.";

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const created = await signIn.create({ identifier: id });
    if (created.error) {
      setFieldErrors({ form: formatClerkError(created.error) });
      return;
    }

    const auth = await signIn.password({ password, identifier: id });
    if (auth.error) {
      setFieldErrors({ form: formatClerkError(auth.error) });
      return;
    }

    if (signIn.status !== "complete") {
      setFieldErrors({
        form: `Additional step required (${signIn.status}). Configure email+password only in Clerk, or extend this flow.`,
      });
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
      setFieldErrors({ form: formatClerkError(done.error) });
    }
  }, [email, password, router, signIn]);

  const submitDisabled = useMemo(
    () => busy || !email.trim() || !password || !isValidEmailFormat(email),
    [busy, email, password],
  );

  if (!signIn) {
    return (
      <AuthScreenShell>
        <View className="items-center py-16">
          <ActivityIndicator size="large" color="#ea7a53" />
          <Text className="mt-4 text-sm font-sans-medium text-muted-foreground">
            Preparing sign-in…
          </Text>
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell>
      <AuthBrandHeader tagline="Sign in" />

      <Text
        className="auth-title text-center"
        accessibilityRole="header"
      >
        Welcome back
      </Text>
      <Text className="auth-subtitle">
        Sign in with the email and password you use for Recurly.
      </Text>

      <View className="auth-card">
        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <TextInput
              className={
                fieldErrors.email ? "auth-input auth-input-error" : "auth-input"
              }
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="you@example.com"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearField("email");
              }}
              editable={!busy}
              returnKeyType="next"
              accessibilityLabel="Email address for sign in"
            />
            {fieldErrors.email ? (
              <Text className="auth-error" accessibilityLiveRegion="polite">
                {fieldErrors.email}
              </Text>
            ) : null}
          </View>

          <AuthPasswordField
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              clearField("password");
            }}
            editable={!busy}
            autoComplete="password"
            errorText={fieldErrors.password}
            inputAccessibilityLabel="Password"
          />

          {fieldErrors.form ? (
            <Text
              className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-sans-medium text-destructive"
              accessibilityRole="alert"
            >
              {fieldErrors.form}
            </Text>
          ) : null}

          <Pressable
            className={
              submitDisabled ? "auth-button auth-button-disabled" : "auth-button"
            }
            disabled={submitDisabled}
            onPress={() => void onSubmit()}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityState={{ disabled: submitDisabled }}
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
        <Text className="auth-link-copy">New here?</Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable
            hitSlop={12}
            accessibilityRole="link"
            accessibilityLabel="Create an account"
          >
            <Text className="auth-link">Create an account</Text>
          </Pressable>
        </Link>
      </View>

      <AuthLegalFooter />
    </AuthScreenShell>
  );
}
