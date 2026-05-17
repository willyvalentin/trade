"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Direction = "Long" | "Short";
type RecommendationStatus = "new" | "watched" | "ignored" | "taken";
type Tab = "Daily Recommendations" | "Active Positions" | "History";

type RecommendationRow = {
  id: string;
  ticker: string;
  company_name: string | null;
  direction: string | null;
  setup_type: string | null;
  entry_zone: string | null;
  stop_loss: string | null;
  target_1: string | null;
  target_2: string | null;
  risk_reward: string | null;
  confidence: string | null;
  timeframe: string | null;
  thesis: string | null;
  invalidation: string | null;
  reason_to_avoid: string | null;
  status: string | null;
  created_at?: string | null;
};

type PositionRow = {
  id: string;
  recommendation_id?: string | null;
  ticker: string;
  company_name: string | null;
  direction?: string | null;
  entry_price: number | string | null;
  position_size: number | string | null;
  current_stop: string | null;
  target_1: string | null;
  target_2: string | null;
  status?: string | null;
  created_at?: string | null;
};

type Recommendation = {
  id: string;
  ticker: string;
  companyName: string;
  direction: Direction;
  setupType: string;
  entryZone: string;
  stopLoss: string;
  target1: string;
  target2: string;
  riskReward: string;
  confidence: string;
  timeframe: string;
  thesis: string;
  invalidation: string;
  reasonToAvoid: string;
  status: RecommendationStatus;
  createdAt: string;
};

type ActivePosition = {
  id: string;
  ticker: string;
  companyName: string;
  direction: Direction;
  entryPrice: string;
  positionSize: string;
  stopLoss: string;
  target1: string;
  target2: string;
  openedAt: string;
};

const tabs: Tab[] = ["Daily Recommendations", "Active Positions", "History"];
const historyStatuses: RecommendationStatus[] = ["ignored", "watched", "taken"];

const text = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
};

function money(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not set";
  }

  return String(value);
}

function direction(value: string | null | undefined): Direction {
  return value?.toLowerCase() === "short" ? "Short" : "Long";
}

