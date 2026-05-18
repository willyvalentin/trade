import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

type RecommendationInsert = {
  session_type: "morning" | "midday";
  ticker: string;
  company_name: string;
  direction: "Long" | "Short";
  setup_type: string;
  entry_low: number;
  entry_high: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  risk_reward: number;
  confidence: string;
  timeframe: string;
  thesis: string;
  invalidation: string;
  reason_to_avoid: string;
  status: "new";
};

type MockRecommendation = Omit<RecommendationInsert, "session_type">;

const mockRecommendations: MockRecommendation[] = [
  {
    ticker: "AAPL",
    company_name: "Apple Inc.",
    direction: "Long",
    setup_type: "Pullback to support",
    entry_low: 184,
    entry_high: 187,
    stop_loss: 179,
    target_1: 194,
    target_2: 201,
    risk_reward: 2.4,
    confidence: "Medium",
    timeframe: "2-5 days",
    thesis: "Price is holding above a recent breakout area with improving relative strength.",
    invalidation: "A close below $179 would break the support structure.",
    reason_to_avoid: "Avoid if the broader Nasdaq opens sharply weak.",
    status: "new",
  },
  {
    ticker: "MSFT",
    company_name: "Microsoft Corporation",
    direction: "Long",
    setup_type: "Trend continuation",
    entry_low: 421,
    entry_high: 426,
    stop_loss: 414,
    target_1: 438,
    target_2: 449,
    risk_reward: 2.1,
    confidence: "Medium",
    timeframe: "3-7 days",
    thesis: "The stock is consolidating near highs while buyers continue to defend dips.",
    invalidation: "A move below $414 would signal failed continuation.",
    reason_to_avoid: "Avoid if volume is unusually light on the breakout attempt.",
    status: "new",
  },
  {
    ticker: "NVDA",
    company_name: "NVIDIA Corporation",
    direction: "Long",
    setup_type: "Momentum reset",
    entry_low: 116,
    entry_high: 119,
    stop_loss: 111,
    target_1: 126,
    target_2: 132,
    risk_reward: 2.2,
    confidence: "High",
    timeframe: "1-4 days",
    thesis: "Momentum remains constructive after a controlled pullback into short-term support.",
    invalidation: "A breakdown below $111 would show sellers have control.",
    reason_to_avoid: "Avoid chasing if it gaps above the first target.",
    status: "new",
  },
  {
    ticker: "AMZN",
    company_name: "Amazon.com, Inc.",
    direction: "Long",
    setup_type: "Range breakout",
    entry_low: 178,
    entry_high: 181,
    stop_loss: 173,
    target_1: 188,
    target_2: 195,
    risk_reward: 2.5,
    confidence: "Medium",
    timeframe: "3-6 days",
    thesis: "A tight range near resistance suggests buyers may be preparing for continuation.",
    invalidation: "Failure back below $173 would invalidate the breakout setup.",
    reason_to_avoid: "Avoid if price rejects the range high during the first hour.",
    status: "new",
  },
  {
    ticker: "GOOGL",
    company_name: "Alphabet Inc.",
    direction: "Long",
    setup_type: "Support bounce",
    entry_low: 167,
    entry_high: 170,
    stop_loss: 163,
    target_1: 176,
    target_2: 182,
    risk_reward: 2.0,
    confidence: "Medium",
    timeframe: "2-5 days",
    thesis: "Buyers are stepping in near a prior demand zone after a mild pullback.",
    invalidation: "A close below $163 would break the demand zone.",
    reason_to_avoid: "Avoid if mega-cap tech is broadly underperforming.",
    status: "new",
  },
  {
    ticker: "META",
    company_name: "Meta Platforms, Inc.",
    direction: "Long",
    setup_type: "Flag breakout",
    entry_low: 493,
    entry_high: 500,
    stop_loss: 481,
    target_1: 516,
    target_2: 532,
    risk_reward: 2.3,
    confidence: "Medium",
    timeframe: "2-6 days",
    thesis: "A clean bull flag is forming after a strong advance with no major distribution.",
    invalidation: "A close below $481 would damage the flag pattern.",
    reason_to_avoid: "Avoid if the breakout happens without volume confirmation.",
    status: "new",
  },
  {
    ticker: "TSLA",
    company_name: "Tesla, Inc.",
    direction: "Short",
    setup_type: "Failed bounce",
    entry_low: 176,
    entry_high: 180,
    stop_loss: 186,
    target_1: 167,
    target_2: 158,
    risk_reward: 2.1,
    confidence: "Medium",
    timeframe: "1-4 days",
    thesis: "The stock is struggling below resistance after a weak recovery attempt.",
    invalidation: "A close above $186 would show buyers reclaimed control.",
    reason_to_avoid: "Avoid if the market is in a broad risk-on rally.",
    status: "new",
  },
  {
    ticker: "JPM",
    company_name: "JPMorgan Chase & Co.",
    direction: "Long",
    setup_type: "Relative strength breakout",
    entry_low: 199,
    entry_high: 202,
    stop_loss: 194,
    target_1: 209,
    target_2: 216,
    risk_reward: 2.0,
    confidence: "Medium",
    timeframe: "4-8 days",
    thesis: "Financials are firming and JPM is pressing against resistance with steady demand.",
    invalidation: "A close below $194 would reject the breakout base.",
    reason_to_avoid: "Avoid if yields move sharply against the financial sector.",
    status: "new",
  },
  {
    ticker: "XOM",
    company_name: "Exxon Mobil Corporation",
    direction: "Long",
    setup_type: "Sector strength",
    entry_low: 113,
    entry_high: 115,
    stop_loss: 109,
    target_1: 120,
    target_2: 125,
    risk_reward: 2.2,
    confidence: "Medium",
    timeframe: "3-7 days",
    thesis: "Energy is showing steady bid and XOM is holding above a higher low.",
    invalidation: "A close below $109 would break the short-term uptrend.",
    reason_to_avoid: "Avoid if crude oil sells off sharply before entry.",
    status: "new",
  },
  {
    ticker: "COST",
    company_name: "Costco Wholesale Corporation",
    direction: "Long",
    setup_type: "Orderly pullback",
    entry_low: 842,
    entry_high: 850,
    stop_loss: 825,
    target_1: 872,
    target_2: 895,
    risk_reward: 2.1,
    confidence: "High",
    timeframe: "5-10 days",
    thesis: "The stock is pulling back gently within a strong trend while defensive retail holds up.",
    invalidation: "A close below $825 would break the pullback structure.",
    reason_to_avoid: "Avoid if consumer staples weaken across the board.",
    status: "new",
  },
];

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function POST(request: Request) {
  try {
    let body: { session_type?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Please send a JSON request body." },
        { status: 400 },
      );
    }

    if (body.session_type !== "morning" && body.session_type !== "midday") {
      return NextResponse.json(
        { error: "session_type must be morning or midday." },
        { status: 400 },
      );
    }

    const sessionType = body.session_type;
    const todayStart = getStartOfToday();

    const [todaysRecommendationsResult, openPositionsResult] = await Promise.all([
      supabase
        .from("recommendations")
        .select("ticker")
        .gte("created_at", todayStart),
      supabase.from("positions").select("ticker").eq("status", "open"),
    ]);

    if (todaysRecommendationsResult.error) {
      console.error(todaysRecommendationsResult.error);
      return NextResponse.json(
        { error: todaysRecommendationsResult.error.message ?? "Unknown error" },
        { status: 500 },
      );
    }

    if (openPositionsResult.error) {
      console.error(openPositionsResult.error);
      return NextResponse.json(
        { error: openPositionsResult.error.message ?? "Unknown error" },
        { status: 500 },
      );
    }

    const blockedTickers = new Set<string>();

    for (const recommendation of todaysRecommendationsResult.data ?? []) {
      blockedTickers.add(String(recommendation.ticker).toUpperCase());
    }

    for (const position of openPositionsResult.data ?? []) {
      blockedTickers.add(String(position.ticker).toUpperCase());
    }

    const availableRecommendations = mockRecommendations.filter(
      (recommendation) => !blockedTickers.has(recommendation.ticker),
    );
    const amountToCreate = Math.min(
      availableRecommendations.length,
      Math.floor(Math.random() * 3) + 3,
    );
    const recommendationsToInsert: RecommendationInsert[] = shuffle(
      availableRecommendations,
    )
      .slice(0, amountToCreate)
      .map((recommendation) => ({
        session_type: sessionType,
        ...recommendation,
      }));

    if (recommendationsToInsert.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    const insertResult = await supabase
      .from("recommendations")
      .insert(recommendationsToInsert)
      .select("*");

    if (insertResult.error) {
      console.error(insertResult.error);
      return NextResponse.json(
        { error: insertResult.error.message ?? "Unknown error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ recommendations: insertResult.data ?? [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
