"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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
    <main className="ture-login-page">
      <div className="ture-login-pattern" aria-hidden="true" />
      <section className="ture-login-shell" aria-labelledby="ture-login-title">
        <div className="ture-login-brand">
          <Image
            src="/trade-assets/ture-logo-vertical.svg"
            alt="TURE"
            width={138}
            height={136}
            priority
            className="ture-login-brand__vertical-logo"
          />
          <h1 id="ture-login-title" className="ture-login-brand__sr-title">
            TURE
          </h1>
          <p>Trade Unlimiting Recommendation Engine</p>
        </div>

        <form onSubmit={submitPassword} className="ture-login-card">
          <label className="ture-login-field">
            <span>Enter Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoFocus
              required
              placeholder="Enter username"
              aria-label="Enter username"
            />
          </label>

          <label className="ture-login-field">
            <span>Enter Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="Enter password"
              aria-label="Enter password"
            />
          </label>

          {error && (
            <p className="ture-login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="ture-login-button"
          >
            {isSubmitting ? "Logging In" : "Log In"}
          </button>
        </form>
      </section>
    </main>
  );
}
