# Meeting Cost Live Counter (MeetTab) — Spec by @winpapathu1994

**Repository description:** A privacy-first meeting cost timer with JWT authentication. Login to CRUD roles, manage named attendees, save/reuse preset sessions with snapshotted hourly rates, and share a link — no salaries exposed. Dark mode by default.

## Gist

A browser-based meeting cost counter built on Next.js with JWT authentication and MongoDB. Login to add named attendees, assign them roles via a modern picker, save meeting sessions, and start the timer. Roles are fully customizable. No real salaries involved — just market rates.

## Story

Lily is a team lead at a Yangon-based software firm. She opens MeetTab, logs in, and adds her team by name — Alice (Senior Dev), Bob (Junior Dev), Carol (Junior Dev), David (Manager), Emily (Designer). She saves this session as "Sprint Planning". The projector shows "MMK 52,400 — 18 min 32 sec" in large text. Everyone instinctively keeps it brief. Next sprint, she opens the app, logs in, opens the Preset Sessions tab, and clicks Reuse on her saved session — names, roles, and snapshotted rates are restored instantly.

## Why

Meetings have invisible costs. Existing tools require entering real salaries — which is awkward and a privacy risk. MeetTab uses role-based Myanmar market rate presets and named attendees so anyone can start a cost counter without exposing anyone's pay. Login with JWT to persist attendee data and meeting sessions to MongoDB. Roles are fully CRUD-editable. No install needed; share a URL and go.

## Why Not

- No real salary input — role-based market rate presets only
- No calendar sync — manual input only for MVP
- No mobile app — web browser only, optimized for projector display
- Authentication required — no anonymous usage; login to access the timer

## Tech Spec

| Layer | Tech | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | API routes + React frontend in one project |
| Frontend | React 19 | Client components for interactivity |
| Styling | Tailwind CSS 4 | Dark mode default, light/dark toggle, projector-readable large text |
| Timer logic | `useTimer` hook | Real-time cost tick every second |
| Attendee model | `Attendee { id, name, roleId, hourlyRate }` | Full CRUD with inline UI, hourlyRate snapshotted on save, persisted to MongoDB |
| Role model | `Role { label, hourlyRate }` | Full CRUD at `/roles`, stored in MongoDB |
| Authentication | JWT (httpOnly cookie) | bcryptjs password hashing, 7-day token expiry |
| Database | MongoDB / Mongoose | User, AttendeeSession, Preset, and Role collections |
| Share config | URL parameters | Encodes role counts + names (`?r=junior:2,senior:1&n=Alice,Bob&name=...`) |
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
| `/meet` | Attendee CRUD + timer + save sessions + share | **Yes** |
| `/roles` | Role CRUD (label + hourly rate) | **Yes** |
| `/presets` | Preset Sessions — reuse or delete saved sessions | **Yes** |
| `/api-docs` | Swagger UI interactive API documentation (dark theme) | No |

## Data Flow

1. User logs in at `/` — JWT set as httpOnly cookie
2. User is redirected to `/meet` — auth guard checks `/api/auth/me`
3. User can create and manage custom roles at `/roles`
4. User adds attendees by name and assigns each a role via the modern dropdown picker
5. Each attendee has a role with a market rate estimate; hourly rate is snapshotted
6. User can **Save** attendees to MongoDB or load a previous session
7. User can save preset sessions for recurring configurations — hourly rates are persisted per attendee
8. User can reuse saved sessions from the Preset Sessions tab — names, roles, and rates restored
9. Delete actions show a confirmation dialog before removing records
10. Start is pressed — timer begins, cost updates every second
11. `cost = (sum of all attendee role rates / 3600) x elapsedSeconds`
12. Projector view shows total cost only — no per-person breakdown
13. Role config + names are shareable via URL parameters

## API Routes

### Auth

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Create account (bcrypt hash), return JWT cookie |
| POST | `/api/auth/login` | Verify credentials, return JWT cookie |
| GET | `/api/auth/me` | Restore session from JWT cookie |
| POST | `/api/auth/logout` | Clear JWT cookie |

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
| GET | `/api/presets` | Yes | List user's saved sessions |
| POST | `/api/presets` | Yes | Create named session (attendees with hourlyRate) |
| PUT | `/api/presets/[id]` | Yes | Update session name or attendees |
| DELETE | `/api/presets/[id]` | Yes | Delete session (with confirmation dialog) |

## MongoDB Collections

