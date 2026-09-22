import { expect, test } from "@playwright/test";

import {
  buildInternalPaperExitCommand,
  INTERNAL_PAPER_EXIT_COMMAND_VERSION,
  INTERNAL_PAPER_EXIT_EVIDENCE_VERSION,
  INTERNAL_PAPER_EXIT_FILL_MODEL_VERSION,
} from "@/lib/internal-paper-exit";
import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";
const POSITION_ID = "33333333-3333-4333-8333-333333333333";
const CANDLE_ID = "44444444-4444-4444-8444-444444444444";

function candle(overrides: Partial<SharedCandleCacheCandle> = {}) {
  return {
    contract_version: "shared_candle_cache_v1",
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "1min",
    timestamp: "2026-09-21T15:00:00.000Z",
    open: 111,
    high: 112.2,
    low: 110.8,
    close: 112,
    volume: 12345,
    timezone: "America/New_York",
    adjusted: true,
    market_session: "regular",
    fetched_at: "2026-09-21T15:00:03.000Z",
    source_request_id: "td-request-1",
    validation_status: "valid",
    ...overrides,
  } satisfies SharedCandleCacheCandle;
}

function build(
  overrides: Partial<Parameters<typeof buildInternalPaperExitCommand>[0]> = {},
) {
  return buildInternalPaperExitCommand({
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    position_id: POSITION_ID,
    durable_candle_id: CANDLE_ID,
    position_ticker: "AAPL",
    candle: candle(),
    ...overrides,
  });
}

test.describe("SV-C2 internal-paper exit admission", () => {
  test("emits only durable identities and leaves reason, quantity and price to the database", () => {
    expect(build()).toEqual({
      status: "ready",
      reason_codes: [],
      command: {
        command_version: INTERNAL_PAPER_EXIT_COMMAND_VERSION,
        fill_model_version: INTERNAL_PAPER_EXIT_FILL_MODEL_VERSION,
        evidence_version: INTERNAL_PAPER_EXIT_EVIDENCE_VERSION,
        owner_user_id: OWNER_ID,
        account_id: ACCOUNT_ID,
        position_id: POSITION_ID,
        candle_id: CANDLE_ID,
      },
    });
    expect(build().command).not.toHaveProperty("exit_price");
    expect(build().command).not.toHaveProperty("quantity");
    expect(build().command).not.toHaveProperty("exit_reason");
  });

  test("rejects stale, synthetic and non-regular evidence before persistence", () => {
    expect(
      build({
        candle: candle({
          validation_status: "stale",
          interval: "5min",
          market_session: "extended",
        }),
      }),
    ).toEqual({
      status: "blocked",
      reason_codes: ["candle_not_regular_one_minute", "candle_not_valid"],
      command: null,
    });
  });

  test("rejects ticker, timezone and durable identity mismatches", () => {
    expect(
      build({
        durable_candle_id: "not-a-uuid",
        candle: candle({ ticker: "MSFT", timezone: "UTC" }),
      }),
    ).toMatchObject({
      status: "blocked",
      reason_codes: [
        "candle_identity_invalid",
        "candle_market_identity_invalid",
      ],
      command: null,
    });
  });

  test("rejects malformed OHLC and non-causal fetch provenance", () => {
    expect(
      build({
        candle: candle({
          high: 99,
          close: 100,
          fetched_at: "2026-09-21T14:59:59.000Z",
          source_request_id: "",
        }),
      }),
    ).toEqual({
      status: "blocked",
      reason_codes: [
        "candle_price_invalid",
        "candle_provenance_incomplete",
        "candle_time_invalid",
      ],
      command: null,
    });
  });
});
