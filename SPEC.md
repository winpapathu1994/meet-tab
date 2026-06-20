# Meeting Cost Live Counter (MeetTab) — Spec by @winpapathu1994

**Repository description:** A privacy-first meeting cost timer with JWT authentication. Login to CRUD roles, manage named attendees, save/reuse preset sessions with snapshotted hourly rates, share a link (public view-only), and review session history — no salaries exposed. Dark/light mode.

## Gist

A browser-based meeting cost counter built on Next.js with JWT authentication and MongoDB. Login to add named attendees, assign them roles via a modern picker, save meeting sessions, start the timer, and end to record history. Roles are fully customizable. Share links work without login. No real salaries involved — just market rates.

## Story

Lily is a team lead at a Yangon-based software firm. She opens MeetTab, logs in, and adds her team by name — Alice (Senior Dev), Bob (Junior Dev), Carol (Junior Dev), David (Manager), Emily (Designer). She saves this session as "Sprint Planning". The projector shows "MMK 52,400" in large text. Everyone instinctively keeps it brief. She ends the meeting and is taken to the History page where she can review the session details. Next sprint, she opens the Preset tab and clicks Reuse on her saved session — names, roles, and snapshotted rates are restored instantly. She shares the link with a stakeholder who opens it without logging in and sees the attendee configuration in view-only mode.

## Why

Meetings have invisible costs. Existing tools require entering real salaries — which is awkward and a privacy risk. MeetTab uses role-based Myanmar market rate presets and named attendees so anyone can start a cost counter without exposing anyone's pay. Login with JWT to persist attendee data and meeting sessions to MongoDB. Roles are fully CRUD-editable. Share links are publicly viewable. Session history tracks every meeting.

## Why Not

- No real salary input — role-based market rate presets only
- No calendar sync — manual input only for MVP
- No mobile app — web browser only, optimized for projector display
- Authentication required for editing — guests can view shared links but cannot modify

## Tech Spec

| Layer | Tech | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | API routes + React frontend in one project |
| Frontend | React 19 | Client components for interactivity |
| Styling | Tailwind CSS 4 | Dark/light mode, gradient brand text, color-coded role icons, modern card UI |
| Timer logic | `useTimer` hook | Real-time cost tick every second, idle→running→paused state machine |
| Attendee model | `Attendee { id, name, roleId, hourlyRate }` | Full CRUD with inline UI, hourlyRate snapshotted on save, persisted to MongoDB |
| Role model | `Role { label, hourlyRate }` | Full CRUD at `/roles`, stored in MongoDB, color-coded by keyword |
| Authentication | JWT (httpOnly cookie) | bcryptjs password hashing, 7-day token expiry |
| Database | MongoDB / Mongoose | User, AttendeeSession, Preset, Role, and SessionHistory collections |
| Share config | URL parameters | Encodes role counts + names (`?r=junior:2,senior:1&n=Alice,Bob&name=...`), public view-only |
| Session history | SessionHistory model | Saves on meeting end, card-based UI with expandable attendee breakdown |
| Profile | Avatar upload + name/password edit | File upload via FormData, image stored in public/uploads |
| API docs | OpenAPI 3.0.3 + Swagger UI (swagger-ui-react) | Dark-themed interactive docs at `/api-docs` |


**Role presets (Myanmar market default — Yangon tech sector):**

| Role | Est. Hourly Rate | Monthly Basis |
|---|---|---|
| Junior Dev | MMK 3,500/hr | ~600,000 MMK/month |
| Senior Dev | MMK 8,000/hr | ~1,400,000 MMK/month |
| Manager | MMK 12,000/hr | ~2,000,000 MMK/month |
| Designer (UI/UX) | MMK 5,000/hr | ~850,000 MMK/month |
| QA / Tester | MMK 3,000/hr | ~500,000 MMK/month |
| DevOps | MMK 9,000/hr | ~1,500,000 MMK/month |

**Static exchange rates (CBM official — June 2026):**

| Currency | Rate |
|---|---|
| USD | 1 USD = 3,658 MMK |
| SGD | 1 SGD = 1,653 MMK |

## Routes

| Path | Content | Auth Required |
|------|---------|:---:|
| `/` | Login form (redirects to `/meet` if already logged in) | No |
| `/register` | Registration form (redirects to `/meet` if already logged in) | No |
| `/meet` | Attendee CRUD + timer + save sessions + share | View-only* |
| `/roles` | Role CRUD grid cards with color-coded icons | **Yes** |
| `/presets` | Preset Sessions — reuse or delete saved sessions | **Yes** |
| `/history` | Session History — past meeting records with breakdown | **Yes** |
| `/api-docs` | Swagger UI interactive API documentation (dark theme) | No |

\* `/meet` allows unauthenticated access with `?r=` share params (view-only mode)

## Data Flow

