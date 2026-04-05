import "@/global.css";

import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { formatClerkError } from "@/lib/auth/clerk-errors";
import { useSignUp } from "@clerk/expo";
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

type Phase = "form" | "verify";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();

  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");

  const busy = fetchStatus === "fetching";

  const finalizeSession = useCallback(async () => {
    if (!signUp) return;
    const done = await signUp.finalize({
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
  }, [router, signUp]);

  const onSubmitForm = useCallback(async () => {
    if (!signUp) return;
    setFormError("");
    const addr = email.trim();
    if (!addr || !password) {
      setFormError("Enter email and password.");
      return;
    }

    const { error } = await signUp.password({
      emailAddress: addr,
      password,
    });
    if (error) {
      setFormError(formatClerkError(error));
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSession();
      return;
    }

    const sent = await signUp.verifications.sendEmailCode();
    if (sent.error) {
      setFormError(formatClerkError(sent.error));
      return;
    }
    setPhase("verify");
  }, [email, finalizeSession, password, signUp]);

  const onVerify = useCallback(async () => {
    if (!signUp) return;
    setFormError("");
    if (!code.trim()) {
      setFormError("Enter the code from your email.");
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });
    if (error) {
      setFormError(formatClerkError(error));
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSession();
    } else {
      setFormError("Verification incomplete. Check Clerk dashboard settings.");
    }
  }, [code, finalizeSession, signUp]);

  if (!signUp) {
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
            <Text className="auth-wordmark-sub">Sign up</Text>
          </View>
        </View>
      </View>

      {phase === "form" ? (
        <>
          <Text className="auth-title text-center">Create your account</Text>
          <Text className="auth-subtitle">
            We’ll email you a code if your Clerk instance requires email
            verification.
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
                  autoComplete="new-password"
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
                className={
                  busy ? "auth-button auth-button-disabled" : "auth-button"
                }
                disabled={busy}
                onPress={() => void onSubmitForm()}
                accessibilityRole="button"
                accessibilityLabel="Sign up"
              >
                {busy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Continue</Text>
                )}
              </Pressable>

              <View nativeID="clerk-captcha" />
            </View>
          </View>
        </>
      ) : (
        <>
          <Text className="auth-title text-center">Check your email</Text>
          <Text className="auth-subtitle">
            Enter the verification code we sent to {email.trim()}.
          </Text>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Code</Text>
                <TextInput
                  className="auth-input"
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  placeholder="123456"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={code}
                  onChangeText={setCode}
                  editable={!busy}
                />
              </View>

              {formError ? (
                <Text className="auth-error">{formError}</Text>
              ) : null}

              <Pressable
                className={
                  busy ? "auth-button auth-button-disabled" : "auth-button"
                }
                disabled={busy}
                onPress={() => void onVerify()}
                accessibilityRole="button"
                accessibilityLabel="Verify email"
              >
                {busy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Verify & continue</Text>
                )}
              </Pressable>

              <Pressable
                className="auth-secondary-button mt-2"
                disabled={busy}
                onPress={() => void signUp.verifications.sendEmailCode()}
                accessibilityRole="button"
                accessibilityLabel="Resend code"
              >
                <Text className="auth-secondary-button-text">
                  Resend code
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      <View className="auth-link-row">
        <Text className="auth-link-copy">Already have an account?</Text>
        <Link href="/(auth)/sign-in" replace asChild>
          <Pressable hitSlop={8}>
            <Text className="auth-link">Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
