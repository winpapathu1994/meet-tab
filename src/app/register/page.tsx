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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin" />
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent">Meet</span>
          <span className="font-light tracking-tighter">Tab</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Create an account</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4"
      >
        <div>
          <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="your name"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <div className="text-sm">
            <p className="text-red-400">{error}</p>
            {errorCode === "email_exists" && (
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Already have an account?{" "}
                <Link href="/" className="text-primary hover:text-primary-hover underline underline-offset-2">
                  Login here
                </Link>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="group relative w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary via-blue-500 to-cyan-400 hover:from-primary-hover hover:via-blue-600 hover:to-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400 text-white font-semibold tracking-wide transition-all duration-300 shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 active:shadow-sm"
        >
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative">{busy ? "Creating account…" : "Register"}</span>
        </button>

        <p className="text-center text-sm text-slate-400 dark:text-slate-500">
          Already have an account?{" "}
          <Link href="/" className="text-primary hover:text-primary-hover">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
}
