# App Store Review Notes

## How to Test
1. Open the app — no login or account required
2. Enter a stock ticker symbol (e.g., **AAPL**, **MSFT**, **TSLA**)
3. Tap **"Generate Analysis"**
4. Wait 10–20 seconds for the full analysis to load
5. Scroll through the results: technical indicators, scorecard, AI analysis, news sentiment
6. Optionally tap **"Export PDF"** to download a report

## Key Points for Review

### No Login Required
The app has no user accounts, authentication, or sign-up flow. Users simply enter a ticker symbol and receive an analysis.

### Rate Limiting
The app limits requests to 5 analyses per minute per device. If testing rapidly, you may see a rate limit message — simply wait 60 seconds.

### Educational Disclaimer
The app prominently displays disclaimers that all analysis is for educational purposes only and does not constitute investment advice. This is displayed on the About screen and in every generated analysis.

### Data Usage
The app only processes stock ticker symbols entered by the user. No personal data is collected. See our Privacy Policy at https://singlestock.mark2markets.com/privacy

### Network Requirement
The app requires an internet connection to retrieve market data and generate AI analysis. It connects to our server at https://singlestock.mark2markets.com which proxies requests to Polygon.io and OpenAI.

## Export Compliance (ECCN)
- The app uses **standard HTTPS (TLS)** for all network communication
- No custom encryption algorithms are implemented
- This qualifies for the **encryption exemption** under ECCN 5D002
- **EAR99** — no export license required

## Content
- No user-generated content
- No social features
- No in-app purchases
- No ads
- No third-party SDKs for analytics or advertising
