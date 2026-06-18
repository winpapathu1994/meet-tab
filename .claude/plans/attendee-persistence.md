# Plan: Attendee Persistence + Meeting View Polish

## Problem 1: Attendee names lost on refresh

Currently `useAttendees` only encodes **role counts** in the URL (`?r=junior:2,senior:1`).
Full attendee data (including names) is lost on page refresh because names
are intentionally excluded from the shareable URL.

**Fix:** Add localStorage as a persistence layer for full attendee data.
- On every change (add/update/delete/replace), save the full attendee array
  to `localStorage` under the key `meet-tab-attendees`
- On init, check localStorage first; if present, use it. Otherwise fall back
  to URL params (for shared links).
- localStorage always wins over URL params — if a shared link is opened,
  the unnamed attendees from URL are used unless there's already saved data.
  Actually: if there's no localStorage data, populate from URL, then save
  to localStorage so names can be added and they stick.

## Problem 2: Login visible during meeting

AuthNav is already in the root layout, so Login/Register links are on every
page including the projector (meeting) view. This works.

One tweak: make AuthNav slightly more visible by using a pill/badge style
instead of just small text links — so it catches the eye during a meeting.

## Problem 3: Share link works without account

Already works. The share URL only encodes role counts (`?r=...`), no auth
required to copy or open it. No changes needed.

## Files to change

### 1. `src/hooks/useAttendees.ts`
- Add `STORAGE_KEY = "meet-tab-attendees"`
- Add `loadFromStorage(): Attendee[] | null`
- Add `saveToStorage(attendees: Attendee[]): void`
- Init: try localStorage → fallback to URL params → save to localStorage
- Sync on every mutation

### 2. `src/components/AuthNav.tsx`
- Slightly bolder styling: background pill for Login/Register buttons
  so they're more visible against the dark projector background
