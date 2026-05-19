"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type UserSettingsRow = {
  id: string | number;
  created_at: string | null;
  updated_at: string | null;
  portfolio_size: number | string | null;
  risk_per_trade_percent: number | string | null;
  max_recommendations_per_session: number | string | null;
  max_open_positions: number | string | null;
  preferred_timeframe: string | null;
  long_only: boolean | null;
};

type SettingsForm = {
  portfolioSize: string;
  riskPerTradePercent: string;
  maxRecommendationsPerSession: string;
  maxOpenPositions: string;
  preferredTimeframe: string;
  longOnly: boolean;
};

type ScheduledScanRun = {
  id: string | number;
  created_at: string | null;
  scan_date: string | null;
  session_type: string | null;
  status: string | null;
  recommendations_created: number | string | null;
  message: string | null;
};

type MarketStatus = {
  isOpenDay: boolean;
  reason: string;
  date: string;
  dayType: "trading_day" | "weekend" | "holiday" | "early_close" | "unknown";
  marketOpenTime: string | null;
  marketCloseTime: string | null;
  provider: string;
  fromCache: boolean;
};

const emptyForm: SettingsForm = {
  portfolioSize: "",
  riskPerTradePercent: "",
  maxRecommendationsPerSession: "",
  maxOpenPositions: "",
  preferredTimeframe: "",
  longOnly: true,
};

const defaultSettingsRow = {
  portfolio_size: 100000,
  risk_per_trade_percent: 0.5,
  max_recommendations_per_session: 5,
  max_open_positions: 5,
  preferred_timeframe: "1–5 days",
  long_only: true,
};

