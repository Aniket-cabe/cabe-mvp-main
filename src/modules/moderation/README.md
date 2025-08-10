# Moderation Module

A comprehensive fake moderation UI message system for the CaBE platform that simulates moderation review states with realistic animations and interactions.

## 🎯 Features

- **3 Modal Types**: Review Pending, Suspicious, and Rejected states
- **Realistic Animations**: Shake, pulse glow, and fade-in zoom effects
- **Auto-close Behavior**: Timeout-based closing for processing states
- **Appeal System**: Integrated appeal form for rejected submissions
- **WebSocket Mock**: Simulates real-time moderation updates
- **Full Accessibility**: Keyboard navigation, focus trapping, and ARIA labels

## 📁 File Structure

```
src/modules/moderation/
├── components/
│   ├── ModerationModal.tsx    # Main modal component
│   ├── AppealForm.tsx         # Appeal form component
│   └── ModerationDemo.tsx     # Demo/testing component
├── hooks/
│   └── useModeration.ts       # Modal state management
├── types.ts                   # TypeScript interfaces
├── index.ts                   # Module exports
└── README.md                  # This file
```

## 🚀 Quick Start

```tsx
import { useModeration, ModerationModal } from '@/modules/moderation';

function MyComponent() {
  const { isOpen, type, openModal, closeModal } = useModeration();

  return (
    <div>
      <button onClick={() => openModal('rejected')}>Trigger Rejection</button>

      {isOpen && type && (
        <ModerationModal
          isOpen={isOpen}
          type={type}
          onClose={closeModal}
          onAppeal={() => console.log('Appeal submitted')}
        />
      )}
    </div>
  );
}
```

## 📋 Modal Types

### 1. Review Pending (`review_pending`)

- **Message**: "Hold tight. Our bots are eye-balling your proof."
- **Icon**: 🟡 + Clock icon
- **Behavior**: Auto-closes after 8 seconds
- **Animation**: Pulse glow effect
- **Can Close**: No (processing state)

### 2. Suspicious (`suspicious`)

- **Message**: "Hmm… stuff's not adding up. We're digging deeper."
- **Icon**: 🟠 + AlertTriangle icon
- **Behavior**: Auto-closes after 12 seconds
- **Animation**: Fade-in + zoom effect
- **Can Close**: No (processing state)

### 3. Rejected (`rejected`)

- **Message**: "Proof failed the vibe check. Lose 50 pts."
- **Icon**: 🔴 + Ban icon
- **Behavior**: Manual close required
- **Animation**: Shake effect
- **Can Close**: Yes
- **Appeal**: Shows appeal button

## 🎨 Animations

### Shake Animation (Rejected)

```css
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}
```

### Pulse Glow (Review Pending)

```css
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
  }
}
```

### Fade-in Zoom (Suspicious)

```css
@keyframes fadeInZoom {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

## 🔧 API Reference

### useModeration Hook

```tsx
const {
  isOpen, // boolean
  type, // ModerationType | null
  openModal, // (type: ModerationType) => void
  closeModal, // () => void
  triggerRandomModeration, // () => void
} = useModeration();
```

### ModerationModal Props

```tsx
interface ModerationModalProps {
  isOpen: boolean; // Controls modal visibility
  type: ModerationType; // Modal type (review_pending | suspicious | rejected)
  onClose: () => void; // Close handler
  onAppeal?: () => void; // Appeal submission handler
}
```

### AppealForm Props

```tsx
interface AppealFormProps {
  isOpen: boolean; // Controls form visibility
  onClose: () => void; // Close handler
  onSubmit: (reason: string) => void; // Submit handler
}
```

## 🧠 Accessibility Features

- **Focus Trapping**: Modal content is focus-trapped
- **Keyboard Navigation**: ESC to close (when allowed)
- **ARIA Labels**: Proper dialog and button labels
- **Screen Reader Support**: Semantic HTML structure
- **Color Contrast**: WCAG compliant color schemes

## 🧪 Testing

Run the Cypress tests:

```bash
npm run cypress:run -- --spec "cypress/e2e/moderation.cy.ts"
```

### Test Coverage

- ✅ Modal opening with correct messages
- ✅ Appeal CTA shows only for rejected
- ✅ Modal traps keyboard focus
- ✅ Auto-close behavior
- ✅ Animation effects
- ✅ Accessibility features
- ✅ Appeal form functionality

## 🌐 WebSocket Integration

The system includes a mock WebSocket that simulates real-time moderation updates:

```tsx
// In development mode, triggers random events every 30 seconds
ws.on('moderation:update', (data: { type: ModerationType }) => {
  openModal(data.type);
});
```

## 🎯 Usage Examples

### Basic Usage

```tsx
const { isOpen, type, openModal, closeModal } = useModeration();

// Trigger different modal types
openModal('review_pending');
openModal('suspicious');
openModal('rejected');
```

### With Appeal Handling

```tsx
const handleAppeal = (reason: string) => {
  // Send appeal to backend
  api.submitAppeal({ reason, submissionId });
};

<ModerationModal
  isOpen={isOpen}
  type={type}
  onClose={closeModal}
  onAppeal={handleAppeal}
/>;
```

### Random Triggering

```tsx
const { triggerRandomModeration } = useModeration();

// Triggers random moderation type
<button onClick={triggerRandomModeration}>Test Random Moderation</button>;
```

## 🎨 Customization

### Custom Messages

Modify the `MODERATION_CONFIG` in `ModerationModal.tsx`:

```tsx
const MODERATION_CONFIG = {
  review_pending: {
    message: 'Your custom message here',
    // ... other config
  },
};
```

### Custom Animations

Add new keyframes to the `<style>` section in `ModerationModal.tsx`:

```css
@keyframes custom-animation {
  /* Your animation keyframes */
}
```

## 🔒 Security Considerations

- All user input in appeal forms is validated
- XSS protection through proper escaping
- CSRF protection should be implemented in production
- Rate limiting for appeal submissions

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly button sizes
- Swipe gestures for mobile interaction
- Optimized animations for mobile performance

## 🚀 Performance

- Lazy loading of components
- Optimized animations using CSS transforms
- Efficient re-renders with React.memo
- Minimal bundle size impact

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test on multiple devices/browsers
