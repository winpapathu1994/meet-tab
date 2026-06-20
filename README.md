# MeetTab

> A privacy-first meeting cost timer with JWT authentication and MongoDB. Login to CRUD roles, manage named attendees, save preset sessions, share a link, hit start. Dark/light mode. Share links work without login in view-only mode. Session history records every completed meeting.

MeetTab shows the real-time cost of your meeting on a projector — using Myanmar market role presets instead of anyone's actual salary. Roles are fully customizable via the `/roles` page and stored in MongoDB. Hourly rates are snapshotted when you save a session so totals don't drift even if role rates change later.

## How it works

1. **Login** — JWT authentication at the landing page (or register a new account)
2. **Manage Roles** — visit the Roles tab to create/edit/delete roles with custom labels and hourly rates. Grid card layout with color-coded icons.
3. **Name your attendees** — add team members by name, assign each a role via the modern dropdown picker
4. **Save & Reuse** — persist attendee lists as preset sessions to MongoDB with snapshotted hourly rates; reuse them from the Preset tab
5. **Start the meeting** — a live cost counter ticks up every second
6. **Project it** — giant text on a clean background, readable from across the room
7. **Share the link** — URL encodes the role config and attendee names. Anyone can open it (no login required) in view-only mode
8. **End the meeting** — session is saved to history automatically; navigate to History tab to review past sessions with full attendee breakdown

The formula: `cost = (sum of all attendee role hourly rates / 3600) × elapsed seconds`

No per-person breakdown is ever shown — only the total running cost.

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally on `mongodb://localhost:27017`

## Quick start

```bash
git clone https://github.com/winpapathu1994/meet-tab.git
cd meet-tab

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local — set your JWT_SECRET and MONGODB_URI

# Start MongoDB (in another terminal)
mongod

# Seed default roles
export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/seed-roles.ts

# Start the dev server
npm run dev
```

Open http://localhost:3000/ — login or register, then you'll be taken to `/meet`.

## Scripts

| Command                              | What it does                          |
| ------------------------------------ | ------------------------------------- |
| `npm run dev`                        | Start Next.js dev server (Turbopack)  |
| `npm run build`                      | Type-check then production build      |
| `npm start`                          | Start the production server           |
| `npx tsx scripts/seed-roles.ts`      | Seed default roles into MongoDB       |

## API docs

Interactive Swagger UI available at **http://localhost:3000/api-docs** (no link in the app UI — navigate directly). Raw OpenAPI 3.0 spec served at `/api/docs`.

## Routes

| Path        | Content                                            | Auth      |
| ----------- | -------------------------------------------------- | :-------: |
| `/`         | Login form (redirects to `/meet` if logged in)      | No        |
| `/register` | Registration form (redirects if logged in)          | No        |
| `/meet`     | Attendee CRUD, timer, save sessions, share         | View-only |
| `/roles`    | Role CRUD — grid cards with color-coded icons       | Yes       |
| `/presets`  | Preset Sessions — reuse or delete saved configs     | Yes       |
| `/history`  | Session History — past meeting records with breakdown | Yes    |
| `/api-docs` | Swagger UI interactive API documentation            | No        |

**Note:** `/meet` allows unauthenticated access only when `?r=` share params are present — guests see a read-only view with a "View-only mode" badge.

## Tech stack

| Layer          | Choice                               |
| -------------- | ------------------------------------ |
| Framework      | Next.js 16 (App Router)              |
| Language       | TypeScript 5.8                       |
| Styling        | Tailwind CSS 4, dark/light mode     |
| Auth           | JWT (httpOnly cookie, bcryptjs)     |
| Database       | MongoDB / Mongoose                   |
| API docs       | OpenAPI 3.0 + Swagger UI            |
| Sharing        | URL query params (public view-only) |

