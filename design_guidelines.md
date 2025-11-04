# YOU–N–I–VERSE Studio Design Guidelines

## Design Approach

**Selected Approach:** Hybrid - Reference-based (VS Code, Linear, Notion IDE aesthetics) + Custom Cosmic Theme

This is a professional development environment with a unique "cosmic consciousness" identity. We blend established IDE patterns with creative visual elements that make the interface feel like a living, intelligent workspace.

## Core Design Principles

1. **Cosmic Professionalism** - Balance technical precision with universe-inspired aesthetics
2. **Portal-Based Navigation** - Every section entry feels like stepping into a new dimension
3. **Persistent AI Presence** - The Guard Dog is always accessible, never intrusive
4. **Lavender Consciousness** - The signature color (#9b87f5) represents AI intelligence throughout

---

## Typography

**Font System:**
- **Primary:** Inter or 'SF Pro Display' for UI elements
- **Code:** 'JetBrains Mono' or 'Fira Code' for all code displays
- **Accent:** 'Space Grotesk' for Dashboard headings (cosmic feel)

**Hierarchy:**
- **Dashboard Title:** text-3xl font-bold (Space Grotesk)
- **Panel Headers:** text-xl font-semibold
- **Section Labels:** text-sm font-medium uppercase tracking-wide
- **Body Text:** text-base
- **Code:** text-sm font-mono
- **Metadata:** text-xs text-muted-foreground

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 8, 12, 16** consistently
- Tight spacing: p-2, gap-2
- Standard spacing: p-4, gap-4, m-4
- Section spacing: p-8, gap-8
- Large spacing: p-12, p-16

**Grid Structure:**
- Dashboard: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- IDE Panels: Flexible split-pane layout (60/40 or 70/30 code-to-preview)
- Settings: Single column max-w-2xl
- Game Templates: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

**Container Constraints:**
- Dashboard: max-w-6xl mx-auto
- IDE: Full viewport with min-h-screen
- Modals/Dialogs: max-w-lg to max-w-2xl based on content
- Floating Assistant: fixed w-96 h-[600px] (minimizes to h-14)

---

## Color Palette

**Primary Theme - Lavender Consciousness:**
- Lavender: `#9b87f5` (primary accent, AI elements, CTAs)
- Lavender Hover: `#8b77e5` (interactive states)
- Lavender Muted: `#9b87f5/10` (backgrounds)
- Lavender Border: `#9b87f5/20` (dividers)

**Semantic Colors:**
- Background: `bg-background` (dark mode optimized)
- Card: `bg-card` (elevated surfaces)
- Foreground: `text-foreground` (primary text)
- Muted: `text-muted-foreground` (secondary text)
- Border: `border` (subtle dividers)

**Status Indicators:**
- Success/Configured: `bg-green-500`
- Warning/Pending: `bg-yellow-500`
- Error: `bg-red-500`
- Processing: Lavender with pulse animation

---

## Component Library

### A. Dashboard - The Gateway

**Layout:**
- Centered vertical layout with cosmic gradient background
- `bg-gradient-to-br from-[#9b87f5]/10 to-background`
- Main title with lavender glow effect
- Grid of large "portal" buttons (minimum h-32 each)

**Portal Buttons:**
- Primary (IDE): `bg-[#9b87f5] hover:bg-[#8b77e5]` with glow
- Secondary: `variant="outline"` with lavender border on hover
- Each portal shows icon + label + subtle description
- Hover state: Scale transform (scale-105) + enhanced glow

**Optional Elements:**
- Welcome message with last project info (text-sm text-muted-foreground)
- Quick stats (projects created, AI sessions, etc.)

### B. IDE Panels (DeveloperPanel)

**Structure:**
- Three-panel layout: FileExplorer (20%) | CodeEditor (50%) | BrowserView (30%)
- Resizable dividers with lavender accent on active drag
- Top toolbar with breadcrumb navigation

**FileExplorer:**
- Sidebar with tree structure
- Folder icons with collapse/expand animations
- Selected file: lavender background highlight
- Context menu on right-click

**CodeEditor:**
- Full Monaco editor integration
- Line numbers, syntax highlighting
- Minimap on right
- Bottom status bar with file info + cursor position

**BrowserView:**
- Embedded iframe with toolbar
- URL bar, refresh, fullscreen controls
- Loading state with lavender spinner

### C. Game Creator Panel

**Layout:**
- Header with title + search/filter controls
- Template cards in responsive grid
- Each card: Preview image, title, description, "Use Template" CTA

**Template Cards:**
- rounded-lg border with hover elevation
- Preview thumbnail (16:9 aspect ratio)
- Lavender accent on hover border
- Launch icon in corner
- Tech stack badges (small pills)

### D. Settings Panel

**Structure:**
- Single column form layout
- Grouped sections with clear headers
- AIBackendSelector as prominent card component

**Form Elements:**
- Labels: text-sm font-medium mb-2
- Inputs: Full width with lavender focus ring
- Dropdowns: Chevron icon, lavender highlights on selection
- Save buttons: Lavender primary style
- Status indicators: Colored dots with labels

### E. Persistent AI Assistant

**Floating Button (Collapsed):**
- Bottom-right: `bottom-6 right-6`
- Circular h-14 w-14 with Bot icon
- Lavender background with shadow-lg
- Pulse animation on new messages

**Expanded Panel:**
- w-96 h-[600px] floating card
- Header with AI avatar + minimize/close controls
- Scrollable chat area (p-4)
- Message bubbles: User (lavender bg, right-aligned) / Assistant (muted bg, left-aligned)
- Input area with textarea + send button
- Loading state: Three animated dots

**Visual Treatments:**
- Card border: `border-2 border-[#9b87f5]/20`
- Header gradient: `bg-gradient-to-r from-[#9b87f5]/10 to-transparent`
- Avatar circle: Solid lavender with bot icon

### F. Navigation & Routing

**Top Navigation (if visible):**
- Horizontal bar with logo + route links
- Active route: Lavender underline
- Breadcrumbs: Separated by `/` with lavender current page

**Route Transitions:**
- Smooth fade-in animations (200ms)
- No jarring page reloads
- Maintain AI assistant position across routes

---

## Visual Effects & Polish

**Glow Effects:**
```
Portal buttons: box-shadow: 0 0 10px #9b87f5aa, 0 0 20px #9b87f5aa inset
Active elements: box-shadow: 0 0 20px #9b87f5dd
```

**Animations (Minimal):**
- Button hover: scale-105 transform (150ms)
- Portal entry: Fade + slight scale-in (300ms)
- AI typing indicator: Pulse on dots
- Loading states: Lavender spinner rotation

**NO complex scroll-based animations, parallax, or decorative motion**

---

## Accessibility

- All interactive elements: min-h-44 touch targets
- Focus rings: 2px lavender outline
- ARIA labels on icon-only buttons
- Keyboard navigation support (Tab, Enter, Escape)
- High contrast maintained in dark mode
- Screen reader announcements for AI responses

---

## Responsive Behavior

**Breakpoints:**
- Mobile (< 768px): Single column, stacked panels
- Tablet (768px - 1024px): Two-column dashboard, side-by-side IDE panels collapse to tabs
- Desktop (> 1024px): Full three-panel IDE layout

**Mobile Adjustments:**
- Dashboard portals: Full width, h-24
- IDE: Tabbed interface (Code / Files / Browser)
- AI Assistant: Full-screen overlay when open
- Settings: Full-width form

---

## Images

**Dashboard Background:**
- Subtle cosmic gradient (no hero image needed)
- Optional: Faint constellation/network pattern overlay

**Template Cards:**
- Each game template shows 400x225px preview screenshot
- Placeholder: Gradient with game icon if no screenshot

**NO other images required** - This is a functional IDE, not a marketing site