---
description: Deploy Mobile - Build, test, and deploy mobile apps to app stores
---

# /deploy-mobile — Mobile App Deployment Workflow

Build and deploy React Native or Flutter apps to iOS App Store and Google Play.

// turbo

1. **Pre-Flight Check**
   - Verify app version bump in `app.json` / `app.config.js`.
   - Check for platform-specific issues (iOS certificates, Android signing).
   - Run lint and type check.

2. **Test**
   - Run unit tests: `npm test` or `flutter test`.
   - Check for crash-prone patterns (unhandled promises, memory leaks).

// turbo

3. **Build**
   - iOS: `eas build --platform ios` or `npx react-native build-ios`.
   - Android: `eas build --platform android` or `./gradlew assembleRelease`.
   - 🛑 STOP if build fails — fix before proceeding.

4. **Deploy**
   - Staging: deploy to TestFlight (iOS) / Internal Testing (Android).
   - 🛑 STOP & WAIT: User verifies on staging.
   - Production: submit to App Store / Google Play.

// turbo

5. **Post-Deploy**
   - Tag release in git.
   - Update changelog.
   - Monitor crash reports (Sentry, Crashlytics).
