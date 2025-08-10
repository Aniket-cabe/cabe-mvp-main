# Penalty & Point Decay Module

A comprehensive penalty and point decay management system for the CaBE platform that warns users about point decay and CaBOT credit consumption with visual indicators and interactive components.

## 🎯 Features

- **Decay Warning Banner**: Shows when last submission > 7 days with urgency levels
- **CaBOT Credit Ring**: Visual progress ring with countdown to weekly reset
- **Credit Warning Toast**: Auto-hiding notifications for low credit balance
- **Decay History Modal**: Detailed table of all point losses and penalties
- **Real-time Updates**: Live countdown timers and credit consumption tracking
- **Responsive Design**: Works perfectly on all screen sizes

## 📁 File Structure

```
src/modules/penalty/
├── components/
│   ├── DecayBanner.tsx           # Point decay warning banner
│   ├── DecayHistoryModal.tsx     # Decay history table modal
│   ├── CreditWarningToast.tsx    # Low credit warning toast
│   ├── CabotCreditRing.tsx       # Credit progress ring
│   └── PenaltyDemo.tsx           # Demo/testing component
├── hooks/
│   ├── usePenaltyData.ts         # Penalty data management
│   └── useCabot.ts              # CaBOT credit management
├── types.ts                      # TypeScript interfaces
├── index.ts                      # Module exports
└── README.md                     # This file
```

## 🚀 Quick Start

```tsx
import {
  DecayBanner,
  CabotCreditRing,
  CreditWarningToast,
  usePenaltyData,
  useCabot,
} from '@/modules/penalty';

function MyComponent() {
  const { penaltyData } = usePenaltyData();
  const { credits } = useCabot();

  return (
    <div>
      {/* Decay Warning Banner */}
      <DecayBanner
        lastSubmission={penaltyData?.lastSubmission || ''}
        onViewHistory={() => console.log('View history')}
      />

      {/* CaBOT Credit Ring */}
      {credits && <CabotCreditRing credits={credits} />}

      {/* Credit Warning Toast */}
      <CreditWarningToast
        isVisible={credits?.current <= 1}
        onClose={() => console.log('Close toast')}
        creditsLeft={credits?.current || 0}
      />
    </div>
  );
}
```

## 📋 Component Overview

### 1. DecayBanner

- **Trigger**: Shows when `lastSubmission > 7 days`
- **Message**: "Points drip away after day 7 — do a quick task to plug the leak."
- **Features**:
  - Urgency levels (low/medium/high)
  - Progress bar showing decay severity
  - Quick action buttons
  - View history button

### 2. CabotCreditRing

- **Display**: Circular progress ring showing credit percentage
- **Features**:
  - Dynamic colors based on credit level
  - Countdown timer to weekly reset
  - Warning indicators for low credits
  - Smooth animations

### 3. CreditWarningToast

- **Trigger**: Shows when CaBOT credits ≤ 1
- **Message**: "You're outta juice. Earn credits to ask CaBOT."
- **Features**:
  - Auto-hides after 8 seconds
  - Different messages based on credit level
  - Action buttons for earning credits

### 4. DecayHistoryModal

- **Content**: Table of `{date, pointsLost, reason}`
- **Features**:
  - Detailed decay history
  - Reason badges with color coding
  - Export functionality
  - Summary statistics

## 🔧 API Reference

### usePenaltyData Hook

```tsx
const {
  penaltyData, // PenaltyData | null
  loading, // boolean
  error, // string | null
  refetch, // () => void
} = usePenaltyData();
```

### useCabot Hook

```tsx
const {
  credits, // CabotCredit | null
  consumeCredit, // () => Promise<boolean>
  loading, // boolean
  error, // string | null
  timeUntilReset, // string
  resetProgress, // number (0-100)
} = useCabot();
```

### Component Props

```tsx
// DecayBanner
interface DecayBannerProps {
  lastSubmission: string; // ISO date string
  onViewHistory: () => void; // History button handler
}

// CabotCreditRing
interface CabotCreditRingProps {
  credits: CabotCredit; // Credit data
  size?: number; // Ring size (default: 120)
  strokeWidth?: number; // Stroke width (default: 8)
  showCountdown?: boolean; // Show countdown (default: true)
}

// CreditWarningToast
interface CreditWarningToastProps {
  isVisible: boolean; // Show/hide toast
  onClose: () => void; // Close handler
  creditsLeft: number; // Current credit count
}
```

## 🎨 Visual Design

### Color Coding

