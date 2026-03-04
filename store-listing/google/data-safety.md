# Google Play Data Safety Questionnaire

## Overview
The app collects minimal data necessary for core functionality (stock analysis).

## Data Collection

### Search queries (Stock ticker symbols)
- **Collected**: Yes
- **Required**: Yes — core app functionality depends on it
- **Purpose**: App functionality (to retrieve and analyze stock data)
- **Shared with third parties**: Yes
  - **Polygon.io** — to retrieve market data for the requested ticker
  - **OpenAI** — to generate AI-powered analysis for the requested ticker
- **Processing**: Ephemeral (processed in real-time, not stored on our servers)
- **Encrypted in transit**: Yes (HTTPS/TLS)
- **User can request deletion**: Not applicable (data is not stored)

## Data NOT Collected
- Personal info (name, email, phone, address)
- Financial info (payment info, purchase history, credit score)
- Location (approximate or precise)
- Contacts
- Photos/videos
- Audio
- Files and docs
- Calendar
- App activity (other than search queries described above)
- Web browsing history
- Device identifiers
- Diagnostics (crash logs, performance data)
- Health and fitness data

## Account
- **No account/login required** to use the app
- Users cannot create accounts

## Data Handling
- **Encryption in transit**: Yes (all communication via HTTPS)
- **Encryption at rest**: Not applicable (no data stored)
- **Deletion mechanism**: Not applicable (no persistent data)

## Summary for Data Safety Form
When filling out the Google Play Console Data Safety form:
1. App **does collect** data → "Search queries" only
2. Search queries are **shared** with Polygon.io and OpenAI for functionality
3. Data is **not stored** persistently
4. Data is **encrypted in transit**
5. No way to request deletion (nothing stored)
6. App does **not** collect any other data types
