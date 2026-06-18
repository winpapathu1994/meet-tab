"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  // Redirect to /meet if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/meet");
    }
  }, [loading, user, router]);

  // Show spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Already authenticated — render nothing while redirecting
  if (user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setErrorCode(undefined);
    setBusy(true);
    const result = await register(name, email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      setErrorCode(result.code);
    } else {
      router.push("/meet");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 gap-8">
      <Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold text-white">Register</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
      >
        <div>
          <label className="block text-sm text-slate-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            placeholder="your name"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <div className="text-sm">
            <p className="text-red-400">{error}</p>
            {errorCode === "email_exists" && (
              <p className="text-slate-400 mt-1">
                Already have an account?{" "}
                <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                  Login here
                </Link>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-colors"
        >
          {busy ? "Creating account…" : "Register"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
