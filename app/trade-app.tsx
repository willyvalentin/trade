"use client";

import { useState } from "react";

type Direction = "Long" | "Short";
type RecommendationStatus = "new" | "watched" | "ignored";
type Tab = "Daily Recommendations" | "Active Positions" | "History";
type HistoryAction = "Took trade" | "Watch only" | "Ignored" | "Generated";

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
};

type ActivePosition = Recommendation & {
  openedAt: string;
};

type HistoryItem = {
  id: string;
  ticker: string;
  companyName: string;
  action: HistoryAction;
  note: string;
  time: string;
};

const tabs: Tab[] = ["Daily Recommendations", "Active Positions", "History"];

const starterRecommendations: Recommendation[] = [
  {
    id: "nvda-base",
    ticker: "NVDA",
    companyName: "NVIDIA",
    direction: "Long",
    setupType: "Pullback continuation",
    entryZone: "$910 - $925",
    stopLoss: "$884",
    target1: "$960",
    target2: "$995",
    riskReward: "1:2.4",
    confidence: "High",
    timeframe: "2-5 days",
    thesis:
      "Momentum leader holding above a prior breakout area with buyers stepping in near rising support.",
    invalidation:
      "Daily close below the pullback low or a broad market reversal with heavy volume.",
    reasonToAvoid:
      "Avoid if price gaps far above the entry zone or volatility expands before entry.",
    status: "new",
  },
  {
    id: "msft-base",
    ticker: "MSFT",
    companyName: "Microsoft",
    direction: "Long",
    setupType: "Range breakout",
    entryZone: "$426 - $432",
    stopLoss: "$414",
    target1: "$448",
    target2: "$462",
    riskReward: "1:2.1",
    confidence: "Medium",
    timeframe: "1-3 weeks",
    thesis:
      "Tight consolidation near highs gives a clean breakout trigger with defined downside.",
    invalidation:
      "Failed breakout back inside the range with two weak closes below support.",
    reasonToAvoid:
      "Avoid if the index is selling off or the breakout comes on weak participation.",
    status: "new",
  },
  {
    id: "aapl-base",
    ticker: "AAPL",
    companyName: "Apple",
    direction: "Short",
    setupType: "Resistance rejection",
    entryZone: "$188 - $191",
    stopLoss: "$196",
    target1: "$180",
    target2: "$174",
    riskReward: "1:2.0",
    confidence: "Medium",
    timeframe: "3-7 days",
    thesis:
      "Repeated rejection at resistance suggests sellers still control that zone.",
    invalidation:
      "Strong close above resistance followed by a successful retest from above.",
    reasonToAvoid:
      "Avoid if buyers reclaim the zone early in the session with strong breadth.",
    status: "new",
  },
  {
    id: "amzn-base",
    ticker: "AMZN",
    companyName: "Amazon",
    direction: "Long",
    setupType: "Trend pullback",
    entryZone: "$181 - $184",
    stopLoss: "$176",
    target1: "$192",
    target2: "$199",
    riskReward: "1:2.7",
    confidence: "High",
    timeframe: "1-2 weeks",
    thesis:
      "The stock is holding a higher-low structure while volume dries up on the pullback.",
    invalidation:
      "Break below the prior swing low with no immediate reclaim by the close.",
    reasonToAvoid:
      "Avoid if price opens below the stop area or closes weak before entry.",
    status: "new",
  },
  {
    id: "jpm-base",
    ticker: "JPM",
    companyName: "JPMorgan Chase",
    direction: "Long",
    setupType: "Sector relative strength",
    entryZone: "$198 - $201",
    stopLoss: "$192",
    target1: "$210",
    target2: "$216",
    riskReward: "1:2.3",
    confidence: "Medium",
    timeframe: "2-4 weeks",
    thesis:
      "Financials are firming, and the stock is compressing above support after a strong advance.",
    invalidation:
      "Close below support while the sector loses relative strength.",
    reasonToAvoid:
      "Avoid before major rate-sensitive headlines or if the sector turns lower.",
    status: "new",
  },
];

