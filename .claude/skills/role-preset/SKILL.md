---
name: role-preset
description: Estimate hourly rates for tech roles in the Myanmar market (Yangon-based). Use when selecting roles in MeetTab to calculate meeting cost.
---

# Role Preset — Myanmar Tech Market Rates (Yangon)

## When to apply

Use these rates whenever the user is selecting participant roles in MeetTab and wants to calculate the total cost of a meeting. Apply the default currency (MMK) unless the user requests conversion to another currency.

## Role rates (MMK/hr)

All rates are in Myanmar Kyat (MMK) per hour, based on the current Yangon tech market.

| Role              | Hourly Rate (MMK) |
|-------------------|--------------------|
| Junior Dev        | 3,500              |
| Senior Dev        | 8,000              |
| Manager           | 12,000             |
| Designer (UI/UX)  | 5,000              |
| QA / Tester       | 3,000              |
| DevOps            | 9,000              |

## Default currency

**MMK (Myanmar Kyat)** is the default currency for all calculations.

## Currency conversion

Exchange rates are sourced from the **Central Bank of Myanmar (CBM)** — Market Trading Rate: <https://forex.cbm.gov.mm/>

> **Last updated:** 18-06-2026 (rates are static for this skill; re-fetch from CBM to refresh)

| From | To  | CBM Market Trading Rate |
|------|-----|--------------------------|
| MMK  | USD | 1 USD = 3,658.00 MMK     |
| MMK  | SGD | 1 SGD = 1,653.00 MMK     |

### Conversion formulas

- **MMK → USD**: `total_mmk / 3658.00` (round to 2 decimal places)
- **MMK → SGD**: `total_mmk / 1653.00` (round to 2 decimal places)

### Quick-reference table (per-role rates in other currencies)

| Role              | MMK/hr | USD/hr (approx) | SGD/hr (approx) |
|-------------------|--------|------------------|------------------|
| Junior Dev        | 3,500  | $0.96            | S$2.12           |
| Senior Dev        | 8,000  | $2.19            | S$4.84           |
| Manager           | 12,000 | $3.28            | S$7.26           |
| Designer (UI/UX)  | 5,000  | $1.37            | S$3.02           |
| QA / Tester       | 3,000  | $0.82            | S$1.81           |
| DevOps            | 9,000  | $2.46            | S$5.45           |

## Output format

When calculating meeting cost, return the result in this format:

```
Meeting Cost Summary
--------------------
Participants:
  - <Role> × <count>: <rate> MMK/hr each = <subtotal> MMK/hr
  ...
Total hourly cost: <total> MMK/hr
[If converted: ≈ <amount> <target_currency>/hr]
```

### Example

User selects: 2 Senior Devs, 1 Manager, 1 Designer for a meeting.

Output:

```
Meeting Cost Summary
--------------------
Participants:
  - Senior Dev × 2: 8,000 MMK/hr each = 16,000 MMK/hr
  - Manager × 1: 12,000 MMK/hr each = 12,000 MMK/hr
  - Designer × 1: 5,000 MMK/hr each = 5,000 MMK/hr
Total hourly cost: 33,000 MMK/hr
```

If user requests USD:

```
Total hourly cost: 33,000 MMK/hr ≈ $9.02 USD/hr
```
