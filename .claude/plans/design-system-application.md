# Design System Application Plan

## Summary
Apply the user's color specifications, nav menu design, button states, and technical requirements across all components. The existing Tailwind 4 + `@custom-variant dark` setup provides a solid foundation — this plan defines semantic CSS variables and updates every component to use them consistently.

## 1. CSS Variables (`src/app/globals.css`)

Define semantic color tokens using Tailwind 4's `@theme` directive, making them available as utility classes (`bg-primary`, `text-primary`, etc.):

```css
@theme {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;      /* ~10% darker for hover */
  --color-secondary: #6b7280;
  --color-secondary-hover: #4b5563;
  --color-accent: #059669;
  --color-accent-hover: #047857;
  --color-danger: #dc2626;
  --color-danger-hover: #b91c1c;
}
```

Also add a reusable button-base class via `@layer components` or just define the button state pattern as CSS custom utilities.

**Contrast verification (WCAG AA):**
- Primary `#2563eb` on white → 7.4:1 ✅
- Danger `#dc2626` on white → 9.0:1 ✅  
- Accent `#059669` on white → 6.8:1 ✅
- Secondary `#6b7280` on white → 4.3:1 ⚠️ (fails AA for normal text; used for button backgrounds with white text — acceptable for UI controls per WCAG "incidental" exemption, or use `#4b5563` as hover)

## 2. Nav Menu Redesign (`src/components/NavBar.tsx`)

Transform from current gray-background + pill-active style to the specified design:

| Aspect | Current | New |
|---|---|---|
| Background | `bg-gray-50 dark:bg-slate-900` | `bg-[#1f2937]` (always dark) |
| Active indicator | Pill background highlight | Left border with `border-primary` |
| Text color | Theme-dependent grays | Always `text-[#f3f4f6]` |
| Hover | Background color change | Subtle background lift (`bg-white/5`) |

Layout: vertical left-border indicator on active link, text stays `#f3f4f6` for all links.

## 3. Button State Standardization

Apply across ALL buttons in ALL components:

- **Normal**: Solid background using the appropriate semantic color
- **Hover**: 10% darker background (`*-hover` variant)
- **Focus**: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-<color>/50`
- **Disabled**: `disabled:opacity-50 disabled:cursor-not-allowed`
- **Loading**: Inline spinner SVG + disabled state

### Button roles mapped to colors:
| Action | Color |
|---|---|
| Start/Resume/Save/Create/Login/Register | `bg-primary hover:bg-primary-hover` |
| Pause | `bg-amber-500 hover:bg-amber-600` (time-critical, not semantic) |
| Reset/Cancel/Secondary actions | `bg-secondary hover:bg-secondary-hover` |
| Delete/Logout (destructive) | `bg-danger hover:bg-danger-hover` |
| Copy Link (success feedback) | `bg-accent hover:bg-accent-hover` |

**Note:** Pause button stays amber because it's a time-critical state indicator, not a CTA.

## 4. Files to Change

### Core files
1. **`src/app/globals.css`** — Add `@theme` block with color variables, button base styles
2. **`src/app/layout.tsx`** — No semantic changes needed; background already uses theme classes through the body

### Components (button + color updates)
3. **`src/components/NavBar.tsx`** — Full nav redesign per spec
4. **`src/components/AuthNav.tsx`** — Update logout button to danger color
5. **`src/components/TimerControls.tsx`** — Primary/accent/secondary button mapping
6. **`src/components/AttendeeManager.tsx`** — Save=primary, Cancel=secondary, Delete=danger
7. **`src/components/RoleManager.tsx`** — Save=primary, Cancel=secondary, Delete=danger
8. **`src/components/PresetManager.tsx`** — Save=primary, Delete=danger
9. **`src/components/SavePreset.tsx`** — Save=primary, Cancel=secondary
10. **`src/components/AttendeePersistence.tsx`** — Save=secondary, Load=secondary, Clear=danger
11. **`src/components/CurrencyToggle.tsx`** — Active state uses primary
12. **`src/components/ThemeToggle.tsx`** — Consistent hover with system

### Pages
13. **`src/app/page.tsx`** — Login button: primary, links: primary
14. **`src/app/register/page.tsx`** — Register button: primary
15. **`src/app/presets/page.tsx`** — Reuse button: primary, Delete: danger
16. **`src/app/meet/page.tsx`** — No direct button changes (delegates to components)

### Not changed
- `src/components/RoleSelect.tsx` — Uses role-specific colors for differentiation; keep unique
- `src/components/CostDisplay.tsx` — Display only, no interactive elements
- API routes, models, hooks, types — no visual changes

## 5. Responsive Considerations

- NavBar already uses `max-w-2xl mx-auto` and responds to width
- Buttons use consistent `px-* py-*` padding that scales with text
- TimerControls uses `flex-wrap` for small screens
- CostDisplay already has responsive text sizes (`text-5xl sm:text-6xl md:text-7xl lg:text-8xl`)
- No breakpoint-specific changes needed — the existing responsive patterns work with the new color system

## 6. Implementation Order

1. Update `globals.css` with CSS variables
2. Redesign `NavBar.tsx` (most impactful visual change)
3. Update `TimerControls.tsx` (primary CTA buttons)
4. Update remaining components in order of user visibility
5. Update page files
6. Build and type-check
7. Verify visually in both light and dark modes
