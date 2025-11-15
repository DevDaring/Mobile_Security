# Privacy Guard - Mobile Privacy Management App

A comprehensive React Native application designed to help college students manage their digital privacy, monitor app permissions, and make informed decisions about social media sharing. This project is based on peer-reviewed research on privacy nudges and permission management.

## 🎓 Academic Context

This app is a **college project** implementing findings from two research papers:

1. **AppOps Study**: Permission managers and daily nudges increase user awareness and lead to permission changes
2. **Facebook Field Trial**: Audience thumbnails and short timers help prevent regrettable disclosures

## ✨ Features

### Core Functionality

1. **Device Permission Inspector**
   - Monitor which apps access sensitive permissions (location, contacts, camera, microphone, storage)
   - View access frequency and history
   - Mark trusted apps as "safe"

2. **Social Media Aggregator**
   - Connect Facebook, Instagram, and YouTube accounts (mock implementation for demo)
   - View all your posts in one unified timeline
   - See visibility settings and audience size for each post
   - Identify privacy risks (public posts, location tags, PII)

3. **Privacy Nudges**
   - **Permission Access Nudges**: Daily alerts about which apps accessed sensitive data
   - **Audience Nudges**: Preview who can see your post before publishing
   - **Timer Nudges**: Brief countdown before posting to encourage reflection
   - **Exposure Alerts**: Warnings about risky posts

4. **Composer with Smart Nudges**
   - Create posts for multiple platforms
   - Real-time audience preview
   - Configurable timer before publishing
   - Privacy tips and suggestions

5. **Exposure Analyzer**
   - Scan recent posts for privacy risks
   - Detect public posts, location tags, PII (emails/phone numbers)
   - Auto-fix options for common issues
   - Detailed risk explanations

6. **Audit History**
   - Complete log of all privacy events
   - Track nudges shown and your responses
   - Monitor permission changes
   - Export data for personal records

7. **Customizable Settings**
   - Configure nudge frequency (daily, weekly, biweekly)
   - Choose delivery style (heads-up, full-screen, notification)
   - Set quiet hours
   - Adjust sensitivity thresholds
   - Personalize per-app exemptions

## 🏗️ Architecture

```
PrivacyApp/
├── src/
│   ├── assets/              # Images, fonts, icons
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── NudgeModal.tsx
│   │   └── RiskBadge.tsx
│   ├── screens/             # Screen components
│   │   ├── Onboarding/
│   │   ├── Dashboard/
│   │   ├── PermissionsManager/
│   │   ├── SocialAggregate/
│   │   ├── Composer/
│   │   ├── ExposureAnalyzer/
│   │   ├── Alerts/
│   │   ├── History/
│   │   └── Settings/
│   ├── services/            # Business logic
│   │   ├── permissionsService.ts
│   │   ├── nudgeEngine.ts
│   │   └── socialConnectors/
│   ├── store/               # Zustand state management
│   ├── utils/               # Helper functions
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── App.tsx              # Main app component
├── docs/                    # Documentation
│   ├── privacy_policy.md
│   ├── ethics_consent_guidelines.md
│   └── integration_notes.md
└── package.json
```

## 🛠️ Technology Stack

### Core Technologies
- **React Native 0.73**: Cross-platform mobile framework
- **TypeScript**: Type-safe development
- **Zustand**: Lightweight state management
- **React Navigation**: Navigation framework

### Key Dependencies (All Free & Open Source)
- `@react-navigation/native`: Navigation library
- `@react-navigation/stack`: Stack navigator
- `@react-navigation/bottom-tabs`: Tab navigator
- `@react-native-async-storage/async-storage`: Local data persistence
- `react-native-permissions`: Permission management
- `react-native-safe-area-context`: Safe area handling
- `react-native-screens`: Native navigation performance
- `react-native-gesture-handler`: Gesture support
- `date-fns`: Date formatting and manipulation

**Note**: All packages used are free, open-source, and suitable for academic projects.

## 📋 Prerequisites

- **Node.js**: 18 or higher
- **npm** or **yarn**
- **React Native development environment**:
  - For iOS: Xcode (macOS only)
  - For Android: Android Studio, JDK 11+

## 🚀 Getting Started

### 1. Clone the Repository

```bash
cd PrivacyApp
```

### 2. Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### 3. Install iOS Dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

### 4. Run the App

**For Android:**

```bash
npm run android
```

**For iOS:**

```bash
npm run ios
```

**Start Metro Bundler:**

```bash
npm start
```

## 📱 Running on Physical Devices

### Android

1. Enable Developer Options and USB Debugging on your device
2. Connect via USB
3. Run `npm run android`

### iOS

1. Open `ios/PrivacyApp.xcworkspace` in Xcode
2. Select your device
3. Click Run (or `cmd + R`)

