"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApplicationLogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to sign out");
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("We could not sign you out. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="trade-logout-control">
      <button
        type="button"
        onClick={signOut}
        className="trade-topbar-link"
        disabled={isSigningOut}
        aria-busy={isSigningOut}
      >
        {isSigningOut ? "Signing out…" : "Log out"}
      </button>
      {error && (
        <p className="trade-logout-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
