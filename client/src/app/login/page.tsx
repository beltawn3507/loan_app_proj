"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AlertBanner } from "@/components/alert-banner";
import { useAuth } from "@/hooks/use-auth";
import { roleHomePaths } from "@/lib/auth-context";
import { getApiErrorMessage } from "@/lib/api";

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, status, user } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [name, setName] = useState(""); // optional (only if backend supports)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [nextPath] = useState(() =>
    typeof window === "undefined"
      ? ""
      : new URLSearchParams(window.location.search).get("next") ?? ""
  );

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(nextPath || roleHomePaths[user.role]);
    }
  }, [nextPath, router, status, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const currentUser =
        mode === "login"
          ? await login(email, password)
          : await signup(email, password);

      if (!currentUser) {
        setError("No active session returned from the backend.");
        return;
      }

      router.replace(nextPath || roleHomePaths[currentUser.role]);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm">
        
        {/* Toggle */}
        <div className="mb-6 flex rounded-xl bg-slate-200 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`w-1/2 rounded-lg py-2 text-sm font-semibold ${
              mode === "login" ? "bg-white shadow" : ""
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`w-1/2 rounded-lg py-2 text-sm font-semibold ${
              mode === "signup" ? "bg-white shadow" : ""
            }`}
          >
            Signup
          </button>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Loan Management System
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          {status === "loading" ? (
            <p className="mt-2 text-sm text-slate-500">Checking saved session...</p>
          ) : null}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Name only for signup */}
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              required
            />
          </div>

          {error ? <AlertBanner message={error} /> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting
              ? "Processing..."
              : mode === "login"
              ? "Login"
              : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}