## 🧪 Testing

The app includes mock data for demonstration purposes:

- **Permission Accesses**: Auto-generated mock data showing various apps accessing permissions
- **Social Media Posts**: Placeholder posts from Facebook, Instagram, YouTube
- **OAuth Flows**: Simulated authentication (no real API credentials needed)

This allows you to test all features without connecting real accounts or requiring API keys.

## 🎨 Key Screens

### 1. Onboarding
- Explains app purpose and privacy principles
- Requests necessary permissions
- Progressive disclosure approach

### 2. Dashboard
- Privacy score overview
- Recent exposures summary
- Top apps accessing data
- Quick actions

### 3. Permissions Manager
- Filter by permission type
- View access frequency
- Mark apps as safe
- Open system settings

### 4. Social Aggregate Feed
- Connect social accounts
- View all posts in one place
- Filter by risk level or visibility
- Make posts private or delete

### 5. Composer
- Multi-platform posting
- Audience preview nudge
- Timer nudge before publishing
- Privacy tips

### 6. Exposure Analyzer
- Privacy risk scanner
- Auto-fix suggestions
- Detailed risk explanations
- One-tap remediation

### 7. Alerts
- Nudge inbox
- Snooze or dismiss options
- Nudge history

### 8. Audit History
- Complete event log
- Filter by event type
- Export functionality
- Data control

### 9. Settings
- Nudge preferences
- Frequency controls
- Delivery style
- Quiet hours
- Sensitivity adjustment

## 🔒 Privacy & Security

### Data Handling
- **Local-First**: All data processed and stored on device
- **No External Servers**: No data sent to third parties
- **Encrypted Storage**: OAuth tokens stored securely
- **User Control**: Complete data export and deletion
- **Transparent**: Audit log shows all app actions

### Permissions Requested
- **Location**: To monitor location access by other apps
- **Camera**: To monitor camera access
- **Microphone**: To monitor microphone access
- **Contacts**: To monitor contact access (optional)
- **Storage**: For local data storage

**Note**: The app only monitors permission usage; it doesn't access the actual data.

## 📚 Research Foundation

This app implements research-backed privacy interventions:

### AppOps Study Findings
- Permission managers increase user awareness
- Daily nudges lead to permission changes
- Showing top 3 apps + "X others" is effective
- Personalization reduces annoyance

### Facebook Field Trial Findings
- Audience thumbnails help users judge visibility
- 3-5 random profile pictures effective
- Short timer (5-10s) prevents regretful posts
- "Post now" option maintains user autonomy

## 🎯 Use Cases

### For Students
- Learn about mobile privacy
- Understand permission risks
- Practice privacy-preserving behavior
- Manage social media footprint

### For Researchers
- Study privacy nudge effectiveness
- Collect anonymized usage data (with consent)
- Replicate published studies
- Extend with new interventions

### For Developers
- Example of privacy-first app design
- Reference implementation for nudge systems
- Educational codebase
- Open-source contribution opportunities

## 🚧 Known Limitations

1. **Permission Monitoring**: OS restrictions limit real-time monitoring on modern Android/iOS
2. **Social Media APIs**: Uses mock implementations; real APIs require approval and rate limits
3. **Background Tasks**: Limited by platform restrictions
4. **Platform Differences**: iOS and Android have different capabilities

See `docs/integration_notes.md` for production implementation guidance.

## 📖 Documentation

- **[Privacy Policy](docs/privacy_policy.md)**: How data is collected and used
- **[Ethics Guidelines](docs/ethics_consent_guidelines.md)**: Ethical principles and consent framework
- **[Integration Notes](docs/integration_notes.md)**: Production implementation guide

## 🤝 Contributing

This is an academic project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please maintain the privacy-first principles and ethical guidelines.

## 📝 License

This project is created for educational purposes. Please review the ethics guidelines before using or modifying the code.

## 🙏 Acknowledgments

- Research papers on privacy nudges and permission management
- React Native community
- Open-source contributors

## 📧 Contact

For questions or feedback:
- Open an issue on GitHub
- Email: [your-email]

## 🎓 Academic Integrity

If you use this project for academic purposes:
- Cite the original research papers
- Follow your institution's academic integrity policies
- Don't submit as original work without proper attribution
- Extend and improve rather than copy

## 🔮 Future Enhancements

Potential improvements:
- Real social media API integration
- Machine learning for better PII detection
- Server-side anonymized analytics
- Additional social platforms (Twitter, TikTok, LinkedIn)
- Gamification elements
- Peer comparison (anonymized)
- Advanced natural language processing
- Contextual nudges based on time/location

---

**Built with ❤️ for privacy-conscious students**

**No paid packages • No data collection • No surveillance • Just privacy**