function status(value: string | null | undefined): RecommendationStatus {
  if (value === "watched" || value === "ignored" || value === "taken") {
    return value;
  }

  return "new";
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function toRecommendation(row: RecommendationRow): Recommendation {
  return {
    id: row.id,
    ticker: row.ticker,
    companyName: text(row.company_name),
    direction: direction(row.direction),
    setupType: text(row.setup_type),
    entryZone: text(row.entry_zone),
    stopLoss: text(row.stop_loss),
    target1: text(row.target_1),
    target2: text(row.target_2),
    riskReward: text(row.risk_reward),
    confidence: text(row.confidence),
    timeframe: text(row.timeframe),
    thesis: text(row.thesis),
    invalidation: text(row.invalidation),
    reasonToAvoid: text(row.reason_to_avoid),
    status: status(row.status),
    createdAt: formatDate(row.created_at),
  };
}

function toActivePosition(row: PositionRow): ActivePosition {
  return {
    id: row.id,
    ticker: row.ticker,
    companyName: text(row.company_name),
    direction: direction(row.direction),
    entryPrice: money(row.entry_price),
    positionSize: money(row.position_size),
    stopLoss: text(row.current_stop),
    target1: text(row.target_1),
    target2: text(row.target_2),
    openedAt: formatDate(row.created_at),
  };
}

export default function TradeApp() {
  const [activeTab, setActiveTab] = useState<Tab>("Daily Recommendations");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activePositions, setActivePositions] = useState<ActivePosition[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);
  const [entryPrice, setEntryPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadTradeData() {
    await Promise.resolve();

    setIsLoading(true);
    setMessage("");

    const [recommendationsResult, positionsResult] = await Promise.all([
      supabase.from("recommendations").select("*"),
      supabase.from("positions").select("*").eq("status", "open"),
    ]);

    if (recommendationsResult.error) {
      setMessage(recommendationsResult.error.message);
    } else {
      setRecommendations(
        (recommendationsResult.data as RecommendationRow[]).map(toRecommendation),
      );
    }

    if (positionsResult.error) {
      setMessage(positionsResult.error.message);
    } else {
      setActivePositions((positionsResult.data as PositionRow[]).map(toActivePosition));
    }

    setIsLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTradeData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function updateRecommendationStatus(
    recommendation: Recommendation,
    newStatus: RecommendationStatus,
  ) {
    setIsSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("recommendations")
      .update({ status: newStatus })
      .eq("id", recommendation.id);

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    setRecommendations((currentRecommendations) =>
      currentRecommendations.map((item) =>
        item.id === recommendation.id ? { ...item, status: newStatus } : item,
      ),
    );
    setIsSaving(false);
  }

  function openTradeModal(recommendation: Recommendation) {
    setSelectedRecommendation(recommendation);
    setEntryPrice("");
    setPositionSize("");
    setMessage("");
  }

  function closeTradeModal() {
    if (isSaving) {
      return;
    }

    setSelectedRecommendation(null);
  }

  async function submitTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRecommendation) {
      return;
    }

    const actualEntryPrice = Number(entryPrice);
    const actualPositionSize = Number(positionSize);

    if (Number.isNaN(actualEntryPrice) || Number.isNaN(actualPositionSize)) {
      setMessage("Entry price and position size must be numbers.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const { error: insertError } = await supabase.from("positions").insert({
      recommendation_id: selectedRecommendation.id,
      ticker: selectedRecommendation.ticker,
      company_name: selectedRecommendation.companyName,
      entry_price: actualEntryPrice,
      position_size: actualPositionSize,
      current_stop: selectedRecommendation.stopLoss,
      target_1: selectedRecommendation.target1,
      target_2: selectedRecommendation.target2,
      status: "open",
    });

    if (insertError) {
      setMessage(insertError.message);
      setIsSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("recommendations")
      .update({ status: "taken" })
      .eq("id", selectedRecommendation.id);

    if (updateError) {
      setMessage(updateError.message);
      setIsSaving(false);
      return;
    }

    setSelectedRecommendation(null);
    setActiveTab("Active Positions");
    await loadTradeData();
    setIsSaving(false);
  }

  const dailyRecommendations = recommendations.filter(
    (recommendation) => !historyStatuses.includes(recommendation.status),
  );
  const historyRecommendations = recommendations.filter((recommendation) =>
    historyStatuses.includes(recommendation.status),
  );
  const watchedCount = recommendations.filter(
    (recommendation) => recommendation.status === "watched",
  ).length;
  const ignoredCount = recommendations.filter(
    (recommendation) => recommendation.status === "ignored",
  ).length;

  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Private app</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Supabase connected</span>
            </div>
            <div>
              <h1 className="font-mono text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Trade
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Daily trade ideas, active positions, and decision history in one
                quiet workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[420px]">
            <Stat label="Recommendations" value={dailyRecommendations.length} />
            <Stat label="Active" value={activePositions.length} />
            <Stat label="Watched" value={watchedCount} />
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition ${
                activeTab === tab
                  ? "border-emerald-300 bg-emerald-300 text-zinc-950"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {message && (
          <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            {message}
          </div>
        )}

        {activeTab === "Daily Recommendations" && (
          <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                  Daily Recommendations
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {ignoredCount} ignored, {watchedCount} watched, saved in Supabase.
                </p>
              </div>
              <button
                type="button"
                onClick={loadTradeData}
                disabled={isLoading}
                className="min-h-11 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                Refresh recommendations
              </button>
            </div>

            {isLoading ? (
              <EmptyState
                title="Loading recommendations"
                message="Trade is reading your Supabase recommendations table."
              />
            ) : dailyRecommendations.length === 0 ? (
              <EmptyState
                title="No recommendations yet"
                message="Add rows to the recommendations table in Supabase. New rows with status new or empty will appear here."
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {dailyRecommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    isSaving={isSaving}
                    onTakeTrade={openTradeModal}
                    onWatchOnly={(item) =>
                      updateRecommendationStatus(item, "watched")
                    }
                    onIgnore={(item) => updateRecommendationStatus(item, "ignored")}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Active Positions" && (
          <section className="space-y-5">
            <div>
              <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                Active Positions
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Open positions loaded from the positions table.
              </p>
            </div>

            {isLoading ? (
              <EmptyState
                title="Loading positions"
                message="Trade is reading your open Supabase positions."
              />
            ) : activePositions.length === 0 ? (
              <EmptyState
                title="No active positions yet"
                message="Use Took trade on a recommendation to create an open position."
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {activePositions.map((position) => (
                  <ActivePositionCard key={position.id} position={position} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "History" && (
          <section className="space-y-5">
            <div>
              <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                History
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Recommendations marked ignored, watched, or taken.
              </p>
            </div>

            {isLoading ? (
              <EmptyState
                title="Loading history"
                message="Trade is reading completed recommendation decisions."
              />
            ) : historyRecommendations.length === 0 ? (
              <EmptyState
                title="No history yet"
                message="Ignored, watched, and taken recommendations will appear here."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-white/10">
                {historyRecommendations.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 border-b border-white/10 bg-white/[0.025] p-4 last:border-b-0 sm:grid-cols-[140px_1fr_150px]"
                  >
                    <div className="font-mono text-sm font-semibold text-white">
                      {item.status}
                    </div>
                    <div>
                      <div className="font-mono text-sm text-zinc-200">
                        {item.ticker}{" "}
                        <span className="text-zinc-500">{item.companyName}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        {item.thesis}
                      </p>
                    </div>
                    <div className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500 sm:text-right">
                      {item.createdAt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {selectedRecommendation && (
        <TradeModal
          recommendation={selectedRecommendation}
          entryPrice={entryPrice}
          positionSize={positionSize}
          isSaving={isSaving}
          onEntryPriceChange={setEntryPrice}
          onPositionSizeChange={setPositionSize}
          onClose={closeTradeModal}
          onSubmit={submitTrade}
        />
      )}
    </main>
  );
}

function RecommendationCard({
  recommendation,
  isSaving,
  onTakeTrade,
  onWatchOnly,
  onIgnore,
}: {
  recommendation: Recommendation;
  isSaving: boolean;
  onTakeTrade: (recommendation: Recommendation) => void;
  onWatchOnly: (recommendation: Recommendation) => void;
  onIgnore: (recommendation: Recommendation) => void;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-3xl font-semibold tracking-normal text-white">
              {recommendation.ticker}
            </span>
            <DirectionPill direction={recommendation.direction} />
          </div>
          <p className="mt-1 break-words text-sm text-zinc-400">
            {recommendation.companyName}
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-left sm:text-right">
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
            Confidence
          </div>
          <div className="mt-1 font-mono text-sm font-semibold text-white">
            {recommendation.confidence}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Setup" value={recommendation.setupType} />
        <Detail label="Entry Zone" value={recommendation.entryZone} />
        <Detail label="Stop Loss" value={recommendation.stopLoss} />
        <Detail label="Target 1" value={recommendation.target1} />
        <Detail label="Target 2" value={recommendation.target2} />
        <Detail label="Risk/Reward" value={recommendation.riskReward} />
        <Detail label="Timeframe" value={recommendation.timeframe} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <TextBlock label="Thesis" value={recommendation.thesis} />
        <TextBlock label="Invalidation" value={recommendation.invalidation} />
        <TextBlock label="Reason to Avoid" value={recommendation.reasonToAvoid} />
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onTakeTrade(recommendation)}
          disabled={isSaving}
          className="min-h-11 flex-1 rounded-md bg-emerald-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          Took trade
        </button>
        <button
          type="button"
          onClick={() => onWatchOnly(recommendation)}
          disabled={isSaving}
          className="min-h-11 flex-1 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          Watch only
        </button>
        <button
          type="button"
          onClick={() => onIgnore(recommendation)}
          disabled={isSaving}
          className="min-h-11 flex-1 rounded-md border border-rose-300/30 bg-rose-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          Ignore
        </button>
      </div>
    </article>
  );
}

function TradeModal({
  recommendation,
  entryPrice,
  positionSize,
  isSaving,
  onEntryPriceChange,
  onPositionSizeChange,
  onClose,
  onSubmit,
}: {
  recommendation: Recommendation;
  entryPrice: string;
  positionSize: string;
  isSaving: boolean;
  onEntryPriceChange: (value: string) => void;
  onPositionSizeChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-lg border border-white/10 bg-[#0b0c0c] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Took trade
            </p>
            <h2 className="mt-2 font-mono text-2xl font-semibold text-white">
              {recommendation.ticker}{" "}
              <span className="text-zinc-500">{recommendation.companyName}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-zinc-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Actual Entry Price
            </span>
            <input
              required
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(event) => onEntryPriceChange(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Position Size
            </span>
            <input
              required
              type="number"
              step="0.01"
              value={positionSize}
              onChange={(event) => onPositionSizeChange(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-emerald-300"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Detail label="Stop Loss" value={recommendation.stopLoss} />
          <Detail label="Target 1" value={recommendation.target1} />
          <Detail label="Target 2" value={recommendation.target2} />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 min-h-11 w-full rounded-md bg-emerald-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSaving ? "Saving trade" : "Create active position"}
        </button>
      </form>
    </div>
  );
}

function ActivePositionCard({ position }: { position: ActivePosition }) {
  return (
    <article className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.045] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-3xl font-semibold tracking-normal text-white">
              {position.ticker}
            </span>
            <DirectionPill direction={position.direction} />
          </div>
          <p className="mt-1 text-sm text-zinc-400">{position.companyName}</p>
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-emerald-200">
          Opened {position.openedAt}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Entry Price" value={position.entryPrice} />
        <Detail label="Position Size" value={position.positionSize} />
        <Detail label="Stop Loss" value={position.stopLoss} />
        <Detail label="Target 1" value={position.target1} />
        <Detail label="Target 2" value={position.target2} />
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-4">
      <div className="font-mono text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-3">
      <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-2 break-words font-mono text-sm text-zinc-100">{value}</dd>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}

function DirectionPill({ direction }: { direction: Direction }) {
  const className =
    direction === "Long"
      ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100"
      : "border-rose-300/35 bg-rose-300/10 text-rose-100";

  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.12em] ${className}`}
    >
      {direction}
    </span>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
      <h3 className="font-mono text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {message}
      </p>
    </div>
  );
}
