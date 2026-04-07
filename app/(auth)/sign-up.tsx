import "@/global.css";

import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthLegalFooter } from "@/components/auth/AuthLegalFooter";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { formatClerkError } from "@/lib/auth/clerk-errors";
import {
  isStrongEnoughPassword,
  isValidEmailFormat,
  MIN_SIGN_UP_PASSWORD_LENGTH,
} from "@/lib/auth/validation";
import { posthog } from "@/lib/posthog";
import type { AuthFieldErrors, AuthSignUpPhase } from "@/types/auth";
import { useSignUp } from "@clerk/expo";
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

/** Email/password sign-up with email verification and Clerk captcha mount. */
export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();

  const [phase, setPhase] = useState<AuthSignUpPhase>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  const busy = fetchStatus === "fetching";
  const trimmedEmail = email.trim();

  /** Clears a single `fieldErrors` entry when the user edits that field. */
  const clearField = useCallback((key: keyof AuthFieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /** Completes Clerk sign-up and navigates into the main app. */
  const finalizeSession = useCallback(async () => {
    if (!signUp) return;
    const done = await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        const userId = session?.user?.id;
        const userEmail = session?.user?.primaryEmailAddress?.emailAddress;
        if (userId) {
          posthog.identify(userId, {
            $set: { email: userEmail ?? null },
            $set_once: { first_sign_up_date: new Date().toISOString() },
          });
        }
        posthog.capture("email_verification_completed", {
          email: userEmail ?? null,
        });
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
  }, [router, signUp]);

  /** Creates the password strategy sign-up and sends the email verification code when required. */
  const onSubmitForm = useCallback(async () => {
    if (!signUp) return;
    const nextErrors: AuthFieldErrors = {};

    if (!trimmedEmail) nextErrors.email = "Email is required.";
    else if (!isValidEmailFormat(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) nextErrors.password = "Password is required.";
    else if (!isStrongEnoughPassword(password)) {
      nextErrors.password = `Use at least ${MIN_SIGN_UP_PASSWORD_LENGTH} characters.`;
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const { error } = await signUp.password({
      emailAddress: trimmedEmail,
      password,
    });
    if (error) {
      setFieldErrors({ form: formatClerkError(error) });
      return;
    }

    posthog.capture("user_signed_up", { email: trimmedEmail });

    if (signUp.status === "complete") {
      await finalizeSession();
      return;
    }

    const sent = await signUp.verifications.sendEmailCode();
    if (sent.error) {
      setFieldErrors({ form: formatClerkError(sent.error) });
      return;
    }
    setPhase("verify");
    setFieldErrors({});
  }, [finalizeSession, password, signUp, trimmedEmail]);

  /** Verifies the email code and finalizes the session when Clerk reports complete. */
  const onVerify = useCallback(async () => {
    if (!signUp) return;
    const nextErrors: AuthFieldErrors = {};
    if (!code.trim()) nextErrors.code = "Enter the code from your email.";
    setFieldErrors(nextErrors);
    if (nextErrors.code) return;

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });
    if (error) {
      setFieldErrors({ form: formatClerkError(error) });
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSession();
    } else {
      setFieldErrors({
        form: "Verification incomplete. Check Clerk email settings for this application.",
      });
    }
  }, [code, finalizeSession, signUp]);

  /** Resets Clerk sign-up state so the user can edit their email from scratch. */
  const onChangeEmail = useCallback(async () => {
    if (!signUp) return;
    setFieldErrors({});
    await signUp.reset();
    setPhase("form");
    setCode("");
  }, [signUp]);

  /** Resends the email verification OTP; surfaces Clerk or network errors in `fieldErrors`. */
  const onResendCode = useCallback(async () => {
    if (!signUp) return;
    try {
      const sent = await signUp.verifications.sendEmailCode();
      if (sent.error) {
        setFieldErrors({ form: formatClerkError(sent.error) });
        return;
      }
      setFieldErrors({});
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setFieldErrors({ form: formatClerkError({ message }) });
    }
  }, [signUp]);

  const formSubmitDisabled = useMemo(
    () =>
      busy ||
      !trimmedEmail ||
      !password ||
      !isValidEmailFormat(trimmedEmail) ||
      !isStrongEnoughPassword(password),
    [busy, trimmedEmail, password],
  );

  const verifyDisabled = useMemo(
    () => busy || !code.trim(),
    [busy, code],
  );

  if (!signUp) {
    return (
      <AuthScreenShell>
        <View className="items-center py-16">
          <ActivityIndicator size="large" color="#ea7a53" />
          <Text className="mt-4 text-sm font-sans-medium text-muted-foreground">
            Preparing sign-up…
          </Text>
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell>
      <AuthBrandHeader tagline="Sign up" />

      {phase === "form" ? (
        <>
          <Text className="auth-title text-center" accessibilityRole="header">
            Create your account
          </Text>
          <Text className="auth-subtitle">
            Use a work or personal email. We&apos;ll verify it if your Clerk app
            requires email confirmation.
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
                  accessibilityLabel="Email address for new account"
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
                autoComplete="new-password"
                errorText={fieldErrors.password}
                inputAccessibilityLabel="Password for new account"
              />
              <Text className="-mt-2 text-xs font-sans-medium text-muted-foreground">
                At least {MIN_SIGN_UP_PASSWORD_LENGTH} characters, as required for new
                accounts.
              </Text>

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
                  formSubmitDisabled
                    ? "auth-button auth-button-disabled"
                    : "auth-button"
                }
                disabled={formSubmitDisabled}
                onPress={() => void onSubmitForm()}
                accessibilityRole="button"
                accessibilityLabel="Continue sign up"
                accessibilityState={{ disabled: formSubmitDisabled }}
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
          <Text className="auth-title text-center" accessibilityRole="header">
            Verify your email
          </Text>
          <Text className="auth-subtitle">
            Enter the code we sent to{" "}
            <Text className="font-sans-bold text-primary">{email.trim()}</Text>.
          </Text>

          <Pressable
            onPress={() => void onChangeEmail()}
            className="auth-back-link"
            accessibilityRole="button"
            accessibilityLabel="Use a different email address"
            disabled={busy}
          >
            <Text className="auth-back-link-text">← Use a different email</Text>
          </Pressable>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Verification code</Text>
                <TextInput
                  className={
                    fieldErrors.code ? "auth-input auth-input-error" : "auth-input"
                  }
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  placeholder="6-digit code"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={code}
                  onChangeText={(t) => {
                    setCode(t);
                    clearField("code");
                  }}
                  editable={!busy}
                  returnKeyType="done"
                  maxLength={12}
                  accessibilityLabel="Email verification code"
                />
                {fieldErrors.code ? (
                  <Text className="auth-error" accessibilityLiveRegion="polite">
                    {fieldErrors.code}
                  </Text>
                ) : null}
              </View>

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
                  verifyDisabled ? "auth-button auth-button-disabled" : "auth-button"
                }
                disabled={verifyDisabled}
                onPress={() => void onVerify()}
                accessibilityRole="button"
                accessibilityLabel="Verify email and continue"
                accessibilityState={{ disabled: verifyDisabled }}
              >
                {busy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Verify & continue</Text>
                )}
              </Pressable>

              <Pressable
                className="auth-secondary-button mt-1"
                disabled={busy}
                onPress={() => void onResendCode()}
                accessibilityRole="button"
                accessibilityLabel="Resend verification code"
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
        <Link href="/(auth)/sign-in" asChild>
          <Pressable
            hitSlop={12}
            accessibilityRole="link"
            accessibilityLabel="Go to sign in"
          >
            <Text className="auth-link">Sign in</Text>
          </Pressable>
        </Link>
      </View>

      <AuthLegalFooter />
    </AuthScreenShell>
  );
}
