import OpenAI from "openai";
import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

type SessionType = "morning" | "midday";
type Confidence = "Low" | "Medium" | "High";

type RecommendationInsert = {
  session_type: SessionType;
  ticker: string;
  company_name: string;
  direction: "long";
  setup_type: string;
  entry_low: number;
  entry_high: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  risk_reward: number;
  confidence: Confidence;
  timeframe: string;
  thesis: string;
  invalidation: string;
  reason_to_avoid: string;
  status: "new";
};

type MockCandidate = {
  ticker: string;
  company_name: string;
  sector: string;
  mock_current_price: number;
  mock_trend: string;
  mock_volume_context: string;
  mock_support: number;
  mock_resistance: number;
  mock_news_context: string;
};

type AiRecommendation = Omit<RecommendationInsert, "session_type" | "status">;

type AiResponse = {
  recommendations: AiRecommendation[];
};

const mockCandidates: MockCandidate[] = [
  {
    ticker: "AAPL",
    company_name: "Apple Inc.",
    sector: "Technology",
    mock_current_price: 184.5,
    mock_trend: "Orderly pullback inside a broader uptrend",
    mock_volume_context: "Volume has been near average with heavier demand on green days",
    mock_support: 181,
    mock_resistance: 190,
    mock_news_context: "Mock context: product-cycle sentiment is steady, with no live news used",
  },
  {
    ticker: "MSFT",
    company_name: "Microsoft Corporation",
    sector: "Technology",
    mock_current_price: 423.2,
    mock_trend: "Tight consolidation near recent highs",
    mock_volume_context: "Volume is slightly above average during advances",
    mock_support: 416,
    mock_resistance: 432,
    mock_news_context: "Mock context: cloud and AI software narrative remains constructive",
  },
  {
    ticker: "NVDA",
    company_name: "NVIDIA Corporation",
    sector: "Technology",
    mock_current_price: 118.4,
    mock_trend: "Momentum reset after a shallow dip",
    mock_volume_context: "Volume expands on upside pushes and cools on pullbacks",
    mock_support: 113,
    mock_resistance: 124,
    mock_news_context: "Mock context: semiconductor demand theme remains supportive",
  },
  {
    ticker: "AMZN",
    company_name: "Amazon.com, Inc.",
    sector: "Consumer Discretionary",
    mock_current_price: 180.1,
    mock_trend: "Compression below range resistance",
    mock_volume_context: "Volume is balanced, with no clear distribution signal",
    mock_support: 174,
    mock_resistance: 184,
    mock_news_context: "Mock context: retail and cloud sentiment are mixed but stable",
  },
  {
    ticker: "GOOGL",
    company_name: "Alphabet Inc.",
    sector: "Communication Services",
    mock_current_price: 168.8,
    mock_trend: "Testing a prior demand zone",
    mock_volume_context: "Volume is average, with buyers appearing near support",
    mock_support: 164,
    mock_resistance: 176,
    mock_news_context: "Mock context: digital advertising narrative remains neutral-positive",
  },
  {
    ticker: "META",
    company_name: "Meta Platforms, Inc.",
    sector: "Communication Services",
    mock_current_price: 497.5,
    mock_trend: "Bull flag after a strong advance",
    mock_volume_context: "Volume is drying up during the flag",
    mock_support: 484,
    mock_resistance: 508,
    mock_news_context: "Mock context: platform engagement and AI capex themes are balanced",
  },
  {
    ticker: "TSLA",
    company_name: "Tesla, Inc.",
    sector: "Consumer Discretionary",
    mock_current_price: 178.2,
    mock_trend: "Volatile rebound into overhead supply",
    mock_volume_context: "Volume is choppy and higher than average",
    mock_support: 169,
    mock_resistance: 187,
    mock_news_context: "Mock context: EV sentiment remains volatile; no live headlines used",
  },
  {
    ticker: "JPM",
    company_name: "JPMorgan Chase & Co.",
    sector: "Financials",
    mock_current_price: 201.3,
    mock_trend: "Relative strength breakout attempt",
    mock_volume_context: "Volume has been steady during the recent rise",
    mock_support: 195,
    mock_resistance: 207,
    mock_news_context: "Mock context: large-bank sentiment is firm in this mock dataset",
  },
  {
    ticker: "XOM",
    company_name: "Exxon Mobil Corporation",
    sector: "Energy",
    mock_current_price: 114.4,
    mock_trend: "Higher-low structure with sector support",
    mock_volume_context: "Volume is average, with demand on dips",
    mock_support: 110,
    mock_resistance: 120,
    mock_news_context: "Mock context: energy complex is treated as stable, not live",
  },
  {
    ticker: "COST",
    company_name: "Costco Wholesale Corporation",
    sector: "Consumer Staples",
    mock_current_price: 846.7,
    mock_trend: "Controlled pullback in a defensive leader",
    mock_volume_context: "Volume is lighter on the pullback",
    mock_support: 828,
    mock_resistance: 870,
    mock_news_context: "Mock context: defensive retail demand remains resilient",
  },
  {
    ticker: "AVGO",
    company_name: "Broadcom Inc.",
    sector: "Technology",
    mock_current_price: 139.6,
    mock_trend: "Sideways base after trend advance",
    mock_volume_context: "Volume is contracting inside the base",
    mock_support: 134,
    mock_resistance: 146,
    mock_news_context: "Mock context: chip infrastructure demand remains supportive",
  },
  {
    ticker: "AMD",
    company_name: "Advanced Micro Devices, Inc.",
    sector: "Technology",
    mock_current_price: 157.4,
    mock_trend: "Reclaiming short-term moving averages",
    mock_volume_context: "Volume improved on the reclaim attempt",
    mock_support: 150,
    mock_resistance: 166,
    mock_news_context: "Mock context: AI accelerator sentiment is constructive",
  },
  {
    ticker: "NFLX",
    company_name: "Netflix, Inc.",
    sector: "Communication Services",
    mock_current_price: 640.2,
    mock_trend: "High tight range near resistance",
    mock_volume_context: "Volume is modest but consistent",
    mock_support: 620,
    mock_resistance: 660,
    mock_news_context: "Mock context: subscriber and ad-tier narrative is positive",
  },
  {
    ticker: "CRM",
    company_name: "Salesforce, Inc.",
    sector: "Technology",
    mock_current_price: 276.3,
    mock_trend: "Attempting to turn up from support",
    mock_volume_context: "Volume is mixed, improving on up days",
    mock_support: 268,
    mock_resistance: 290,
    mock_news_context: "Mock context: enterprise software sentiment is stabilizing",
  },
  {
    ticker: "ORCL",
    company_name: "Oracle Corporation",
    sector: "Technology",
    mock_current_price: 126.9,
    mock_trend: "Pullback toward rising support",
    mock_volume_context: "Volume is lighter than average on the pullback",
    mock_support: 122,
    mock_resistance: 134,
    mock_news_context: "Mock context: cloud infrastructure demand theme is constructive",
  },
  {
    ticker: "ADBE",
    company_name: "Adobe Inc.",
    sector: "Technology",
    mock_current_price: 512.8,
    mock_trend: "Basing after a prior selloff",
    mock_volume_context: "Volume is drying up as price stabilizes",
    mock_support: 498,
    mock_resistance: 535,
    mock_news_context: "Mock context: creative software sentiment is neutral",
  },
  {
    ticker: "INTC",
    company_name: "Intel Corporation",
    sector: "Technology",
    mock_current_price: 35.6,
    mock_trend: "Early reversal attempt from support",
    mock_volume_context: "Volume is elevated but inconsistent",
    mock_support: 33.5,
    mock_resistance: 39,
    mock_news_context: "Mock context: turnaround narrative remains speculative",
  },
  {
    ticker: "QCOM",
    company_name: "QUALCOMM Incorporated",
    sector: "Technology",
    mock_current_price: 188.4,
    mock_trend: "Trend continuation above a prior base",
    mock_volume_context: "Volume has been above average during the advance",
    mock_support: 181,
    mock_resistance: 198,
    mock_news_context: "Mock context: handset and edge-AI sentiment is supportive",
  },
  {
    ticker: "SHOP",
    company_name: "Shopify Inc.",
    sector: "Technology",
    mock_current_price: 76.3,
    mock_trend: "Rounded base with improving momentum",
    mock_volume_context: "Volume is gradually improving",
    mock_support: 72,
    mock_resistance: 82,
    mock_news_context: "Mock context: ecommerce software sentiment is improving",
  },
  {
    ticker: "UBER",
    company_name: "Uber Technologies, Inc.",
    sector: "Industrials",
    mock_current_price: 71.8,
    mock_trend: "Constructive consolidation above support",
    mock_volume_context: "Volume is near average with no distribution cluster",
    mock_support: 68,
    mock_resistance: 77,
    mock_news_context: "Mock context: mobility demand narrative is stable",
  },
  {
    ticker: "BA",
    company_name: "The Boeing Company",
    sector: "Industrials",
    mock_current_price: 184.7,
    mock_trend: "Basing below a key resistance shelf",
    mock_volume_context: "Volume is uneven and event-sensitive",
    mock_support: 176,
    mock_resistance: 195,
    mock_news_context: "Mock context: industrial sentiment is cautious",
  },
  {
    ticker: "CAT",
    company_name: "Caterpillar Inc.",
    sector: "Industrials",
    mock_current_price: 332.4,
    mock_trend: "Higher lows with cyclical leadership",
    mock_volume_context: "Volume is steady on advances",
    mock_support: 320,
    mock_resistance: 348,
    mock_news_context: "Mock context: machinery demand theme is constructive",
  },
  {
    ticker: "GE",
    company_name: "GE Aerospace",
    sector: "Industrials",
    mock_current_price: 164.9,
    mock_trend: "Strong trend pausing above short-term support",
    mock_volume_context: "Volume is average after prior accumulation",
    mock_support: 158,
    mock_resistance: 173,
    mock_news_context: "Mock context: aerospace demand theme remains supportive",
  },
  {
    ticker: "HD",
    company_name: "The Home Depot, Inc.",
    sector: "Consumer Discretionary",
    mock_current_price: 356.7,
    mock_trend: "Base breakout attempt",
    mock_volume_context: "Volume is slightly above average near resistance",
    mock_support: 344,
    mock_resistance: 368,
    mock_news_context: "Mock context: housing-related demand is treated as mixed",
  },
  {
    ticker: "MCD",
    company_name: "McDonald's Corporation",
    sector: "Consumer Discretionary",
    mock_current_price: 287.1,
    mock_trend: "Defensive uptrend with a shallow pullback",
    mock_volume_context: "Volume is light but stable",
    mock_support: 280,
    mock_resistance: 296,
    mock_news_context: "Mock context: restaurant traffic sentiment is steady",
  },
  {
    ticker: "NKE",
    company_name: "NIKE, Inc.",
    sector: "Consumer Discretionary",
    mock_current_price: 92.4,
    mock_trend: "Attempting to recover from a low base",
    mock_volume_context: "Volume is improving but still uneven",
    mock_support: 88,
    mock_resistance: 99,
    mock_news_context: "Mock context: consumer brand sentiment is cautious",
  },
  {
    ticker: "WMT",
    company_name: "Walmart Inc.",
    sector: "Consumer Staples",
    mock_current_price: 67.8,
    mock_trend: "Steady defensive trend near highs",
    mock_volume_context: "Volume is consistent with mild accumulation",
    mock_support: 65,
    mock_resistance: 70.5,
    mock_news_context: "Mock context: value retail sentiment remains resilient",
  },
  {
    ticker: "PEP",
    company_name: "PepsiCo, Inc.",
    sector: "Consumer Staples",
    mock_current_price: 171.5,
    mock_trend: "Support bounce inside a wide range",
    mock_volume_context: "Volume is average and defensive",
    mock_support: 166,
    mock_resistance: 179,
    mock_news_context: "Mock context: staples demand is steady",
  },
  {
    ticker: "LLY",
    company_name: "Eli Lilly and Company",
    sector: "Health Care",
    mock_current_price: 784.3,
    mock_trend: "Power trend with a controlled pause",
    mock_volume_context: "Volume remains supportive on advances",
    mock_support: 755,
    mock_resistance: 815,
    mock_news_context: "Mock context: obesity-drug demand theme remains strong",
  },
  {
    ticker: "UNH",
    company_name: "UnitedHealth Group Incorporated",
    sector: "Health Care",
    mock_current_price: 508.6,
    mock_trend: "Recovering from a higher low",
    mock_volume_context: "Volume is stable, not aggressive",
    mock_support: 492,
    mock_resistance: 530,
    mock_news_context: "Mock context: managed-care sentiment is stabilizing",
  },
  {
    ticker: "ABBV",
    company_name: "AbbVie Inc.",
    sector: "Health Care",
    mock_current_price: 169.2,
    mock_trend: "Defensive consolidation above support",
    mock_volume_context: "Volume is slightly below average",
    mock_support: 164,
    mock_resistance: 176,
    mock_news_context: "Mock context: pharma sentiment is steady",
  },
  {
    ticker: "MRK",
    company_name: "Merck & Co., Inc.",
    sector: "Health Care",
    mock_current_price: 128.4,
    mock_trend: "Trend continuation attempt after a pause",
    mock_volume_context: "Volume is balanced with mild accumulation",
    mock_support: 123,
    mock_resistance: 134,
    mock_news_context: "Mock context: large-cap pharma demand is stable",
  },
  {
    ticker: "V",
    company_name: "Visa Inc.",
    sector: "Financials",
    mock_current_price: 279.6,
    mock_trend: "Shallow pullback in a steady trend",
    mock_volume_context: "Volume is quiet but constructive",
    mock_support: 271,
    mock_resistance: 290,
    mock_news_context: "Mock context: payments volume sentiment is constructive",
  },
  {
    ticker: "MA",
    company_name: "Mastercard Incorporated",
    sector: "Financials",
    mock_current_price: 456.2,
    mock_trend: "Base building near highs",
    mock_volume_context: "Volume is normal and calm",
    mock_support: 442,
    mock_resistance: 472,
    mock_news_context: "Mock context: consumer payments sentiment remains positive",
  },
  {
    ticker: "GS",
    company_name: "The Goldman Sachs Group, Inc.",
    sector: "Financials",
    mock_current_price: 414.8,
    mock_trend: "Financial-sector strength with higher lows",
    mock_volume_context: "Volume is stronger on upside moves",
    mock_support: 400,
    mock_resistance: 430,
    mock_news_context: "Mock context: capital markets sentiment is improving",
  },
  {
    ticker: "CVX",
    company_name: "Chevron Corporation",
    sector: "Energy",
    mock_current_price: 158.1,
    mock_trend: "Range support bounce",
    mock_volume_context: "Volume is average with no clear pressure",
    mock_support: 153,
    mock_resistance: 166,
    mock_news_context: "Mock context: integrated energy sentiment is stable",
  },
];

const recommendationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["recommendations"],
  properties: {
    recommendations: {
      type: "array",
      minItems: 0,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "ticker",
          "company_name",
          "direction",
          "setup_type",
          "entry_low",
          "entry_high",
          "stop_loss",
          "target_1",
          "target_2",
          "risk_reward",
          "confidence",
          "timeframe",
          "thesis",
          "invalidation",
          "reason_to_avoid",
        ],
        properties: {
          ticker: { type: "string" },
          company_name: { type: "string" },
          direction: { type: "string", enum: ["long"] },
          setup_type: { type: "string" },
          entry_low: { type: "number" },
          entry_high: { type: "number" },
          stop_loss: { type: "number" },
          target_1: { type: "number" },
          target_2: { type: "number" },
          risk_reward: { type: "number" },
          confidence: { type: "string", enum: ["Low", "Medium", "High"] },
          timeframe: { type: "string" },
          thesis: { type: "string" },
          invalidation: { type: "string" },
          reason_to_avoid: { type: "string" },
        },
      },
    },
  },
};

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

function normalizeTicker(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function text(value: unknown, fieldName: string) {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  return trimmed;
}

function number(value: unknown, fieldName: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number.`);
  }

  return Number(value.toFixed(2));
}

function parseAiResponse(outputText: string): AiResponse {
  try {
    const parsed = JSON.parse(outputText) as unknown;

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray((parsed as { recommendations?: unknown }).recommendations)
    ) {
      throw new Error("Response JSON did not include a recommendations array.");
    }

    return parsed as AiResponse;
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unknown JSON parsing error.";

    throw new Error(`OpenAI returned invalid JSON: ${message}`);
  }
}

function sanitizeRecommendations(
  aiRecommendations: AiRecommendation[],
  availableCandidates: MockCandidate[],
  sessionType: SessionType,
): RecommendationInsert[] {
  const candidatesByTicker = new Map(
    availableCandidates.map((candidate) => [candidate.ticker, candidate]),
  );
  const seenTickers = new Set<string>();

  return aiRecommendations.slice(0, 5).map((recommendation, index) => {
    const ticker = normalizeTicker(recommendation.ticker);
    const candidate = candidatesByTicker.get(ticker);

    if (!candidate) {
      throw new Error(
        `Recommendation ${index + 1} used ticker ${ticker || "(empty)"}, which was not an available candidate.`,
      );
    }

    if (seenTickers.has(ticker)) {
      throw new Error(`OpenAI returned duplicate ticker ${ticker}.`);
    }

    seenTickers.add(ticker);

    if (recommendation.direction !== "long") {
      throw new Error(`Recommendation ${ticker} direction must be long.`);
    }

    const confidence = recommendation.confidence;

    if (
      confidence !== "Low" &&
      confidence !== "Medium" &&
      confidence !== "High"
    ) {
      throw new Error(`Recommendation ${ticker} confidence is invalid.`);
    }

    return {
      session_type: sessionType,
      ticker,
      company_name: candidate.company_name,
      direction: "long",
      setup_type: text(recommendation.setup_type, `${ticker}.setup_type`),
      entry_low: number(recommendation.entry_low, `${ticker}.entry_low`),
      entry_high: number(recommendation.entry_high, `${ticker}.entry_high`),
      stop_loss: number(recommendation.stop_loss, `${ticker}.stop_loss`),
      target_1: number(recommendation.target_1, `${ticker}.target_1`),
      target_2: number(recommendation.target_2, `${ticker}.target_2`),
      risk_reward: number(recommendation.risk_reward, `${ticker}.risk_reward`),
      confidence,
      timeframe: text(recommendation.timeframe, `${ticker}.timeframe`),
      thesis: text(recommendation.thesis, `${ticker}.thesis`),
      invalidation: text(recommendation.invalidation, `${ticker}.invalidation`),
      reason_to_avoid: text(
        recommendation.reason_to_avoid,
        `${ticker}.reason_to_avoid`,
      ),
      status: "new",
    };
  });
}

async function generateRecommendationsWithOpenAI(
  availableCandidates: MockCandidate[],
  sessionType: SessionType,
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env.local.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    instructions: [
      "You generate mock trade recommendation cards for a private trading app.",
      "You are not using live market data.",
      "You must not pretend the recommendations are based on real-time prices.",
      "Treat the provided candidates as mock structured inputs only.",
      "Choose 3 to 5 long-only recommendations, or fewer if quality is weak.",
      "Use only tickers from the provided candidates.",
      "Make entry, stop, and target levels coherent with each candidate's mock support, mock resistance, and mock_current_price.",
      "risk_reward must be a JSON number such as 2.2, never a string such as 2.2R or 1:2.2.",
      "Only output JSON. Do not include markdown. Do not include explanations outside JSON.",
    ].join("\n"),
    input: JSON.stringify({
      session_type: sessionType,
      candidates: availableCandidates,
    }),
    text: {
      format: {
        type: "json_schema",
        name: "trade_recommendations",
        strict: true,
        schema: recommendationSchema,
      },
    },
    temperature: 0.3,
    max_output_tokens: 3000,
    store: false,
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty response.");
  }

  return parseAiResponse(response.output_text);
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
      blockedTickers.add(normalizeTicker(recommendation.ticker));
    }

    for (const position of openPositionsResult.data ?? []) {
      blockedTickers.add(normalizeTicker(position.ticker));
    }

    const availableCandidates = mockCandidates.filter(
      (candidate) => !blockedTickers.has(candidate.ticker),
    );

    if (availableCandidates.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    const aiResponse = await generateRecommendationsWithOpenAI(
      availableCandidates,
      sessionType,
    );
    const recommendationsToInsert = sanitizeRecommendations(
      aiResponse.recommendations,
      availableCandidates,
      sessionType,
    );

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
