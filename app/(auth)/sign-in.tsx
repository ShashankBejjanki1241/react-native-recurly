import "@/global.css";

import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthLegalFooter } from "@/components/auth/AuthLegalFooter";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { formatClerkError } from "@/lib/auth/clerk-errors";
import { pickSignInSecondFactor, type SignInMfaChoice } from "@/lib/auth/pick-sign-in-second-factor";
import { isValidEmailFormat } from "@/lib/auth/validation";
import { posthog } from "@/lib/posthog";
import type { AuthFieldErrors, AuthSignInPhase } from "@/types/auth";
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

/** User-facing copy when `signIn.status` is not complete and not handled by a dedicated step. */
function signInIncompleteMessage(status: string): string {
  switch (status) {
    case "needs_first_factor":
      return "Additional sign-in step is required. Check your Clerk sign-in strategies.";
    case "needs_client_trust":
      return "A security check is required. Try again, or update the app if the problem continues.";
    case "needs_new_password":
      return "You must set a new password. Use your Clerk password reset flow if available.";
    case "needs_identifier":
      return "Sign-in could not continue. Check your email and try again.";
    default:
      return `Sign-in cannot continue (${status}). Check Clerk dashboard settings.`;
  }
}

/** Email/password sign-in with optional MFA and Clerk captcha mount. */
export default function SignInScreen() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();

  const [phase, setPhase] = useState<AuthSignInPhase>("credentials");
  const [mfaChoice, setMfaChoice] = useState<SignInMfaChoice | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  const busy = fetchStatus === "fetching";

  const clearField = useCallback((key: keyof AuthFieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /** Activates the Clerk session after `signIn.status === 'complete'`. */
  const finalizeSession = useCallback(async () => {
    if (!signIn) return;
    const done = await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        const userId = session?.user?.id;
        const userEmail = session?.user?.primaryEmailAddress?.emailAddress;
        if (userId) {
          posthog.identify(userId, {
            $set: { email: userEmail ?? null },
            $set_once: { first_sign_in_date: new Date().toISOString() },
          });
        }
        posthog.capture("user_signed_in", {
          method: phase,
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
  }, [phase, router, signIn]);

  /** Sends the default second-factor code and moves UI to the MFA step. */
  const beginSecondFactor = useCallback(async () => {
    if (!signIn) return false;
    const factors = signIn.supportedSecondFactors ?? [];
    const choice = pickSignInSecondFactor(factors);

    if (choice.kind === "none") {
      setFieldErrors({
        form: "Two-step sign-in is required, but no supported second factor was returned. Check MFA settings in Clerk.",
      });
      return false;
    }

    if (choice.kind === "unsupported_email_link") {
      setFieldErrors({
        form:
          "This account uses email link as the second step. Use an authenticator app, SMS, or email code for MFA in Clerk instead.",
      });
      return false;
    }

    if (choice.kind === "email_code") {
      const sent = await signIn.mfa.sendEmailCode();
      if (sent.error) {
        setFieldErrors({ form: formatClerkError(sent.error) });
        return false;
      }
    } else if (choice.kind === "phone_code") {
      const sent = await signIn.mfa.sendPhoneCode();
      if (sent.error) {
        setFieldErrors({ form: formatClerkError(sent.error) });
        return false;
      }
    }

    setMfaChoice(choice);
    setPhase("mfa");
    setMfaCode("");
    setFieldErrors({});
    return true;
  }, [signIn]);

  /** Validates identifier/password, runs Clerk sign-in, then MFA or finalize as needed. */
  const onSubmitCredentials = useCallback(async () => {
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

    if (signIn.status === "complete") {
      await finalizeSession();
      return;
    }

    if (signIn.status === "needs_second_factor") {
      await beginSecondFactor();
      return;
    }

    setFieldErrors({ form: signInIncompleteMessage(signIn.status) });
  }, [beginSecondFactor, email, finalizeSession, password, signIn]);

  /** Submits the MFA code for the active `mfaChoice`, then finalizes when complete. */
  const onVerifyMfa = useCallback(async () => {
    if (!signIn || !mfaChoice) return;
    const nextErrors: AuthFieldErrors = {};
    const trimmed = mfaCode.trim();
    if (!trimmed) {
      nextErrors.code = "Enter your verification code.";
      setFieldErrors(nextErrors);
      return;
    }

    let err: { message?: string; errors?: { message?: string }[] } | null = null;

    if (mfaChoice.kind === "email_code") {
      ({ error: err } = await signIn.mfa.verifyEmailCode({ code: trimmed }));
    } else if (mfaChoice.kind === "phone_code") {
      ({ error: err } = await signIn.mfa.verifyPhoneCode({ code: trimmed }));
    } else if (mfaChoice.kind === "totp") {
      ({ error: err } = await signIn.mfa.verifyTOTP({ code: trimmed }));
    } else if (mfaChoice.kind === "backup_code") {
      ({ error: err } = await signIn.mfa.verifyBackupCode({ code: trimmed }));
    } else {
      setFieldErrors({ form: "Unsupported verification step." });
      return;
    }

    if (err) {
      setFieldErrors({ form: formatClerkError(err) });
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSession();
      return;
    }

    if (signIn.status === "needs_second_factor") {
      setFieldErrors({
        form: "Another verification step is required. If this keeps happening, contact support.",
      });
      return;
    }

    setFieldErrors({ form: signInIncompleteMessage(signIn.status) });
  }, [finalizeSession, mfaChoice, mfaCode, signIn]);

  /** Clears MFA state and resets the Clerk sign-in attempt. */
  const onBackFromMfa = useCallback(async () => {
    if (!signIn) return;
    setFieldErrors({});
    setMfaCode("");
    setMfaChoice(null);
    setPhase("credentials");
    await signIn.reset();
  }, [signIn]);

  /** Resends SMS or email MFA codes when supported for the current factor. */
  const onResendMfa = useCallback(async () => {
    if (!signIn || !mfaChoice) return;
    if (mfaChoice.kind === "email_code") {
      const sent = await signIn.mfa.sendEmailCode();
      if (sent.error) setFieldErrors({ form: formatClerkError(sent.error) });
      else setFieldErrors({});
      return;
    }
    if (mfaChoice.kind === "phone_code") {
      const sent = await signIn.mfa.sendPhoneCode();
      if (sent.error) setFieldErrors({ form: formatClerkError(sent.error) });
      else setFieldErrors({});
    }
  }, [mfaChoice, signIn]);

  const emailIssue =
    fieldErrors.email ??
    (email.trim().length > 0 && !isValidEmailFormat(email.trim())
      ? "Enter a valid email address."
      : undefined);

  const credentialsSubmitDisabled = useMemo(
    () => busy || !email.trim() || !password || !isValidEmailFormat(email.trim()),
    [busy, email, password],
  );

  const mfaVerifyDisabled = useMemo(() => busy || !mfaCode.trim(), [busy, mfaCode]);

  const mfaTitle = useMemo(() => {
    if (!mfaChoice) return "Two-step verification";
    if (mfaChoice.kind === "totp") return "Authenticator code";
    if (mfaChoice.kind === "backup_code") return "Backup code";
    return "Verification code";
  }, [mfaChoice]);

  const mfaSubtitle = useMemo(() => {
    if (!mfaChoice) return "";
    if (mfaChoice.kind === "email_code") {
      return `Enter the code we sent to ${mfaChoice.safeIdentifier || "your email"}.`;
    }
    if (mfaChoice.kind === "phone_code") {
      return `Enter the code we sent to ${mfaChoice.safeIdentifier || "your phone"}.`;
    }
    if (mfaChoice.kind === "totp") {
      return "Open your authenticator app and enter the 6-digit code.";
    }
    if (mfaChoice.kind === "backup_code") {
      return "Enter one of your backup codes.";
    }
    return "";
  }, [mfaChoice]);

  const mfaCodeMaxLength = mfaChoice?.kind === "backup_code" ? 16 : 12;
  const mfaPlaceholder =
    mfaChoice?.kind === "backup_code" ? "Backup code" : "6-digit code";

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

      {phase === "credentials" ? (
        <>
          <Text className="auth-title text-center" accessibilityRole="header">
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
                    emailIssue ? "auth-input auth-input-error" : "auth-input"
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
                {emailIssue ? (
                  <Text className="auth-error" accessibilityLiveRegion="polite">
                    {emailIssue}
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

              <View className="mt-1 items-end">
                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable
                    hitSlop={12}
                    accessibilityRole="link"
                    accessibilityLabel="Forgot password"
                  >
                    <Text className="auth-link text-sm">Forgot password?</Text>
                  </Pressable>
                </Link>
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
                  credentialsSubmitDisabled
                    ? "auth-button auth-button-disabled"
                    : "auth-button"
                }
                disabled={credentialsSubmitDisabled}
                onPress={() => void onSubmitCredentials()}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                accessibilityState={{ disabled: credentialsSubmitDisabled }}
              >
                {busy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Sign in</Text>
                )}
              </Pressable>

              <View nativeID="clerk-captcha" />
            </View>
          </View>
        </>
      ) : (
        <>
          <Text className="auth-title text-center" accessibilityRole="header">
            {mfaTitle}
          </Text>
          <Text className="auth-subtitle">{mfaSubtitle}</Text>

          <Pressable
            onPress={() => void onBackFromMfa()}
            className="auth-back-link"
            accessibilityRole="button"
            accessibilityLabel="Back to email and password"
            disabled={busy}
          >
            <Text className="auth-back-link-text">← Back to sign in</Text>
          </Pressable>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Code</Text>
                <TextInput
                  className={
                    fieldErrors.code ? "auth-input auth-input-error" : "auth-input"
                  }
                  autoCapitalize="none"
                  keyboardType={
                    mfaChoice?.kind === "backup_code" ? "default" : "number-pad"
                  }
                  textContentType="oneTimeCode"
                  placeholder={mfaPlaceholder}
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={mfaCode}
                  onChangeText={(t) => {
                    setMfaCode(t);
                    clearField("code");
                  }}
                  editable={!busy}
                  returnKeyType="done"
                  maxLength={mfaCodeMaxLength}
                  accessibilityLabel="Two-step verification code"
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
                  mfaVerifyDisabled ? "auth-button auth-button-disabled" : "auth-button"
                }
                disabled={mfaVerifyDisabled}
                onPress={() => void onVerifyMfa()}
                accessibilityRole="button"
                accessibilityLabel="Verify and continue sign in"
                accessibilityState={{ disabled: mfaVerifyDisabled }}
              >
                {busy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Verify & continue</Text>
                )}
              </Pressable>

              {mfaChoice?.kind === "email_code" || mfaChoice?.kind === "phone_code" ? (
                <Pressable
                  className="auth-secondary-button mt-1"
                  disabled={busy}
                  onPress={() => void onResendMfa()}
                  accessibilityRole="button"
                  accessibilityLabel="Resend verification code"
                >
                  <Text className="auth-secondary-button-text">Resend code</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </>
      )}

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
