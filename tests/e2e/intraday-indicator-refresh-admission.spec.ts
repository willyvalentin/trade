import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION,
  resolveIntradayIndicatorRefreshAdmission,
} from "@/lib/intraday-indicator-refresh-admission";
import { CANDIDATE_DECISION_SCANNER_VERSION } from "@/lib/candidate-decision-record";
import { planOtherwiseOmittedFirstPair } from "@/lib/intraday-indicator-refresh-admission";

test("first-pair guard protects one genuinely omitted member instead of an already admitted unseen member", () => {
  const members = Array.from({ length: 8 }, (_, ticker_index) => ({ ticker_index,
    estimated_requests: 2, previously_acquired: false }));
  expect(planOtherwiseOmittedFirstPair(members, 8, true)).toMatchObject({
    policy_version: "completed_input_omitted_first_pair_guard_v1",
    guarded_ticker_index: 4, acquisition_order: [4, 0, 1, 2, 3, 5, 6, 7],
  });
});

test("first-pair guard preserves free fresh members and skips previously acquired omitted members", () => {
  const members = [0, 2, 2, 1, 2].map((estimated_requests, ticker_index) => ({
    ticker_index, estimated_requests, previously_acquired: ticker_index === 3,
  }));
  expect(planOtherwiseOmittedFirstPair(members, 4, true)).toMatchObject({
    guarded_ticker_index: 4, acquisition_order: [0, 4, 1, 2, 3],
  });
});

test("first-pair guard does not intervene before a current bar or without enough credit", () => {
  const members = [2, 2, 2].map((estimated_requests, ticker_index) => ({
    ticker_index, estimated_requests, previously_acquired: false,
  }));
  for (const [cap, possible] of [[8, true], [8, false], [1, true], [0, true]] as const) {
    expect(planOtherwiseOmittedFirstPair(members, cap, possible)).toMatchObject({
      guarded_ticker_index: null, acquisition_order: [0, 1, 2],
    });
  }
});

test("first-pair guard fails closed for invalid counters, indices and demands", () => {
  for (const cap of [-1, 9, NaN, 1.5]) expect(() => planOtherwiseOmittedFirstPair([], cap, true)).toThrow();
  expect(() => planOtherwiseOmittedFirstPair([{ ticker_index: 1, estimated_requests: 1, previously_acquired: false }], 8, true)).toThrow();
  expect(() => planOtherwiseOmittedFirstPair([{ ticker_index: 0, estimated_requests: 3, previously_acquired: false }], 8, true)).toThrow();
});

const boundedRefreshBudget = {
  fresh_provider_calls_used: 0,
  max_fresh_provider_calls: 1,
  fresh_indicator_fetches_used: 0,
  max_fresh_indicator_fetches: 3,
};

test("reuses a fresh cache without reserving a provider credit", () => {
  expect(
    resolveIntradayIndicatorRefreshAdmission({
      cache: { source: "cache", has_indicators: true, stale: false },
      ...boundedRefreshBudget,
    }),
  ).toEqual({
    policy_version: INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION,
    disposition: "reuse_fresh_cache",
    reason_code: "fresh_cache_available",
    allow_fresh_fetch: false,
    reserve_provider_credit: false,
  });
});

test("reserves exactly one provider refresh only when a fresh cache is absent", () => {
  expect(
    resolveIntradayIndicatorRefreshAdmission({
      cache: { source: "cache", has_indicators: true, stale: true },
      ...boundedRefreshBudget,
    }),
  ).toMatchObject({
    disposition: "reserve_provider_refresh",
    reason_code: "provider_refresh_budget_available",
    allow_fresh_fetch: true,
    reserve_provider_credit: true,
  });

  expect(
    resolveIntradayIndicatorRefreshAdmission({
      cache: { source: "unavailable", has_indicators: false, stale: true },
      ...boundedRefreshBudget,
    }),
  ).toMatchObject({
    disposition: "reserve_provider_refresh",
    reserve_provider_credit: true,
  });
});

test("does not permit a provider refresh when either bounded counter is exhausted", () => {
  expect(
    resolveIntradayIndicatorRefreshAdmission({
      cache: { source: "unavailable", has_indicators: false, stale: true },
      ...boundedRefreshBudget,
      fresh_provider_calls_used: 1,
    }),
  ).toMatchObject({
    disposition: "provider_refresh_not_admitted",
    reason_code: "provider_refresh_budget_exhausted",
    allow_fresh_fetch: false,
    reserve_provider_credit: false,
  });

  expect(
    resolveIntradayIndicatorRefreshAdmission({
      cache: { source: "unavailable", has_indicators: false, stale: true },
      ...boundedRefreshBudget,
      fresh_indicator_fetches_used: 3,
    }),
  ).toMatchObject({
    disposition: "provider_refresh_not_admitted",
    reason_code: "provider_refresh_budget_exhausted",
    reserve_provider_credit: false,
  });
});

test("fails closed for invalid budget counters", () => {
  expect(
    resolveIntradayIndicatorRefreshAdmission({
      cache: { source: "unavailable", has_indicators: false, stale: true },
      ...boundedRefreshBudget,
      fresh_provider_calls_used: Number.NaN,
    }),
  ).toMatchObject({
    disposition: "provider_refresh_not_admitted",
    reason_code: "provider_refresh_budget_invalid",
    allow_fresh_fetch: false,
    reserve_provider_credit: false,
  });
});

test("keeps the allocation policy provider-free and configuration-free", () => {
  const source = readFileSync(
    resolve(process.cwd(), "lib/intraday-indicator-refresh-admission.ts"),
    "utf8",
  );

  for (const prohibited of [
    "fetch(",
    "process.env",
    "Netlify.env",
    "createClient",
    "getServerSupabaseClient",
    "getOrRefreshIntradayIndicators",
    ".from(",
  ]) {
    expect(source).not.toContain(prohibited);
  }
});

test("marks new decision records as a separate fresh-cache allocation cohort", () => {
  expect(CANDIDATE_DECISION_SCANNER_VERSION).toBe(
    "scanner_v2_fresh_cache_before_refresh",
  );
});
