import { clearTokenCookie, jsonResponse } from "@/lib/auth";

export async function POST() {
  await clearTokenCookie();
  return jsonResponse({ ok: true });
}
