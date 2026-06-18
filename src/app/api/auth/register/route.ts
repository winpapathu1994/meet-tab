import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { hashPassword, jsonResponse, setTokenCookie, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return jsonResponse({ error: "Email, password, and name are required" }, 400);
    }

    if (password.length < 6) {
      return jsonResponse({ error: "Password must be at least 6 characters" }, 400);
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return jsonResponse({ error: "An account with this email already exists", code: "email_exists" }, 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
    });

    const token = signToken({ userId: user._id.toString() });
    await setTokenCookie(token);

    return jsonResponse({
      user: { id: user._id, name: user.name, email: user.email },
    }, 201);
  } catch (error) {
    console.error("Register error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
