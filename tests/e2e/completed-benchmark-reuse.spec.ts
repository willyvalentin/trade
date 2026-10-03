import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { buildCandidateDecisionCapture, buildCandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildRecommendationScanRun } from "@/lib/recommendation-scan-run";
import { buildDecisionLineageReceipt } from "@/lib/decision-lineage-receipt";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import { spawnSync } from "node:child_process";

// Synthetic CLOSED source/transport fixtures, never market or alpha evidence.
test("only revalidated owned original benchmark capsules can free the two reserved calls", async () => {
  const bundle = await build({ stdin: { resolveDir: process.cwd(), contents: `
    export * from './lib/market-regime'; export * from './lib/completed-benchmark-reuse';
    export { scanMarket } from './lib/scanner';` },
    bundle: true, write: false, platform: "node", format: "cjs", conditions: ["react-server"] });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
  const runtime = loaded.exports as typeof import("@/lib/market-regime") & typeof import("@/lib/completed-benchmark-reuse") &
    Pick<typeof import("@/lib/scanner"), "scanMarket">;
  const OriginalDate = globalThis.Date, originalFetch = globalThis.fetch, originalKey = process.env.TWELVE_DATA_API_KEY;
  const captured = new OriginalDate("2026-10-01T17:30:00.000Z");
  const next = new OriginalDate("2026-10-01T17:45:00.000Z");
  const owner = "00000000-0000-4000-8000-000000000001";
  let requests = 0;
  globalThis.Date = class extends OriginalDate {
    constructor(...args: ConstructorParameters<typeof Date>) { super(...(args.length ? args : [captured.getTime()]) as ConstructorParameters<typeof Date>); }
    static now() { return captured.getTime(); }
  } as typeof Date;
  process.env.TWELVE_DATA_API_KEY = "synthetic-closed-only";
  globalThis.fetch = async input => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    expect(url.origin).toBe("https://api.twelvedata.com"); expect(url.pathname).toBe("/time_series");
    expect(url.searchParams.get("adjust")).toBe("splits");
    requests++;
    const values = [];
    for (let days = 0; days < 130 && values.length < 60; days++) {
      const date = new OriginalDate(OriginalDate.parse("2026-09-30T00:00:00Z") - days * 86400000);
      if (!getUsEquityMarketSession(date.toISOString().slice(0, 10)).session_close) continue;
      values.unshift({ datetime: date.toISOString().slice(0, 10), open: "100", high: "102",
        low: "99", close: "101", volume: "1000000" });
    }
    return Response.json({ meta: { symbol: url.searchParams.get("symbol"), interval: "1day",
      exchange_timezone: "America/New_York" }, values });
  };
  try {
    const regime = await runtime.getMarketRegime({ inputPolicyVersion: runtime.COMPLETED_DAILY_MARKET_REGIME_INPUT_POLICY_VERSION });
    expect(requests).toBe(2);
    const run = buildRecommendationScanRun({ observed_at: new OriginalDate(captured.getTime() - 5000).toISOString(),
      completed_at: new OriginalDate(captured.getTime() + 1000).toISOString(), source: "supabase",
      data_mode: "supabase_record", window: "midday" });
    expect(run.completed_at).toBe("2026-10-01T17:30:01.000Z");
    const capture = buildCandidateDecisionCapture({ captureTimestamp: captured.toISOString(), decisionTimestamp: captured.toISOString(), universe: [],
      observedCandidates: [], inputPolicyVersion: "completed_daily_intraday_input_v1", noPublishReason: "no_trade" });
    const decision = buildCandidateDecisionRecord({ scanRun: run, capture,
      scoringVersion: "unchanged-local-scoring", buildVersion: "synthetic-reuse-proof" })!;
    expect(decision).toBeTruthy();
    const row = { ...run, owner_user_id: owner, payload_json: { market_regime: regime,
      candidate_decision_record: decision, decision_lineage_receipt: buildDecisionLineageReceipt(decision) } };
    expect(candidateDecisionRecordFromScanRun(row)).toEqual(decision);
    expect(decisionLineageReceiptFromScanRun(row, decision)).toBeTruthy();
    expect(await runtime.readCompletedMarketRegime(regime, next)).not.toBeNull();
    const read = (source: unknown = row, currentOwner = owner, now = next) =>
      runtime.readOwnedCompletedBenchmarkReuse({ row: source, owner: currentOwner, now });
    const reused = await read();
    expect(reused).not.toBeNull();
    // The legacy serving-window label is not a historical input-fitness gate.
    expect(await read({ ...row, window: "outside_window" })).not.toBeNull();
    expect(await runtime.isValidCompletedBenchmarkReuse(reused!, next)).toBe(true);
    expect(await runtime.isValidCompletedBenchmarkReuse(structuredClone(reused!), next)).toBe(false);
    expect(await runtime.isValidCompletedBenchmarkReuse(reused!, new OriginalDate("2026-10-01T20:00:00Z"))).toBe(false);
    expect(await runtime.isValidCompletedBenchmarkReuse(reused!, new OriginalDate("invalid"))).toBe(false);
    // Exercise the actual scanner admission, not just the brand helper. These
    // failures must happen before any cache read or additional provider call.
    for (const options of [
      { source: "scheduled" as const, completedDailyContextPolicyVersion: "completed_daily_intraday_input_v1" as const,
        completedBenchmarkReuse: structuredClone(reused!), maxFreshProviderCalls: 8 },
      { source: "manual" as const, completedDailyContextPolicyVersion: "completed_daily_intraday_input_v1" as const,
        completedBenchmarkReuse: reused!, maxFreshProviderCalls: 8 },
      { source: "scheduled" as const, completedBenchmarkReuse: reused!, maxFreshProviderCalls: 8 },
    ]) await expect(runtime.scanMarket([], options)).rejects.toThrow("completed_benchmark_reuse_allocation_invalid");
    await expect(runtime.scanMarket([], { source: "scheduled", completedBenchmarkReuse: reused!,
      completedDailyContextPolicyVersion: "completed_daily_intraday_input_v1", maxFreshProviderCalls: 8,
      signal: AbortSignal.abort() })).rejects.toMatchObject({ name: "OperationAbortedError" });
    expect(reused!.market_regime.input_evidence!.reuse).toMatchObject({
      policy_version: "completed_benchmark_regular_session_reuse_v2", source_scan_run_id: run.id,
      source_scan_run_fingerprint: run.run_fingerprint, source_decision_timestamp: decision.decision_timestamp,
      original_classified_at: captured.toISOString(), revalidated_at: next.toISOString(),
      benchmark_provider_calls: 0, scanner_provider_call_cap: 8, whole_scan_provider_call_cap: 8,
      source_window: "midday", source_regular_session_verified: true,
    });
    for (const symbol of ["spy", "qqq"] as const) {
      expect(reused!.market_regime.input_evidence![symbol]).toEqual(regime.input_evidence![symbol]);
    }
    expect(runtime.marketRegimePromptInput(reused!.market_regime)).toEqual(runtime.marketRegimePromptInput(regime));
    expect(await read(row, "00000000-0000-4000-8000-000000000002")).toBeNull();
    expect(await read(row, owner, new OriginalDate("2026-10-02T17:45:00Z"))).toBeNull();
    expect(await read(row, owner, new OriginalDate("2026-10-01T20:00:00Z"))).toBeNull();
    for (const mutate of [
      (v: typeof row) => { v.run_fingerprint = "wrong-binding"; },
      (v: typeof row) => { v.data_mode = "demo_preview"; },
      (v: typeof row) => { v.status = "failed"; },
      (v: typeof row) => { v.status = "stale"; },
      (v: typeof row) => { v.window = "closed"; },
      (v: typeof row) => { v.window = "unknown"; },
      (v: typeof row) => { v.observed_at = "invalid"; },
      (v: typeof row) => { v.completed_at = "invalid"; },
      (v: typeof row) => { v.observed_at = "2026-10-01T13:29:59.000Z"; },
      (v: typeof row) => { v.completed_at = "2026-10-01T20:00:00.000Z"; },
      (v: typeof row) => { delete v.payload_json.candidate_decision_record.versions.input_policy_version; },
      (v: typeof row) => { v.completed_at = "2026-10-01T18:00:00Z"; },
      (v: typeof row) => { v.payload_json.market_regime.spy.ma20 = 999; },
      (v: typeof row) => { v.payload_json.market_regime.summary = "cached fabricated classification"; },
      (v: typeof row) => { v.payload_json.market_regime.input_evidence!.spy.candles[0].close = 999; },
      (v: typeof row) => { v.payload_json.market_regime.input_evidence!.qqq.content_sha256 = "wrong-digest"; },
      (v: typeof row) => { v.payload_json.market_regime.input_evidence!.qqq.calendar_fingerprint = "wrong-calendar"; },
      (v: typeof row) => { v.payload_json.market_regime.input_evidence!.evaluated_at = "2026-10-01T18:00:00Z"; },
      (v: typeof row) => { v.payload_json.decision_lineage_receipt.scan_run_id = "wrong-lineage"; },
    ]) {
      const changed = structuredClone(row); mutate(changed);
      expect(await read(changed)).toBeNull();
    }
    await expect(runtime.readOwnedCompletedBenchmarkReuse({ row, owner, now: next,
      signal: AbortSignal.abort(new Error("synthetic-owner-cancel")) })).rejects.toMatchObject({ name: "OperationAbortedError" });
    expect(requests).toBe(2); // Revalidation never refreshes a provider or rewrites capture time.
  } finally {
    globalThis.Date = OriginalDate; globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TWELVE_DATA_API_KEY;
    else process.env.TWELVE_DATA_API_KEY = originalKey;
  }
});

