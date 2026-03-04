# Apple App Store Build & Submission Checklist

## Prerequisites
- [ ] Apple Developer account enrolled ($99/year) at https://developer.apple.com
- [ ] Xcode installed (latest stable version)
- [ ] App ID registered in Apple Developer portal with bundle ID `com.mark2market.stockintelligence`
- [ ] Distribution certificate and provisioning profile created

## 1. Build the App
```bash
# Build Next.js and sync with Capacitor
npm run cap:build

# Open in Xcode
npm run cap:ios
```

## 2. Xcode Configuration
- [ ] Select your **Team** in Signing & Capabilities
- [ ] Verify Bundle Identifier: `com.mark2market.stockintelligence`
- [ ] Set Version: `1.0.0` and Build: `1`
- [ ] Confirm deployment target (iOS 16.0+)
- [ ] Verify app icons appear in Assets.xcassets

## 3. Archive & Upload
- [ ] Select **Any iOS Device** as build target
- [ ] Product → Archive
- [ ] In Organizer, click **Distribute App**
- [ ] Select **App Store Connect** → Upload
- [ ] Wait for processing (5–15 minutes)

## 4. App Store Connect Setup
- [ ] Create new app in App Store Connect
- [ ] Fill in app information:
  - App Name: `M2M Stock Intelligence`
  - Subtitle: `AI-Powered Stock Analysis`
  - Category: Finance
  - Secondary Category: Education
- [ ] Copy description from `store-listing/apple/metadata.json`
- [ ] Add keywords from metadata
- [ ] Set Privacy Policy URL: `https://singlestock.mark2markets.com/privacy`
- [ ] Set Support URL: `https://singlestock.mark2markets.com/support`

## 5. Screenshots
Upload screenshots for required device sizes:
- [ ] 6.7" Display (iPhone 15 Pro Max): 1290×2796
- [ ] 6.5" Display (iPhone 14 Plus): 1284×2778
- [ ] 5.5" Display (iPhone 8 Plus): 1242×2208
- [ ] iPad Pro 12.9" (6th gen): 2048×2732

See `store-listing/screenshots/README.md` for capture instructions.

## 6. Content Rating
- [ ] Complete Age Rating questionnaire (all "No" → 4+ rating)
- [ ] Reference: `store-listing/apple/content-rating.md`

## 7. Pricing
- [ ] Set price to **Free**
- [ ] No in-app purchases to configure

## 8. App Review Information
- [ ] Paste review notes from `store-listing/apple/review-notes.md`
- [ ] No demo account needed (no login required)

## 9. Export Compliance
- [ ] Select "Yes" for uses encryption
- [ ] Select "Yes" for exempt (standard HTTPS/TLS only)
- [ ] No ECCN required

## 10. Submit
- [ ] Select the uploaded build
- [ ] Review all sections for completeness
- [ ] Click **Submit for Review**
- [ ] Expected review time: 24–48 hours
