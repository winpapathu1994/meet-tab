export interface Attendee {
  id: string;
  name: string;
  roleId: string;
  hourlyRate: number;
}

/** Convert attendees array to role-id → count (for URL sharing) */
export function toRoleCounts(
  attendees: Attendee[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const a of attendees) {
    counts[a.roleId] = (counts[a.roleId] ?? 0) + 1;
  }
  return counts;
}

/** Encode attendee names for URL transport — compressed: empty names omitted with ":" */
export function encodeNames(attendees: Attendee[]): string {
  return attendees.map((a) => a.name || "").join(",");
}

/** Decode names from URL — returns array of names in order */
export function decodeNames(raw: string): string[] {
  if (!raw) return [];
  return raw.split(",");
}

/** Create unnamed attendees from role-id → count (for loading from URL) */
export function fromRoleCounts(
  counts: Record<string, number>,
  names?: string[],
): Attendee[] {
  const attendees: Attendee[] = [];
  let idx = 0;
  for (const [roleId, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i++) {
      attendees.push({
        id: crypto.randomUUID(),
        name: names?.[idx] ?? "",
        roleId,
        hourlyRate: 0, // resolved from roles at display time for URL-loaded attendees
      });
      idx++;
    }
  }
  return attendees;
}
