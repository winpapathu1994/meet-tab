# Plan: Replace localStorage with MongoDB for Attendee CRUD

## Decisions

- **Only logged-in users** persist to MongoDB. Anonymous users keep attendees in
  React state only (lost on refresh unless URL has `?r=...` role counts).
- **Explicit Save/Load** — attendees live in React state until the user clicks
  "Save" to persist to MongoDB, or "Load" to restore. No auto-sync.
- PresetManager stays as a separate "named templates" feature.

## Data Model

### AttendeeSession (MongoDB)
One document per user storing their single "current session" attendee list.
Replaces on each save — always exactly one document per user.

```typescript
{
  _id: ObjectId,
  userId: ObjectId,  // ref → User, unique index
  attendees: [{ name: string, roleId: string }],
  updatedAt: Date
}
```

## API Routes

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/attendees` | Yes | Load the user's saved attendee list |
| PUT | `/api/attendees` | Yes | Save (upsert) the user's attendee list |
| DELETE | `/api/attendees` | Yes | Clear the user's saved attendee list |

Single-document-per-user pattern — no `[id]` routes needed.
PUT upserts (creates if not exists, replaces if exists).

## Files to Create / Modify

### New: `src/lib/models/AttendeeSession.ts`
Mongoose model — userId (unique), attendees array, timestamps.

### New: `src/app/api/attendees/route.ts`
- `GET` — returns the user's saved session
- `PUT` — upserts the user's attendee list
- `DELETE` — removes the saved session

### Modify: `src/hooks/useAttendees.ts`
- Remove localStorage persistence (`loadFromStorage`, `saveToStorage`, `clearStorage`)
- Keep URL param sync (for sharing)
- Init: parse URL → empty if nothing
- Keep `replaceAttendees` (used by PresetManager and Load button)

### New: `src/components/AttendeePersistence.tsx`
Save/Load/Clear buttons for logged-in users:
- **💾 Save** — sends current attendees to `PUT /api/attendees` (disabled if no attendees)
- **📂 Load** — fetches from `GET /api/attendees` and calls `replaceAttendees`
- **🗑️ Clear** — deletes saved session from DB
- Success/error feedback with brief toast
- Only renders when user is logged in

### Modify: `src/app/page.tsx`
- Add `AttendeePersistence` component between `AttendeeManager` and `TimerControls`
- Pass `attendees` and `replaceAttendees` as props

## UI Flow (logged-in setup view)

```
┌──────────────────────────────┐
│         MeetTab              │
│  [Login] [Register]    [MMK] │
│                              │
│  ┌─── AttendeeManager ─────┐ │
│  │ Alice  Senior Dev  8K/hr│ │
│  │ Bob    Junior Dev  3.5K │ │
│  │ [+ Add Attendee]        │ │
│  │ 2 people · MMK 11,500/hr│ │
│  └──────────────────────────┘ │
│                              │
│  [💾 Save] [📂 Load] [🗑️]   │  ← NEW: AttendeePersistence
│                              │
│  💾 Save as Preset  (named)  │  ← Existing PresetManager
│                              │
│      [Start Meeting]         │
└──────────────────────────────┘
```

## Anonymous User Flow (unchanged)

- Add attendees → live in React state only
- Refresh → attendees reset to URL params (role counts if shared, else empty)
- No Save/Load buttons shown
- Copy Link still works (encodes role counts)