1. User logs in at `/` — JWT set as httpOnly cookie
2. User is redirected to `/meet` — auth guard checks `/api/auth/me`
3. User can create and manage custom roles at `/roles` — grid card layout with color icons
4. User adds attendees by name and assigns each a role via the modern dropdown picker
5. Each attendee has a role with a market rate estimate; hourly rate is snapshotted
6. User can **Save** attendees to MongoDB or load a previous session
7. User can save preset sessions for recurring configurations
8. User can reuse saved sessions from the Preset tab — names, roles, and rates restored
9. Delete actions show a confirmation dialog before removing records
10. Start is pressed — timer begins, cost updates every second
11. `cost = (sum of all attendee role rates / 3600) x elapsedSeconds`
12. Projector view shows total cost only — no per-person breakdown
13. Role config + names are shareable via URL — public view-only, no login required
14. End Meeting saves session to history and navigates to `/history`
15. History page shows card-based timeline with expandable attendee breakdown

## API Routes

### Auth

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Create account (bcrypt hash), return JWT cookie |
| POST | `/api/auth/login` | Verify credentials, return JWT cookie |
| GET | `/api/auth/me` | Restore session from JWT cookie |
| POST | `/api/auth/logout` | Clear JWT cookie |
| PUT | `/api/auth/profile` | Update name and/or password |
| POST | `/api/auth/avatar` | Upload profile avatar (FormData) |

Error responses include a `code` field for contextual UI hints (`email_not_found`, `invalid_password`, `email_exists`).

### Roles

| Method | Route | Auth | Purpose |
|--------|-------|:---:|---------|
| GET | `/api/roles` | No | List all roles |
| POST | `/api/roles` | Yes | Create role |
| PUT | `/api/roles/[id]` | Yes | Update role |
| DELETE | `/api/roles/[id]` | Yes | Delete role |

### Attendee Session

| Method | Route | Auth | Purpose |
|--------|-------|:---:|---------|
| GET | `/api/attendees` | Yes | Load saved attendee list |
| PUT | `/api/attendees` | Yes | Save (upsert) current attendees |
| DELETE | `/api/attendees` | Yes | Clear saved session |

### Preset Sessions

| Method | Route | Auth | Purpose |
|--------|-------|:---:|---------|
| GET | `/api/presets` | Yes | List user's saved presets |
| POST | `/api/presets` | Yes | Create named preset |
| PUT | `/api/presets/[id]` | Yes | Update preset name or attendees |
| DELETE | `/api/presets/[id]` | Yes | Delete preset |

### Session History

| Method | Route | Auth | Purpose |
|--------|-------|:---:|---------|
| GET | `/api/sessions` | Yes | List user's completed sessions |
| POST | `/api/sessions` | Yes | Save session on meeting end |
| DELETE | `/api/sessions/[id]` | Yes | Delete session record |

## MongoDB Collections