for (const historyStart of ["prewarmed", "cold"] as const) {
for (const mode of ["baseline", "reuse", "invalid"] as const) {
  test(`packaged ${historyStart} ${mode} allocation preserves original populations and whole-scan credits after restart`, () => {
    test.setTimeout(90000);
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--benchmark-reuse",
      ...(historyStart === "cold" ? ["--cold"] : []),
      ...(mode === "baseline" ? ["--benchmark-reuse-baseline"] : mode === "invalid" ? ["--benchmark-reuse-invalid"] : [])],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
    const firstFresh = historyStart === "cold" ? 3 : 6;
    const secondFresh = historyStart === "cold" ? (mode === "reuse" ? 4 : 3) : (mode === "reuse" ? 8 : 6);
    expect(evidence).toMatchObject({ scenario: "retained_benchmark_two_slot", setup_synthetic_requests: historyStart === "cold" ? 0 : 32,
      scheduled_synthetic_requests: 16, attempts: 2, cycles: 2, claims: 2,
      fresh_inputs: secondFresh, actual_provider_requests: 0,
      production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert",
      benchmark_reuse_evidence: { mode: mode === "baseline" ? "original_committed_baseline" : mode === "invalid" ? "invalid_original_falls_back" : "validated_owner_reuse",
        history_start: historyStart, first_scan_requests: 8, second_scan_requests: 8,
        first_fresh_inputs: firstFresh, second_fresh_inputs: secondFresh,
        original_members_per_decision: 8, attempts: 2, reservations: 2, reserved_credits: 16,
        benchmark_calls_second: mode === "reuse" ? 0 : 2, restarted_owner_read: true, wrong_owner_runs: 0 } });
  });
}
}