## Project structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                     # Root layout (Providers + NavBar)
│   ├── page.tsx                       # Login landing page (/)
│   ├── register/page.tsx              # Register page (/register)
│   ├── meet/page.tsx                  # Timer + attendees (/meet)
│   ├── roles/page.tsx                 # Role CRUD (/roles)
│   ├── presets/page.tsx               # Preset Sessions (/presets)
│   ├── history/page.tsx               # Session History (/history)
│   ├── api-docs/                      # Swagger UI page (/api-docs)
│   │   ├── page.tsx                   # Client-side Swagger UI renderer
│   │   └── swagger-dark.css           # Dark theme overrides
│   └── api/                           # API routes
│       ├── docs/route.ts              # OpenAPI 3.0 JSON spec (/api/docs)
│       ├── auth/                      # register, login, me, logout, profile, avatar
│       ├── attendees/                 # session persistence (save/load/clear)
│       ├── presets/                   # preset session CRUD
│       ├── roles/                     # role CRUD
│       └── sessions/                  # session history (save on end, list, delete)
├── components/
│   ├── AttendeeManager.tsx            # Inline CRUD for named attendees (readOnly support)
│   ├── AttendeePersistence.tsx        # Save / Load / Clear buttons
│   ├── AuthNav.tsx                    # Auth navigation (login/register pages)
│   ├── ConfirmDialog.tsx              # Reusable delete confirmation modal
│   ├── CostDisplay.tsx                # Giant cost + elapsed time with digit-flash
│   ├── CurrencyToggle.tsx             # MMK ↔ USD ↔ SGD segmented control
│   ├── NavBar.tsx                     # Gradient brand, centered tabs, user menu + mobile drawer
│   ├── PresetManager.tsx              # Save / Load / Delete preset sessions inline
│   ├── Providers.tsx                  # Auth + Theme context wrapper
│   ├── RoleManager.tsx                # Role CRUD grid cards with color icons
│   ├── RoleSelect.tsx                 # Modern role dropdown with icons + colors
│   ├── SavePreset.tsx                 # Inline save-preset toggle
│   ├── ThemeToggle.tsx                # Light/dark mode toggle (sun/moon icons)
│   ├── TimerControls.tsx              # Start/Pause/Resume/Reset/End/Copy Link
│   └── UserMenu.tsx                   # Profile settings dropdown (avatar, name, password)
├── contexts/
│   ├── AuthContext.tsx                # useAuth() — user, login, register, logout, updateUser
│   └── ThemeContext.tsx               # Dark/Light mode with localStorage persistence
├── data/
│   └── roles.ts                       # Role presets, currency rates, formatters
├── hooks/
│   ├── useAttendees.ts                # Attendee CRUD + URL param sync
│   ├── useRoles.ts                    # Roles from API + static fallback
│   └── useTimer.ts                    # Timer state machine (idle→running→paused)
├── lib/
│   ├── auth.ts                        # JWT helpers, bcrypt, cookies
│   ├── db.ts                          # Mongoose connection singleton
│   ├── openapi.ts                     # Full OpenAPI 3.0 spec
│   └── models/
│       ├── User.ts                    # User model (name, email, password, image)
│       ├── AttendeeSession.ts         # Attendee session (one per user)
│       ├── Preset.ts                  # Meeting preset (many per user)
│       ├── Role.ts                    # Role model (label + hourlyRate)
│       └── SessionHistory.ts          # Completed meeting record
├── types/
│   ├── attendee.ts                    # Attendee interface + URL helpers
│   └── swagger-ui-react.d.ts          # Type declarations for swagger-ui-react
└── scripts/
    └── seed-roles.ts                  # One-shot MongoDB role seeder
