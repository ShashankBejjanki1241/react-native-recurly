# Clerk authentication (Expo / Recurly)

This app follows the [Clerk Expo quickstart](https://clerk.com/docs/quickstarts/expo) as the source of truth for native auth.

## 1. Clerk Dashboard

1. Create or open your [Clerk application](https://dashboard.clerk.com/).
2. Enable **Native API** under **Native applications** (required for Expo).
3. Under **User & authentication → Email, phone, username**, enable **Email address** and **Password** so the custom email/password screens work.
4. For **Forgot password**, enable the email reset strategy in Clerk (see [forgot password](https://clerk.com/docs/guides/development/custom-flows/account-updates/forgot-password)) so `resetPasswordEmailCode` can send codes.
5. Copy the **Publishable key** from **API keys**.

## 2. Environment

1. Copy `.env.example` to `.env` in the repo root (`.env` is not committed).
2. Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to your publishable key.
3. Restart Expo (`npx expo start`) so Metro picks up env changes.

`lib/auth/clerk-config.ts` also accepts `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` if you reuse a web `.env`.

## 3. Architecture in this repo

| Piece | Role |
|--------|------|
| `app/_layout.tsx` | Loads fonts, then wraps the app in `ClerkProvider` + `tokenCache` from `@clerk/expo/token-cache` (Secure Store). |
| `unstable_settings.initialRouteName` | Prefers the `(tabs)` stack so cold start hits the tab shell; `RequireAuth` sends guests to sign-in. |
| `app/(auth)/_layout.tsx` | Stack for sign-in/up; redirects signed-in users to `/(tabs)`. |
| `app/(auth)/sign-in.tsx` / `sign-up.tsx` / `forgot-password.tsx` | Custom flows with `useSignIn` / `useSignUp` (Clerk’s “JavaScript” Expo path). Forgot password uses `resetPasswordEmailCode` after `signIn.create({ identifier })`. |
| `components/auth/RequireAuth.tsx` | Guard: `useAuth()` → `<Redirect href="/(auth)/sign-in" />` when signed out. |
| `app/(tabs)/_layout.tsx` | Wraps the tab navigator with `RequireAuth`. |
| `app/Subscriptions/[id].tsx` | Wrapped with `RequireAuth` (deep links stay protected). |
| `app/(tabs)/settings.tsx` | `useUser` + `signOut()` → `/(auth)/sign-in`. |
| `types/auth.ts` | Shared auth UI types (`AuthFieldErrors`, `AuthSignUpPhase`, `AuthSignInPhase`, `HomeHeaderUserContent`, etc.). |
| `lib/auth/pick-sign-in-second-factor.ts` | Picks email/SMS/TOTP/backup when sign-in status is `needs_second_factor`. |
| `lib/auth/map-clerk-user.ts` | Maps Clerk `useUser()` → `HomeHeaderUserContent` for the home header. |
| `app/(tabs)/index.tsx` | Extra guard: `useAuth` / `Redirect` + passes Clerk user into `HomeHeader`. |

## 4. Native builds and the config plugin

`app.json` includes the `@clerk/expo` config plugin (iOS/Android native setup). After adding it, run a **development build** or `npx expo prebuild` when you move beyond Expo Go, per Clerk’s docs.

## 5. MFA / 2FA (sign-in)

1. In the Clerk Dashboard, enable **multi-factor authentication** for your users and choose allowed second factors (e.g. authenticator app, SMS, email code).
2. `app/(auth)/sign-in.tsx` handles `needs_second_factor` after a successful password: it sends an email or SMS code when that strategy is available, or prompts for TOTP / backup codes.
3. **Email link** as the only second factor is not supported in-app; use codes or TOTP in Clerk so mobile users can complete sign-in.

## 6. Session behavior

- Tokens persist via **expo-secure-store** through Clerk’s `tokenCache`.
- Active session drives `useAuth().isSignedIn` and `useUser()`; no custom session store is required on the client.

## 7. Backend / API keys

- **Never** put `CLERK_SECRET_KEY` in the Expo app. Use it only on a server or Edge function that verifies JWTs.
- The mobile app only needs the **publishable** key.