| Collection | Schema | Index |
|-----------|--------|-------|
| `users` | `{ email, passwordHash, name, timestamps }` | `email` unique |
| `roles` | `{ label, hourlyRate, timestamps }` | — |
| `attendeesessions` | `{ userId, attendees: [{name, roleId, hourlyRate}], updatedAt }` | `userId` unique |
| `presets` | `{ userId, name, attendees: [{name, roleId, hourlyRate}], timestamps }` | `userId` |

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                 # Root layout (Providers + NavBar)
│   ├── globals.css                # Tailwind import
│   ├── page.tsx                   # Login landing page (/)
│   ├── register/page.tsx          # Register page (/register)
│   ├── meet/page.tsx              # Timer + attendees (/meet) — auth-gated
│   ├── roles/page.tsx             # Role CRUD (/roles) — auth-gated
│   ├── presets/page.tsx           # Preset Sessions (/presets) — auth-gated
│   ├── api-docs/
│   │   ├── page.tsx               # Swagger UI (/api-docs)
│   │   └── swagger-dark.css       # Dark theme overrides
│   └── api/
│       ├── docs/route.ts          # GET — OpenAPI 3.0 JSON spec
│       ├── auth/
│       │   ├── register/route.ts  # POST — create account
│       │   ├── login/route.ts     # POST — login
│       │   ├── me/route.ts        # GET — current user
│       │   └── logout/route.ts    # POST — clear cookie
│       ├── attendees/route.ts     # GET/PUT/DELETE — session persistence
│       ├── presets/
│       │   ├── route.ts           # GET/POST — list/create
│       │   └── [id]/route.ts      # PUT/DELETE — update/delete
│       └── roles/
│           ├── route.ts           # GET/POST — list/create
│           └── [id]/route.ts      # PUT/DELETE — update/delete
├── components/
│   ├── AttendeeManager.tsx         # Inline CRUD for named attendees
│   ├── AttendeePersistence.tsx     # Save / Load / Clear (MongoDB)
│   ├── ConfirmDialog.tsx           # Reusable delete confirmation modal
│   ├── CostDisplay.tsx             # Giant cost + timer, digit-flash animation
│   ├── CurrencyToggle.tsx          # MMK ↔ USD ↔ SGD pill toggle
│   ├── NavBar.tsx                  # Brand left, centered tabs, user actions right + mobile drawer
│   ├── PresetManager.tsx           # Save / Load / Delete preset sessions inline
│   ├── Providers.tsx               # Auth + Theme context provider wrapper
│   ├── RoleManager.tsx             # Role CRUD (label + hourly rate)
│   ├── RoleSelect.tsx              # Modern role dropdown picker with icons + colors
│   ├── SavePreset.tsx              # Save Session inline toggle
│   ├── ThemeToggle.tsx             # Light/dark mode toggle (sun/moon icons)
│   └── TimerControls.tsx           # Start/Pause/Resume/Reset/Copy Link
├── contexts/
│   ├── AuthContext.tsx             # useAuth() — user, login, register, logout
│   └── ThemeContext.tsx            # Dark mode context (default dark, localStorage)
├── data/
│   └── roles.ts                    # Role presets, currency rates, formatters
├── hooks/
│   ├── useAttendees.ts             # Attendee CRUD state + URL param sync (names + roles)
│   ├── useRoles.ts                 # Roles from API with static fallback
│   └── useTimer.ts                 # Timer state machine (idle→running→paused)
├── lib/
│   ├── auth.ts                     # JWT sign/verify, cookie helpers, bcrypt
│   ├── db.ts                       # Mongoose singleton connection
│   ├── openapi.ts                  # Full OpenAPI 3.0 spec (all routes + schemas)
│   └── models/
│       ├── User.ts                  # User model
│       ├── AttendeeSession.ts       # Session attendee list (one per user)
│       ├── Preset.ts               # Meeting session preset (many per user)
│       └── Role.ts                 # Role model (label + hourlyRate)
├── types/
│   └── attendee.ts                 # Attendee interface + helpers
└── scripts/
    └── seed-roles.ts               # One-shot MongoDB role seeder
```

## Definition of Done

- [ ] User can register and login with JWT authentication
- [ ] Login page redirects to `/meet` if already authenticated
- [ ] Register page redirects to `/meet` if already authenticated
- [ ] Error codes on login/register provide contextual direction (register here / login here)
- [ ] Login is the landing page; `/meet`, `/roles`, `/presets` are auth-gated
- [ ] User can CRUD roles (label + hourly rate) at `/roles`
- [ ] Role dropdown is a modern custom picker with icons, colors, and animation
- [ ] User can CRUD individual named attendees with a modern role picker
- [ ] Attendee list shows each person's name, role, and currency-aware hourly rate
- [ ] Role rates display in selected currency (MMK/USD/SGD) throughout the UI
- [ ] User can Save Session to MongoDB
- [ ] User can Reuse or Delete saved sessions from `/presets`
- [ ] Reusing a session restores attendee names and shows the session name
- [ ] Meeting sessions persist across sessions via MongoDB
- [ ] Preset sessions snapshotted hourly rates survive role rate changes
- [ ] Delete actions (roles, presets, attendees, clear) show confirmation dialog
- [ ] Counter updates every second in real time
- [ ] Projector view shows total cost only — no per-person breakdown visible
- [ ] Timer supports pause, resume, and reset
- [ ] Role config + names are shareable via URL parameters
- [ ] Copy Link button shows Copied! feedback
- [ ] Display is legible on a projector (large font, high contrast)
- [ ] Default currency is MMK with toggle to USD and SGD
- [ ] Dark mode is the default; light/dark toggle persists via localStorage
- [ ] NavBar provides brand + centered Meet / Roles / Preset Sessions tabs + responsive mobile drawer
- [ ] Works correctly on mobile browsers