- **Green**: Good credit level (60%+)
- **Blue**: Medium credit level (30-60%)
- **Orange**: Low credit level (10-30%)
- **Red**: Critical credit level (0-10%)

### Urgency Levels

- **Low**: Yellow warning (8-10 days)
- **Medium**: Orange warning (10-14 days)
- **High**: Red warning (14+ days)

### Animations

- **Smooth Transitions**: All state changes are animated
- **Pulse Effects**: Warning indicators for critical states
- **Glow Effects**: Visual emphasis for important elements

## 🧠 Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Keyboard navigation support
- **Color Contrast**: WCAG compliant color schemes
- **Screen Reader Support**: Semantic HTML structure
- **Keyboard Shortcuts**: ESC to close modals

## 🧪 Testing

Run the Cypress tests:

```bash
npm run cypress:run -- --spec "cypress/e2e/penalty.cy.ts"
```

### Test Coverage

- ✅ Decay banner shows correctly
- ✅ Toast fires at 1 credit
- ✅ Credit ring animates smoothly
- ✅ Modal interactions work properly
- ✅ Responsive design on all screen sizes
- ✅ Accessibility features
- ✅ Loading and error states

## 🌐 API Integration

### Penalty Data Endpoint

```typescript
// GET /api/user/penalty-data
interface PenaltyDataResponse {
  creditsLeft: number;
  lastSubmission: string;
  pointsLost: DecayEntry[];
}
```

### CaBOT Credit Endpoint

```typescript
// PATCH /api/cabot/consume
interface ConsumeCreditResponse {
  success: boolean;
  data: {
    current: number;
    max: number;
    resetTime: string;
  };
}
```

## 🎯 Usage Examples

### Basic Integration

```tsx
import { usePenaltyData, useCabot } from '@/modules/penalty';

function Dashboard() {
  const { penaltyData } = usePenaltyData();
  const { credits, consumeCredit } = useCabot();

  return (
    <div>
      {penaltyData?.shouldShowDecayWarning && (
        <DecayBanner
          lastSubmission={penaltyData.lastSubmission}
          onViewHistory={() => setShowHistory(true)}
        />
      )}

      {credits && <CabotCreditRing credits={credits} />}
    </div>
  );
}
```

### Credit Consumption

```tsx
const { consumeCredit } = useCabot();

const handleAskCabot = async () => {
  const success = await consumeCredit();
  if (success) {
    // Proceed with CaBOT interaction
    askCabot(question);
  } else {
    // Show error or redirect to earn credits
    showCreditError();
  }
};
```

### Toast Management

```tsx
const [showToast, setShowToast] = useState(false);

useEffect(() => {
  if (credits?.current <= 1) {
    setShowToast(true);
  }
}, [credits?.current]);

<CreditWarningToast
  isVisible={showToast}
  onClose={() => setShowToast(false)}
  creditsLeft={credits?.current || 0}
/>;
```

## 🎨 Customization

### Custom Messages

```tsx
// Modify the MODERATION_CONFIG in components
const CUSTOM_MESSAGES = {
  decay: 'Your points are slowly disappearing!',
  credit: 'Running low on AI juice!',
};
```

### Custom Colors

```tsx
// Override color schemes in components
const CUSTOM_COLORS = {
  critical: '#DC2626',
  warning: '#F59E0B',
  success: '#059669',
};
```

## 🔒 Security Considerations

- **Input Validation**: All user inputs are validated
- **Rate Limiting**: Credit consumption is rate-limited
- **Data Sanitization**: All displayed data is sanitized
- **Access Control**: Proper authorization checks

## 📱 Mobile Support

- **Touch-Friendly**: Large touch targets for mobile
- **Responsive Layout**: Adapts to all screen sizes
- **Gesture Support**: Swipe gestures for modals
- **Performance**: Optimized for mobile devices

## 🚀 Performance

- **Lazy Loading**: Components load on demand
- **Memoization**: Efficient re-renders with React.memo
- **Optimized Animations**: CSS transforms for smooth performance
- **Bundle Splitting**: Code splitting for better load times

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test on multiple devices/browsers
6. Verify performance impact

## 📊 Data Flow

```
usePenaltyData Hook
    ↓
PenaltyData State
    ↓
DecayBanner | DecayHistoryModal
    ↓
User Interactions & API Calls

useCabot Hook
    ↓
Credit State Management
    ↓
CabotCreditRing | CreditWarningToast
    ↓
Real-time Updates & Consumption
```
