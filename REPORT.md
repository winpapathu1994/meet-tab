
# Meeting Cost Live Counter (MeetTab) — Report

github_username: winpapathu1994
personal_repo_url: https://github.com/winpapathu1994/meet-tab.git
project_summary: A privacy-first meeting cost timer with JWT authentication and MongoDB — CRUD roles, manage named attendees, save/reuse meeting sessions, and share links using Myanmar market rate presets.
slides_url: slides/pitch.md

## Methodology
MeetTab was built using a project-based approach, committing after each feature was complete. Development followed a clear sequence — role preset data, timer logic, URL sharing, projector UI, auth system, MongoDB persistence, role CRUD, meeting sessions, and navigation.

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