for (const mode of ["baseline", "minimum_requests_first", "regular_session_reuse", "invalid_history"] as const) {
  test(`mixed original population ${mode} preserves original inputs and explicit acquisition costs`, () => {
    test.setTimeout(90000);
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--benchmark-reuse", "--mixed-history",
      ...(mode === "baseline" ? ["--acquisition-baseline"] : mode === "minimum_requests_first" ? ["--minimum-order-baseline"] : mode === "invalid_history" ? ["--mixed-history-invalid"] : [])],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
    expect(evidence).toMatchObject({ setup_synthetic_requests: 16, scheduled_synthetic_requests: 16,
      attempts: 2, cycles: 2, claims: 2, actual_provider_requests: 0,
      production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert",
      benchmark_reuse_evidence: { baseline_revision: "43fa089e2c7410f10834e148179dda1564765e46", history_start: "mixed",
        acquisition_mode: mode === "minimum_requests_first" ? "minimum_requests_first" : "original_order",
        historical_context_integrity: mode === "invalid_history" ? "tampered" : "valid",
        first_scan_requests: 8, second_scan_requests: 8,
        first_fresh_inputs: mode === "minimum_requests_first" ? 5 : 3,
        second_fresh_inputs: mode === "minimum_requests_first" ? 6 : 4,
        original_members_per_decision: 8, reservations: 2, reserved_credits: 16,
        benchmark_calls_second: 0, restarted_owner_read: true, wrong_owner_runs: 0 } });
  });
}

