# Google Play Store Build & Submission Checklist

## Prerequisites
- [ ] Google Play Developer account registered ($25 one-time) at https://play.google.com/console
- [ ] Android Studio installed
- [ ] Release keystore generated (see `store-listing/android-signing.md`)
- [ ] `keystore.properties` file configured in `android/` directory

## 1. Build the App
```bash
# Build Next.js and sync with Capacitor
npm run cap:build

# Open in Android Studio (optional, for debugging)
npm run cap:android
```

## 2. Generate Signed AAB (Android App Bundle)
```bash
cd android

# Build release bundle
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

Alternatively, build from Android Studio:
- Build → Generate Signed Bundle / APK
- Select Android App Bundle
- Choose your release keystore
- Build

## 3. Google Play Console Setup

### Create App
- [ ] Create new app in Google Play Console
- [ ] App name: `M2M Stock Intelligence`
- [ ] Default language: English (US)
- [ ] App type: App (not Game)
- [ ] Free

### Store Listing
- [ ] Short description from `store-listing/google/metadata.json`
- [ ] Full description from `store-listing/google/metadata.json`
- [ ] Upload feature graphic (1024×500) — generate with `node scripts/generate-feature-graphic.mjs`
- [ ] Upload screenshots (see `store-listing/screenshots/README.md`)
  - [ ] Phone screenshots (minimum 2, recommended 4-8)
  - [ ] 7" tablet screenshots (optional but recommended)
  - [ ] 10" tablet screenshots (optional but recommended)
- [ ] App icon (512×512) — already generated at `resources/android/playstore/icon.png`

### Content Rating
- [ ] Complete IARC questionnaire
- [ ] Reference: `store-listing/google/content-rating.md`
- [ ] Expected: Everyone / PEGI 3

### Data Safety
- [ ] Complete Data Safety form
- [ ] Reference: `store-listing/google/data-safety.md`

### App Content
- [ ] Target audience: 18+ (financial content)
- [ ] Ads: No
- [ ] App access: All functionality available without login
- [ ] Content ratings: Complete questionnaire
- [ ] Privacy policy URL: `https://singlestock.mark2markets.com/privacy`

### Pricing & Distribution
- [ ] Set to Free
- [ ] Select target countries (US initially)
- [ ] Opt into Google Play App Signing (recommended)

## 4. Upload & Release

### Internal Testing (Recommended First)
- [ ] Create internal testing track
- [ ] Upload AAB
- [ ] Add test email addresses
- [ ] Test on real devices

### Production Release
- [ ] Upload AAB to production track
- [ ] Add release notes: "Initial release — AI-powered educational stock analysis"
- [ ] Review and roll out to production
- [ ] Expected review time: 1–7 days (first submission may take longer)

## 5. Post-Launch
- [ ] Monitor Android Vitals for crashes/ANRs
- [ ] Respond to user reviews
- [ ] Monitor Play Console for policy issues
