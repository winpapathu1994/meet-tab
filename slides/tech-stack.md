<!--
  Marp slide deck — Tech Stack for MeetTab
  Render:  marp slides/tech-stack.md -o slides.html
-->
---
marp: true
paginate: true
size: 16:9
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500;700&display=swap');
:root { --bg:#0c0a1d; --ink:#e8e4f0; --muted:#9b93b0; --accent:#a78bfa; --line:#2a2545; --code:#1a1636; --card:#15122a; --glow:rgba(167,139,250,0.12); }
section {
  background:var(--bg); color:var(--ink);
  font-family:'Inter','Noto Sans','Pyidaungsu',sans-serif;
  font-size:27px; line-height:1.55; padding:60px 80px;
}
h1,h2,h3 { font-family:'Source Serif 4',Georgia,serif; }
h1 { color:#f0ecfa; font-weight:700; border-bottom:2px solid var(--line); padding-bottom:.2em; }
h2 { color:var(--accent); font-weight:600; }
h3 { color:#c4b5fd; }
strong { color:#c4b5fd; }
a { color:var(--accent); text-decoration:underline; text-underline-offset:3px; }
code { background:var(--code); color:#c4b5fd; padding:.06em .35em; border-radius:4px; font-family:ui-monospace,monospace; }
pre  { background:#0f0d24; border:1px solid var(--line); border-radius:8px; font-size:.85em; }
pre code { background:none; color:#e8e4f0; }
blockquote { border-left:3px solid var(--accent); background:var(--glow); color:var(--muted); padding:.5em 1em; font-style:italic; }
table th { background:var(--card); color:var(--accent); }
table td { background:var(--card); color:var(--ink); }
table td, table th { border-color:var(--line); }
header,footer,section::after { color:var(--muted); font-size:.5em; }
section.cover { background:linear-gradient(160deg,#0c0a1d 0%,#1a1240 50%,#0c0a1d 100%); }
section.cover h1 { border-bottom:none; font-size:2.4em; line-height:1.1; }
section.cover h2 { color:var(--muted); font-weight:400; font-family:'Inter',sans-serif; }
section.lead { background:linear-gradient(160deg,#15122a 0%,#1e1845 100%); }
section.lead h1 { border-bottom:none; }
</style>

<!-- _class: cover -->

# How MeetTab is Built

## Tech stack, AI tooling, and the workflow behind a real-time meeting cost counter

**by winpapathu1994** 

---

<!-- _class: lead -->

# Tech Stack

The foundation — what powers MeetTab end to end.

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 16 (App Router) | Server components + API routes in one project |
| **UI** | React 19 + TypeScript 5.8 | Strict types, latest concurrent features |
| **Styling** | Tailwind CSS 4 | CSS-first config, no `tailwind.config.ts` |
| **Database** | MongoDB + Mongoose 9 | Flexible schema, fast iteration, singleton cache |
| **Auth** | JWT + bcryptjs | httpOnly cookies, 7-day expiry, zero middleware overhead |
| **Hosting** | Vercel | Zero-config deploys, edge-ready |

- **No component library** — every UI element is hand-crafted with Tailwind
- **Path alias** `@/` → `src/` keeps imports clean across 60+ files

---

<!-- _class: lead -->

# Agents

Claude Code agents — specialized subroutines for focused tasks.

### `cost-calculator`

Runs on **Haiku** — lightweight and fast for arithmetic.

```
Read + Skill → roles lookup → math → output
```

- Looks up role hourly rates (MMK base)
- Applies currency conversion (USD, SGD) from CBM rates
- Returns total hourly cost, cost per second, and URL param string
- Zero UI — purely computational, invoked by `useTimer()`

> Agents handle the work that's **too specific** for the general model
> but **too important** to get wrong.

---

<!-- _class: lead -->

# Skills

Reusable knowledge packs — inject domain expertise into any prompt.


### `role-preset`

A structured data skill that encodes Myanmar tech market rates.

| Role | MMK/hr |
|------|--------|
| Junior Dev | 3,500 |
| Senior Dev | 8,000 |
| Manager | 12,000 |
| Designer | 5,000 |
| QA / Tester | 3,000 |
| DevOps | 9,000 |

- Rates sourced from Yangon market data
- Currency conversion baked in (MMK → USD @ 3,658, MMK → SGD @ 1,653)
- **Why skills matter:** they turn a generic model into one that knows *your* domain

---

<!-- _class: lead -->

# Methodology

**AI-assisted pair programming** — human directs, Claude Code executes.

### The loop

```
Read ─► Think ─► Act ─► Verify
```

Every change goes through: understand the code, decide the approach,
make the edit, prove it builds.

### Decision tree

| Situation | Path |
|-----------|------|
| Simple, obvious change | Direct code edit |
| Needs domain knowledge | Invoke **skill** → apply rates, data |
| Complex computation | Spawn **agent** → get structured output |
| Multi-step orchestration | **Workflow** → pipeline or parallel fan-out |

### Guardrails

- **Build must pass** before any work is considered done
- **Skills** are passive — inject context when relevant, never execute
- **Agents** are active — execute and return results
- **Human stays in the loop** — reviews, directs, approves

---

<!-- _class: lead -->

# Trigger

When does Claude Code act — and when does it step back?

### How Claude Code decides what to do

| Trigger | Action |
|---------|--------|
| `/` command | Invokes a skill directly (e.g. `/role-preset`) |
| Question in chat | General reasoning, no tool needed |
| File edit request | Read → Edit → verify with build |
| "find bugs" / "review" | Spawns agents for parallel analysis |
| Error message | Parses stack trace, suggests or applies fix |
| Git operation | Runs `git` commands, opens PRs |

### The key principle

> **Minimal intervention.** Only reach for tools when the task benefits from them.
> A single-line fix gets a direct edit. A cross-cutting concern gets a workflow.

---

<!-- _class: lead -->

# Commands

The actual commands — what powers the dev workflow.

### Dev workflow

```bash
npm run dev          # Turbopack dev server on :3000
npm run build        # TypeScript check + production build
npm start            # Production server
npx tsx scripts/seed-roles.ts   # Seed MongoDB with default roles
```

### Claude Code operations

```bash
# File operations
Read file.ts        # Read any file in the repo
Edit file.ts        # Targeted string replacement
Write file.ts       # Full file write (new or overwrite)

# Git
git commit -m "msg" # Standard workflow
gh pr create        # Open pull requests

# Testing / validation
npm run build       # Type-check must pass
```

### The contract

> **Build must pass before work is considered done.** No exceptions.

---

<!-- _class: lead -->

# Summary

| Concept | What it does |
|---------|-------------|
| **Tech Stack** | Next.js 16 · React 19 · Tailwind 4 · MongoDB 9 |
| **Agents** | Haiku-powered cost calculator for math |
| **Skills** | Domain knowledge (Myanmar market rates) |
| **Methodology** | Read → think → act → verify |
| **Trigger** | Tools only when the task benefits from them |
| **Commands** | `npm run dev/build/start` + Claude Code file ops |

> **Built with Claude Code** — AI-assisted development that stays grounded
> in the actual codebase.

---

# Links

- **Live:** https://meet-tab.vercel.app
- **Repo:** https://github.com/winpapathu1994/meet-tab
- **Slides:** `slides/tech-stack.md`
