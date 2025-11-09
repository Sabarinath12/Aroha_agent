# Design Guidelines: Voice & Map Input Application

## Design Approach
**Selected Approach:** Design System - Minimalist Utility  
**Rationale:** This is a function-focused tool requiring clarity and efficiency. Drawing from Google's Material Design principles for clean, purposeful interfaces with emphasis on usability over decoration.

**Core Principles:**
- Clarity and precision in every element
- Purposeful negative space
- Clear visual hierarchy for interactive elements
- Professional, distraction-free interface

---

## Layout Structure

**Viewport Strategy:**
- Single-page application with full viewport height (100vh)
- Fixed positioning for mic button ensures constant accessibility
- Map container occupies majority of vertical space

**Layout Composition:**
```
┌─────────────────────────────────┐
│   Map Search Field & Controls   │  (80-100px height)
├─────────────────────────────────┤
│                                 │
│      Google Maps Display        │  (Flex-grow fills space)
│                                 │
│                                 │
└─────────────────────────────────┘
        [Mic Button]                   (Fixed bottom-center)
```

**Spacing Primitives:**
Use Tailwind units: **4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-6 or p-8
- Section gaps: gap-4 or gap-6
- Large spacing: mt-12 or mb-16

---

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - clean, modern sans-serif
- Weights: 400 (regular), 500 (medium), 600 (semibold)

**Type Scale:**
- Map search input: text-base (16px) - weight-400
- Button labels: text-sm (14px) - weight-500
- Helper text: text-xs (12px) - weight-400
- Map controls: text-sm (14px) - weight-500

---

## Component Library

### 1. Map Search Field (Top Section)
- Full-width container with max-w-4xl centered
- Input field with sharp, minimal styling (1px border, 2px focus ring)
- Height: h-12 (48px) for comfortable touch targets
- Include search icon (Heroicons: MagnifyingGlassIcon) positioned left inside input
- Optional current location button positioned right (Heroicons: MapPinIcon)
- Autocomplete dropdown appears below with subtle shadow

### 2. Google Maps Container
- Takes remaining vertical space using flex-1
- No additional borders or frames - map fills edge-to-edge
- Maintains Google Maps default controls in their standard positions

### 3. Microphone Button (Bottom-Center, Fixed)
- Position: fixed bottom-8 left-1/2 -translate-x-1/2
- Size: w-16 h-16 (64x64px) - substantial touch target
- Shape: Fully rounded (rounded-full)
- Icon: Heroicons MicrophoneIcon, size w-6 h-6
- Shadow: Deep shadow for elevation (shadow-2xl)
- States:
  - Inactive: Solid fill, subtle pulse animation on hover
  - Active/Recording: Pulsing border animation, filled center
  - Disabled: Reduced opacity (opacity-40)

### 4. Visual Feedback Elements
- Recording indicator: Small red dot (w-3 h-3) positioned top-right of mic button when active
- Toast notifications: Top-center position for permission requests or errors
- Loading states: Subtle skeleton loaders for map initialization

---

## Interaction Patterns

**Microphone Button:**
- Single click to start recording
- Click again or automatic stop after input
- Clear visual state changes (not just color - add scale transform on active)
- Haptic-style feedback with subtle scale animation (scale-95 on click)

**Map Interactions:**
- Standard Google Maps gestures (zoom, pan, street view)
- Search updates map position smoothly with animated transition
- Clear visual focus states for all interactive elements (2px ring)

**Accessibility:**
- All interactive elements have minimum 44x44px touch targets
- Clear focus indicators for keyboard navigation
- ARIA labels for icon-only buttons
- Screen reader announcements for recording states

---

## Responsive Behavior

**Mobile (< 768px):**
- Map search field: Full width with px-4 padding
- Mic button: Slightly smaller (w-14 h-14) but maintains fixed bottom position
- Map controls: Use Google Maps' built-in responsive behavior

**Desktop (≥ 768px):**
- Map search constrained to max-w-2xl with mx-auto
- Mic button: Standard size (w-16 h-16)
- Additional padding and breathing room

---

## Animation Guidelines

**Minimal, Purposeful Motion:**
- Mic button: Subtle scale on click (duration-100), pulse during recording (duration-1000, repeat)
- Map transitions: 300ms ease-in-out for position changes
- Focus rings: Instant appearance (duration-0)
- Toast notifications: Slide in from top (duration-200)

**No decorative animations** - only functional feedback that communicates state changes.

---

## Images Section

**No images required for this application.** This is a pure utility interface focused on map display and voice input functionality. The visual interest comes from the interactive Google Maps content itself.