# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (Turbopack) on port 3000
npm run build        # TypeScript type-check then production build
npm start            # Start production server
npx tsx scripts/seed-roles.ts  # Seed default role presets into MongoDB
```

Build and type-check must both pass before considering work done. The `build` script runs `next build` which includes type-checking.

## Environment

Create `.env.local` from template:

```
MONGODB_URI=mongodb://localhost:27017/meet-tab
JWT_SECRET=<random-64-character-hex-string>
```

MongoDB must be running locally. Both `JWT_SECRET` and `MONGODB_URI` are validated at import time in `src/lib/auth.ts` and `src/lib/db.ts` — the app will throw if either is missing.

## Architecture

### Stack
- **Next.js 16** App Router (all pages and API routes in `src/app/`)
- **TypeScript 5.8** with `strict: true`, path alias `@/` → `src/`
- **Tailwind CSS 4** via `@tailwindcss/postcss` (no `tailwind.config.ts`; config is CSS-first)
- **MongoDB / Mongoose 9** with a global singleton connection cache in `src/lib/db.ts`
- **JWT auth** via httpOnly cookies (bcryptjs for password hashing, 7-day token expiry)

### API route patterns
- All API routes live under `src/app/api/` as Next.js route handlers
- **Auth guard**: call `getCurrentUserId()` at the top of mutation handlers — returns `userId` or `null`; return `jsonResponse({ error: "Unauthorized" }, 401)` if null. There is no middleware-based auth guard.
- **DB connection**: call `await connectDB()` before any Mongoose operation
- **Response helper**: use `jsonResponse(data, status)` from `src/lib/auth.ts` for all JSON responses
- **Error handling**: wrap handler body in try/catch, log the error, return 500 with `{ error: "Internal server error" }`
- API routes for collections with CRUD: `route.ts` handles `GET`/`POST`, `[id]/route.ts` handles `PUT`/`DELETE`
- Login/register return an `error` string and optional `code` field (`email_not_found`, `invalid_password`, `email_exists`) for contextual UI hints

### Mongoose patterns
- All models in `src/lib/models/` use the singleton pattern: `mongoose.models.X ?? mongoose.model<IX>("X", schema)`
- `connectDB()` in `src/lib/db.ts` uses a `global.mongooseCache` to avoid reconnecting on every hot-reload
- Models: `User`, `Role`, `AttendeeSession` (one per user), `Preset` (many per user), `SessionHistory` (completed meeting records)

### Auth flow
- `AuthContext` (`src/contexts/AuthContext.tsx`) is a client-side React context that calls `/api/auth/me` on mount to restore the session from the JWT cookie
- `AuthProvider` wraps the entire app in `layout.tsx` via `Providers` component
- Auth-gated pages (`/meet`, `/roles`, `/presets`, `/history`) are client components that check `useAuth()` and `router.replace("/")` if not authenticated. They show a loading spinner while `loading` is true and render nothing after redirect.
- **Exception**: `/meet` allows unauthenticated access when `?r=` share params are present (view-only mode for guests)
- Unauthenticated pages (`/`, `/register`) redirect to `/meet` if already logged in

### Share links (public view-only)
- Share URLs contain `?r=junior:2,senior:1&n=Alice,Bob&name=Sprint+Planning`
- Users without auth who open a share link get **read-only mode**: they can view attendee config, toggle currency, and copy the link, but cannot edit, start/stop meetings, save presets, or access history
- `AttendeeManager` and `TimerControls` accept a `readOnly` prop that hides edit/delete/start/end controls
- A "View-only mode" badge with eye icon is shown to guest users, plus a "Sign in" prompt
- Auth-gated pages (`/presets`, `/roles`, `/history`) still require login — only `/meet` has the share-link exception

### Timer and cost calculation
- Timer is a state machine: `idle` → `running` → `paused` (via `useTimer` hook)
- Cost formula: `(sum of all attendee hourly rates / 3600) × elapsedSeconds`
- Rate lookup: tries API roles by `_id` first, falls back to static `ROLES` array by short id (`src/data/roles.ts`)
- Display shows only total cost — never per-person breakdown

### Session history
- When a meeting ends (End button clicked in running/paused state), a `SessionHistory` document is saved to MongoDB with session name, attendees, totalCostMMK, elapsedSeconds, and currency
- User is navigated to `/history` after ending
- History page shows card-based timeline with expandable attendee breakdown, role labels resolved from API roles + static ROLES
- Sessions can be deleted with confirmation dialog

### Hooks architecture (three custom hooks)
- `useAttendees()` — attendee CRUD state + URL param sync (reads `?r=junior:2,senior:1&n=Alice,Bob` on mount, writes back on change). Uses `useEffect` after render for URL sync to avoid Next.js "Cannot update Router while rendering" errors.
- `useRoles()` — fetches roles from `/api/roles`, falls back to static `ROLES` array from `src/data/roles.ts` on failure
- `useTimer()` — timer state machine with `setInterval` ticking every second

### Role label resolution
- Role IDs stored in sessions and presets can be either short static IDs (`junior`, `senior`) or MongoDB ObjectIds from custom API roles
- All display components resolve labels with a dual-lookup: API roles by `_id` first, then static `ROLES` by short `id`, then fallback to raw ID
- Used consistently across history page, presets page, and AttendeeManager

### URL sharing
Role config and names are encoded as query parameters: `?r=junior:2,senior:1&n=Alice,Bob&name=Sprint+Planning`. The `useAttendees` hook handles encoding/decoding via helper functions in `src/types/attendee.ts`. `TimerControls` includes a Copy Link button that writes the shareable URL to the clipboard. Share links are publicly accessible in view-only mode.

### Currency
Default MMK with toggle to USD and SGD. Static exchange rates in `src/data/roles.ts` (CBM official rates, June 2026). `formatCost()` handles MMK as whole numbers with commas, USD/SGD with 2 decimal places. `CurrencyToggle` is a segmented control component visible in both setup and projector views.

### Theme
Dark mode is the default. `ThemeContext` manages `light`/`dark` state persisted to `localStorage`. `ThemeToggle` shows sun icon in dark mode and moon icon in light mode. All components use `dark:` Tailwind variants for theme-aware styling. Pages use `bg-slate-50 dark:bg-slate-950` background. NavBar is `bg-white dark:bg-slate-900` with light shadow in light mode.

### Styling
Tailwind CSS 4 via `@tailwindcss/postcss` — imported in `src/app/globals.css`. Modern card-based UI throughout: `rounded-2xl` cards with borders, shadows, hover lifts, SVG icons (no emoji), smooth transitions. NavBar brand uses gradient text (`from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent`). Projector view uses large font sizes for visibility from across a room. No component library — all UI is custom.

### Role icon color system
Six built-in roles are auto-detected by keyword in the label and assigned color families:
- Junior → emerald, Senior → amber, Manager → violet, Designer → pink, QA → cyan, DevOps → orange
- Used consistently across RoleSelect dropdown, RoleManager grid cards, and role badge pills
- Custom roles get neutral slate default

## Project conventions
- Path alias `@/` → `src/` (configured in `tsconfig.json`)
- Client components use `"use client"` directive at the top of the file
- API routes are server-only (no directive needed)
- `crypto.randomUUID()` for client-side ID generation (attendees)
- MongoDB `_id` for server-side ID generation
- `.env.local` is gitignored; `.env.local.example` should be provided for setup instructions
- All toast notifications use `animate-bounce-in` CSS animation (fixed bottom center)
- ConfirmDialog is the reusable confirmation modal used across all delete actions
