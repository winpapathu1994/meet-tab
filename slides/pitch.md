---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?

Engineering managers, team leads, and project managers who run frequent meetings with mixed-role teams — and have no idea how much those meetings actually cost.

Think: a standup with 2 seniors, 1 manager, and a designer burns **33,000 MMK/hr**. A sprint planning that runs 90 minutes? Nearly **50,000 MMK** — gone.

---

<!-- slide 2 -->
# Their problem
- **Meetings are expensive, but invisible.** There's no running tally of what a meeting costs as it happens.
- **No accountability.** When a 30-minute sync balloons to 90 minutes, nobody sees the financial impact.
- **Hard to share context.** Inviting a stakeholder to "just observe" a meeting config requires onboarding them to a tool.
- **Role rates vary wildly.** A junior dev and a manager don't cost the same — but most timers treat everyone equally.

---

<!-- slide 3 -->
# What I built

**MeetTab** — a real-time meeting cost tracker.
- Add attendees by **name + role** (6 built-in roles or create custom roles)
- A **live timer** with start, pause, resume, end — cost ticks up every second
- **Projector view** with giant cost display for the meeting room screen
- **Currency toggle** (MMK / USD / SGD) so international teams can relate
- **Share links** — copy a URL, anyone can view the config in read-only mode without logging in
- **Presets** — save common team setups, reuse them in one click
- **Session history** — every ended meeting is recorded with attendees, duration, and total cost
- **User profiles** with avatar upload and password management

---

<!-- slide 4 -->
# How I built it

- **Next.js 16** App Router with TypeScript — all pages and API routes in `src/app/`
- **MongoDB + Mongoose 9** — models for Users, Roles, Presets, SessionHistory, AttendeeSessions
- **JWT auth** via httpOnly cookies with bcryptjs password hashing
- **Tailwind CSS 4** — no component library, all custom UI with card-based design, dark mode default
- **Three custom hooks**: `useAttendees` (CRUD + URL sync), `useRoles` (API + static fallback), `useTimer` (state machine)
- **URL param encoding** — roles and names encoded as `?r=junior:2,senior:1&n=Alice,Bob` for shareable links
- Built entirely with **Claude Code** — MCP, skills, and agents for development workflow

---

<!-- slide 5 -->
# Why it matters

- **Transparency.** When the cost display ticks past 10,000 MMK, people wrap up faster.
- **No setup friction.** Share a link, anyone can see the config — no account needed.
- **Repeatable.** Save your "Sprint Planning" preset, load it every Monday in one click.
- **Data-driven.** Session history lets you spot patterns — which meetings run long, which teams cost most.
- **Works everywhere.** Dark mode for late-night planning, projector mode for the conference room, mobile-responsive for on-the-go.

---

<!-- slide 6 -->
# Done checklist

- [x] Next.js 16 full-stack app with MongoDB backend
- [x] JWT auth, user profiles, avatar upload
- [x] Real-time cost timer with projector view
- [x] Share links with guest read-only access
- [x] Presets and session history
- [x] Custom role management
- [x] Multi-currency support (MMK / USD / SGD)
- [x] Dark mode, responsive, modern card UI
