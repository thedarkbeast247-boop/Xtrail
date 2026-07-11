# XTrail

XTrail is a mobile-first South African off-road trail and ride-management app built with React, TypeScript, Vite, React Router, Tailwind-style UI components, and Capacitor Android.

## Project folder

Run all commands from the folder containing `package.json`, `src`, `vite.config.ts`, and `package-lock.json`.

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

For phone testing on the same local network:

```bash
npm run dev -- --host 0.0.0.0
```

## Verify before committing

```bash
npm run check
```

This runs the TypeScript check and production Vite build.

## Android / Capacitor

```bash
npm run android:sync
npm run android:open
```

Create a Windows debug APK with:

```bash
npm run apk:debug
```

The APK is generated under:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Generated files

Do not edit files inside `dist`. The `dist` folder and Android build output are generated and excluded from Git.
