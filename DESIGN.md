---
name: F1 Head-to-Head Telemetry
description: A calm live broadcast surface for understanding a two-player race.
colors:
  canvas: "#090a0c"
  canvas-secondary: "#0f1115"
  surface: "#14171c"
  surface-soft: "#101217"
  surface-elevated: "#20242b"
  ink: "#ffffff"
  contrast-ink: "#000000"
  ink-secondary: "#e2e5e9"
  body: "#c1c6ce"
  muted: "#969da8"
  hairline: "#30343c"
  hairline-soft: "#242830"
  race-blue: "#1c69d4"
  race-red: "#e22718"
  success: "#0fa336"
  warning: "#f4b400"
typography:
  display:
    fontFamily: "Satoshi, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  display-compact:
    fontFamily: "Satoshi, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  display-mobile:
    fontFamily: "Satoshi, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Satoshi, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Satoshi, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Satoshi, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Satoshi, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.3
  micro:
    fontFamily: "Satoshi, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "10px"
  lg: "16px"
  xl: "18px"
components:
  surface-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "18px"
  player-panel:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "18px"
  status-pill:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: F1 Head-to-Head Telemetry

## 1. Overview

**Creative North Star: "Head-to-Head Broadcast"**

This interface should feel like a modern race broadcast built around two competitors: immediate enough for spectators, precise enough for the players, and calm enough to scan throughout a full session. The two human players and the changing story between them are the primary visual layer. Whole-field standings, technical telemetry, and historical detail remain accessible as supporting layers.

The system uses a dark canvas because it is commonly viewed on a gaming display during a live session, where low glare and stable data colors matter. Minimalism comes from hierarchy, consolidation, and progressive disclosure—not from removing useful telemetry. It explicitly rejects an overcrowded engineering console, a flashy arcade HUD, and a generic admin template.

**Key Characteristics:**

- Two-player comparison before whole-field detail
- Quiet tonal surfaces with restrained brand color
- Broadcast-readable numbers and plain-language labels
- Rounded but disciplined geometry
- State-driven motion only

## 2. Colors

The palette is a near-black broadcast canvas with cool charcoal layers; BMW M blue and red retain race identity while green and yellow communicate live state.

### Primary

- **Race Blue** (`#1c69d4`): focus, current selection, and the subtle head-to-head atmosphere.
- **Race Red** (`#e22718`): the F1/BMW M signature, primary race emphasis, and severe states.

### Secondary

- **Success Green** (`#0fa336`): connected, ready, healthy, and positive telemetry states.
- **Caution Yellow** (`#f4b400`): safety-car, pit, penalty, and threshold warnings.

### Neutral

- **Broadcast Canvas** (`#090a0c`): the page background.
- **Quiet Surface** (`#101217`): local player and metric grouping.
- **Telemetry Surface** (`#14171c`): primary panels.
- **Raised State** (`#20242b`): active navigation, controls, and hover feedback.
- **Primary Ink** (`#ffffff`): high-priority labels and values.
- **Secondary Ink** (`#e2e5e9`): supporting values.
- **Readable Muted** (`#969da8`): metadata and labels; do not reduce its contrast.

**The Signal Color Rule.** Saturated colors communicate identity or live state. They do not decorate inactive panels.

## 3. Typography

**Display Font:** Satoshi (with Inter and system sans fallbacks)

**Body Font:** Satoshi (with Inter and system sans fallbacks)

**Label/Mono Font:** the system monospace stack for telemetry values

**Character:** One contemporary sans family keeps the product familiar and calm. Weight, alignment, and tabular numerals create hierarchy without introducing a second display voice.

### Hierarchy

- **Headline** (700, 16px, 1.25): player names and the highest local headings.
- **Telemetry display** (700, up to 40px, 1): speed, gear, and position only.
- **Title** (700, 12px, 1.3): panel headings; sentence case by default.
- **Body** (400, 13px, 1.45): explanation and secondary information.
- **Label** (500, 11px, 1.3): metric names and navigation.
- **Micro label** (500, 10px, 1.3): dense secondary telemetry where an 11px label does not fit.
- **Telemetry value** (600–700, context-sized): use monospace and tabular numerals for times, gaps, temperatures, energy, and lap counts.

**The Broadcast Scan Rule.** A viewer should distinguish player, position, comparison, and state from typography alone before color is considered.

## 4. Elevation

The system is flat by default. Depth comes from tonal layering between canvas, quiet grouping, primary surfaces, and active states. Panels have one subtle hairline and no decorative box shadow. The header may use backdrop blur because it separates live navigation from scrolling telemetry, not as a general glass effect.

**The Tonal Depth Rule.** Use a neighboring surface token before adding a border, and use a border before considering any shadow.

## 5. Components

### Buttons

- **Shape:** compact controls use a 6px radius; icon/text navigation uses a 6px radius; status actions may be pills.
- **Primary:** race blue is reserved for focused or selected actions rather than filling every control.
- **Hover / Focus:** use `#1a1e24` for hover and a visible race-blue border or focus ring for keyboard focus.
- **Secondary / Ghost:** transparent at rest with muted text and tonal hover feedback.

### Chips

- **Style:** full-pill geometry with compact padding. Green, yellow, or red fills are reserved for meaningful status.
- **State:** labels are short, stable, and readable without relying only on color.

### Cards / Containers

- **Corner Style:** 14px for primary panels; 10px for interactive groups; never exceed 16px.
- **Background:** `#14171c` for panels and `#101217` for subordinate grouping.
- **Shadow Strategy:** no decorative shadows.
- **Border:** one `#242830` hairline on primary panels; avoid outlining every metric.
- **Internal Padding:** 16–18px, reduced to 10px at narrow mobile widths when needed.

### Inputs / Fields

- **Style:** charcoal fill, one quiet hairline, 6px radius, 11–13px type.
- **Focus:** race-blue border with an unambiguous keyboard-visible state.
- **Error / Disabled:** use semantic color plus text or icon; never color alone.

### Navigation

Primary destinations sit in a horizontally scrollable row on narrow screens and align to the right on desktop. The active destination uses a quiet elevated fill; dashboard views use a restrained red underline. Labels stay in title case rather than aggressive tracked uppercase.

### Head-to-Head Player Panel

Each player panel is directly selectable and exposes four primary comparisons—interval, last lap, tyres, and race state—followed by compact secondary telemetry. Selecting a player reveals technical panels below rather than showing every detail at all times.

## 6. Do's and Don'ts

### Do:

- **Do** place the two human players and their changing competitive relationship before whole-field detail.
- **Do** retain useful telemetry through progressive disclosure and compact secondary rows.
- **Do** use 6px, 10px, and 14px radii consistently.
- **Do** use semantic colors for live states and pair those colors with text.
- **Do** keep motion between 150–250ms, tied to selection, status, or live value changes, with reduced-motion support.

### Don't:

- **Don't** recreate an overcrowded engineering console or a generic admin template.
- **Don't** box every metric, nest cards, or use separators where spacing and alignment are enough.
- **Don't** use arcade-style glow, decorative glass, gradient text, or animated ornament.
- **Don't** use colored side-stripe borders on rows or panels.
- **Don't** hide useful race information in pursuit of information-light minimalism.
