---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
theme: default
style: |
  section {
    background: #0f172a;
    color: #e2e8f0;
    font-family: 'Inter', 'Segoe UI', sans-serif;
  }
  h1 { color: #38bdf8; font-size: 2.4em; }
  h2 { color: #7dd3fc; font-size: 1.6em; }
  strong { color: #fbbf24; }
  code { color: #a78bfa; background: #1e293b; padding: 2px 8px; border-radius: 6px; }
  table { font-size: 0.85em; }
  th { background: #1e293b; color: #38bdf8; }
  td { border-color: #334155; }
  section.problem td { color: #0f172a; background: #f1f5f9; }
  section.problem td strong { color: #dc2626; }
  section.howibuilt td { color: #0f172a; background: #f1f5f9; }
  section.howibuilt td strong { color: #1d4ed8; }
  section.whyitmatters td { color: #0f172a; background: #f1f5f9; }
  section.whyitmatters td strong { color: #1d4ed8; }
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->

Engineering managers, team leads, and project managers who run frequent meetings with mixed-role teams — and have no idea how much those meetings actually cost.

<br>

> A standup with 2 seniors + 1 manager + 1 designer
> burns **33,000 MMK/hr**. A 90-min sprint planning?
> Nearly **50,000 MMK** — gone.

---

<!-- slide 2 -->
<!-- _class: problem -->
# Their problem

| Pain | Impact |
|------|--------|
| 💸 **Invisible costs** | No running tally of what a meeting costs |
| ⏰ **Time creep** | 30-min sync balloons to 90 min — nobody sees it |
| 🔢 **Equal treatment** | Junior & manager billed at the same "free" rate |

---

<!-- slide 3 -->
# What I built

**MeetTab** — a real-time meeting cost tracker you can project on the wall.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Add people  │ ──▶ │  Start timer │ ──▶ │  Cost ticks up  │
│  by name +   │     │  on projector│     │  every second    │
│  role        │     │  view        │     │  in real time    │
└─────────────┘     └──────────────┘     └─────────────────┘
```

- 👥 **Role-based rates** — 6 built-in roles + custom ones
- 🔗 **Share links** — anyone can view, no login needed
- 💾 **Presets** — save your team, reuse in one click
- 📜 **History** — every session recorded with cost & duration

---

<!-- slide 4 -->
<!-- _class: howibuilt -->
# How I built it

| Layer | Stack |
|-------|-------|
| **Frontend** |  React 19 · Tailwind CSS 4 |
| **Backend** | Next.js 16 · API Routes |
| **Database** | MongoDB · Mongoose 9 |
| **Auth** | JWT cookies · bcryptjs · httpOnly |

- **MCP**: Context7 — documentation lookups during development
- **Skill**: `role-preset` — managing role presets and attendee configs
- **Agent**: `cost-calculator` — real-time cost calculation logic

---

<!-- slide 5 -->
<!-- _class: whyitmatters -->
# Why it matters

| Benefit | How |
|---------|-----|
| 🔍 **Transparency** | Cost display past 10K MMK → people wrap up faster |
| 🚀 **Zero friction** | Share a link — no account needed to view |
| 🔁 **Repeatable** | Save "Sprint Planning" preset, load every Monday |
| 📊 **Data-driven** | Session history reveals which meetings run long |
| 🌐 **Works everywhere** | Dark mode · light mode · mobile responsive |

> **"When you make the cost visible, behavior changes."**

---

<!-- slide 6 -->
# Done checklist

- [x] repo public
- [x] MCP + skill + agent used
- [x] report.md in team repo
- [x] Real-time cost timer + projector view
- [x] JWT auth + user profiles + avatars
- [x] Share links (guest read-only)
- [x] Presets + session history
- [x] Custom roles + multi-currency support
> ⚠️ **Known Limitation**: Avatar upload uses local storage — doesn't work
> on Vercel. Needs migration to **Cloudinary** or **AWS S3**.