const extraRecommendations: Omit<Recommendation, "id" | "status">[] = [
  {
    ticker: "META",
    companyName: "Meta Platforms",
    direction: "Long",
    setupType: "Base breakout",
    entryZone: "$476 - $482",
    stopLoss: "$462",
    target1: "$505",
    target2: "$524",
    riskReward: "1:2.5",
    confidence: "High",
    timeframe: "1-3 weeks",
    thesis:
      "A tight base near highs creates a clean trigger if buyers expand volume through resistance.",
    invalidation:
      "Breakout fails and price closes back below the base midpoint.",
    reasonToAvoid:
      "Avoid if the breakout happens on a gap that leaves no reasonable stop distance.",
  },
  {
    ticker: "TSLA",
    companyName: "Tesla",
    direction: "Short",
    setupType: "Lower-high fade",
    entryZone: "$176 - $180",
    stopLoss: "$186",
    target1: "$166",
    target2: "$158",
    riskReward: "1:2.2",
    confidence: "Medium",
    timeframe: "2-6 days",
    thesis:
      "A lower high under resistance keeps pressure on buyers unless price quickly reclaims the level.",
    invalidation:
      "Close above resistance with expanding volume and follow-through the next day.",
    reasonToAvoid:
      "Avoid if intraday momentum flips strongly upward before the entry area is tested.",
  },
  {
    ticker: "COST",
    companyName: "Costco",
    direction: "Long",
    setupType: "Breakout retest",
    entryZone: "$715 - $724",
    stopLoss: "$696",
    target1: "$748",
    target2: "$770",
    riskReward: "1:2.1",
    confidence: "Medium",
    timeframe: "2-4 weeks",
    thesis:
      "Price is retesting a prior breakout area while the longer trend remains constructive.",
    invalidation:
      "Retest fails with a close back below the old breakout level.",
    reasonToAvoid:
      "Avoid if defensive retail stocks weaken as a group before entry.",
  },
  {
    ticker: "GOOGL",
    companyName: "Alphabet",
    direction: "Long",
    setupType: "Inside-day expansion",
    entryZone: "$168 - $171",
    stopLoss: "$162",
    target1: "$180",
    target2: "$187",
    riskReward: "1:2.6",
    confidence: "Medium",
    timeframe: "1-2 weeks",
    thesis:
      "Compression after a strong move can resolve higher if price clears the inside-day high.",
    invalidation:
      "Break below the inside-day low with no recovery by the close.",
    reasonToAvoid:
      "Avoid if the move triggers during weak market breadth.",
  },
  {
    ticker: "XOM",
    companyName: "Exxon Mobil",
    direction: "Short",
    setupType: "Failed reclaim",
    entryZone: "$119 - $121",
    stopLoss: "$124",
    target1: "$113",
    target2: "$109",
    riskReward: "1:2.4",
    confidence: "Medium",
    timeframe: "1-2 weeks",
    thesis:
      "Price is struggling to reclaim a key level after a distribution move.",
    invalidation:
      "Close above the reclaim level with the energy sector confirming strength.",
    reasonToAvoid:
      "Avoid if crude oil strength creates a sector-wide bid.",
  },
  {
    ticker: "AMD",
    companyName: "Advanced Micro Devices",
    direction: "Long",
    setupType: "Momentum reset",
    entryZone: "$154 - $158",
    stopLoss: "$147",
    target1: "$169",
    target2: "$178",
    riskReward: "1:2.7",
    confidence: "High",
    timeframe: "3-10 days",
    thesis:
      "A controlled reset after a momentum move keeps the trend intact while improving entry quality.",
    invalidation:
      "Break below the reset low with semiconductor peers also weakening.",
    reasonToAvoid:
      "Avoid if price is extended more than one daily range above the entry zone.",
  },
  {
    ticker: "UNH",
    companyName: "UnitedHealth Group",
    direction: "Long",
    setupType: "Mean reversion bounce",
    entryZone: "$505 - $512",
    stopLoss: "$488",
    target1: "$536",
    target2: "$554",
    riskReward: "1:2.0",
    confidence: "Low",
    timeframe: "1-3 weeks",
    thesis:
      "A deeply oversold move is stabilizing near prior demand with room for a relief bounce.",
    invalidation:
      "Price loses the demand area and closes near session lows.",
    reasonToAvoid:
      "Avoid if headline risk remains elevated or volume expands on red candles.",
  },
  {
    ticker: "NFLX",
    companyName: "Netflix",
    direction: "Short",
    setupType: "Exhaustion reversal",
    entryZone: "$635 - $642",
    stopLoss: "$655",
    target1: "$612",
    target2: "$594",
    riskReward: "1:2.3",
    confidence: "Medium",
    timeframe: "2-8 days",
    thesis:
      "A fast extension into resistance can fade if buyers fail to hold the opening range.",
    invalidation:
      "Strong close above resistance with volume confirming continuation.",
    reasonToAvoid:
      "Avoid if the stock holds above resistance for the full first hour.",
  },
  {
    ticker: "ADBE",
    companyName: "Adobe",
    direction: "Long",
    setupType: "Support reclaim",
    entryZone: "$478 - $485",
    stopLoss: "$462",
    target1: "$506",
    target2: "$522",
    riskReward: "1:2.1",
    confidence: "Medium",
    timeframe: "1-2 weeks",
    thesis:
      "A reclaim of broken support can trap late sellers and create a move back toward the range high.",
    invalidation:
      "Reclaim fails and price closes below the support zone again.",
    reasonToAvoid:
      "Avoid if software peers lag while the market is advancing.",
  },
  {
    ticker: "BA",
    companyName: "Boeing",
    direction: "Short",
    setupType: "Weak bounce",
    entryZone: "$183 - $187",
    stopLoss: "$194",
    target1: "$171",
    target2: "$164",
    riskReward: "1:2.5",
    confidence: "Low",
    timeframe: "1-2 weeks",
    thesis:
      "A weak bounce into supply keeps sellers in control unless price reclaims the recent breakdown.",
    invalidation:
      "Close above supply with strong industrial sector confirmation.",
    reasonToAvoid:
      "Avoid if headline risk creates a large opening gap in either direction.",
  },
];

