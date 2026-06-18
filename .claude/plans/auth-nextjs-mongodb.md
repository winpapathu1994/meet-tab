# Plan: JWT Authentication + Next.js Migration + MongoDB

## Summary

Migrate from Vite + React to Next.js (App Router), add JWT authentication with
local MongoDB, and enable logged-in users to save/load attendee presets.
The timer/counter remains usable without login — auth is additive, not gating.

## Architecture Overview

```
meet-tab/
├── .env.local              # MongoDB URI, JWT secret
├── next.config.ts
├── package.json            # Next.js replaces Vite
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout with AuthProvider
│   │   ├── page.tsx        # Main MeetTab page (no auth required)
│   │   ├── login/page.tsx  # Login page
│   │   ├── register/page.tsx # Register page
│   │   ├── presets/page.tsx  # Saved presets (auth required)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts  # POST /api/auth/register
│   │       │   ├── login/route.ts     # POST /api/auth/login
│   │       │   └── me/route.ts        # GET /api/auth/me
│   │       └── presets/
│   │           ├── route.ts           # GET (list), POST (create)
│   │           └── [id]/route.ts      # PUT (update), DELETE (delete)
│   ├── components/         # Existing + new auth components
│   │   ├── AttendeeManager.tsx  # (existing)
│   │   ├── CostDisplay.tsx      # (existing)
│   │   ├── CurrencyToggle.tsx   # (existing)
│   │   ├── TimerControls.tsx    # (existing)
│   │   ├── AuthNav.tsx          # Login/Logout/User display
│   │   ├── LoginForm.tsx        # Login form
│   │   ├── RegisterForm.tsx     # Register form
│   │   └── PresetManager.tsx    # Save/load/delete presets
│   ├── contexts/
│   │   └── AuthContext.tsx      # Auth state provider
│   ├── data/roles.ts            # (existing — no change)
│   ├── hooks/
│   │   ├── useAttendees.ts      # (existing — no change)
│   │   └── useTimer.ts          # (existing — no change)
│   ├── lib/
│   │   ├── db.ts                # MongoDB connection (Mongoose)
│   │   ├── models/
│   │   │   ├── User.ts          # User model
│   │   │   └── Preset.ts        # Preset model
│   │   └── auth.ts              # JWT sign/verify helpers, password hashing
│   └── types/
│       └── attendee.ts          # (existing — no change)
```

## Data Models

### User (MongoDB)
```typescript
{
  _id: ObjectId,
  email: string,        // unique, indexed
  passwordHash: string, // bcrypt
  name: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Preset (MongoDB)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,      // ref → User, indexed
  name: string,          // e.g., "Sprint Planning"
  attendees: [           // embedded
    { name: string, roleId: string }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/presets` | Yes | List user's presets |
| POST | `/api/presets` | Yes | Create preset |
| PUT | `/api/presets/[id]` | Yes | Update preset |
| DELETE | `/api/presets/[id]` | Yes | Delete preset |

JWT stored in an httpOnly cookie (`token`) for security.
Access token: 15 min expiry. Optional refresh token: 7 day expiry.

## Auth Flow

1. User registers at `/register` → POST `/api/auth/register` → creates User doc, returns JWT cookie
2. User logs in at `/login` → POST `/api/auth/login` → verifies password, returns JWT cookie
3. AuthContext checks `/api/auth/me` on mount to restore session from cookie
4. Protected API routes verify JWT from cookie via middleware/helper
5. Logout clears the cookie

## UI Changes

### AuthNav (always visible in top bar)
- When logged out: "Login" / "Register" links
- When logged in: user name + "Logout" button + "Presets" link

### Main page (`/`) — unchanged
- Timer/counter works without login (as before)
- Attendee list has a "Save as Preset" button (visible only when logged in)
- "Load Preset" dropdown (visible only when logged in)

### Login page (`/login`)
- Email + password form → redirects to `/` on success

### Register page (`/register`)
- Name + email + password form → redirects to `/` on success

### Presets page (`/presets`) — auth required
- List of saved presets with name, attendee count, role summary
- Load: applies preset attendees to the main page
- Delete: removes preset
- Clicking a preset navigates to `/` with attendees loaded

## Implementation Phases

### Phase 1: Next.js Migration + MongoDB setup
1. Install Next.js, React 19 (compatible), Mongoose, bcryptjs, jsonwebtoken
2. Create `next.config.ts`, update `package.json` scripts
3. Move `index.html` → `src/app/layout.tsx` (root layout)
4. Move `src/App.tsx` → `src/app/page.tsx` (home page)
5. Move `src/main.tsx` entry → Next.js convention
6. Update `tsconfig.json` for Next.js
7. Create `src/lib/db.ts` — Mongoose connection
8. Verify build works (`next build`)

### Phase 2: Auth backend
9. Create `src/lib/models/User.ts`
10. Create `src/lib/auth.ts` — JWT helpers
11. Create `POST /api/auth/register`
12. Create `POST /api/auth/login`
13. Create `GET /api/auth/me`
14. Create `src/contexts/AuthContext.tsx`

### Phase 3: Auth UI
15. Create `LoginForm.tsx` + `/login` page
16. Create `RegisterForm.tsx` + `/register` page
17. Create `AuthNav.tsx`
18. Wire AuthNav into root layout

### Phase 4: Presets
19. Create `src/lib/models/Preset.ts`
20. Create preset API routes (GET, POST, PUT, DELETE)
21. Create `PresetManager.tsx` — save/load UI
22. Wire into main page

### Phase 5: Cleanup
23. Remove Vite config (`vite.config.ts`)
24. Remove `tsconfig.app.json`, `tsconfig.node.json`
25. Update `SPEC.md`
26. Full build verification

## Dependencies to Install

```bash
npm install next@latest mongoose bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

## Dependencies to Remove

```bash
npm uninstall vite @vitejs/plugin-react @tailwindcss/vite
```
Tailwind v4 has a Next.js plugin (`@tailwindcss/postcss`) we'll use instead.

## .env.local

```
MONGODB_URI=mongodb://localhost:27017/meet-tab
JWT_SECRET=<random-64-char-hex>
```
