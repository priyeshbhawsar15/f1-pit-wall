---
name: Pit Wall Race Broadcast
summary: An original red, black, and white race-broadcast system for live two-player telemetry.
colors:
  canvas: "#080808"
  canvas-secondary: "#101010"
  surface: "#171717"
  surface-soft: "#111111"
  surface-elevated: "#202020"
  ink: "#ffffff"
  ink-secondary: "#d6d6d6"
  muted: "#969696"
  hairline: "#303030"
  hairline-strong: "#484848"
  race-red: "#ff1801"
  race-red-deep: "#b81200"
  success: "#2ecc71"
  warning: "#ffcc33"
  info: "#5ab8ff"
typography:
  display:
    fontFamily: "Arial Narrow, Roboto Condensed, Helvetica Neue, sans-serif"
    fontWeight: 900
    fontStyle: italic
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Aptos, Segoe UI Variable, Segoe UI, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "JetBrains Mono, Cascadia Mono, SFMono-Regular, Consolas, monospace"
    fontVariantNumeric: tabular-nums
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "28px"
components:
  surface:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.lg}"
  primary-action:
    backgroundColor: "{colors.race-red}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  active-navigation:
    textColor: "{colors.ink}"
    underlineColor: "{colors.race-red}"
---

# Design System: Pit Wall Race Broadcast

## 1. Creative North Star

**Race Control, not cyber telemetry.** Pit Wall should feel like an original contemporary motorsport broadcast package: a near-black stage, crisp white information, disciplined red emphasis, bold speed-led typography, and compact timing graphics. It takes inspiration from the hierarchy and energy of current top-tier racing coverage without copying Formula 1 logos, fonts, imagery, or branded assets.

The product is normally used beside a racing game in a dim room. The dark canvas limits glare; white establishes the reading order; red marks product identity, selection, and primary action. The two human drivers and the race map remain the product-specific story. Technical evidence follows the broadcast layer rather than overwhelming it.

**Key characteristics**

- Near-black and graphite fields with clean white type
- Race red as the single product accent
- Bold condensed italic display treatment for speed and momentum
- Tabular technical typography for measurements and timing
- Fine horizontal rules and three-line race motifs
- Polished rounded cards and controls throughout
- State-driven, compositor-safe motion only

## 2. Color System

### Product hierarchy

- **Race Red** (`#ff1801`) is the primary accent for selected navigation, primary actions, key positions, active replay controls, and the original Pit Wall mark.
- **White** (`#ffffff`) carries headlines, driver names, and the most important values.
- **Canvas Black** (`#080808`) and **Graphite** (`#101010`–`#202020`) create layered broadcast surfaces.
- **Cool Gray** (`#969696` / `#d6d6d6`) supports labels and explanatory copy.

### Semantic signals

Yellow, green, and blue are permitted only when their status meaning is necessary: caution or threshold, healthy/live, and informational telemetry. They never compete with red as product identity. State is always paired with text, shape, or icon so color is not the only cue.

### Discipline rules

1. Red appears at decision points and hierarchy anchors, not around every card.
2. Inactive panels are neutral.
3. Driver/team colors may identify competitors in maps and profiles, but they do not recolor global chrome.
4. No neon lime, ambient blue glow, multicolor cyber grid, or decorative gradient treatment.

## 3. Typography

### Display voice

Use a legally available condensed sans or the system fallback stack: `Arial Narrow`, `Roboto Condensed`, `Helvetica Neue`, sans-serif. Major page titles use 850–900 weight, a restrained italic treatment, tight but legible spacing, and a maximum scale of 68px desktop / 50px mobile. This creates momentum without imitating a proprietary Formula 1 typeface.

### Interface voice

Body, labels, and controls use a highly legible UI sans stack. Surface titles use the condensed display stack without italics for stable scanning. Metadata may use uppercase with modest tracking only at micro sizes.

### Data voice

Timing, gaps, positions, speeds, temperatures, lap counts, and points use a technical monospace stack with tabular numerals. Data columns align by decimal rhythm where possible.

**Broadcast scan rule:** a viewer must distinguish page, section, driver, position, and state from type scale and alignment before color is considered.

## 4. Geometry, Dividers, and Depth

Rounded geometry is a fixed product commitment:

- 14px for primary cards and map stages
- 10px for grouped controls and compact panels
- 6px for buttons, inputs, and local control surfaces
- Pills only for status chips

F1 character comes from typography, horizontal racing lines, crisp dividers, compact data strips, and directional spacing—not clipped or chamfered corners. Panels use neighboring graphite tones and one neutral hairline. Shadows remain low, dark, and functional; no glow.

The three-sector motif is rendered as parallel red/gray bars. Page and panel headers use short red rules or top accents as broadcast cues while retaining rounded containers.

## 5. Component Language

### Navigation

The header is black and compact. The original Pit Wall mark is a red rounded tile with an original gauge icon. Active destinations use white text and a red baseline. Mobile navigation retains labels and safe-area padding; the active icon and label are red/white with a red top cue.

### Page introductions

Large condensed italic titles establish the race or archive context. Supporting copy stays quiet and readable. Metadata chips follow immediately below. The three-line race motif terminates the divider on the right.

### Cards and data panels

Primary cards use graphite surfaces, white headings, gray captions, and fine neutral dividers. A short red header rule may signal section hierarchy. Tables and ledgers prioritize rank, identity, and result; hover states use a small neutral lift or restrained red tint rather than bright fill.

### Buttons and controls

Primary buttons are race red with white text. Quiet buttons use raised graphite. Hover and active feedback is under 200ms and limited to transform, opacity, or small local color changes. Focus uses a high-contrast red/white ring. Destructive actions use a darker red treatment and explicit labels or accessible names.

### Replay

The map remains the dominant upper-viewport element. Controls sit on an opaque near-black rounded rail within the map. Play, active speed, and selected moments use red; timeline and measurements remain neutral. Player-focused statistics stay immediately below the map.

### Maps and telemetry

Track asphalt is neutral charcoal with a light gray racing line. Human drivers use white and red markers with dark outlines; the field may retain team colors when meaningful. Map backgrounds use a very subtle orthogonal timing grid, not a checkerboard or neon grid.

## 6. Responsive and Accessibility Rules

- Maintain 44px minimum touch targets for primary mobile controls.
- Preserve visible keyboard focus and logical tab order.
- Body text and muted metadata must retain readable contrast on every surface.
- Tables and dense ledgers may scroll locally; the page itself must never overflow horizontally.
- Headings balance and body copy wraps naturally at every supported width.
- Reduced-motion mode removes nonessential transitions and animations.
- Canvas labels and controls retain accessible names; visual map meaning is summarized in text.

## 7. Do / Don’t

### Do

- Keep the two-player battle and dominant race map central.
- Use red, white, and graphite consistently across every route.
- Use condensed italic display typography selectively for page-level energy.
- Align timing and telemetry with tabular numerals.
- Preserve rounded corners across cards, controls, and containers.
- Let spacing and dividers create broadcast rhythm.

### Don’t

- Don’t copy or bundle Formula 1 logos, proprietary fonts, photography, or other protected brand assets.
- Don’t return to lime/electric-blue cyber styling as the dominant identity.
- Don’t use chamfered, clipped, or aggressively angular card geometry.
- Don’t decorate inactive surfaces with semantic colors.
- Don’t add glow, glass, gradient text, or animated ornament.
- Don’t shrink or demote the replay map to make room for statistics.
