# Design Guidelines: Instagram Bot Dashboard

## Design Approach
**Selected Framework:** Material Design with RTL Arabic customization
**Rationale:** This is a utility-focused dashboard requiring clarity, information density, and functional efficiency. Material Design provides excellent patterns for data-heavy interfaces with strong RTL support.

## Core Design Principles
1. **RTL-First Design:** All layouts flow right-to-left for Arabic content
2. **Information Hierarchy:** Clear visual distinction between primary controls, status indicators, and secondary information
3. **Functional Clarity:** Every element serves a clear purpose with minimal decoration
4. **Real-time Feedback:** Live updates and status changes are immediately visible

## Typography
- **Primary Font:** 'IBM Plex Sans Arabic' via Google Fonts (excellent Arabic support)
- **Fallback:** system-ui, -apple-system, sans-serif
- **Scale:**
  - Page Title (h1): 24px, weight 600
  - Section Headers (h2): 18px, weight 600
  - Body Text: 15px, weight 400
  - Small Text/Metadata: 13px, weight 400
  - Button Text: 15px, weight 500

## Layout System
**Spacing Units:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-4 or p-6
- Section margins: mb-6 or mb-8
- Element gaps: gap-4
- Container max-width: max-w-5xl (dashboard shouldn't be too wide)

## Component Library

### Navigation/Header
- Fixed header with status badge on left (English position due to RTL flip)
- Logo/title on right side
- Status badge: rounded-lg with icon indicator (online/offline)
- Border bottom separator

### Control Panels
- Card-based sections with rounded-xl borders
- Gradient backgrounds for depth (subtle, dark to darker)
- Each control group in distinct card
- Clear labels above inputs
- Spacing between control groups: space-y-4

### Form Elements
- **Text Areas:** Dark background, subtle border, rounded-lg, min-h-24
- **File Inputs:** Custom styled with upload icon, border-dashed on hover
- **Buttons:** 
  - Primary: Gradient blue (matching accent colors), rounded-lg, px-6 py-3
  - Secondary: Transparent with border, hover state with glow
  - Danger/Stop: Red variant
- **Toggle Switches:** Material-style with smooth transition, 48px wide

### Stats Display
- Grid layout for metrics: grid-cols-2 lg:grid-cols-4
- Each stat in card with icon, number (large), and label
- Use monospace font for numbers
- Subtle background gradient

### Console/Log
- Monospace font: 'Fira Code' or 'Courier New'
- Dark terminal-like background (#000814)
- Bright cyan text (#6fe0ff) for readability
- Auto-scroll to bottom
- Min height: h-64
- Timestamps in muted color

### Status Indicators
- Use icon + text combinations
- Color coding:
  - Active/Online: Blue/Cyan (#0b56a6)
  - Inactive: Muted gray (#9fb6d8)
  - Error/Stop: Red (#ff6b6b)
  - Success: Green (#10b981)

## Visual Hierarchy
**Three-tier structure:**
1. **Header:** Bot status and title (sticky)
2. **Control Zone:** Session management, message settings, bot controls
3. **Monitoring Zone:** Stats and live console log

## Color Palette (Dark Theme)
- Background: Linear gradient from #0b0f13 to #020409
- Panel/Cards: #071022 to #041226 gradient
- Accent Primary: #0b56a6
- Accent Secondary: #063b7a
- Text Primary: #e6eef8
- Text Muted: #9fb6d8
- Success: #10b981
- Danger: #ff6b6b
- Border: rgba(255,255,255,0.06)

## Responsive Behavior
- Desktop (1024px+): Two-column layout for stats
- Tablet (768px): Single column, full-width controls
- Mobile (320px+): Stack all elements, larger touch targets

## Animations
**Minimal and purposeful only:**
- Button hover: subtle translateY(-2px) + shadow
- Toggle switch: smooth slide (0.2s)
- Status badge: gentle pulse when active
- New console messages: subtle fade-in
- No decorative animations

## Accessibility
- All form inputs with clear Arabic labels
- Sufficient color contrast (WCAG AA minimum)
- Focus states with visible outline
- Icon buttons include text labels
- Console log with aria-live="polite"
- TTS toggle clearly labeled

## Images
**No hero images required** - This is a functional dashboard, not a marketing page. Icons only via Heroicons (outline style for consistency).