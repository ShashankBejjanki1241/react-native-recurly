import type { AuthLegalFooterProps } from "@/types/auth";
import * as Linking from "expo-linking";
import { Platform, Text, View } from "react-native";

const legalTextClass =
  "text-center text-xs font-sans-medium leading-5 text-muted-foreground";

/** Opens Terms via custom handler or `termsUrl`. */
function openTerms(p: AuthLegalFooterProps) {
  if (p.onOpenTerms) {
    p.onOpenTerms();
    return;
  }
  if (p.termsUrl) {
    void Linking.openURL(p.termsUrl);
  }
}

/** Opens Privacy Policy via custom handler or `privacyUrl`. */
function openPrivacy(p: AuthLegalFooterProps) {
  if (p.onOpenPrivacy) {
    p.onOpenPrivacy();
    return;
  }
  if (p.privacyUrl) {
    void Linking.openURL(p.privacyUrl);
  }
}

/** Inline link: real `<a>` on web when `webHref` is set; `onActivate` when handlers or native URL open. */
function InlineLegalLink({
  label,
  accessibilityLabel,
  webHref,
  onActivate,
}: {
  label: string;
  accessibilityLabel: string;
  webHref?: string;
  onActivate: () => void;
}) {
  if (Platform.OS === "web" && webHref) {
    return (
      <Text
        accessibilityRole="link"
        accessibilityLabel={accessibilityLabel}
        className="text-accent underline"
        // react-native-web: anchor semantics for external URLs
        // @ts-expect-error — `href` / `target` / `rel` are web-only Text props
        href={webHref}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
      </Text>
    );
  }

  return (
    <Text
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      onPress={onActivate}
      className="text-accent underline"
    >
      {label}
    </Text>
  );
}

/**
 * Compliance copy; pass URLs or open handlers to make Terms / Privacy Policy tappable.
 * With no link props, keeps the original static sentence (nothing clickable).
 */
export function AuthLegalFooter(props: AuthLegalFooterProps = {}) {
  const { termsUrl, privacyUrl, onOpenTerms, onOpenPrivacy } = props;

  const termsInteractive = Boolean(onOpenTerms || termsUrl);
  const privacyInteractive = Boolean(onOpenPrivacy || privacyUrl);

  if (!termsInteractive && !privacyInteractive) {
    return (
      <View className="auth-legal">
        <Text className={legalTextClass}>
          By continuing, you agree to your organization&apos;s terms and acknowledge
          Clerk processes sign-in on your behalf.
        </Text>
      </View>
    );
  }

  const termsWebHref =
    Platform.OS === "web" && termsUrl && !onOpenTerms ? termsUrl : undefined;
  const privacyWebHref =
    Platform.OS === "web" && privacyUrl && !onOpenPrivacy ? privacyUrl : undefined;

  return (
    <View className="auth-legal">
      <Text className={legalTextClass}>
        By continuing, you agree to your organization&apos;s{" "}
        {termsInteractive ? (
          <InlineLegalLink
            label="Terms"
            accessibilityLabel="Terms of service"
            webHref={termsWebHref}
            onActivate={() => openTerms(props)}
          />
        ) : (
          "Terms"
        )}
        {" "}and{" "}
        {privacyInteractive ? (
          <InlineLegalLink
            label="Privacy Policy"
            accessibilityLabel="Privacy policy"
            webHref={privacyWebHref}
            onActivate={() => openPrivacy(props)}
          />
        ) : (
          "Privacy Policy"
        )}
        , and acknowledge Clerk processes sign-in on your behalf.
      </Text>
    </View>
  );
}
