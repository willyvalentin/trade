"use client";

import { useMemo, useState } from "react";
import {
  buildAvanzaExecutionSettingsProfile,
  type AvanzaExecutionCustomerType,
  type AvanzaExecutionSettingsProfile,
} from "@/lib/avanza-execution-settings-profile";

type AvanzaExecutionSettingsProfilePanelProps = {
  initialCustomerType?: AvanzaExecutionCustomerType;
  initialUsernameReferenceConfigured?: boolean;
  initialPasswordReferenceConfigured?: boolean;
  title?: string;
};

function formatBoolean(value: boolean) {
  return value ? "yes" : "no";
}

function customerTypeLabel(value: AvanzaExecutionCustomerType) {
  if (value === "private") return "Privat";
  if (value === "company") return "Företag";
  return "Not selected";
}

function buildModeledCredentialProviderState(
  usernameConfigured: boolean,
  passwordConfigured: boolean,
) {
  return {
    canBypassBankId: false,
    canExportSession: false,
    canLogCredentialMaterial: false,
    canReadCookies: false,
    canReadCredentialMaterial: false,
    canReturnCredentialMaterial: false,
    canStoreCredentialMaterial: false,
    canStoreCredentialInSupabase: false,
    controlsEnabled: false,
    gateLocked: true,
    kind: "macos_keychain",
    passwordAvailable: passwordConfigured,
    providerAvailable: true,
    providerEnabled: true,
    status:
      usernameConfigured && passwordConfigured ? "ready" : "configured",
    usernameConfigured,
  };
}

function buildProfile(
  customerType: AvanzaExecutionCustomerType,
  usernameConfigured: boolean,
  passwordConfigured: boolean,
) {
  return buildAvanzaExecutionSettingsProfile({
    credentialProviderState: buildModeledCredentialProviderState(
      usernameConfigured,
      passwordConfigured,
    ),
    credentialStorageKind: "macos_keychain",
    customerType,
    loginMethod: "username_password",
    localDevOnly: true,
    passwordConfigured,
    profileEnabled: true,
    profileId: "ture-settings-avanza-execution-profile",
    usernameConfigured,
    warnings: [
      "Settings UI models credential references only and never reads credential material.",
    ],
  });
}

function ProfileDetail({
  label,
  value,
}: {
  label: string;
  value: string | boolean;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-zinc-200">
        {typeof value === "boolean" ? formatBoolean(value) : value}
      </dd>
    </div>
  );
}

function SafetyPill({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
      {children}
    </span>
  );
}

export function AvanzaExecutionSettingsProfilePanel({
  initialCustomerType = "unknown",
  initialUsernameReferenceConfigured = false,
  initialPasswordReferenceConfigured = false,
  title = "Avanza Execution Profile",
}: AvanzaExecutionSettingsProfilePanelProps) {
  const [customerType, setCustomerType] =
    useState<AvanzaExecutionCustomerType>(initialCustomerType);
  const [usernameReferenceConfigured, setUsernameReferenceConfigured] =
    useState(initialUsernameReferenceConfigured);
  const [passwordReferenceConfigured, setPasswordReferenceConfigured] =
    useState(initialPasswordReferenceConfigured);
  const profile = useMemo<AvanzaExecutionSettingsProfile>(
    () =>
      buildProfile(
        customerType,
        usernameReferenceConfigured,
        passwordReferenceConfigured,
      ),
    [customerType, passwordReferenceConfigured, usernameReferenceConfigured],
  );

  return (
    <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
            Ture Settings Avanza profile panel
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Passive settings UI only. Choose Privat or Företag and model
            whether secure credential references exist. No raw username field,
            no raw password field, no credential material shown, and no login
            or smoke test runs from Settings.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-black/25 px-3 py-1.5 font-mono text-xs font-bold uppercase text-zinc-200">
          {profile.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "Passive settings UI only",
          "No raw username field",
          "No raw password field",
          "No credential material shown",
          "No password storage",
          "No Supabase credential storage",
          "No localStorage credential storage",
          "No Keychain access from UI",
          "No smoke test from UI",
          "No login from UI",
          "No browser automation",
          "No API route call",
          "No order submission",
          "Final KÖP/SÄLJ human-only",
          "Not production ready",
        ].map((copy) => (
          <SafetyPill key={copy}>{copy}</SafetyPill>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="grid gap-4">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Account type
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                ["private", "Privat"],
                ["company", "Företag"],
              ].map(([value, label]) => (
                <button
                  className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    customerType === value
                      ? "border-cyan-200/50 bg-cyan-200/15 text-cyan-50"
                      : "border-white/10 bg-black/25 text-zinc-300 hover:border-white/25"
                  }`}
                  key={value}
                  onClick={() =>
                    setCustomerType(value as AvanzaExecutionCustomerType)
                  }
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className="mt-2 min-h-10 w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:border-white/25"
              onClick={() => setCustomerType("unknown")}
              type="button"
            >
              Not selected
            </button>
          </div>

          <label className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-4 py-3">
            <span className="text-sm text-zinc-300">
              Username reference configured
            </span>
            <input
              checked={usernameReferenceConfigured}
              className="h-4 w-4 shrink-0 accent-cyan-200"
              onChange={(event) =>
                setUsernameReferenceConfigured(event.target.checked)
              }
              type="checkbox"
            />
          </label>

          <label className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-4 py-3">
            <span className="text-sm text-zinc-300">
              Password reference configured
            </span>
            <input
              checked={passwordReferenceConfigured}
              className="h-4 w-4 shrink-0 accent-cyan-200"
              onChange={(event) =>
                setPasswordReferenceConfigured(event.target.checked)
              }
              type="checkbox"
            />
          </label>
        </div>

        <dl className="grid gap-2 sm:grid-cols-2">
          <ProfileDetail label="Account type" value={customerTypeLabel(profile.customerType)} />
          <ProfileDetail label="Login method" value="Username/password only" />
          <ProfileDetail label="BankID" value="Forbidden / Manual-action only" />
          <ProfileDetail label="Credential provider" value="macOS Keychain" />
          <ProfileDetail
            label="Username reference configured"
            value={profile.usernameConfigured}
          />
          <ProfileDetail
            label="Password reference configured"
            value={profile.passwordConfigured}
          />
          <ProfileDetail label="Profile readiness" value={profile.label} />
          <ProfileDetail label="Credential material" value="never shown" />
          <ProfileDetail label="Password" value="never stored" />
          <ProfileDetail
            label="Supabase credential storage"
            value="forbidden"
          />
          <ProfileDetail
            label="localStorage credential storage"
            value="forbidden"
          />
          <ProfileDetail
            label="Smoke test"
            value="terminal-only, not run from UI"
          />
          <ProfileDetail label="Order submission" value="not available" />
          <ProfileDetail label="Final KÖP/SÄLJ" value="human-only" />
        </dl>
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        The toggles represent modeled credential reference readiness only. They
        are not credential inputs and do not read or write Keychain,
        localStorage credential material, Supabase credentials, cookies,
        sessions, browser state, or orders.
      </p>
    </section>
  );
}