```

## API reference

### Auth

| Method | Route                  | Body                            | Response            |
| ------ | ---------------------- | ------------------------------- | ------------------- |
| POST   | `/api/auth/register`   | `{ name, email, password }`     | `{ user }` + cookie |
| POST   | `/api/auth/login`      | `{ email, password }`           | `{ user }` + cookie |
| GET    | `/api/auth/me`         | —                               | `{ user \| null }`  |
| POST   | `/api/auth/logout`     | —                               | `{ ok: true }`      |
| PUT    | `/api/auth/profile`    | `{ name?, currentPassword?, newPassword? }` | `{ user }` |
| POST   | `/api/auth/avatar`     | FormData `file`                 | `{ image }`         |

Login errors include a `code` field (`email_not_found`, `invalid_password`) for contextual UI hints. Register returns `code: "email_exists"` on duplicate.

### Roles (auth required for mutations)

| Method | Route              | Body                          | Response       |
| ------ | ------------------ | ----------------------------- | -------------- |
| GET    | `/api/roles`       | —                             | `{ roles }`    |
| POST   | `/api/roles`       | `{ label, hourlyRate }`       | `{ role }`     |
| PUT    | `/api/roles/[id]`  | `{ label?, hourlyRate? }`     | `{ role }`     |
| DELETE | `/api/roles/[id]`  | —                             | `{ ok: true }` |

### Attendee Session (auth required)

| Method | Route             | Body                        | Response                  |
| ------ | ----------------- | --------------------------- | ------------------------- |
| GET    | `/api/attendees`  | —                           | `{ attendees: [...] }`    |
| PUT    | `/api/attendees`  | `{ attendees: [...] }`      | `{ attendees: [...] }`    |
| DELETE | `/api/attendees`  | —                           | `{ ok: true }`            |

### Preset Sessions (auth required)

| Method | Route                | Body                          | Response       |
| ------ | -------------------- | ----------------------------- | -------------- |
| GET    | `/api/presets`       | —                             | `{ presets }`  |
| POST   | `/api/presets`       | `{ name, attendees }`         | `{ preset }`   |
| PUT    | `/api/presets/[id]`  | `{ name?, attendees? }`       | `{ preset }`   |
| DELETE | `/api/presets/[id]`  | —                             | `{ ok: true }` |

### Session History (auth required)

| Method | Route                 | Body                                                          | Response        |
| ------ | --------------------- | ------------------------------------------------------------- | --------------- |
| GET    | `/api/sessions`       | —                                                             | `{ sessions }`  |
| POST   | `/api/sessions`       | `{ sessionName, attendees, totalCostMMK, elapsedSeconds, currency }` | `{ session }` |
| DELETE | `/api/sessions/[id]`  | —                                                             | `{ ok: true }`  |

## Role presets

Yangon tech sector market rates (MMK per hour — June 2026):

| Role             | Rate          |
| ---------------- | ------------- |
| Junior Dev       | MMK 3,500/hr  |
| Senior Dev       | MMK 8,000/hr  |
| Manager          | MMK 12,000/hr |
| Designer (UI/UX) | MMK 5,000/hr  |
| QA / Tester      | MMK 3,000/hr  |
| DevOps           | MMK 9,000/hr  |

Roles are seeded via `npx tsx scripts/seed-roles.ts` and manageable at `/roles`.

## Currency support

| Currency | Rate (CBM, June 2026) |
| -------- | --------------------- |
| MMK      | 1 : 1                 |
| USD      | 1 USD = 3,658 MMK     |
| SGD      | 1 SGD = 1,653 MMK     |

Toggle currencies live — the counter and attendee rates convert instantly.

## URL sharing

Role selections and attendee names are encoded as query parameters:

```
?r=junior:2,senior:1&n=Alice,Bob&name=Sprint+Planning
```

Open that URL on any device — **no login required**. The role config loads automatically in view-only mode. Authenticated users get full edit access. Press **Copy Link** during a meeting to grab the shareable URL.

Each attendee stores the `hourlyRate` at save time, so preset sessions display snapshotted rates — not live role rates that may have changed.

## Session History

When you click **End Meeting**, the session is saved to MongoDB and you're taken to the History page. Each record shows:

- Session name and date
- Total elapsed time
- Number of attendees
- Total cost
- Expandable attendee breakdown with per-person cost contribution
- Delete button to remove old records

## Environment variables

```bash
MONGODB_URI=mongodb://localhost:27017/meet-tab
JWT_SECRET=<random-64-character-hex-string>
```

## License

MIT
