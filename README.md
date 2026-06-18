# MeetTab

> A privacy-first meeting cost timer with JWT authentication and MongoDB. Login to CRUD roles, manage named attendees, save meeting sessions, share a link, hit start.

MeetTab shows the real-time cost of your meeting on a projector — using Myanmar market role presets instead of anyone's actual salary. Roles are fully customizable via the `/roles` page and stored in MongoDB.

## How it works

1. **Login** — JWT authentication at the landing page (or register a new account)
2. **Manage Roles** — visit the Roles tab to create/edit/delete roles with custom labels and hourly rates
3. **Name your attendees** — add team members by name, assign each a role via the modern picker
4. **Save & Reuse** — persist attendee lists as meeting sessions to MongoDB; reuse them from the Sessions tab
5. **Start the meeting** — a live cost counter ticks up every second
6. **Project it** — giant text on a dark background, readable from across the room
7. **Share the link** — URL encodes the role config and attendee names so anyone with an account can open it

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

| Command              | What it does                          |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start Next.js dev server (Turbopack)  |
| `npm run build`      | Type-check then production build      |
| `npm start`          | Start the production server           |
| `npx tsx scripts/seed-roles.ts` | Seed default roles into MongoDB |

## Routes

| Path        | Content                                       | Auth |
| ----------- | --------------------------------------------- | :--: |
| `/`         | Login form (redirects to `/meet` if logged in) | No  |
| `/register` | Registration form (redirects if logged in)     | No  |
| `/meet`     | Attendee CRUD, timer, save sessions, share    | Yes  |
| `/roles`    | Role CRUD (custom labels + hourly rates)       | Yes  |
| `/presets`  | Meeting Sessions — Reuse or Delete             | Yes  |

## Tech stack

| Layer          | Choice                         |
| -------------- | ------------------------------ |
| Framework      | Next.js 16 (App Router)        |
| Language       | TypeScript 5.8                 |
| Styling        | Tailwind CSS 4                 |
| Auth           | JWT (httpOnly cookie, bcryptjs)|
| Database       | MongoDB / Mongoose             |
| Sharing        | URL query params               |
| Hosting        | Vercel (free tier)             |

## Project structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                 # Root layout (Providers + NavBar)
│   ├── page.tsx                   # Login landing page (/)
│   ├── register/page.tsx          # Register page (/register)
│   ├── meet/page.tsx              # Timer + attendees (/meet)
│   ├── roles/page.tsx             # Role CRUD (/roles)
│   ├── presets/page.tsx           # Meeting Sessions (/presets)
│   └── api/                       # API routes
│       ├── auth/                  # register, login, me, logout
│       ├── attendees/             # session persistence (save/load/clear)
│       ├── presets/               # meeting session CRUD
│       └── roles/                 # role CRUD
├── components/
│   ├── AttendeeManager.tsx         # Inline CRUD for named attendees
│   ├── AttendeePersistence.tsx     # Save / Load / Clear buttons
│   ├── CostDisplay.tsx             # Giant cost + elapsed time
│   ├── CurrencyToggle.tsx          # MMK ↔ USD ↔ SGD
│   ├── NavBar.tsx                  # Meet / Roles / Sessions tabs + user + logout
│   ├── Providers.tsx               # Auth context wrapper
│   ├── RoleManager.tsx             # Role CRUD (label + hourly rate)
│   ├── RoleSelect.tsx              # Modern role dropdown picker
│   ├── SavePreset.tsx              # Inline save-session toggle
│   └── TimerControls.tsx           # Start / Pause / Resume / Reset / Copy Link
├── contexts/
│   └── AuthContext.tsx             # useAuth() hook
├── data/
│   └── roles.ts                    # Role presets, currency rates, formatters
├── hooks/
│   ├── useAttendees.ts             # Attendee CRUD + URL sync (names + role counts)
│   ├── useRoles.ts                 # Roles from API + static fallback
│   └── useTimer.ts                 # Timer state machine
├── lib/
│   ├── auth.ts                     # JWT helpers, bcrypt, cookies
│   ├── db.ts                       # Mongoose connection
│   └── models/
│       ├── User.ts                  # User model
│       ├── AttendeeSession.ts       # Attendee session (one per user)
│       ├── Preset.ts               # Meeting session preset (many per user)
│       └── Role.ts                 # Role model (label + hourlyRate)
├── types/
│   └── attendee.ts                 # Attendee interface + helpers
└── scripts/
    └── seed-roles.ts               # One-shot MongoDB role seeder
```

## API reference

### Auth

| Method | Route                  | Body                            | Response           |
| ------ | ---------------------- | ------------------------------- | ------------------ |
| POST   | `/api/auth/register`   | `{ name, email, password }`     | `{ user }` + cookie |
| POST   | `/api/auth/login`      | `{ email, password }`           | `{ user }` + cookie |
| GET    | `/api/auth/me`         | —                               | `{ user \| null }`  |
| POST   | `/api/auth/logout`     | —                               | `{ ok: true }`     |

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

### Meeting Sessions (auth required)

| Method | Route                | Body                          | Response       |
| ------ | -------------------- | ----------------------------- | -------------- |
| GET    | `/api/presets`       | —                             | `{ presets }`  |
| POST   | `/api/presets`       | `{ name, attendees }`         | `{ preset }`   |
| PUT    | `/api/presets/[id]`  | `{ name?, attendees? }`       | `{ preset }`   |
| DELETE | `/api/presets/[id]`  | —                             | `{ ok: true }` |

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

Open that URL on any device (after logging in) and the role config loads automatically. Press **📋 Copy Link** during a meeting to grab the shareable URL.

## Environment variables

```bash
MONGODB_URI=mongodb://localhost:27017/meet-tab
JWT_SECRET=<random-64-character-hex-string>
```

## License

MIT
