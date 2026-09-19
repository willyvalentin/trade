import { expect, test } from "@playwright/test";

import { buildRealScannerCandidateGenerationSummary } from "@/lib/real-scanner-candidate-generation";
import type { ScannerCandidate } from "@/lib/scanner";
import {
  twelveDataResponseIdentityFromPayloadBytes,
  type TwelveDataResponseIdentity,
} from "@/lib/twelve-data-response-identity";

const providerPayload = JSON.stringify({
  values: [
    {
      datetime: "2026-09-17 10:00:00",
      open: "100",
      high: "101",
      low: "99",
      close: "100.5",
      volume: "2000",
    },
  ],
});

function scannerCandidateWithIdentity(
  responseIdentity: TwelveDataResponseIdentity,
): ScannerCandidate & { local_score: number } {
  return {
    ticker: "TST",
    company_name: "Test Incorporated",
    sector: "Technology",
    mock_current_price: 100.5,
    mock_trend: "uptrend",
    mock_volume_context: "expanding",
    mock_support: 98,
    mock_resistance: 105,
    mock_news_context: "none",
    latest_close: 100.5,
    volume_ratio: 1.8,
    proposed_entry_low: 100,
    proposed_entry_high: 101,
    proposed_stop_loss: 98,
    proposed_target_1: 106,
    proposed_target_2: 108,
    proposed_risk_reward: 2.5,
    intraday_indicators: {
      vwap: 100,
      latestPrice: 100.5,
      priceVsVwapPercent: 0.5,
      isAboveVwap: true,
      recentHigh: 101,
      recentLow: 99,
      recentRangePercent: 2,
      momentumPercent: 0.5,
      momentumDirection: "up",
      volumeTrend: "expanding",
      latestVolume: 2000,
      averageVolume: 1000,
      warnings: [],
    },
    intraday_indicator_source: "fresh",
    intraday_indicator_cached_at: "2026-09-17T14:00:00.000Z",
    intraday_indicator_response_identity: responseIdentity,
    intraday_indicator_stale: false,
    reference_price_timestamp: "2026-09-17T14:00:00.000Z",
    reference_price_provider: "twelve_data",
    local_score: 92,
  };
}

test("captures a deterministic privacy-preserving Twelve Data response identity and carries it into scanner candidates", async () => {
  const providerPayloadBytes = new TextEncoder().encode(providerPayload);
  const first = await twelveDataResponseIdentityFromPayloadBytes(
    providerPayloadBytes,
  );
  const second = await twelveDataResponseIdentityFromPayloadBytes(
    providerPayloadBytes,
  );

  expect(first).toEqual(second);
  expect(first).toMatchObject({
      contract_version: "twelve_data_response_identity_v1",
      digest_algorithm: "sha256",
      payload_sha256: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      payload_byte_length: new TextEncoder().encode(providerPayload).byteLength,
  });

  const summary = buildRealScannerCandidateGenerationSummary({
    universe: [scannerCandidateWithIdentity(first)],
    candidates: [scannerCandidateWithIdentity(first)],
    source: "test",
    scanWindow: "midday",
    now: new Date("2026-09-17T14:01:00.000Z"),
  });

  expect(summary.candidates[0]?.intraday_indicator_response_identity).toEqual(
    first,
  );
});

test("response identity changes when the actual provider payload changes", async () => {
  const changedPayload = providerPayload.replace('"100.5"', '"100.6"');
  const first = await twelveDataResponseIdentityFromPayloadBytes(
    new TextEncoder().encode(providerPayload),
  );
  const second = await twelveDataResponseIdentityFromPayloadBytes(
    new TextEncoder().encode(changedPayload),
  );

  expect(first.payload_sha256).not.toBe(second.payload_sha256);
  expect(first.payload_byte_length).toBe(second.payload_byte_length);
});
