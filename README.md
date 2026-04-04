# Recurly

**Recurly** is a subscription management app built with React Native. Track renewals, spending, and plans in one place—on iOS, Android, and web.

---

## Stack

| Layer | Technology |
|--------|------------|
| **Framework** | [Expo](https://expo.dev) SDK 54 · [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing) |
| **UI** | [React Native](https://reactnative.dev) 0.81 · [React](https://react.dev) 19 |
| **Styling** | [NativeWind](https://www.nativewind.dev) v5 (preview) · [Tailwind CSS](https://tailwindcss.com) v4 · `global.css` · [react-native-css](https://github.com/nativewind/react-native-css) |
| **Language & quality** | TypeScript · ESLint (`eslint-config-expo`) |
| **Navigation UX** | React Navigation · `react-native-screens` · `react-native-safe-area-context` · Reanimated · Gesture Handler |

### Development

- **Expo CLI / dev server** — `npx expo start` (Expo Go, simulators, or [development builds](https://docs.expo.dev/develop/development-builds/introduction/))
- **Metro** — bundler (configured with NativeWind)

### Integrations (roadmap)

- **[Clerk](https://clerk.com)** — authentication and user management; billing flows where applicable
- **[PostHog](https://posthog.com)** — product analytics and feature flags

### Delivery & collaboration

- **[EAS](https://docs.expo.dev/eas/)** (Expo Application Services) — cloud builds, updates, and app store submission (`eas build`, `eas submit`)
- **[CodeRabbit](https://coderabbit.ai)** — AI-assisted pull request reviews (enable the GitHub app on this repository)

---

## Requirements

- Node.js (LTS recommended)
- [npm](https://www.npmjs.com/) or your preferred package manager
- For device builds: Xcode (iOS), Android Studio (Android), and an [Expo](https://expo.dev) account for EAS when you wire it up

---

## Getting started

```bash
npm install
npx expo start
```

Then open the project in Expo Go, an emulator/simulator, or a development build.

Common scripts:

| Command | Description |
|---------|-------------|
| `npm start` | Start the Metro bundler |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run web` | Start for web |
| `npm run lint` | Run ESLint |

---

## Project layout

- `app/` — Expo Router routes (`(tabs)`, `(auth)`, etc.)
- `global.css` — theme tokens and shared styles (Tailwind / NativeWind)
- `assets/` — images and static assets

---

## Git branches, releases, and versioning

We use **environment-aligned long-lived branches** and **Semantic Versioning** ([SemVer](https://semver.org/)).

| Branch | Purpose |
|--------|---------|
| **`dev`** | Day-to-day integration. Feature branches merge here via PR. **Default branch for active development.** |
| **`qa`** | QA / staging. Updated when `dev` is stable enough for a test build (merge or promote from `dev`). |
| **`prod`** | Production. Only merges from `qa` after sign-off. Matches what ships to stores. |
| **`main`** | Kept in sync with **`prod`** (or latest stable) so clones without checking `prod` still see release history. |

**Version numbers** (in `package.json`, `app.json` / `expo.version` when you wire EAS, and root `VERSION`):

- **`MAJOR.MINOR.PATCH`** (e.g. `1.4.2`) — bump **PATCH** for fixes, **MINOR** for backward-compatible features, **MAJOR** for breaking changes.
- **Pre-release** (optional on `dev` / `qa`): `1.0.0-rc.1`, `1.0.0-beta.2`.

**Git tags** (on `prod` after each store release):

- `v1.0.0`, `v1.1.0`, … — always match the version you released.

**Feature branch names** (merge → `dev`):

- `feature/short-description` — new capability  
- `fix/issue-or-scope` — bugfix  
- `chore/task` — tooling, deps, docs only  

**Typical flow**

```text
feature/* → PR → dev → (promote) → qa → (promote) → prod → tag vX.Y.Z
```

Set GitHub’s **default branch** to **`dev`** while the team is building; switch default to **`main`** or **`prod`** later if you prefer release-first discovery.

---

## Suggested GitHub topics

You can paste these into the repository **Topics** field on GitHub:

`expo` · `react-native` · `expo-router` · `nativewind` · `tailwindcss` · `typescript` · `subscription-management` · `mobile` · `clerk` · `posthog` · `eas` · `react-native-reanimated`

---

## Repository

```text
git@github.com:ShashankBejjanki1241/react-native-recurly.git
```

Clone:

```bash
git clone git@github.com:ShashankBejjanki1241/react-native-recurly.git
cd react-native-recurly
```

---

## License

Private project unless otherwise noted.