function formatActionTime() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

export default function TradeApp() {
  const [activeTab, setActiveTab] = useState<Tab>("Daily Recommendations");
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    starterRecommendations,
  );
  const [activePositions, setActivePositions] = useState<ActivePosition[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [nextExtraIndex, setNextExtraIndex] = useState(0);

  function addHistory(
    recommendation: Pick<Recommendation, "ticker" | "companyName">,
    action: HistoryAction,
    note: string,
  ) {
    setHistory((currentHistory) => [
      {
        id: `${recommendation.ticker}-${action}-${Date.now()}`,
        ticker: recommendation.ticker,
        companyName: recommendation.companyName,
        action,
        note,
        time: formatActionTime(),
      },
      ...currentHistory,
    ]);
  }

  function generateMoreRecommendations() {
    const amountToAdd = 3 + (nextExtraIndex % 3);
    const newRecommendations = Array.from({ length: amountToAdd }, (_, index) => {
      const source =
        extraRecommendations[(nextExtraIndex + index) % extraRecommendations.length];

      return {
        ...source,
        id: `${source.ticker.toLowerCase()}-${Date.now()}-${index}`,
        status: "new" as const,
      };
    });

    setRecommendations((currentRecommendations) => [
      ...currentRecommendations,
      ...newRecommendations,
    ]);
    setNextExtraIndex((currentIndex) => currentIndex + amountToAdd);
    addHistory(
      {
        ticker: "MOCK",
        companyName: "Recommendation engine",
      },
      "Generated",
      `Added ${amountToAdd} mock recommendations.`,
    );
  }

  function takeTrade(recommendation: Recommendation) {
    setRecommendations((currentRecommendations) =>
      currentRecommendations.filter((item) => item.id !== recommendation.id),
    );
    setActivePositions((currentPositions) => [
      {
        ...recommendation,
        status: "new",
        openedAt: formatActionTime(),
      },
      ...currentPositions,
    ]);
    addHistory(
      recommendation,
      "Took trade",
      `${recommendation.direction} ${recommendation.ticker} moved to Active Positions.`,
    );
    setActiveTab("Active Positions");
  }

  function updateRecommendationStatus(
    recommendation: Recommendation,
    status: RecommendationStatus,
  ) {
    setRecommendations((currentRecommendations) =>
      currentRecommendations.map((item) =>
        item.id === recommendation.id ? { ...item, status } : item,
      ),
    );

    addHistory(
      recommendation,
      status === "watched" ? "Watch only" : "Ignored",
      status === "watched"
        ? `${recommendation.ticker} marked as watch only.`
        : `${recommendation.ticker} marked as ignored.`,
    );
  }

  const ignoredCount = recommendations.filter(
    (recommendation) => recommendation.status === "ignored",
  ).length;
  const watchedCount = recommendations.filter(
    (recommendation) => recommendation.status === "watched",
  ).length;

  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Private app</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Mock data only</span>
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
            <Stat label="Recommendations" value={recommendations.length} />
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

        {activeTab === "Daily Recommendations" && (
          <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                  Daily Recommendations
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {ignoredCount} ignored, {watchedCount} watched, all local state.
                </p>
              </div>
              <button
                type="button"
                onClick={generateMoreRecommendations}
                className="min-h-11 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200"
              >
                Generate 3-5 more recommendations
              </button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onTakeTrade={takeTrade}
                  onWatchOnly={(item) =>
                    updateRecommendationStatus(item, "watched")
                  }
                  onIgnore={(item) => updateRecommendationStatus(item, "ignored")}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === "Active Positions" && (
          <section className="space-y-5">
            <div>
              <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
                Active Positions
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Trades you marked as taken during this session.
              </p>
            </div>

            {activePositions.length === 0 ? (
              <EmptyState
                title="No active positions yet"
                message="Use Took trade on a recommendation to move it here."
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
                Local activity from this browser session.
              </p>
            </div>

            {history.length === 0 ? (
              <EmptyState
                title="No history yet"
                message="Actions like Took trade, Watch only, Ignore, and Generate More will appear here."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-white/10">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 border-b border-white/10 bg-white/[0.025] p-4 last:border-b-0 sm:grid-cols-[140px_1fr_150px]"
                  >
                    <div className="font-mono text-sm font-semibold text-white">
                      {item.action}
                    </div>
                    <div>
                      <div className="font-mono text-sm text-zinc-200">
                        {item.ticker}{" "}
                        <span className="text-zinc-500">{item.companyName}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        {item.note}
                      </p>
                    </div>
                    <div className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500 sm:text-right">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function RecommendationCard({
  recommendation,
  onTakeTrade,
  onWatchOnly,
  onIgnore,
}: {
  recommendation: Recommendation;
  onTakeTrade: (recommendation: Recommendation) => void;
  onWatchOnly: (recommendation: Recommendation) => void;
  onIgnore: (recommendation: Recommendation) => void;
}) {
  const isIgnored = recommendation.status === "ignored";
  const isWatched = recommendation.status === "watched";

  return (
    <article
      className={`rounded-lg border p-5 transition ${
        isIgnored
          ? "border-rose-400/25 bg-rose-950/10 opacity-65"
          : "border-white/10 bg-white/[0.035] hover:border-white/20"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-3xl font-semibold tracking-normal text-white">
              {recommendation.ticker}
            </span>
            <DirectionPill direction={recommendation.direction} />
            {isWatched && <StatusPill label="Watched" tone="cyan" />}
            {isIgnored && <StatusPill label="Ignored" tone="rose" />}
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
          disabled={isIgnored}
          className="min-h-11 flex-1 rounded-md bg-emerald-300 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          Took trade
        </button>
        <button
          type="button"
          onClick={() => onWatchOnly(recommendation)}
          disabled={isWatched || isIgnored}
          className="min-h-11 flex-1 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          Watch only
        </button>
        <button
          type="button"
          onClick={() => onIgnore(recommendation)}
          disabled={isIgnored}
          className="min-h-11 flex-1 rounded-md border border-rose-300/30 bg-rose-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          Ignore
        </button>
      </div>
    </article>
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
        <Detail label="Entry Zone" value={position.entryZone} />
        <Detail label="Stop Loss" value={position.stopLoss} />
        <Detail label="Target 1" value={position.target1} />
        <Detail label="Target 2" value={position.target2} />
        <Detail label="Risk/Reward" value={position.riskReward} />
        <Detail label="Timeframe" value={position.timeframe} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <TextBlock label="Thesis" value={position.thesis} />
        <TextBlock label="Invalidation" value={position.invalidation} />
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

function StatusPill({ label, tone }: { label: string; tone: "cyan" | "rose" }) {
  const className =
    tone === "cyan"
      ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
      : "border-rose-300/35 bg-rose-300/10 text-rose-100";

  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.12em] ${className}`}
    >
      {label}
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
