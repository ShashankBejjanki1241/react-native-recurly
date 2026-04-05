# Recurly

Cross-platform subscription management for React Native—track renewals, spending, and plans on **iOS**, **Android**, and **web**.

**Status:** Early development · **Version:** `0.1.0` (see `package.json` and `VERSION`)

---

## Contents

1. [Overview](#overview)
2. [Technology stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Getting started](#getting-started)
5. [npm scripts](#npm-scripts)
6. [Repository layout](#repository-layout)
7. [Branching, releases, and versioning](#branching-releases-and-versioning)
8. [Code review and quality](#code-review-and-quality)
9. [Repository URL](#repository-url)
10. [License](#license)

---

## Overview

Recurly is an Expo-based mobile and web application focused on **subscription lifecycle visibility**: what you pay for, when it renews, and how it fits your budget. The codebase uses **file-based routing** (Expo Router), **TypeScript**, and **NativeWind** for a single design system across platforms.

Planned integrations include **Clerk** (authentication and billing-related flows) and **PostHog** (analytics and experimentation). Builds and store distribution are intended to run through **EAS** when you enable it.

---

## Technology stack


| Area                    | Choices                                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime**             | [Expo](https://expo.dev) SDK 54 · [React Native](https://reactnative.dev) 0.81 · [React](https://react.dev) 19                                                                         |
| **Routing**             | [Expo Router](https://docs.expo.dev/router/introduction/)                                                                                                                              |
| **Styling**             | [NativeWind](https://www.nativewind.dev) v5 (preview) · [Tailwind CSS](https://tailwindcss.com) v4 · `global.css` · [react-native-css](https://github.com/nativewind/react-native-css) |
| **Language & linting**  | TypeScript · ESLint (`[eslint-config-expo](https://docs.expo.dev/guides/using-eslint/)`)                                                                                               |
| **Navigation & motion** | React Navigation · `react-native-screens` · `react-native-safe-area-context` · Reanimated · Gesture Handler                                                                            |
| **Bundling**            | Metro (NativeWind-enabled via `metro.config.js`)                                                                                                                                       |


**Utilities:** `clsx` for conditional `className` composition where used.

---

## Prerequisites


| Requirement           | Notes                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**           | `>= 20.19.4` (declared in `package.json` `engines` and `.nvmrc`). Patch upgrade fixes `npm` `EBADENGINE` warnings from Metro / React Native. |
| **Package manager**   | npm (lockfile provided); pnpm or Yarn work if you regenerate locks.                                                                          |
| **Mobile toolchains** | Xcode (iOS) and Android Studio (Android) for simulators and store builds.                                                                    |
| **Expo account**      | Recommended when you adopt **EAS** for cloud builds and submission.                                                                          |


---

## Getting started

```bash
git clone git@github.com:ShashankBejjanki1241/react-native-recurly.git
cd react-native-recurly
npm install
npx expo start
```

Open the app in **Expo Go**, an **iOS Simulator**, **Android Emulator**, or a **development build** as described in the [Expo workflow docs](https://docs.expo.dev/workflow/overview/).

---

## npm scripts


| Script            | Purpose                          |
| ----------------- | -------------------------------- |
| `npm start`       | Start the Metro dev server       |
| `npm run ios`     | Run on iOS simulator / device    |
| `npm run android` | Run on Android emulator / device |
| `npm run web`     | Run the web target               |
| `npm run lint`    | Run ESLint (Expo preset)         |


**Typecheck (no emit):** `npx tsc --noEmit`

---

## Repository layout

```
.
├── app/                 # Expo Router: routes, groups (tabs), layouts
├── assets/              # Fonts, icons, images, splash assets
├── constants/           # Static config (e.g. tab metadata, icon map)
├── global.css           # Design tokens and Tailwind / NativeWind layers
├── metro.config.js      # Metro + NativeWind
├── postcss.config.mjs   # PostCSS (Tailwind)
├── .coderabbit.yaml     # CodeRabbit review configuration
├── .nvmrc               # Node version hint for nvm
├── VERSION              # Human-readable SemVer line (keep in sync with releases)
└── package.json
```

---

## Branching, releases, and versioning

### Long-lived branches


| Branch | Role                                                                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `dev`  | Primary integration branch. Feature work merges here via pull request.                                                              |
| `qa`   | Staging / pre-production validation; updated when `dev` is stable enough to test as a release candidate.                           |
| `prod` | Production-aligned code; merge from `qa` after sign-off. Tag releases from here.                                                   |
| `main` | **GitHub default branch** for this repo (`origin/HEAD`). Stable or promotion target; align with your `prod` policy as you prefer.   |


### Versioning and tags

- Follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.
- Pre-releases (e.g. `1.0.0-rc.1`) may be used on `dev` or `qa` as needed.
- When releasing from `prod`, create a Git tag `vX.Y.Z` that matches the shipped version (`package.json`, `app.json` / EAS, and `VERSION`).

### Branch naming (merge into `dev`)


| Prefix     | Use case                             |
| ---------- | ------------------------------------ |
| `feature/` | New functionality                    |
| `fix/`     | Bug fixes                            |
| `chore/`   | Tooling, dependencies, documentation |


### Promotion flow

```text
feature|fix|chore/*  →  PR  →  dev  →  qa  →  prod  →  git tag vX.Y.Z
```

### GitHub default branch

On GitHub this repository uses **`main`** as the default branch (fresh clones check out `main`; `git remote set-head origin -a` syncs local `origin/HEAD` after a remote change).

| Phase               | Suggested default | Rationale                                       |
| ------------------- | ----------------- | ----------------------------------------------- |
| Active development  | `dev`             | Aligns clones and new PR bases with daily work. |
| QA-centric workflow | `qa`              | When most integration happens on staging first. |
| Release-first       | `prod` or `main`  | When the default should reflect what ships.     |


---

## Code review and quality

- **Pull requests:** Target `dev` unless you are promoting to `qa`, `prod`, or `main`.
- **CodeRabbit:** Configure the [CodeRabbit](https://coderabbit.ai) GitHub app for this repository. Settings live in `**.coderabbit.yaml`**: automatic reviews include the GitHub default branch plus patterns for `dev`, `qa`, `prod`, and `main` so promotion PRs are covered when the default branch differs.
- **Manual review:** Comment `@coderabbitai review` on a PR to trigger or retry a review.

---

## Repository URL

```text
git@github.com:ShashankBejjanki1241/react-native-recurly.git
```

**Suggested GitHub topics:** `expo`, `react-native`, `expo-router`, `nativewind`, `tailwindcss`, `typescript`, `subscription-management`, `mobile`, `clerk`, `posthog`, `eas`, `react-native-reanimated`

---

## License

Private project unless otherwise noted.