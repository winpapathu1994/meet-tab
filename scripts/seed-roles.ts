/**
 * One-shot seeder: inserts the default roles into MongoDB.
 * Run with: npx tsx scripts/seed-roles.ts
 *
 * Requires MONGODB_URI in the project's .env (or .env.local).
 * Idempotent — skips roles that already exist by label.
 */

import mongoose from "mongoose";
import { Role } from "../src/lib/models/Role";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Load it from .env or .env.local.");
  process.exit(1);
}

interface SeedRole {
  label: string;
  hourlyRate: number;
}

const ROLES: SeedRole[] = [
  { label: "Junior Dev",     hourlyRate: 3500 },
  { label: "Senior Dev",     hourlyRate: 8000 },
  { label: "Manager",        hourlyRate: 12000 },
  { label: "Designer (UI/UX)", hourlyRate: 5000 },
  { label: "QA / Tester",    hourlyRate: 3000 },
  { label: "DevOps",         hourlyRate: 9000 },
];

async function seed(): Promise<void> {
  console.log(`Connecting to ${process.env.MONGODB_URI!.replace(/\/\/.*@/, "//***@")} …`);
  await mongoose.connect(process.env.MONGODB_URI!);

  let created = 0;
  let skipped = 0;

  for (const r of ROLES) {
    const existing = await Role.findOne({ label: r.label });
    if (existing) {
      console.log(`  ⏭  "${r.label}" already exists — skipping`);
      skipped++;
      continue;
    }
    await Role.create(r);
    console.log(`  ✅ "${r.label}" @ ${r.hourlyRate.toLocaleString()} MMK/h`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
