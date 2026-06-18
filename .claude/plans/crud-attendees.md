# Plan: CRUD Attendees for MeetTab

## Problem

Currently the app only supports anonymous role counts (e.g., "Junior Dev ×2"). The user wants full CRUD (Create, Read, Update, Delete) for individual named attendees, so they can track who is in the meeting.

## Design Decisions

### Data Model

```typescript
interface Attendee {
  id: string;      // crypto.randomUUID()
  name: string;    // e.g., "Alice"
  roleId: string;  // references ROLES[i].id
}
```

### URL Sharing Strategy

- **URL encodes role counts only** (`?r=junior:2,senior:1`) — backward compatible
- **Names are local-only** — preserves privacy; you wouldn't want names in a shareable URL
- When loading from a shared URL, role counts are pre-filled as unnamed attendees
- This matches the SPEC requirement: "privacy-first"

### Total Rate Calculation

Change from `roleCount[roleId] * rate` to `sum of each attendee's role rate`. Same math, different source of truth.

## Files to Create

### 1. `src/types/attendee.ts`
- `Attendee` interface
- `AttendeeRoleCounts` helper to convert attendees → role counts (for URL sharing)

### 2. `src/hooks/useAttendees.ts`
- CRUD functions: `addAttendee(name, roleId)`, `updateAttendee(id, updates)`, `deleteAttendee(id)`
- Derives `roleCounts` from attendees for URL sync
- Initializes from URL params (creates unnamed attendees matching role counts)
- State: `attendees: Attendee[]`

### 3. `src/components/AttendeeManager.tsx`
- Displays attendee list grouped by role or flat list
- "Add Attendee" button opens inline form
- Inline form: name input + role dropdown + "Add" / "Cancel" buttons
- Each attendee row: name, role badge, hourly rate, edit (✏️) and delete (🗑️) buttons
- Edit mode: inline edit replaces the row with the form
- Footer: total people + total rate/hr
- Matches existing dark theme (slate-900 bg, slate-700 borders, etc.)

## Files to Modify

### 4. `src/App.tsx`
- Replace `useUrlParams()` with `useAttendees()`
- Calculate `totalRatePerHour` from attendees array instead of roleCounts
- Pass `AttendeeManager` instead of `RoleSelector` in the idle view
- Pass `hasRoles` based on `attendees.length > 0`

### 5. `src/hooks/useUrlParams.ts`
- Keep for URL role-count encoding/decoding (used by useAttendees internally)
- Or: fold its logic directly into useAttendees

### 6. `src/components/RoleSelector.tsx`
- **Remove** — replaced by `AttendeeManager`

## UI Flow

### Setup View (idle)
```
┌──────────────────────────────┐
│         MeetTab              │
│                              │
│  ┌──────── ATTENDEES ──────┐│
│  │ Alice  Senior Dev  8K/hr││  ← edit/delete buttons
│  │ Bob    Junior Dev  3.5K ││
│  │ Carol  Manager    12K   ││
│  │                          ││
│  │ [+ Add Attendee]        ││
│  │                          ││
│  │ 3 people · MMK 23,500/hr││  ← footer summary
│  └──────────────────────────┘│
│                              │
│      [Start Meeting]         │
│      [📋 Copy Link]          │
└──────────────────────────────┘
```

### Add/Edit Form (inline)
```
┌─ Name: [___________] ──────┐
│  Role: [Junior Dev  ▾]     │
│  [Cancel] [Save]           │
└────────────────────────────┘
```

### Projector View (running/paused)
- No change — shows total cost and timer only

## Implementation Order

1. Create `src/types/attendee.ts` — data types
2. Create `src/hooks/useAttendees.ts` — CRUD logic + URL sync
3. Create `src/components/AttendeeManager.tsx` — UI
4. Modify `src/App.tsx` — wire it all together
5. Remove `src/components/RoleSelector.tsx` (or keep as unused)
6. Test: `npm run dev` and verify all flows
