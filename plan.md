# Plan: User Profile Settings (Edit Name, Change Password, Upload Avatar)

## Files to create
1. `public/uploads/` — directory for uploaded avatar images (dir + .gitkeep, gitignored)
2. `src/app/api/auth/profile/route.ts` — PUT handler for profile updates
3. `src/app/api/auth/avatar/route.ts` — POST handler for avatar upload
4. `src/components/UserMenu.tsx` — dropdown/modal for profile editing

## Files to modify
5. `src/lib/models/User.ts` — add optional `image` field to schema
6. `src/contexts/AuthContext.tsx` — add `image` to AuthUser, add `updateUser` method
7. `src/app/api/auth/me/route.ts` — include `image` in response
8. `src/components/NavBar.tsx` — replace static user pill with UserMenu
9. `.gitignore` — add `public/uploads/`

## Detailed steps

### 1. User model — add `image` field
- Add `image?: string` to IUser interface
- Add to schema: `{ type: String, default: "" }`

### 2. AuthContext — add `image` and `updateUser`
- AuthUser gets `image?: string`
- `updateUser(partial)` merges into local user state (no DB call needed; APIs already persist)
- login/register responses don't include image yet (new users have none)
- `/api/auth/me` returns image

### 3. API: GET /api/auth/me — include image
- Add `image` to the `.select()` and response

### 4. API: PUT /api/auth/profile — update name + password
- Auth required
- Accept: `{ name?, currentPassword?, newPassword? }`
- If name: update User.name
- If password: verify currentPassword, hash newPassword, update
- Return updated user object

### 5. API: POST /api/auth/avatar — upload image
- Auth required
- Accept FormData with `file` field
- Validate: image/png, image/jpeg, image/webp; max 2MB
- Write to `public/uploads/<userId>-<timestamp>.ext`
- Update user.image with path like `/uploads/<filename>`
- Delete old avatar file if exists
- Return `{ image: "/uploads/..." }`

### 6. UserMenu component
- Replaces the user pill in NavBar
- Click pill → opens a popover/dropdown panel anchored below
- Panel contents:
  - Avatar section: shows current avatar (or initials fallback), "Change Photo" button (file input)
  - Name field: editable text input, pre-filled with current name
  - Change Password section (collapsible): current password, new password, confirm new password
  - Save button + Cancel button
  - Feedback: success/error message
- On save:
  - If name changed: PUT /api/auth/profile
  - If password changed: PUT /api/auth/profile with password fields
  - If avatar changed: POST /api/auth/avatar first, then update local state
  - Call updateUser() to refresh context

### 7. NavBar changes
- Import UserMenu instead of rendering user pill directly
- UserMenu handles its own open/close state
- Desktop: UserMenu sits in the same position as current pill
- Mobile drawer: user info area also opens UserMenu on tap

### 8. .gitignore
- Add `public/uploads/` so uploaded images aren't committed

## Styling
- Dark theme consistent with existing UI (bg-slate-800 panels, white text, primary blue accents)
- Avatar upload: circular preview with camera/edit overlay on hover
- Password section: collapsible via details/summary or state toggle
- Save button: primary blue; Cancel: secondary gray
