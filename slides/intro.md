<!--
  Marp template — "editorial-light"
  Copy into your repo (e.g. slides/intro.md), replace content.
  Render:  marp slides/intro.md -o slides.html   (or .pdf / .png)
-->
---
marp: true
paginate: true
size: 16:9
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500;700&display=swap');
:root { --bg:#fbfaf7; --ink:#1a1a1a; --muted:#6b6b6b; --accent:#4338ca; --line:#e7e3da; --code:#f3f0e9; }
section {
  background:var(--bg); color:var(--ink);
  font-family:'Inter','Noto Sans','Pyidaungsu',sans-serif;
  font-size:27px; line-height:1.55; padding:60px 80px;
}
h1,h2,h3 { font-family:'Source Serif 4',Georgia,serif; }
h1 { color:#cdcfd1; font-weight:700; border-bottom:2px solid var(--line); padding-bottom:.2em; }
h2 { color:var(--accent); font-weight:600; }
h3 { color:#cdcfd1; }
strong { color:var(--accent); }
a { color:var(--accent); text-decoration:underline; text-underline-offset:3px; }
code { background:var(--code); color:#9a3412; padding:.06em .35em; border-radius:4px; font-family:ui-monospace,monospace; }
pre  { background:#1f1d1a; border-radius:8px; }
pre code { background:none; color:#f4efe7; }
blockquote { border-left:3px solid var(--accent); background:#f5f3ef; color:var(--muted); padding:.5em 1em; font-style:italic; }
table th { background:#f3f0e9; color:var(--accent); }
table td, table th { border-color:var(--line); }
header,footer,section::after { color:var(--muted); font-size:.5em; }
section.cover { background:var(--bg); }
section.cover h1 { border-bottom:none; font-size:2.4em; line-height:1.1; }
section.cover h2 { color:var(--muted); font-weight:400; font-family:'Inter',sans-serif; }
section.lead { background:#f5f3ef; }
section.lead h1 { border-bottom:none; }
</style>

<!-- _class: cover -->

# MeetTab

## Meeting Cost Live Counter — see what your meetings really cost

**Your Name** · @winpapathu1994 · vibecode.tours

---

# What it is

- **Problem:** Meetings feel free, but every minute has a real cost tied to attendee roles and rates
- **Who it's for:** Team leads, project managers, and anyone who wants to make meetings more intentional
- **What it does well:** A privacy-first live cost ticker on a projector — uses role-based market rate presets instead of anyone's actual salary

---

# Key Features

- ⏱️ **Real-time cost ticker** — updates every second, projector-friendly with digit-flash animation
- 👥 **Role-based rates** — 6 built-in Myanmar market rate presets + full CRUD for custom roles
- 🔗 **URL share links** — encode config in query params, viewable without login
- 💾 **Preset sessions** — save and restore common attendee configurations
- 📜 **Session history** — completed meetings saved with cost, duration, and attendee breakdown
- 💱 **Multi-currency** — MMK, USD, and SGD with live toggle

---

# How it works

```bash
git clone https://github.com/winpapathu1994/meet-tab.git
cd meet-tab && npm install
cp .env.local.example .env.local   # set MONGODB_URI + JWT_SECRET
npx tsx scripts/seed-roles.ts      # seed default roles
npm run dev
```

Stack: **Next.js 16 · React 19 · TypeScript 5.8 · Tailwind 4 · MongoDB 9** · built with Claude Code

---

# Architecture

- **App Router** — pages and API routes in `src/app/`
- **JWT auth** — httpOnly cookies, bcryptjs password hashing, 7-day token expiry
- **Mongoose 9** — singleton connection cache, models for User, Role, Preset, SessionHistory
- **Three custom hooks** — `useAttendees()` (CRUD + URL sync), `useRoles()` (API + fallback), `useTimer()` (state machine)
- **Dark mode default** — persisted to localStorage via ThemeContext

---

<!-- _class: lead -->

# Demo Screenshots

<div align="center">

### 🔐 Login Page
![screenshot 1 — Login Page](/public/screenshots/01.png)

### 👥 Meeting Setup - Attendee Management
![screenshot 2 — Meeting Setup](/public/screenshots/02.png)

### ⏱️ Live Meeting Timer - Projector View
![screenshot 3 — Live Timer](/public/screenshots/03.png)

### 📊 Role Management
![screenshot 4 — Role Management](/public/screenshots/04.png)

### 💾 Preset Sessions
![screenshot 5 — Preset Sessions](/public/screenshots/05.png)

### 📜 Session History
![screenshot 6 - Session History](/public/screenshots/06.png)

### 🔗  Shared Link
![screenshot 7 - Shared Link](/public/screenshots/07.png)


</div>

# Links

- **Live:** https://meet-tab.vercel.app
- **Repo:** https://github.com/winpapathu1994/meet-tab
- **License:** MIT License, copyrighted by winpapathu1994 (2026).
