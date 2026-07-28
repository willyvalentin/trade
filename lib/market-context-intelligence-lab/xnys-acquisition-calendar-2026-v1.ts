import { createHash } from "node:crypto";

import { stableMarketContextTradePreparationJsonV2 } from "./trade-to-candle-preparation-v2";

export const MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1 =
  "market_context_xnys_acquisition_calendar_2026_v1" as const;

const sha256Pattern = /^[0-9a-f]{64}$/;
const unixNsPattern = /^(0|[1-9][0-9]*)$/;

export const MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CORE = {
  artifact_id: "market-context-xnys-acquisition-calendar-2026",
  artifact_version: MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1,
  exchange: "XNYS",
  session_scope: "core_trading_session",
  exchange_timezone: "America/New_York",
  timezone_policy:
    "NYSE Eastern Time converted explicitly to UTC; July 2026 is EDT (UTC-04:00); no host-local timezone conversion",
  retrieved_on: "2026-07-27",
  sources: [
    {
      source_id: "nyse_2026_yearly_trading_calendar",
      authority: "NYSE",
      url: "https://www.nyse.com/publicdocs/nyse/ICE_NYSE_2026_Yearly_Trading_Calendar.pdf",
      retrieved_on: "2026-07-27",
      content_sha256:
        "70f5577eb43e60a9dbbecaae3cec23d0f02028c05c7f175013bb3e97816d394f",
      supports: [
        "2026 trading-day and exchange-holiday schedule",
        "2026 early-close markings",
        "2026-07-20 through 2026-07-24 are ordinary trading days",
      ],
    },
    {
      source_id: "nyse_holidays_and_trading_hours",
      authority: "NYSE",
      url: "https://www.nyse.com/trade/hours-calendars",
      retrieved_on: "2026-07-27",
      content_sha256:
        "c466a9cb0377a8028046cd581e782f2695d01e2d06570a8f68d048681c0f2ebe",
      supports: [
        "NYSE core trading session is 09:30 through 16:00 Eastern Time",
        "2026 Independence Day closure is 2026-07-03",
        "no early-close exception applies to 2026-07-20 through 2026-07-24",
      ],
    },
  ],
  sessions: [
    {
      date: "2026-07-20",
      open_explicit_instant: "2026-07-20T13:30:00Z",
      close_explicit_instant: "2026-07-20T20:00:00Z",
      open_unix_ns: "1784554200000000000",
      close_unix_ns: "1784577600000000000",
      early_close: false,
      session_type: "regular",
    },
    {
      date: "2026-07-21",
      open_explicit_instant: "2026-07-21T13:30:00Z",
      close_explicit_instant: "2026-07-21T20:00:00Z",
      open_unix_ns: "1784640600000000000",
      close_unix_ns: "1784664000000000000",
      early_close: false,
      session_type: "regular",
    },
    {
      date: "2026-07-22",
      open_explicit_instant: "2026-07-22T13:30:00Z",
      close_explicit_instant: "2026-07-22T20:00:00Z",
      open_unix_ns: "1784727000000000000",
      close_unix_ns: "1784750400000000000",
      early_close: false,
      session_type: "regular",
    },
    {
      date: "2026-07-23",
      open_explicit_instant: "2026-07-23T13:30:00Z",
      close_explicit_instant: "2026-07-23T20:00:00Z",
      open_unix_ns: "1784813400000000000",
      close_unix_ns: "1784836800000000000",
      early_close: false,
      session_type: "regular",
    },
    {
      date: "2026-07-24",
      open_explicit_instant: "2026-07-24T13:30:00Z",
      close_explicit_instant: "2026-07-24T20:00:00Z",
      open_unix_ns: "1784899800000000000",
      close_unix_ns: "1784923200000000000",
      early_close: false,
      session_type: "regular",
    },
  ],
  independent_control: {
    status: "passed",
    method:
      "NYSE yearly trading calendar dates cross-checked against NYSE official holiday exceptions and published 09:30-16:00 ET core hours",
    price_data_used: false,
    replay_output_used: false,
  },
} as const;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export const MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CANONICAL_JSON =
  stableMarketContextTradePreparationJsonV2(
    MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CORE,
  );

export const MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_SHA256 =
  sha256(
    MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CANONICAL_JSON,
  );

export const MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_ARTIFACT =
  {
    ...MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CORE,
    canonical_json:
      MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CANONICAL_JSON,
    artifact_sha256:
      MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_SHA256,
  } as const;

export function validateMarketContextXnysAcquisitionCalendar2026V1(
  input: unknown,
) {
  try {
    const value = input as typeof MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_ARTIFACT;
    const { canonical_json, artifact_sha256, ...core } = value;
    const canonical = stableMarketContextTradePreparationJsonV2(core);
    if (
      canonical_json !== canonical ||
      canonical !==
        MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CANONICAL_JSON ||
      !sha256Pattern.test(artifact_sha256 ?? "") ||
      artifact_sha256 !== sha256(canonical) ||
      value.artifact_version !==
        MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1 ||
      value.exchange !== "XNYS" ||
      value.exchange_timezone !== "America/New_York" ||
      value.sessions.length !== 5 ||
      value.sessions.some(
        (session) =>
          !unixNsPattern.test(session.open_unix_ns) ||
          !unixNsPattern.test(session.close_unix_ns) ||
          BigInt(session.open_unix_ns) >=
            BigInt(session.close_unix_ns) ||
          session.early_close !== false ||
          session.session_type !== "regular",
      )
    ) {
      return {
        status: "invalid_calendar",
        error_codes: ["xnys_acquisition_calendar_integrity_invalid"],
      } as const;
    }
    return {
      status: "valid_calendar",
      artifact_version:
        MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1,
      artifact_sha256,
      session_count: 5,
      metadata_inferred: false,
    } as const;
  } catch {
    return {
      status: "invalid_calendar",
      error_codes: ["xnys_acquisition_calendar_malformed"],
    } as const;
  }
}
