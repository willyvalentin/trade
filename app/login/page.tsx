"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(result?.error || "Invalid password");
      }

      router.replace("/");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Invalid password",
      );
    }

    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060707] px-5 py-10 text-zinc-100">
      <section className="w-full max-w-sm">
        <div className="mb-8 space-y-4 text-center">
          <div className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <span>Private app</span>
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span>Protected</span>
          </div>
          <div>
            <h1 className="font-mono text-5xl font-semibold tracking-normal text-white">
              Trade
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Enter the app password to continue.
            </p>
          </div>
        </div>

        <form
          onSubmit={submitPassword}
          className="space-y-4 rounded-lg border border-white/10 bg-white/[0.03] p-5"
        >
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Enter Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
              className="min-h-12 w-full rounded-md border border-white/10 bg-[#0b0d0d] px-4 font-mono text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-300"
              placeholder="Password"
            />
          </label>

          {error && (
            <p className="text-sm leading-6 text-amber-200" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {isSubmitting ? "Entering..." : "Enter Trade"}
          </button>
        </form>
      </section>
    </main>
  );
}