test("otherwise omitted first pair is acquired without dropping an original decision member", () => {
  test.setTimeout(90000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--rotation-day", "--cold"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  const firstClosed = evidence.slots[1];
  expect(firstClosed.members.map((member: { ticker: string }) => member.ticker))
    .toEqual(["INTC", "DIS", "JPM", "CAT", "XOM", "UNH", "DKNG", "RKLB"]);
  expect(firstClosed.members.find((member: { ticker: string }) => member.ticker === "XOM").freshness).toBe("fresh");
  expect(firstClosed).toMatchObject({ requests: 8, attempts: 1, runs: 1, reservations: 1 });
  expect(evidence).toMatchObject({ original_member_observations: 208, selected_unique_tickers: 95,
    actual_provider_requests: 0, production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert" });
});

test("retained rejected opening allocator spends no intraday credit before a five-minute bar can close", () => {
  test.setTimeout(90000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--rotation-day", "--cold", "--first-closed-bar-baseline"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  const opening = evidence.slots[0];
  expect(opening.members).toHaveLength(8);
  expect(opening.fresh_members).toBe(0);
  expect(opening.synthetic_request_evidence.filter((request: { interval: string }) => request.interval === "5min")).toHaveLength(0);
  expect(opening.synthetic_request_evidence.filter((request: { ticker: string; interval: string }) =>
    request.interval === "1day" && !["SPY", "QQQ"].includes(request.ticker))).toHaveLength(6);
  expect(evidence).toMatchObject({ actual_provider_requests: 0, production_actions: 0,
    publications: 0, broker_actions: 0, cleanup: "inert" });
});

test("full-session historical reuse improves breadth while retaining rejected allocation baselines", () => {
  test.setTimeout(420000);
  const evidence = ["baseline", "minimum", "guard", "fair", "regular", "first_closed_bar"].map(mode => {
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--rotation-day", "--cold",
      ...(mode === "baseline" ? ["--acquisition-baseline"] : mode === "minimum" ? ["--minimum-order-baseline"] : mode === "guard" ? ["--first-observation-baseline"] : mode === "fair" ? ["--fair-order-baseline"] : mode === "regular" ? ["--regular-session-baseline"] : ["--first-closed-bar-baseline"])], { cwd: process.cwd(), encoding: "utf8", timeout: 180000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    return JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  });
  for (const arm of evidence) {
    expect(arm).toMatchObject({ scenario: "full_session_cold_rotation", original_slots: 26,
      original_member_observations: 208, setup_synthetic_requests: 0, scheduled_synthetic_requests: 208,
      attempts: 26, cycles: 26, scan_runs: 26, reservations: 26, reserved_credits: 208,
      selected_unique_tickers: 95,
      unselected_eligible_tickers: [], restarted_owner_read: true, wrong_owner_runs: 0,
      actual_provider_requests: 0, production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert" });
    expect(arm.synthetic_benchmark_requests).toBe(["original_order_regular_session_reuse", "original_order_first_closed_bar"].includes(arm.acquisition_mode) ? 2 : 20);
    expect(arm.slots).toHaveLength(26);
    expect(arm.ticker_coverage).toHaveLength(95);
    for (const [index, slot] of arm.slots.entries()) {
      expect(slot.slot).toBe(new Date(Date.parse("2026-10-01T13:30:00Z") + index * 900000).toISOString());
      expect(slot.members).toHaveLength(8);
      expect(slot).toMatchObject({ http_status: 200, attempts: 1, runs: 1, reservations: 1, requests: 8 });
    }
    expect(arm.slots[0].fresh_members).toBe(0); // Opening absence must not disappear from the denominator.
    expect(arm.slots.slice(-2).map((slot: { no_trade_reason: string }) => slot.no_trade_reason))
      .toEqual(["power_hour_publication_withheld", "power_hour_publication_withheld"]);
  }
  const [baseline, minimum, guard, fair, regular, firstClosedBar] = evidence;
  for (const [index, slot] of baseline.slots.entries()) {
    expect(minimum.slots[index].members.map((member: { ticker: string }) => member.ticker))
      .toEqual(slot.members.map((member: { ticker: string }) => member.ticker));
    expect(guard.slots[index].members.map((member: { ticker: string }) => member.ticker))
      .toEqual(slot.members.map((member: { ticker: string }) => member.ticker));
    expect(fair.slots[index].members.map((member: { ticker: string }) => member.ticker))
      .toEqual(slot.members.map((member: { ticker: string }) => member.ticker));
    expect(regular.slots[index].members.map((member: { ticker: string }) => member.ticker))
      .toEqual(slot.members.map((member: { ticker: string }) => member.ticker));
    expect(firstClosedBar.slots[index].members.map((member: { ticker: string }) => member.ticker))
      .toEqual(slot.members.map((member: { ticker: string }) => member.ticker));
    const plan = fair.slots[index].acquisition;
    const offset = Math.floor(Date.parse(slot.slot) / 900000) % 8;
    expect(plan).toMatchObject({ policy_version: "completed_input_fair_cost_ties_v1", cost_tie_offset: offset });
    const costs = plan.original_members.map((member: { estimated_requests: number }) => member.estimated_requests);
    expect(plan.acquisition_order).toEqual([0, 1, 2, 3, 4, 5, 6, 7].sort((a, b) =>
      costs[a] - costs[b] || (a - offset + 8) % 8 - (b - offset + 8) % 8));
  }
  // This retained negative evidence prevents the favorable two-slot fixture
  // from becoming a false market-wide coverage claim. More observations do
  // not compensate for five fewer distinct fully observed original tickers.
  expect(baseline).toMatchObject({ fresh_member_observations: 110, ever_complete_tickers: 69, revisit_missing_observations: 40 });
  expect(minimum).toMatchObject({ fresh_member_observations: 115, ever_complete_tickers: 64, revisit_missing_observations: 32 });
  expect(baseline.never_complete_tickers).toHaveLength(26);
  expect(minimum.never_complete_tickers).toHaveLength(31);
  // Retain the failed guard, rather than silently weakening its frozen >69
  // breadth criterion. It changes order but not a single completed member set.
  expect(guard).toMatchObject({ ever_complete_tickers: 64, fresh_member_observations: 115 });
  expect(guard.ever_complete_tickers > baseline.ever_complete_tickers).toBe(false);
  expect(guard.slots.map((slot: { members: { ticker: string; freshness: string }[] }) =>
    slot.members.filter(member => member.freshness === "fresh").map(member => member.ticker)))
    .toEqual(minimum.slots.map((slot: { members: { ticker: string; freshness: string }[] }) =>
      slot.members.filter(member => member.freshness === "fresh").map(member => member.ticker)));
  // Also retain this rejection: more complete observations are not broader
  // discovery, and the predeclared >69 breadth criterion remains unmet.
  expect(fair).toMatchObject({ ever_complete_tickers: 63, fresh_member_observations: 116 });
  expect(fair.ever_complete_tickers > baseline.ever_complete_tickers).toBe(false);
  // The corrected input-fitness gate passes the unchanged frozen acceptance.
  // Ranking, publication and provider budgets have not been relaxed.
  expect(regular.ever_complete_tickers).toBeGreaterThan(baseline.ever_complete_tickers);
  expect(regular.ever_complete_tickers).toBeGreaterThan(minimum.ever_complete_tickers);
  expect(regular.fresh_member_observations).toBeGreaterThanOrEqual(baseline.fresh_member_observations);
  expect(regular).toMatchObject({ ever_complete_tickers: 76, fresh_member_observations: 123,
    synthetic_benchmark_requests: 2, revisit_missing_observations: 32 });
  expect(regular.slots.slice(1).every((slot: { benchmark_requests: number; benchmark_reuse_preflight: { owned_reuse_admitted: boolean } }) =>
    slot.benchmark_requests === 0 && slot.benchmark_reuse_preflight.owned_reuse_admitted)).toBe(true);
  // Frozen breadth >76 fails. Retain the negative result, not a changed gate.
  expect(firstClosedBar.ever_complete_tickers > regular.ever_complete_tickers).toBe(false);
  expect(firstClosedBar).toMatchObject({ ever_complete_tickers: 76, fresh_member_observations: 126 });
  expect(firstClosedBar.fresh_member_observations).toBeGreaterThanOrEqual(regular.fresh_member_observations);
  const originalComplete = regular.ticker_coverage.filter((member: { fresh: number }) => member.fresh > 0)
    .map((member: { ticker: string }) => member.ticker);
  const correctedComplete = firstClosedBar.ticker_coverage.filter((member: { fresh: number }) => member.fresh > 0)
    .map((member: { ticker: string }) => member.ticker);
  expect(originalComplete.filter((ticker: string) => !correctedComplete.includes(ticker))).toEqual([]);
  for (const slot of firstClosedBar.slots) {
    expect(slot.intraday_session_admission_policy_version).toBe("completed_input_first_closed_bar_allocation_v1");
    for (const request of slot.synthetic_request_evidence) {
      if (request.interval === "5min") expect(Date.parse(request.requested_at)).toBeGreaterThanOrEqual(Date.parse("2026-10-01T13:35:00Z"));
    }
  }
});
