
# Meeting Cost Live Counter (MeetTab) — Report

github_username: winpapathu1994
personal_repo_url: https://github.com/winpapathu1994/meet-tab.git
project_summary: A privacy-first meeting cost timer with JWT authentication and MongoDB — CRUD roles, manage named attendees, save/reuse meeting sessions, share links (public view-only), session history, dark/light mode, modern card-based UI.
slides_url: slides/pitch.md

## Methodology
MeetTab was built using a project-based approach, committing after each feature was complete. Development followed a clear sequence — role preset data, timer logic, URL sharing, projector UI, auth system, MongoDB persistence, role CRUD, meeting sessions, navigation, modern UI redesign, session history, public share links, light mode support.

## Evidence — Claude Code usage

### MCP
- path: .mcp.json
- what: context7 — fetches up-to-date React, Next.js, and Tailwind documentation so Claude Code generates accurate, version-correct code throughout the project

### Skill
- path: .claude/skills/role-preset/SKILL.md
- what: teaches Claude how to estimate market hourly rates per role for the Myanmar tech market, with support for multiple currencies (MMK, USD, SGD) and CBM official exchange rates

### Agent
- path: .claude/agents/cost-calculator.md
- what: takes a list of roles as input, calculates total hourly meeting cost, and generates a shareable URL param string (`?r=...&n=...&name=...`) for the meeting config

## Recent Updates

### Session History
- New `SessionHistory` Mongoose model stores completed meeting records (session name, attendees, total cost, elapsed time, currency)
- End Meeting button saves session to MongoDB and navigates to `/history`
- Card-based timeline UI with expandable attendee breakdown, per-person cost, and delete functionality
- Role labels resolved via dual-lookup (API roles + static ROLES)

### Public Share Links
- Share URLs (`?r=junior:2,senior:1&n=Alice,Bob`) work without login — guest gets view-only mode
- "View-only mode" amber badge with eye icon for guest users
- Guests can view attendees, toggle currency, and copy link; cannot edit, start, end, or save
- AttendeeManager and TimerControls accept `readOnly` prop to conditionally hide controls

### Modern UI Redesign
- Complete visual overhaul of all pages: meet, roles, presets, history
- Card-based layouts with rounded-2xl, borders, shadows, hover lifts
- Gradient brand text in NavBar ("Meet" in blue gradient, "Tab" lightweight)
- Color-coded role icons (emerald, amber, violet, pink, cyan, orange) across all components
- SVG icons throughout (no emoji), smooth transitions, toast animations
- Roles page: 2-column responsive grid with color accent cards
- Presets page: amber date badges, expandable attendee details, role summary chips
- History page: gray date badges, cost display, per-attendee breakdown
- Meet page: clean card-based setup view, hero projector display

### Light Mode Support
- ThemeContext manages dark/light state persisted to localStorage
- All components use `dark:` Tailwind variants for theme-aware styling
- NavBar: white background in light mode, dark in dark mode
- Pages use unified `bg-slate-50 dark:bg-slate-950` background
- Role icons use opaque colors for readability on white backgrounds

### Role Label Display
- Dual-lookup `roleLabel()` helper: API roles by `_id` first, then static ROLES by short `id`
- Used consistently across history, presets, and AttendeeManager
- No raw `roleId` (ObjectId or short ID) shown to users anywhere
