---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
## Lily — Team Lead at a Yangon software firm

Runs daily standups, sprint plannings, and retrospectives with 5–10 people. Her team is talented but meetings drift long. She's tried saying "let's wrap up" — it doesn't stick. She needs something that makes the cost *visible* without making it *personal*.

<!-- 20s -->

---

<!-- slide 2 -->
# Their problem
## Meetings have invisible costs — but naming real salaries is awkward

- **No one sees the meter running.** A 45-minute meeting with 5 people costs real money, but the number never appears on screen. People check Slack, discussions wander, and no one feels the burn rate ticking.

- **Existing cost-timer tools ask for real salaries.** Typing "Alice = $45/hr, Bob = $62/hr" into a shared screen is a privacy disaster. Lily won't do it. Her team won't either.

*Lily needs a projector-friendly timer that uses impersonal market-rate presets, persists her setup, and shares with a link — without exposing anyone's pay.*

<!-- 20s -->

---

<!-- slide 3 -->
# What I built
## MeetTab — a privacy-first meeting cost timer

1. **Login with JWT** — register, sign in, session persists for 7 days
2. **Customize roles at `/roles`** — Myanmar market presets (Junior Dev MMK 3,500/hr → Manager MMK 12,000/hr), fully CRUD-editable
3. **Name your attendees** — Alice (Senior Dev), Bob (Junior Dev), Carol (Manager) via a modern role picker
4. **Save & reuse sessions** — one click saves to MongoDB; reload from `/presets` next sprint
5. **Hit Start** — giant projector-readable cost counter ticks every second

<!-- 20s -->

---

<!-- slide 4 -->
# How I built it
**MCP — context7** (`.mcp.json`)
Fetches up-to-date Next.js, React, Tailwind, and Mongoose docs during development. Every API route, hook, and component was generated against the *current* framework APIs — no hallucinated imports or deprecated patterns.
**Skill — role-preset** (`.claude/skills/role-preset/SKILL.md`)
Teaches Claude the Myanmar tech market: role titles, hourly rates in MMK, and CBM exchange rates for USD/SGD. Used whenever generating role data, seed scripts, or cost-calc logic. Keeps every rate consistent across the codebase.
**Agent — cost-calculator** (`.claude/agents/cost-calculator.md`)
A Haiku-powered subagent that takes a role list, computes total hourly cost, converts currencies, and generates shareable URL param strings. Called by the timer display and copy-link flow — small, focused, composable.

<!-- 20s -->

---

<!-- slide 5 -->
# Why it matters
## From "let's wrap up" to "look at the number"
- 🧠 **Behavioral economics on a projector.** The cost counter is a nudge, not a policy. No one is named-and-shamed — the total just *exists*, large and undeniable, on the wall. Meetings naturally shorten.
- 🔒 **Privacy-first by design.** Market-rate role presets mean you never type a real salary. The app shows only the total — never per-person. Attendees are named, but their rates are role-based, not salary-based.
- 🇲🇲 **Built for Myanmar.** Role presets reflect Yangon tech sector reality. MMK is the default currency with CBM-official USD/SGD conversions. No foreign-centric assumptions baked in.
> *"That meeting cost us MMK 52,400. Next one, let's aim for 30."*

<!-- 20s -->

---

<!-- slide 6 -->
# Done checklist
- [ ] repo public — https://github.com/winpapathu1994/meet-tab
- [ ] MCP + skill + agent used — context7, role-preset, cost-calculator
- [ ] report.md in team repo — REPORT.md with methodology, evidence, and artifact paths
- [ ] JWT auth (register, login)
- [ ] Role CRUD with Myanmar market presets
- [ ] Named attendees with modern role picker
- [ ] Timer state machine (start / pause / resume / reset)
- [ ] Projector-optimized display (giant text, dark theme)
- [ ] Meeting sessions persisted to MongoDB (save / load / reuse / delete)
- [ ] Currency toggle (MMK ↔ USD ↔ SGD, CBM rates)

