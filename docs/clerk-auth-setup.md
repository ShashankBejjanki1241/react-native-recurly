# Clerk authentication (Expo / Recurly)

This app follows the [Clerk Expo quickstart](https://clerk.com/docs/quickstarts/expo) as the source of truth for native auth.

## 1. Clerk Dashboard

1. Create or open your [Clerk application](https://dashboard.clerk.com/).
2. Enable **Native API** under **Native applications** (required for Expo).
3. Under **User & authentication → Email, phone, username**, enable **Email address** and **Password** so the custom email/password screens work.
4. Copy the **Publishable key** from **API keys**.

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
| `app/(auth)/sign-in.tsx` / `sign-up.tsx` | Custom flows with `useSignIn` / `useSignUp` (Clerk’s “JavaScript” Expo path). |
| `components/auth/RequireAuth.tsx` | Guard: `useAuth()` → `<Redirect href="/(auth)/sign-in" />` when signed out. |
| `app/(tabs)/_layout.tsx` | Wraps the tab navigator with `RequireAuth`. |
| `app/Subscriptions/[id].tsx` | Wrapped with `RequireAuth` (deep links stay protected). |
| `app/(tabs)/settings.tsx` | `useUser` + `signOut()` → `/(auth)/sign-in`. |
| `types/auth.ts` | Shared auth UI types (`AuthFieldErrors`, `AuthSignUpPhase`, `HomeHeaderUserContent`, etc.). |
| `lib/auth/map-clerk-user.ts` | Maps Clerk `useUser()` → `HomeHeaderUserContent` for the home header. |
| `app/(tabs)/index.tsx` | Extra guard: `useAuth` / `Redirect` + passes Clerk user into `HomeHeader`. |

## 4. Native builds and the config plugin

`app.json` includes the `@clerk/expo` config plugin (iOS/Android native setup). After adding it, run a **development build** or `npx expo prebuild` when you move beyond Expo Go, per Clerk’s docs.

## 5. Session behavior

- Tokens persist via **expo-secure-store** through Clerk’s `tokenCache`.
- Active session drives `useAuth().isSignedIn` and `useUser()`; no custom session store is required on the client.

## 6. Backend / API keys

- **Never** put `CLERK_SECRET_KEY` in the Expo app. Use it only on a server or Edge function that verifies JWTs.
- The mobile app only needs the **publishable** key.
