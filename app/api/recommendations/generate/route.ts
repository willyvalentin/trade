import { NextResponse } from "next/server";

import {
  generateRecommendations,
  RecommendationGenerationError,
} from "@/lib/recommendation-generator";
import { getUsMarketStatus } from "@/lib/market-calendar";

type GenerateRequestBody = {
  session_type?: unknown;
  target_count?: unknown;
};

function parseTargetCount(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    throw new RecommendationGenerationError(
      "target_count must be a positive integer.",
      400,
    );
  }

  return value;
}

export async function POST(request: Request) {
  try {
    let body: GenerateRequestBody;

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

    const marketStatus = await getUsMarketStatus();

    if (!marketStatus.isOpenDay) {
      return NextResponse.json(
        {
          error: "US stock market is closed today.",
          market_status: marketStatus,
        },
        { status: 400 },
      );
    }

    const result = await generateRecommendations({
      sessionType: body.session_type,
      targetCount: parseTargetCount(body.target_count),
      source: "manual",
    });

    return NextResponse.json({ ...result, market_status: marketStatus });
  } catch (error) {
    console.error(error);

    if (error instanceof RecommendationGenerationError) {
      return NextResponse.json(
        {
          error: error.message,
          ...error.details,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
