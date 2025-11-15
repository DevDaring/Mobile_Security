# Integration Notes - Privacy Guard App

## Social Media API Integration

### Current Implementation

The current app uses **mock/placeholder implementations** for social media integrations. These are suitable for:
- Academic projects and coursework
- Demonstrations and prototypes
- Understanding the architecture
- Testing the UI/UX flow

### Production Implementation Guide

To integrate real social media APIs:

#### 1. Facebook/Instagram (Meta)

**Setup:**
```bash
npm install react-native-fbsdk-next
```

**Configuration:**
- Create app at developers.facebook.com
- Add Facebook App ID to app configuration
- Request permissions: `user_posts`, `pages_read_engagement`

**Implementation:**
```typescript
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

async function facebookLogin() {
  const result = await LoginManager.logInWithPermissions(['user_posts']);
  if (result.isCancelled) return;

  const token = await AccessToken.getCurrentAccessToken();
  // Use token to fetch posts via Graph API
}
```

**API Endpoints:**
- Posts: `GET /me/posts`
- Update Post: `POST /{post-id}`
- Delete Post: `DELETE /{post-id}`

**Rate Limits:**
- 200 calls per hour per user
- Consider caching and batching

**Privacy Considerations:**
- Request minimal permissions
- Explain data usage clearly
- Allow easy disconnection
- Don't store tokens unencrypted

#### 2. YouTube (Google)

**Setup:**
```bash
npm install @react-native-google-signin/google-signin
npm install @googleapis/youtube
```

**Configuration:**
- Create project in Google Cloud Console
- Enable YouTube Data API v3
- Configure OAuth 2.0 credentials

**Implementation:**
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID',
  offlineAccess: true,
  scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
});

async function youtubeLogin() {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();
  // Use tokens with YouTube API
}
```

**API Endpoints:**
- Activities: `GET /youtube/v3/activities`
- Videos: `GET /youtube/v3/videos`
- Update: `PUT /youtube/v3/videos`

**Quotas:**
- 10,000 units per day (default)
- Different operations cost different units
- Monitor usage in Cloud Console

#### 3. Instagram

**Note:** Instagram requires business/creator accounts for API access.

**Setup:**
- Use Facebook Graph API (Instagram is owned by Meta)
- Request Instagram Basic Display API access
- Or use Instagram Graph API for business accounts

**Scopes:**
- `instagram_basic`
- `instagram_content_publish` (if needed)

## Permission Monitoring

### Android Implementation

For real permission monitoring on Android:

**Native Module Required:**

Create `android/app/src/main/java/com/privacyapp/PermissionMonitorModule.java`:

```java
import android.app.AppOpsManager;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class PermissionMonitorModule extends ReactContextBaseJavaModule {
    public PermissionMonitorModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "PermissionMonitor";
    }

    @ReactMethod
    public void getPermissionUsage(Promise promise) {
        // Implementation to read app ops logs
        // Requires PACKAGE_USAGE_STATS permission
    }
}
```

**Permissions Required:**
```xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
```

**Limitations:**
- User must manually grant PACKAGE_USAGE_STATS in Settings
- Some Android versions restrict access
- Cannot get real-time logs on modern Android (10+)

### iOS Implementation

iOS provides more limited permission monitoring:

```typescript
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';

async function checkIOSPermissions() {
  const locationStatus = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
  // Can check current status, but not access history
}
```

**Limitations:**
- Cannot access permission usage logs
- Can only check current permission states
- No timestamp information available
- Must rely on heuristics and user self-reporting

## Alternative Approaches

Since permission logging is limited:

### 1. Self-Reporting

Ask users to manually report concerning apps:
- "Which apps surprised you with location access?"
- User-driven privacy audits

### 2. App Scanning

Analyze installed apps' requested permissions:

```typescript
import { getInstalledApps } from 'react-native-installed-apps';

async function scanInstalledApps() {
  const apps = await getInstalledApps();
  // Analyze which apps request sensitive permissions
}
```

### 3. Educational Approach

Focus on education rather than monitoring:
- Teach users to check permissions manually
- Provide guides for each app store
- Explain privacy settings

### 4. Survey-Based

Periodic surveys asking:
- "How often do you check app permissions?"
- "Which apps have you granted location access?"
- Use responses to generate nudges

## Background Tasks

### Android Background Service

For periodic privacy scans:

```java
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

