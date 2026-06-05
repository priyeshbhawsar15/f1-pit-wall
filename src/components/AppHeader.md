# AppHeader

**File**: `AppHeader.tsx`  
**Type**: Client Component  
**Category**: Navigation / Layout

---

## What It Does

Renders the top navigation bar used on all **non-dashboard** pages (History, Players, Standings, Seasons, and session detail pages). It contains:

- F1 logo + optional page title
- Optional back-arrow button (for detail pages)
- Optional `meta` slot for contextual information (e.g. track name on a session detail page)
- Right-aligned nav links with active-state underline

The dashboard (`/`) uses [`SessionInfo`](SessionInfo.md) instead of `AppHeader` because the dashboard header carries live telemetry data (weather, timer, LIVE pill, tab switcher).

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | No | Page title displayed next to the F1 logo |
| `backHref` | `string` | No | If provided, shows a `←` arrow that navigates to this URL |
| `meta` | `React.ReactNode` | No | Arbitrary content injected between the title and nav (e.g. track name, season name) |

---

## Used On

| Page | Usage |
|---|---|
| `/sessions` | `<AppHeader title="HISTORY" />` |
| `/sessions/[id]` | `<AppHeader title="REPLAY" backHref="/sessions" meta={...} />` |
| `/players` | `<AppHeader title="PLAYERS" />` |
| `/players/[id]` | `<AppHeader backHref="/players" meta={playerName} />` |
| `/players/h2h` | `<AppHeader title="HEAD TO HEAD" backHref="/players" />` |
| `/standings` | `<AppHeader title="STANDINGS" />` |
| `/seasons` | `<AppHeader title="SEASONS" />` |
| `/seasons/[id]` | `<AppHeader title={seasonName} backHref="/seasons" />` |

---

## Child Components

None. Uses `Link` from Next.js and icon components from `lucide-react`.

---

## Key Logic

### `isActive` detection
```ts
const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
```
Uses `usePathname()` from Next.js to highlight the current nav item. The `/` route uses strict equality to avoid matching all routes.

---

## Nav Links

```ts
const navLinks = [
  { href: '/',          label: 'Live',      icon: Radio },
  { href: '/sessions',  label: 'History',   icon: History },
  { href: '/players',   label: 'Players',   icon: Users },
  { href: '/standings', label: 'Standings', icon: Trophy },
  { href: '/seasons',   label: 'Seasons',   icon: Calendar },
];
```

---

## Related Components

- [`SessionInfo`](SessionInfo.md) — dashboard-specific header with live session data
