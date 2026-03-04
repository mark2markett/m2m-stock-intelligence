# Android Release Signing Setup

## 1. Generate a Release Keystore

Run this command and follow the prompts:

```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore m2m-release.keystore \
  -alias m2m-stock-intelligence \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You will be prompted for:
- **Keystore password**: Choose a strong password
- **Key password**: Can be the same as keystore password
- **Name, Organization, etc.**: Fill in your details (e.g., "Mark2Market LLC")

**IMPORTANT**: Store the keystore file and passwords securely. If you lose the keystore, you cannot update the app on Google Play.

## 2. Create keystore.properties

Create a file at `android/keystore.properties` (this file is gitignored):

```properties
storeFile=../m2m-release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=m2m-stock-intelligence
keyPassword=YOUR_KEY_PASSWORD
```

Place the `m2m-release.keystore` file in the project root (or adjust the `storeFile` path).

## 3. Verify

The `android/app/build.gradle` is already configured to read from `keystore.properties`. To verify:

```bash
cd android
./gradlew bundleRelease
```

If successful, the signed AAB will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## 4. Google Play App Signing

Google Play offers **Play App Signing** which manages your app signing key. When you upload your first AAB:
- Google generates and manages the app signing key
- Your upload key (from the keystore above) is used to authenticate uploads
- This provides key recovery if you lose your upload keystore

**Recommended**: Opt into Play App Signing during your first upload.

## Security Notes
- Never commit `keystore.properties` or `.keystore` / `.jks` files to version control
- Store backups of your keystore in a secure location (password manager, encrypted backup)
- The `.gitignore` already excludes these files
