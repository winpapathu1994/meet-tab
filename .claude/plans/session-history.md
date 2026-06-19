# Session History Feature — Implementation Plan

## Overview
Save meeting sessions to MongoDB when the user ends a meeting, and display past sessions in a modern history page.

---

## 1. New Mongoose Model: `SessionHistory`

**File:** `src/lib/models/SessionHistory.ts`

Schema fields:
- `userId` — ObjectId ref → User, indexed
- `sessionName` — string (from URL param or auto-generated like "Session — Jun 19, 2026")
- `attendees` — array of `{ name, roleId, hourlyRate }` (same shape as `IAttendeeEntry`)
- `totalCostMMK` — number (final cost in MMK at time of ending)
- `elapsedSeconds` — number (total elapsed time)
- `currency` — string ("MMK" | "USD" | "SGD")
- Timestamps: `createdAt` (when session ended), `updatedAt`

Follows existing singleton pattern: `mongoose.models.SessionHistory ?? mongoose.model(...)`

---

## 2. API Routes

### `POST /api/sessions` — Save a completed session
- Auth guard → `getCurrentUserId()`
- Body: `{ sessionName, attendees, totalCostMMK, elapsedSeconds, currency }`
- Creates a `SessionHistory` document
- Returns the saved session

### `GET /api/sessions` — List user's session history
- Auth guard
- Returns sessions sorted by `createdAt` descending
- Lean query for performance

### `DELETE /api/sessions/[id]` — Delete a session record
- Auth guard
- Verifies ownership (userId matches)
- Deletes and returns `{ ok: true }`

---

## 3. UI: "End Meeting" button in TimerControls

- New prop: `onEndMeeting` callback
- Shows `End Meeting` button (red/danger style) when state is `running` or `paused`
- Also remains visible when `running` so user can end directly (no need to pause first)

---

## 4. UI: Meet page — handle end-meeting flow

- `handleEndMeeting` callback:
  1. Compute final cost: `(totalRatePerHour / 3600) * elapsed`
  2. POST to `/api/sessions`
  3. Reset timer (`reset()`)
  4. Show a toast/success indicator (or just navigate)
- Pass `onEndMeeting` to both instances of `TimerControls`

---

## 5. UI: Session History page (`/history`)

**File:** `src/app/history/page.tsx`

Modern card-based dark-themed design:
- Header: "Session History" title
- Each session card shows:
  - **Left:** Date (formatted), session name
  - **Center:** Duration (formatted as `Xh Ym Zs`), attendee count
  - **Right:** Total cost (formatted with currency), delete button
- Cards have hover effects (subtle border glow / bg shift)
- Expandable rows OR inline detail showing attendee breakdown
- Empty state illustration when no sessions exist
- Loading skeleton while fetching

### Attendee breakdown (expand on click):
- List each attendee with their role and hourly rate
- Show per-attendee cost contribution

---

## 6. NavBar: Add "History" tab

- Add `{ label: "History", href: "/history" }` to TABS array
- Active state highlights when on `/history`

---

## Files to create (4 new)
1. `src/lib/models/SessionHistory.ts`
2. `src/app/api/sessions/route.ts` — POST + GET
3. `src/app/api/sessions/[id]/route.ts` — DELETE
4. `src/app/history/page.tsx`

## Files to modify (3 existing)
5. `src/components/TimerControls.tsx` — add `onEndMeeting` prop + button
6. `src/app/meet/page.tsx` — handle end-meeting + pass prop
7. `src/components/NavBar.tsx` — add History tab

---

## Edge cases covered
- End with zero attendees → allow, save with empty attendees array
- End while paused → works; uses current elapsed time
- Delete session → confirmation dialog (reuse existing ConfirmDialog pattern)
- Auth guard on history page → redirect to `/` if not logged in
- API errors → caught in try/catch, return 500
