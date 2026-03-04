# Screenshot Capture Guide

## Required Screenshots

### Apple App Store
| Device | Resolution | Required |
|--------|-----------|----------|
| iPhone 15 Pro Max (6.7") | 1290 x 2796 | Yes |
| iPhone 14 Plus (6.5") | 1284 x 2778 | Yes |
| iPhone 8 Plus (5.5") | 1242 x 2208 | Yes (if supporting older devices) |
| iPad Pro 12.9" (6th gen) | 2048 x 2732 | Yes (if listing as iPad compatible) |

### Google Play Store
| Device | Resolution | Required |
|--------|-----------|----------|
| Phone | 1080 x 1920 (min) | Yes (min 2, recommended 4-8) |
| 7" Tablet | 1200 x 1920 | Recommended |
| 10" Tablet | 1600 x 2560 | Recommended |

## Recommended Screenshots to Capture

Capture these screens for each required device size:

1. **Home Screen** — Empty state with ticker input field
2. **Analysis Loading** — Loading spinner with progress steps
3. **Technical Indicators** — Chart with RSI, MACD, Bollinger Bands
4. **M2M Scorecard** — 6-Factor score with radar chart
5. **AI Analysis** — AI-generated summary section
6. **News Sentiment** — News headlines with sentiment scores
7. **PDF Export** — Export button or PDF preview
8. **About Screen** — App info with disclaimer

## Capture Methods

### Method 1: iOS Simulator (for Apple screenshots)
```bash
# Open in Xcode
npm run cap:ios

# In Simulator: File → Screenshot (Cmd+S)
# Or: xcrun simctl io booted screenshot screenshot.png
```

Select different simulators in Xcode to match required device sizes.

### Method 2: Android Emulator (for Google Play screenshots)
```bash
# Open in Android Studio
npm run cap:android

# In Emulator: Click camera icon in toolbar
# Or: adb exec-out screencap -p > screenshot.png
```

### Method 3: Chrome DevTools (Quick mockups)
1. Open `https://singlestock.mark2markets.com` in Chrome
2. Open DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)
3. Set custom dimensions matching target resolution
4. Set Device Pixel Ratio to match (2x or 3x)
5. Capture screenshot: three-dot menu → Capture screenshot

### Method 4: Real Devices
- iOS: Side button + Volume Up
- Android: Power + Volume Down

## Tips
- Use a compelling stock like AAPL or NVDA that shows good chart patterns
- Ensure the analysis has fully loaded before capturing
- Capture in dark mode (the app's default theme)
- Screenshots should be PNG format
- Do not include device frames for App Store (Apple adds them automatically)
- Consider adding marketing text overlays for Google Play using a tool like Figma

## Output Directory
Save final screenshots to:
```
store-listing/screenshots/apple/
store-listing/screenshots/google/
```
