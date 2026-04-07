<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly Expo app. Here is a summary of everything that was done:

- **`app.config.js`** — Created (replaces `app.json` at runtime). Reads `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from `.env` via `process.env` and exposes them through Expo Constants extras.
- **`.env`** — Added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (values written securely, `.gitignore` coverage confirmed).
- **`lib/posthog.ts`** — New PostHog client singleton. Reads config from `Constants.expoConfig?.extra`, disables itself gracefully when the token is absent.
- **`app/_layout.tsx`** — Added `PostHogProvider` wrapping `ClerkProvider`, plus manual screen tracking via `usePathname` / `useGlobalSearchParams` so every Expo Router navigation is recorded in PostHog.
- **`app/(auth)/sign-in.tsx`** — Added `user_signed_in` event and `posthog.identify()` (with Clerk user ID and email) inside `finalizeSession`, covering both credentials and MFA sign-in paths.
- **`app/(auth)/sign-up.tsx`** — Added `user_signed_up` event after form acceptance and `email_verification_completed` + `posthog.identify()` after email OTP verification succeeds.
- **`app/(auth)/forgot-password.tsx`** — Added `password_reset_requested` after reset code is sent, and `password_reset_completed` + `posthog.identify()` after the new password is accepted.
- **`app/(tabs)/settings.tsx`** — Added `user_signed_out` event and `posthog.reset()` before Clerk signs the user out.
- **`app/onboarding.tsx`** — Added `onboarding_create_account_pressed` and `onboarding_sign_in_pressed` events on the respective CTA buttons.
- **`app/Subscriptions/[id].tsx`** — Added `subscription_detail_viewed` event (with `subscription_id`) via `useEffect` on mount.
- **`app/(tabs)/index.tsx`** — Added `home_subscription_expanded` event (with `subscription_id`, `subscription_name`, and `expanded` boolean) when a card is toggled.

## Events

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully completed sign-in (credentials or MFA). Fires after Clerk session is finalized. | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User submitted the sign-up form and Clerk accepted their credentials. | `app/(auth)/sign-up.tsx` |
| `email_verification_completed` | User successfully verified their email OTP during sign-up and the Clerk session is complete. | `app/(auth)/sign-up.tsx` |
| `password_reset_requested` | User submitted their email on the forgot-password screen and a reset code was sent successfully. | `app/(auth)/forgot-password.tsx` |
| `password_reset_completed` | User set a new password and the Clerk session finalized after the reset flow. | `app/(auth)/forgot-password.tsx` |
| `user_signed_out` | User tapped Sign out in the Settings tab and Clerk successfully signed them out. | `app/(tabs)/settings.tsx` |
| `onboarding_create_account_pressed` | User tapped the 'Create account' CTA on the onboarding screen. Top of the sign-up funnel. | `app/onboarding.tsx` |
| `onboarding_sign_in_pressed` | User tapped 'I already have an account' on the onboarding screen. Top of the sign-in funnel. | `app/onboarding.tsx` |
| `subscription_detail_viewed` | User navigated to a subscription's detail page. Captures the subscription ID. | `app/Subscriptions/[id].tsx` |
| `home_subscription_expanded` | User expanded or collapsed a subscription card on the home dashboard. | `app/(tabs)/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/370499/dashboard/1433742
- **Sign-up conversion funnel** (onboarding CTA → account created → email verified): https://us.posthog.com/project/370499/insights/B5GU2LH3
- **Daily sign-ins and sign-ups** (DAU trends): https://us.posthog.com/project/370499/insights/o1dBUCOk
- **Password reset funnel** (requested → completed): https://us.posthog.com/project/370499/insights/XieguQ9p
- **Daily sign-outs — churn signal**: https://us.posthog.com/project/370499/insights/wW03eaFf
- **Onboarding → sign-in funnel**: https://us.posthog.com/project/370499/insights/Taf3Lqfw

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