PeriodicWorkRequest scanRequest =
    new PeriodicWorkRequest.Builder(PrivacyScanWorker.class, 24, TimeUnit.HOURS)
        .build();

WorkManager.getInstance(context).enqueue(scanRequest);
```

### iOS Background Fetch

Limited options on iOS:

```typescript
import BackgroundFetch from 'react-native-background-fetch';

BackgroundFetch.configure({
  minimumFetchInterval: 15, // minutes
}, async (taskId) => {
  console.log('[BackgroundFetch] taskId: ', taskId);
  // Perform privacy scan
  BackgroundFetch.finish(taskId);
});
```

**iOS Limitations:**
- System decides when to run
- No guaranteed execution
- Limited processing time

## Security Best Practices

### Secure Token Storage

**iOS (Keychain):**
```typescript
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('oauth_token', token, {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
  service: 'com.privacyapp.oauth',
});
```

**Android (Keystore):**
```typescript
import {encrypt, decrypt} from 'react-native-simple-crypto';
// Or use react-native-encrypted-storage
```

### API Key Protection

Never hardcode API keys:

```typescript
// ❌ Don't do this
const API_KEY = "AIzaSyD...";

// ✅ Do this
import Config from 'react-native-config';
const API_KEY = Config.GOOGLE_API_KEY;
```

**.env file:**
```
FACEBOOK_APP_ID=your_app_id
GOOGLE_API_KEY=your_api_key
```

**Add to .gitignore:**
```
.env
.env.local
```

## Testing

### Mock Data Generation

The app includes mock data generators:
- `PermissionsService.generateMockPermissionData()`
- Social connectors return placeholder posts
- Useful for development and demos

### Integration Testing

Before production:

```bash
# Test OAuth flows
npm run test:integration:facebook
npm run test:integration:youtube

# Test permission checks
npm run test:permissions

# Test data persistence
npm run test:storage
```

## Deployment Checklist

Before deploying to production:

- [ ] Replace all mock implementations with real APIs
- [ ] Secure all API keys and tokens
- [ ] Configure OAuth redirect URLs
- [ ] Set up backend if needed (for anonymized telemetry)
- [ ] Test on physical devices (not just simulators)
- [ ] Review platform privacy policies
- [ ] Submit privacy policy and data usage to app stores
- [ ] Implement proper error handling
- [ ] Add crash reporting (with user consent)
- [ ] Set up analytics (privacy-preserving only)
- [ ] Configure rate limiting
- [ ] Test offline functionality
- [ ] Verify GDPR/CCPA compliance

## Platform-Specific Notes

### Android

- Requires `compileSdkVersion 33` or higher
- Test on Android 10+ (privacy restrictions)
- Handle runtime permissions correctly
- Respect Battery Optimization settings

### iOS

- Requires iOS 14+ for ATT (App Tracking Transparency)
- Test on real devices (permissions different in simulator)
- Provide purpose strings for all permissions
- Handle App Store review guidelines

## Known Limitations

1. **Permission Monitoring**: Limited on modern OS versions
2. **Background Execution**: Restricted by platform
3. **Social Media APIs**: Rate limits and approval required
4. **Real-Time Nudges**: May not be immediate
5. **Cross-Platform Differences**: iOS and Android have different capabilities

## Future Enhancements

Potential improvements:

1. **Server-Side Component**
   - Anonymized aggregate statistics
   - Privacy trend analysis
   - Collaborative filtering for nudges

2. **Machine Learning**
   - Better PII detection
   - Emotion analysis for posts
   - Personalized risk scoring

3. **Additional Platforms**
   - Twitter/X integration
   - TikTok support
   - LinkedIn for professional context

4. **Enhanced Nudges**
   - Contextual nudges based on time/location
   - Social comparison (anonymized)
   - Gamification elements

## Support and Resources

- React Native Docs: https://reactnative.dev/
- Facebook Graph API: https://developers.facebook.com/docs/graph-api/
- YouTube Data API: https://developers.google.com/youtube/v3
- React Native Permissions: https://github.com/zoontek/react-native-permissions

---

**Remember**: This is an educational project. Real production deployment requires significant additional work, testing, and compliance verification.
