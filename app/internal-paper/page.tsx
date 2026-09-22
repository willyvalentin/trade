import Link from "next/link";

import type { InternalPaperObserver } from "@/lib/internal-paper-observer";
import { requireApplicationPageSession } from "@/lib/server/application-session";
import { readInternalPaperObserver } from "@/lib/server/internal-paper-observer-persistence";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function textValue(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(record: Record<string, unknown> | null, key: string) {
  const raw = record?.[key];
  const value = typeof raw === "number"
    ? raw
    : typeof raw === "string" && raw.trim().length > 0
      ? Number(raw)
      : Number.NaN;
  return Number.isFinite(value) ? value : null;
}

function ObserverMetric({ label, value, detail }: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl text-zinc-100">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-zinc-500">{detail}</p> : null}
    </div>
  );
}

function ObserverView({ observer }: { observer: InternalPaperObserver }) {
  const decision = observer.latest_decision;
  const decisionKind = textValue(decision, "decision_kind") ?? "No decision";
  const ticker = textValue(decision, "ticker");
  const noTradeReason = textValue(decision, "no_trade_reason");
  const latestResult = observer.latest_realized_result;
  const latestResultTicker = textValue(latestResult, "ticker");
  const latestResultNet = numberValue(latestResult, "net_pnl");

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Internal paper engine summary">
        <ObserverMetric
          label="Engine health"
          value={observer.engine_health.status.toUpperCase()}
          detail={`${observer.engine_health.queued_count} queued · ${observer.engine_health.leased_count} leased · ${observer.engine_health.blocked_count} blocked`}
        />
        <ObserverMetric
          label="Cash"
          value={formatCurrency(observer.accounting.cash_balance)}
          detail={`Starting cash ${formatCurrency(observer.accounting.starting_cash)}`}
        />
        <ObserverMetric
          label="Book value"
          value={formatCurrency(observer.accounting.book_value)}
          detail={`Open cost basis ${formatCurrency(observer.accounting.open_position_cost_basis)}`}
        />
        <ObserverMetric
          label="Marked equity"
          value="Unavailable"
          detail="No current attributable market mark exists. Ture does not invent equity."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Latest decision</h2>
          <p className="mt-3 font-mono text-sm uppercase tracking-[0.12em] text-teal-300">
            {decisionKind.replaceAll("_", " ")}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {ticker ? `Selected ${ticker}.` : noTradeReason
              ? `No trade: ${noTradeReason.replaceAll("_", " ")}.`
              : "No decision receipt is available yet."}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-zinc-500">Completed</dt><dd className="mt-1 text-zinc-200">{observer.engine_health.completed_count}</dd></div>
            <div><dt className="text-zinc-500">No trade</dt><dd className="mt-1 text-zinc-200">{observer.engine_health.no_trade_count}</dd></div>
          </dl>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Realized accounting</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-zinc-500">Net P&amp;L</dt><dd className="mt-1 font-mono text-zinc-200">{formatCurrency(observer.accounting.realized_net_pnl)}</dd></div>
            <div><dt className="text-zinc-500">Gross P&amp;L</dt><dd className="mt-1 font-mono text-zinc-200">{formatCurrency(observer.accounting.realized_gross_pnl)}</dd></div>
            <div><dt className="text-zinc-500">Commissions</dt><dd className="mt-1 font-mono text-zinc-200">{formatCurrency(observer.accounting.total_commission_paid)}</dd></div>
            <div><dt className="text-zinc-500">Ledger balance</dt><dd className="mt-1 font-mono text-zinc-200">{formatCurrency(observer.accounting.ledger_balance)}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            {latestResultTicker && latestResultNet !== null
              ? `Latest exit: ${latestResultTicker}, ${formatCurrency(latestResultNet)} net.`
              : "No realized exit is available yet."}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-100">Pending orders</h2>
            <span className="font-mono text-xs text-zinc-500">{observer.pending_orders.length}</span>
          </div>
          {observer.pending_orders.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No queued or leased paper orders.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              {observer.pending_orders.map((order, index) => (
                <li key={textValue(order, "job_id") ?? index} className="rounded-lg border border-white/10 p-3">
                  {textValue(order, "ticker") ? `${textValue(order, "ticker")} · ` : ""}
                  {(textValue(order, "work_kind") ?? "unknown").replaceAll("_", " ")} · {textValue(order, "status") ?? "unknown"}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-100">Positions</h2>
            <span className="font-mono text-xs text-zinc-500">{observer.positions.length}</span>
          </div>
          {observer.positions.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No paper positions.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              {observer.positions.map((position, index) => (
                <li key={textValue(position, "position_id") ?? index} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
                  <span>{textValue(position, "ticker") ?? "Unknown"}</span>
                  <span className="font-mono text-xs uppercase text-zinc-500">{textValue(position, "status") ?? "unknown"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-5 text-sm leading-6 text-amber-50/80">
        <h2 className="font-semibold text-amber-100">Freshness is not classified yet</h2>
        <p className="mt-2">
          Latest durable activity is {observer.freshness.age_seconds} seconds old. No approved freshness threshold exists, so the observer reports this age without claiming fresh or stale.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Pilot scope</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-zinc-500">Strategy</dt><dd className="mt-1 font-mono text-zinc-200">{observer.account.strategy_id}@{observer.account.strategy_version}</dd></div>
          <div><dt className="text-zinc-500">Config</dt><dd className="mt-1 font-mono text-zinc-200">{observer.account.config_version}</dd></div>
          <div><dt className="text-zinc-500">Eligible symbols</dt><dd className="mt-1 font-mono text-zinc-200">{observer.account.eligible_symbols.join(", ")}</dd></div>
          <div><dt className="text-zinc-500">Observer</dt><dd className="mt-1 font-mono text-zinc-200">{observer.observer_version}</dd></div>
        </dl>
      </section>
    </div>
  );
}

export default async function InternalPaperPage() {
  const session = await requireApplicationPageSession();
  const result = await readInternalPaperObserver(session.owner_user_id);

  return (
    <main className="min-h-screen bg-[#090d10] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-teal-400">Read-only · internal paper</p>
            <h1 className="mt-2 text-3xl font-semibold">Paper Observer</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Durable engine, decision and accounting evidence. This view cannot place orders, call a market-data provider or activate the paper worker.
            </p>
          </div>
          <Link href="/" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-teal-400/40 hover:text-white">
            Back to dashboard
          </Link>
        </div>

        {result.status === "available" ? <ObserverView observer={result.data} /> : (
          <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold">
              {result.status === "not_configured" ? "Observer not configured" : "Observer unavailable"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              {result.status === "not_configured"
                ? "The read-only observer source is present, but no internal paper account has been configured for this environment. Nothing has been activated automatically."
                : "The versioned database read model could not be verified. No partial or synthetic account state is shown."}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
