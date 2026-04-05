import "@/global.css";

import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthLegalFooter } from "@/components/auth/AuthLegalFooter";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { formatClerkError } from "@/lib/auth/clerk-errors";
import { pickSignInSecondFactor, type SignInMfaChoice } from "@/lib/auth/pick-sign-in-second-factor";
import {
  isStrongEnoughPassword,
  isValidEmailFormat,
  MIN_SIGN_UP_PASSWORD_LENGTH,
} from "@/lib/auth/validation";
import type { AuthFieldErrors, AuthForgotPasswordStep } from "@/types/auth";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

function signInIncompleteMessage(status: string): string {
  switch (status) {
    case "needs_first_factor":
      return "Reset could not continue from this state. Try again from the start.";
    case "needs_client_trust":
      return "A security check is required. Try again, or update the app if the problem continues.";
    case "needs_identifier":
      return "Check your email and try again.";
    default:
      return `Something went wrong (${status}). Try again or contact support.`;
  }
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();

  const [flowStep, setFlowStep] = useState<AuthForgotPasswordStep>("email");
  const [mfaChoice, setMfaChoice] = useState<SignInMfaChoice | null>(null);
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

  const goToSignedInApp = useCallback(
    (path: string) => {
      if (Platform.OS === "web" && path.startsWith("http")) {
        window.location.assign(path);
        return;
      }
      router.replace(path as Href);
    },
    [router],
  );

  const finalizeSession = useCallback(
    async (opts?: { passwordJustUpdatedTip?: boolean }) => {
      if (!signIn) return;
      const done = await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const path = decorateUrl("/(tabs)");
          const go = () => goToSignedInApp(path);

          if (opts?.passwordJustUpdatedTip && Platform.OS !== "web") {
            Alert.alert(
              "Password updated",
              "Your Recurly password was changed.\n\n" +
                "Your email on this account is unchanged. To change it later, use Settings when that option is available.\n\n" +
                "If your device asks to save or update a password for Expo Go, that comes from your phone’s password manager. " +
                "You can tap Save password to use AutoFill next time, or Not now on that system prompt.",
              [
                { text: "Not now", style: "cancel", onPress: go },
                { text: "Continue", onPress: go },
              ],
            );
            return;
          }

          go();
        },
      });
      if (done.error) {
        setFieldErrors({ form: formatClerkError(done.error) });
      }
    },
    [goToSignedInApp, signIn],
  );

  const startOver = useCallback(async () => {
    if (signIn) await signIn.reset();
    setFlowStep("email");
    setMfaChoice(null);
    setResetCode("");
    setNewPassword("");
    setMfaCode("");
    setFieldErrors({});
  }, [signIn]);

  const beginSecondFactor = useCallback(async () => {
    if (!signIn) return false;
    const factors = signIn.supportedSecondFactors ?? [];
    const choice = pickSignInSecondFactor(factors);

    if (choice.kind === "none") {
      setFieldErrors({
        form: "Two-step verification is required, but no supported method was returned. Check MFA in Clerk.",
      });
      return false;
    }

    if (choice.kind === "unsupported_email_link") {
      setFieldErrors({
        form:
          "This account uses email link for the second step. Use codes or an authenticator app in Clerk instead.",
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
    setFlowStep("mfa");
    setMfaCode("");
    setFieldErrors({});
    return true;
  }, [signIn]);

  const onSendResetCode = useCallback(async () => {
    if (!signIn) return;
    const nextErrors: AuthFieldErrors = {};
    const id = email.trim();
    if (!id) nextErrors.email = "Email is required.";
    else if (!isValidEmailFormat(id)) nextErrors.email = "Enter a valid email address.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const created = await signIn.create({ identifier: id });
    if (created.error) {
      setFieldErrors({ form: formatClerkError(created.error) });
      return;
    }

    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) {
      setFieldErrors({ form: formatClerkError(sent.error) });
      return;
    }

    setResetCode("");
    setFieldErrors({});
    setFlowStep("verify");
  }, [email, signIn]);

  const onVerifyResetCode = useCallback(async () => {
    if (!signIn) return;
    const trimmed = resetCode.trim();
    if (!trimmed) {
      setFieldErrors({ code: "Enter the code from your email." });
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code: trimmed,
    });
    if (error) {
      setFieldErrors({ form: formatClerkError(error) });
      return;
    }

    if (signIn.status === "needs_new_password") {
      setNewPassword("");
      setFieldErrors({});
      setFlowStep("new_password");
      return;
    }

    setFieldErrors({
      form: signInIncompleteMessage(signIn.status),
    });
  }, [resetCode, signIn]);

  const onSubmitNewPassword = useCallback(async () => {
    if (!signIn) return;
    const nextErrors: AuthFieldErrors = {};
    if (!newPassword) nextErrors.password = "Password is required.";
    else if (!isStrongEnoughPassword(newPassword)) {
      nextErrors.password = `Use at least ${MIN_SIGN_UP_PASSWORD_LENGTH} characters.`;
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    });
    if (error) {
      setFieldErrors({ form: formatClerkError(error) });
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSession({ passwordJustUpdatedTip: true });
      return;
    }

    if (signIn.status === "needs_second_factor") {
      await beginSecondFactor();
      return;
    }

    setFieldErrors({ form: signInIncompleteMessage(signIn.status) });
  }, [beginSecondFactor, finalizeSession, newPassword, signIn]);

  const onVerifyMfa = useCallback(async () => {
    if (!signIn || !mfaChoice) return;
    const trimmed = mfaCode.trim();
    if (!trimmed) {
      setFieldErrors({ code: "Enter your verification code." });
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
      await finalizeSession({ passwordJustUpdatedTip: true });
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

  const onResendResetCode = useCallback(async () => {
    if (!signIn) return;
    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) setFieldErrors({ form: formatClerkError(sent.error) });
    else setFieldErrors({});
  }, [signIn]);

  const emailIssue =
    fieldErrors.email ??
    (email.trim().length > 0 && !isValidEmailFormat(email.trim())
      ? "Enter a valid email address."
      : undefined);

  const sendDisabled = useMemo(
    () => busy || !email.trim() || !isValidEmailFormat(email.trim()),
    [busy, email],
  );

  const verifyCodeDisabled = useMemo(
    () => busy || !resetCode.trim(),
    [busy, resetCode],
  );

  const newPasswordDisabled = useMemo(
    () =>
      busy ||
      !newPassword ||
      !isStrongEnoughPassword(newPassword),
    [busy, newPassword],
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
            Preparing…
          </Text>
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell>
      <AuthBrandHeader tagline="Reset password" />

      {flowStep === "email" ? (
        <>
          <Text className="auth-title text-center" accessibilityRole="header">
            Forgot password?
          </Text>
          <Text className="auth-subtitle">
            Enter your account email. We&apos;ll send a code to reset your password.
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
                  returnKeyType="done"
                  accessibilityLabel="Email for password reset"
                />
                {emailIssue ? (
                  <Text className="auth-error" accessibilityLiveRegion="polite">
                    {emailIssue}
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
                  sendDisabled ? "auth-button auth-button-disabled" : "auth-button"
                }
                disabled={sendDisabled}
                onPress={() => void onSendResetCode()}
                accessibilityRole="button"
                accessibilityLabel="Send reset code"
                accessibilityState={{ disabled: sendDisabled }}
              >
                {busy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Send reset code</Text>
                )}
              </Pressable>

              <View nativeID="clerk-captcha" />
            </View>
          </View>
        </>
      ) : null}

      {flowStep === "verify" ? (
        <>
          <Text className="auth-title text-center" accessibilityRole="header">
            Check your email
          </Text>
          <Text className="auth-subtitle">
            Enter the reset code we sent to{" "}
            <Text className="font-sans-bold text-primary">{email.trim()}</Text>.
          </Text>

          <Pressable
            onPress={() => void startOver()}
            className="auth-back-link"
            accessibilityRole="button"
            accessibilityLabel="Start over with a different email"
            disabled={busy}
          >
            <Text className="auth-back-link-text">← Use a different email</Text>
          </Pressable>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Reset code</Text>
                <TextInput
                  className={
                    fieldErrors.code ? "auth-input auth-input-error" : "auth-input"
                  }
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  placeholder="6-digit code"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={resetCode}
                  onChangeText={(t) => {
                    setResetCode(t);
                    clearField("code");
                  }}
                  editable={!busy}
                  returnKeyType="done"
                  maxLength={12}
                  accessibilityLabel="Password reset code from email"
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
                  verifyCodeDisabled
                    ? "auth-button auth-button-disabled"
                    : "auth-button"
                }
                disabled={verifyCodeDisabled}
                onPress={() => void onVerifyResetCode()}
                accessibilityRole="button"
                accessibilityLabel="Verify reset code"
                accessibilityState={{ disabled: verifyCodeDisabled }}
              >
                {busy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Continue</Text>
                )}
              </Pressable>

              <Pressable
                className="auth-secondary-button mt-1"
                disabled={busy}
                onPress={() => void onResendResetCode()}
                accessibilityRole="button"
                accessibilityLabel="Resend reset code"
              >
                <Text className="auth-secondary-button-text">Resend code</Text>
              </Pressable>
            </View>
          </View>
        </>
      ) : null}

      {flowStep === "new_password" ? (
        <>
          <Text className="auth-title text-center" accessibilityRole="header">
            Choose a new password
          </Text>
          <Text className="auth-subtitle">
            Use at least {MIN_SIGN_UP_PASSWORD_LENGTH} characters for your new password.
          </Text>

          <Pressable
            onPress={() => void startOver()}
            className="auth-back-link"
            accessibilityRole="button"
            accessibilityLabel="Cancel password reset and start over"
            disabled={busy}
          >
            <Text className="auth-back-link-text">← Start over</Text>
          </Pressable>

          <View className="auth-card">
            <View className="auth-form">
              <AuthPasswordField
                label="New password"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  clearField("password");
                }}
                editable={!busy}
                autoComplete="new-password"
                errorText={fieldErrors.password}
                inputAccessibilityLabel="New password"
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
                  newPasswordDisabled
                    ? "auth-button auth-button-disabled"
                    : "auth-button"
                }
                disabled={newPasswordDisabled}
                onPress={() => void onSubmitNewPassword()}
                accessibilityRole="button"
                accessibilityLabel="Save new password and sign in"
                accessibilityState={{ disabled: newPasswordDisabled }}
              >
                {busy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Save & sign in</Text>
                )}
              </Pressable>
            </View>
          </View>
        </>
      ) : null}

      {flowStep === "mfa" ? (
        <>
          <Text className="auth-title text-center" accessibilityRole="header">
            {mfaTitle}
          </Text>
          <Text className="auth-subtitle">{mfaSubtitle}</Text>

          <Pressable
            onPress={() => void startOver()}
            className="auth-back-link"
            accessibilityRole="button"
            accessibilityLabel="Cancel and start password reset over"
            disabled={busy}
          >
            <Text className="auth-back-link-text">← Start over</Text>
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
                accessibilityLabel="Verify and finish signing in"
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
      ) : null}

      <View className="auth-link-row">
        <Text className="auth-link-copy">Remember it?</Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable
            hitSlop={12}
            accessibilityRole="link"
            accessibilityLabel="Back to sign in"
          >
            <Text className="auth-link">Sign in</Text>
          </Pressable>
        </Link>
      </View>

      <AuthLegalFooter />
    </AuthScreenShell>
  );
}