function toForm(row: UserSettingsRow): SettingsForm {
  return {
    portfolioSize: String(row.portfolio_size ?? ""),
    riskPerTradePercent: String(row.risk_per_trade_percent ?? ""),
    maxRecommendationsPerSession: String(
      row.max_recommendations_per_session ?? "",
    ),
    maxOpenPositions: String(row.max_open_positions ?? ""),
    preferredTimeframe: row.preferred_timeframe ?? "",
    longOnly: row.long_only ?? true,
  };
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateSettings(form: SettingsForm) {
  const portfolioSize = parseNumber(form.portfolioSize);
  const riskPerTradePercent = parseNumber(form.riskPerTradePercent);
  const maxRecommendationsPerSession = parseNumber(
    form.maxRecommendationsPerSession,
  );
  const maxOpenPositions = parseNumber(form.maxOpenPositions);

  if (portfolioSize === null || portfolioSize <= 0) {
    return "Portfolio size must be greater than 0.";
  }

  if (
    riskPerTradePercent === null ||
    riskPerTradePercent <= 0 ||
    riskPerTradePercent > 5
  ) {
    return "Risk per trade must be greater than 0 and no more than 5%.";
  }

  if (
    maxRecommendationsPerSession === null ||
    maxRecommendationsPerSession < 1 ||
    maxRecommendationsPerSession > 10
  ) {
    return "Max recommendations per session must be between 1 and 10.";
  }

  if (
    maxOpenPositions === null ||
    maxOpenPositions < 1 ||
    maxOpenPositions > 20
  ) {
    return "Max open positions must be between 1 and 20.";
  }

  if (!form.preferredTimeframe.trim()) {
    return "Preferred timeframe cannot be empty.";
  }

  return null;
}

async function fetchFirstSettingsRow() {
  return supabase
    .from("user_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
}

async function createDefaultSettingsRow() {
  return supabase
    .from("user_settings")
    .insert(defaultSettingsRow)
    .select("*")
    .single();
}

async function fetchRecentScheduledScanRuns() {
  return supabase
    .from("scheduled_scan_runs")
    .select(
      "id,created_at,scan_date,session_type,status,recommendations_created,message",
    )
    .order("created_at", { ascending: false })
    .limit(20);
}

async function fetchMarketStatusForUi() {
  try {
    const response = await fetch("/api/market-calendar/status", {
      cache: "no-store",
    });
    const result = (await response.json().catch(() => null)) as {
      market_status?: MarketStatus;
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(result?.error || "Could not load market calendar status.");
    }

    return {
      marketStatus: result?.market_status ?? null,
      error: "",
    };
  } catch (error) {
    console.error("[settings] market_status_error", error);

    return {
      marketStatus: null,
      error: "Market calendar status is unavailable right now.",
    };
  }
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatSessionType(value: string | null) {
  if (value === "morning") {
    return "Morning";
  }

  if (value === "midday") {
    return "Midday";
  }

  return value ?? "Unknown";
}

export default function SettingsPage() {
  const [settingsId, setSettingsId] = useState<UserSettingsRow["id"] | null>(
    null,
  );
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [automationRuns, setAutomationRuns] = useState<ScheduledScanRun[]>([]);
  const [isLoadingAutomationRuns, setIsLoadingAutomationRuns] = useState(true);
  const [automationMessage, setAutomationMessage] = useState("");
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [marketStatusMessage, setMarketStatusMessage] = useState("");

  async function loadSettings() {
    setIsLoading(true);
    setMessage("");
    setSuccessMessage("");

    const { data, error } = await fetchFirstSettingsRow();

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    let settingsRow = data as UserSettingsRow | null;

    if (!settingsRow) {
      const { data: newSettingsRow, error: insertError } =
        await createDefaultSettingsRow();

      if (insertError) {
        setMessage(
          `Settings row was missing, and the default row could not be created: ${insertError.message}`,
        );
        setIsLoading(false);
        return;
      }

      settingsRow = newSettingsRow as UserSettingsRow | null;
    }

    if (!settingsRow) {
      setMessage("Settings could not be loaded because no settings row exists.");
      setIsLoading(false);
      return;
    }

    setSettingsId(settingsRow.id);
    setForm(toForm(settingsRow));
    setIsLoading(false);
  }

  async function loadAutomationRuns() {
    setIsLoadingAutomationRuns(true);
    setAutomationMessage("");

    const [{ data, error }, marketStatusResult] = await Promise.all([
      fetchRecentScheduledScanRuns(),
      fetchMarketStatusForUi(),
    ]);

    if (error) {
      setAutomationMessage(error.message);
      setAutomationRuns([]);
    } else {
      setAutomationRuns((data ?? []) as ScheduledScanRun[]);
    }

    setMarketStatus(marketStatusResult.marketStatus);
    setMarketStatusMessage(marketStatusResult.error);
    setIsLoadingAutomationRuns(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSettings();
      loadAutomationRuns();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function updateField(field: keyof SettingsForm, value: string | boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setMessage("");
    setSuccessMessage("");
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (settingsId === null) {
      setMessage(
        "Settings cannot be saved because no settings row is loaded. Refresh the page to create the default settings row.",
      );
      return;
    }

    const validationError = validateSettings(form);

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("user_settings")
      .update({
        portfolio_size: Number(form.portfolioSize),
        risk_per_trade_percent: Number(form.riskPerTradePercent),
        max_recommendations_per_session: Number(
          form.maxRecommendationsPerSession,
        ),
        max_open_positions: Number(form.maxOpenPositions),
        preferred_timeframe: form.preferredTimeframe.trim(),
        long_only: form.longOnly,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settingsId)
      .select("*")
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    if (!data) {
      setMessage(
        "Settings could not be saved because the settings row no longer exists. Refresh the page to recreate it.",
      );
      setSettingsId(null);
      setIsSaving(false);
      return;
    }

    const settingsRow = data as UserSettingsRow;
    setSettingsId(settingsRow.id);
    setForm(toForm(settingsRow));
    setSuccessMessage("Settings saved.");
    setIsSaving(false);
  }

  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Private app</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Risk controls</span>
            </div>
            <div>
              <h1 className="font-mono text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Settings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Personal trading limits for recommendation flow and risk.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white"
          >
            Back to Trade
          </Link>
        </header>

        {message && (
          <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            {message}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg border border-[#00db94]/25 bg-[#00db94]/10 p-4 text-sm leading-6 text-emerald-100">
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
            <h2 className="font-mono text-lg font-semibold text-white">
              Loading settings
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Trade is reading your user_settings row.
            </p>
          </div>
        ) : (
          <form
            onSubmit={saveSettings}
            className="bg-surface-subtle rounded-lg border border-white/10 p-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SettingsField label="Portfolio Size">
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.portfolioSize}
                  onChange={(event) =>
                    updateField("portfolioSize", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Risk Per Trade %">
                <input
                  required
                  type="number"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={form.riskPerTradePercent}
                  onChange={(event) =>
                    updateField("riskPerTradePercent", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Max Recommendations Per Session">
                <input
                  required
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={form.maxRecommendationsPerSession}
                  onChange={(event) =>
                    updateField(
                      "maxRecommendationsPerSession",
                      event.target.value,
                    )
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Max Open Positions">
                <input
                  required
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  value={form.maxOpenPositions}
                  onChange={(event) =>
                    updateField("maxOpenPositions", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Preferred Timeframe">
                <input
                  required
                  type="text"
                  value={form.preferredTimeframe}
                  onChange={(event) =>
                    updateField("preferredTimeframe", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <div className="rounded-md border border-white/10 bg-black/25 p-4">
                <div className="flex min-h-12 items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Long Only
                    </div>
                    <div className="mt-1 text-sm text-zinc-300">
                      {form.longOnly ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <label className="relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full border border-white/10 bg-zinc-800 transition has-[:checked]:border-[#00db94]/40 has-[:checked]:bg-[#00db94]/25">
                    <input
                      type="checkbox"
                      checked={form.longOnly}
                      onChange={(event) =>
                        updateField("longOnly", event.target.checked)
                      }
                      className="peer sr-only"
                    />
                    <span className="ml-1 h-5 w-5 rounded-full bg-zinc-500 transition peer-checked:translate-x-5 peer-checked:bg-emerald-200" />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-zinc-500">
                These controls are saved for future trading logic.
              </p>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-11 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}

        <AutomationStatusPanel
          automationRuns={automationRuns}
          isLoading={isLoadingAutomationRuns}
          message={automationMessage}
          marketStatus={marketStatus}
          marketStatusMessage={marketStatusMessage}
          onRefresh={loadAutomationRuns}
        />
      </div>
    </main>
  );
}

function SettingsField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-md border border-white/10 bg-black/25 p-4">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function AutomationStatusPanel({
  automationRuns,
  isLoading,
  message,
  marketStatus,
  marketStatusMessage,
  onRefresh,
}: {
  automationRuns: ScheduledScanRun[];
  isLoading: boolean;
  message: string;
  marketStatus: MarketStatus | null;
  marketStatusMessage: string;
  onRefresh: () => void;
}) {
  const lastMorningScan =
    automationRuns.find((run) => run.session_type === "morning") ?? null;
  const lastMiddayScan =
    automationRuns.find((run) => run.session_type === "midday") ?? null;
  const lastAutomationRun = automationRuns[0] ?? null;

  return (
    <section className="bg-surface-subtle rounded-lg border border-white/10 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Automation
          </div>
          <h2 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
            Automation Status
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Scheduled scans are triggered by Netlify every 15 minutes on
            weekdays. Trade checks the market calendar and only generates
            recommendations inside the configured New York time windows.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="min-h-11 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          {isLoading ? "Refreshing..." : "Refresh Status"}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <MarketCalendarStatusCard
          marketStatus={marketStatus}
          isLoading={isLoading}
          message={marketStatusMessage}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-black/25 p-4">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Morning window
            </div>
            <div className="mt-2 font-mono text-sm text-white">
              09:30&ndash;10:00 New York time
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-black/25 p-4">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Midday window
            </div>
            <div className="mt-2 font-mono text-sm text-white">
              12:30&ndash;13:00 New York time
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-5 rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-6 text-center">
          <h3 className="font-mono text-base font-semibold text-white">
            Loading automation status
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Trade is reading recent scheduled_scan_runs rows.
          </p>
        </div>
      ) : automationRuns.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-6 text-center text-sm leading-6 text-zinc-400">
          No automated scans have run yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <AutomationRunCard title="Last Morning Scan" run={lastMorningScan} />
          <AutomationRunCard title="Last Midday Scan" run={lastMiddayScan} />
          <AutomationRunCard
            title="Last Automation Run"
            run={lastAutomationRun}
          />
        </div>
      )}
    </section>
  );
}

function AutomationRunCard({
  title,
  run,
}: {
  title: string;
  run: ScheduledScanRun | null;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-black/25 p-4">
      <div className="flex min-h-8 items-start justify-between gap-3">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {title}
        </h3>
        {run && <StatusPill status={run.status} />}
      </div>

      {run ? (
        <dl className="mt-4 space-y-3 text-sm">
          <AutomationDetail
            label="Session"
            value={formatSessionType(run.session_type)}
          />
          <AutomationDetail
            label="Recommendations created"
            value={String(run.recommendations_created ?? 0)}
          />
          <AutomationDetail label="Status" value={run.status ?? "Unknown"} />
          <AutomationDetail
            label="Message"
            value={run.message?.trim() || "No message recorded"}
          />
          <AutomationDetail
            label="Created at"
            value={formatDateTime(run.created_at)}
          />
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-6 text-zinc-500">
          No run has been recorded for this scan type yet.
        </p>
      )}
    </article>
  );
}

function getMarketStatusLabel(marketStatus: MarketStatus | null) {
  if (!marketStatus) {
    return "Unknown";
  }

  if (marketStatus.dayType === "early_close") {
    return "Early close";
  }

  if (marketStatus.dayType === "unknown") {
    return "Unknown";
  }

  return marketStatus.isOpenDay ? "Open" : "Closed";
}

function getMarketStatusBadgeStatus(
  marketStatus: MarketStatus | null,
  isLoading: boolean,
) {
  if (isLoading) {
    return "Loading";
  }

  if (!marketStatus) {
    return "Unknown";
  }

  if (marketStatus.dayType === "unknown") {
    return "Provider unavailable";
  }

  return marketStatus.isOpenDay ? "completed" : "Closed";
}

function MarketCalendarStatusCard({
  marketStatus,
  isLoading,
  message,
}: {
  marketStatus: MarketStatus | null;
  isLoading: boolean;
  message: string;
}) {
  const statusValue = isLoading
    ? "Loading"
    : getMarketStatusLabel(marketStatus);
  const providerValue = isLoading
    ? "Loading"
    : marketStatus?.provider ?? "Unavailable";
  const cacheValue = isLoading
    ? "Loading"
    : marketStatus
      ? marketStatus.fromCache
        ? "Fresh cache"
        : "Live provider or fallback"
      : "Unavailable";
  const reasonValue = isLoading
    ? "Loading market calendar status..."
    : marketStatus?.reason || message || "No market calendar result yet";

  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-4">
      <div className="flex min-h-8 items-start justify-between gap-3">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Market Calendar
        </div>
        <StatusPill status={getMarketStatusBadgeStatus(marketStatus, isLoading)} />
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <AutomationDetail label="Status" value={statusValue} />
        <AutomationDetail label="Provider" value={providerValue} />
        <AutomationDetail label="Cache" value={cacheValue} />
        <AutomationDetail label="Reason" value={reasonValue} />
      </dl>
    </div>
  );
}

function AutomationDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </dt>
      <dd className="mt-1 break-words text-zinc-200">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const isCompleted = status === "completed";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
        isCompleted
          ? "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100"
          : "border-amber-300/30 bg-amber-300/10 text-amber-100"
      }`}
    >
      {status ?? "Unknown"}
    </span>
  );
}