| Collection | Schema | Index |
|-----------|--------|-------|
| `users` | `{ email, passwordHash, name, image, timestamps }` | `email` unique |
| `roles` | `{ label, hourlyRate, timestamps }` | — |
| `attendeesessions` | `{ userId, attendees: [{name, roleId, hourlyRate}], updatedAt }` | `userId` unique |
| `presets` | `{ userId, name, attendees: [{name, roleId, hourlyRate}], timestamps }` | `userId` |
| `sessionhistories` | `{ userId, sessionName, attendees, totalCostMMK, elapsedSeconds, currency, timestamps }` | `userId` |

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                     # Root layout (Providers + NavBar)
│   ├── globals.css                    # Tailwind import + animations
│   ├── page.tsx                       # Login landing page (/)
│   ├── register/page.tsx              # Register page (/register)
│   ├── meet/page.tsx                  # Timer + attendees (/meet) — share-link public
│   ├── roles/page.tsx                 # Role CRUD (/roles) — auth-gated
│   ├── presets/page.tsx               # Preset Sessions (/presets) — auth-gated
│   ├── history/page.tsx               # Session History (/history) — auth-gated
│   ├── api-docs/
│   │   ├── page.tsx                   # Swagger UI (/api-docs)
│   │   └── swagger-dark.css           # Dark theme overrides
│   └── api/
│       ├── docs/route.ts              # GET — OpenAPI 3.0 JSON spec
│       ├── auth/
│       │   ├── register/route.ts      # POST — create account
│       │   ├── login/route.ts         # POST — login
│       │   ├── me/route.ts            # GET — current user
│       │   ├── logout/route.ts        # POST — clear cookie
│       │   ├── profile/route.ts       # PUT — update name/password
│       │   └── avatar/route.ts        # POST — upload avatar
│       ├── attendees/route.ts         # GET/PUT/DELETE — session persistence
│       ├── presets/
│       │   ├── route.ts               # GET/POST — list/create
│       │   └── [id]/route.ts          # PUT/DELETE — update/delete
│       ├── roles/
│       │   ├── route.ts               # GET/POST — list/create
│       │   └── [id]/route.ts          # PUT/DELETE — update/delete
│       └── sessions/
│           ├── route.ts               # GET/POST — list/save history
│           └── [id]/route.ts          # DELETE — remove history record
├── components/
│   ├── AttendeeManager.tsx            # Inline CRUD for named attendees (readOnly support)
│   ├── AttendeePersistence.tsx        # Save / Load / Clear buttons
│   ├── AuthNav.tsx                    # Auth navigation (login/register pages)
│   ├── ConfirmDialog.tsx              # Reusable delete confirmation modal
│   ├── CostDisplay.tsx                # Giant cost + timer, digit-flash animation
│   ├── CurrencyToggle.tsx             # MMK ↔ USD ↔ SGD segmented control
│   ├── NavBar.tsx                     # Gradient brand, centered tabs, user menu + mobile drawer
│   ├── PresetManager.tsx              # Save / Load / Delete preset sessions inline
│   ├── Providers.tsx                  # Auth + Theme context provider wrapper
│   ├── RoleManager.tsx                # Role CRUD grid cards with color-coded icons
│   ├── RoleSelect.tsx                 # Modern role dropdown with icons + colors + animation
│   ├── SavePreset.tsx                 # Save Session inline toggle
│   ├── ThemeToggle.tsx                # Light/dark mode toggle (sun/moon icons)
│   ├── TimerControls.tsx              # Start/Pause/Resume/Reset/End/Copy Link (readOnly support)
│   └── UserMenu.tsx                   # Profile settings (avatar, name, password)
├── contexts/
│   ├── AuthContext.tsx                # useAuth() — user, login, register, logout, updateUser
│   └── ThemeContext.tsx               # Dark/Light mode with localStorage persistence
├── data/
│   └── roles.ts                       # Role presets, currency rates, formatters
├── hooks/
│   ├── useAttendees.ts                # Attendee CRUD state + URL param sync
│   ├── useRoles.ts                    # Roles from API with static fallback
│   └── useTimer.ts                    # Timer state machine (idle→running→paused)
├── lib/
│   ├── auth.ts                        # JWT sign/verify, cookie helpers, bcrypt
│   ├── db.ts                          # Mongoose singleton connection
│   ├── openapi.ts                     # Full OpenAPI 3.0 spec
│   └── models/
│       ├── User.ts                    # User model
│       ├── AttendeeSession.ts         # Session attendee list (one per user)
│       ├── Preset.ts                  # Meeting preset (many per user)
│       ├── Role.ts                    # Role model (label + hourlyRate)
│       └── SessionHistory.ts          # Completed meeting record
├── types/
│   ├── attendee.ts                    # Attendee interface + URL helpers
│   └── swagger-ui-react.d.ts          # Type declarations for swagger-ui-react
└── scripts/
    └── seed-roles.ts                  # One-shot MongoDB role seeder
```

## Definition of Done

- [x] User can register and login with JWT authentication
- [x] Login page redirects to `/meet` if already authenticated
- [x] Register page redirects to `/meet` if already authenticated
- [x] Error codes on login/register provide contextual direction
- [x] Login is the landing page; `/meet`, `/roles`, `/presets`, `/history` are auth-gated
- [x] Share links (`?r=...`) are publicly viewable without login
- [x] Guest users see "View-only mode" badge; cannot edit, start, or end meetings
- [x] User can CRUD roles (label + hourly rate) at `/roles` — grid card layout
- [x] Role dropdown is a modern custom picker with icons, colors, and animation
- [x] User can CRUD individual named attendees with a modern role picker
- [x] Attendee list shows each person's name, role label, and currency-aware hourly rate
- [x] Role label names shown everywhere (not raw roleIds)
- [x] Role rates display in selected currency (MMK/USD/SGD) throughout the UI
- [x] User can Save Session to MongoDB
- [x] User can Reuse or Delete saved presets from `/presets` — card-based UI
- [x] Reusing a preset restores attendee names and shows the session name
- [x] Meeting sessions persist across sessions via MongoDB
- [x] Preset sessions snapshotted hourly rates survive role rate changes
- [x] Delete actions (roles, presets, attendees, clear) show confirmation dialog
- [x] Counter updates every second in real time
- [x] Projector view shows total cost only — no per-person breakdown visible
- [x] Timer supports pause, resume, reset, and end
- [x] End Meeting saves session to history and navigates to `/history`
- [x] Session history page shows card-based timeline with expandable attendee breakdown
- [x] History records can be deleted with confirmation dialog
- [x] Role config + names are shareable via URL parameters
- [x] Copy Link button shows Copied! feedback
- [x] Display is legible on a projector (large font, high contrast)
- [x] Default currency is MMK with toggle to USD and SGD
- [x] Dark mode is default; light/dark toggle persists via localStorage
- [x] All components use `dark:` variants for theme-aware styling
- [x] Gradient brand text in NavBar (Meet in gradient blue, Tab lightweight)
- [x] Color-coded role icons across RoleSelect, RoleManager, and badge pills
- [x] NavBar provides gradient brand + Meet / Roles / Preset / History tabs + responsive mobile drawer
- [x] User can edit profile (name, avatar, password) via UserMenu dropdown
- [x] Works correctly on mobile browsers
