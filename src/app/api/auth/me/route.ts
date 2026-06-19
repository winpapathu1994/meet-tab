import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ user: null });
    }

    await connectDB();

    const user = await User.findById(userId).select("name email image");
    if (!user) {
      return jsonResponse({ user: null });
    }

    return jsonResponse({
      user: { id: user._id, name: user.name, email: user.email, image: user.image || "" },
    });
  } catch (error) {
    console.error("Me error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
