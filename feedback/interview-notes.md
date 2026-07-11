# User Interview — MeetTab

- **Who:** Ko Pyone Cho
- **When:** 1 July 2026
- **How:** Live app testing at meet-tab.vercel.app — ~20 min 

- **Who:** Win Theint Theint Thu
- **When:** 5 July 2026
- **How:**  In Person — ~15 min



## What they do today (without your project)

- Track meeting costs manually after meetings using spreadsheets or manual calculations.
- Estimate meeting expenses when preparing reports rather than monitoring costs in real time.
- Keep role-based hourly rates in internal documents or spreadsheets.
- Do not have live visibility into the total meeting cost or each participant's cost contribution during the meeting.

## What they liked

- **Dark UI is projector-friendly** — the large cost display and high contrast work well on a big screen
- **Share links are frictionless** — anyone can open a link and see the meeting cost without creating an account
- **Presets save real time** — saving "Sprint Planning" and loading it every Monday eliminates repetitive setup
- **Role color coding** — the visual distinction between roles makes the attendee list scannable at a glance

## What confused them / what's missing

- **No onboarding** — first-time users didn't know roles were editable or that the currency toggle existed. They had to be told.
- **Mobile layout breaks** — attendee cards overflow on small screens, making the app unusable on phones
- **No export** — they want CSV/PDF of meeting history for weekly reports and invoicing. It doesn't exist yet.
- **Cost is total only** — they want to see per-role breakdown (e.g. "Senior Dev: 16,000 MMK, Manager: 12,000 MMK") not just the aggregate

## What would make them actually use it

**Automate meeting tracking** — Allow the timer to start automatically from Slack, Microsoft Teams, Discord, or calendar events instead of requiring users to start it manually.
- **Per-role cost breakdown** — show who's costing what, not just the total
- **Mobile-friendly** — they want to check meeting cost from their phone during standups, not just from a projector
- **Export for reporting** — CSV or PDF of session history for management reports

## What I'll change (next steps)

- [x] Prevent attendee cards from overflowing and optimize the timer view for mobile devices. — **Fixed with Claude Code agent**
- [x] Add CSV/PDF export to the History page — **Fixed with Claude Code agent**
- [x] Add first-time user onboarding (tooltip walkthrough or empty-state guidance) — **Fixed with Claude Code agent**
- [x] Consider per-role cost breakdown in projector view — **Fixed with Claude Code agent**
