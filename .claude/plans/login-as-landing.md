# Plan: Login as Landing Page (No Anonymous Access)

## Routing Changes

| Before | After | Content |
|--------|-------|---------|
| `/` | `/` | **Login page** (was timer page) |
| `/login` | — | **Removed** — redirects to `/` |
| `/register` | `/register` | Register page (unchanged) |
| — | `/meet` | **Timer + attendees** (was `/`) — auth-gated |

## What Needs to Change

### 1. Move files
- `src/app/page.tsx` → `src/app/meet/page.tsx` (the timer/attendees page)
- `src/app/login/page.tsx` content → `src/app/page.tsx` (login becomes landing)

### 2. New: `src/app/meet/page.tsx`
- Same content as old home page
- Add auth guard: if `loading` is false and `user` is null → redirect to `/`
- Show loading spinner while auth state is resolving

### 3. Update: `src/app/page.tsx` (new login landing)
- Same content as old `/login/page.tsx`
- Update redirect after login: `router.push("/meet")`

### 4. Update: `src/app/register/page.tsx`
- Update redirect after register: `router.push("/meet")`

### 5. Delete: `src/app/login/page.tsx`
- No longer needed — login is the landing page

### 6. Update: `src/app/layout.tsx`
- AuthNav already present — no change needed
- Remove the Login/Register links from AuthNav since `/` is already login
- AuthNav on `/meet` shows: user name + logout

### 7. Update: `src/components/AuthNav.tsx`
- Remove Login/Register links (landing page handles auth)
- When logged out: show nothing (user is on `/` which is login page)
- When logged in: show user name + Presets link + Logout

### 8. Authentication middleware (optional, client-side guard instead)
- `/meet/page.tsx` checks `{ user, loading }` from `useAuth()`
- If not loading and no user → `router.replace("/")`

## Flow

```
User opens / → sees login form → enters credentials → redirects to /meet → sees timer + attendees
                                                                               ↓
                                                                        [Logout] → / (login page)
```
