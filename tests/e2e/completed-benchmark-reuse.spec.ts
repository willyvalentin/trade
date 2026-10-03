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

test("retained rejected first-pair guard changes acquisition without dropping a decision member", () => {
  test.setTimeout(90000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--rotation-day", "--cold", "--omitted-pair-baseline"],
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

test("actual full-session input coverage does not impersonate complete prospective opportunity sets", () => {
  test.setTimeout(90000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--rotation-day", "--cold", "--prospective-enrollment"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({ fresh_member_observations: 123, ever_complete_tickers: 76,
    original_member_observations: 208, scheduled_synthetic_requests: 208, setup_synthetic_requests: 0,
    actual_provider_requests: 0, production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert",
    prospective_enrollment_evidence: { source_decisions: 26, original_member_observations: 208,
      enrolled_decisions: 0, excluded_decisions: 26, quality_improvement_claimed: false,
      evidence_scope: "synthetic_controlled_original_source_composition_not_database_forward_seal" } });
  const composition = evidence.prospective_enrollment_evidence;
  expect(composition.diagnostics).toHaveLength(26);
  expect(composition.diagnostics.every((row: { reason: string }) => row.reason === "original_complete_assessed_population_unavailable")).toBe(true);
  expect(composition.decisions.reduce((sum: number, row: { assessed_count: number }) => sum + row.assessed_count, 0)).toBe(111);
  expect(composition.decisions.every((row: { original_population_count: number; unassessed_count: number }) =>
    row.original_population_count === 8 && row.unassessed_count > 0)).toBe(true);
  expect(composition.partitions.map((row: { enrolled_decision_count: number }) => row.enrolled_decision_count)).toEqual([0, 0, 0]);
});

test("actual premarket preparation preserves its narrow original population rather than preparing arbitrary afternoon members", () => {
  test.setTimeout(90000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
    "--benchmark-reuse", "--existing-premarket-setup"], { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({ setup_synthetic_requests: 4, scheduled_synthetic_requests: 16,
    attempts: 2, cycles: 2, claims: 2, actual_provider_requests: 0, production_actions: 0,
    publications: 0, broker_actions: 0, cleanup: "inert",
    benchmark_reuse_evidence: { history_start: "existing_premarket_paid_setup", first_fresh_inputs: 3,
      second_fresh_inputs: 4, original_members_per_decision: 8, reserved_credits: 16 },
    existing_premarket_evidence: { setup_intraday_requests: 1, first_regular_prepared_overlap: [],
      retained_daily_contexts: [{ symbol: "TSLA", captured_at: "2026-10-01T13:00:00.000Z",
        latest_completed_market_date: "2026-09-30" }], publication_count: 0 } });
  expect(evidence.existing_premarket_evidence.original_universe).toHaveLength(50);
  expect(evidence.existing_premarket_evidence.requests.map((row: { ticker: string; interval: string }) =>
    [row.ticker, row.interval])).toEqual([["SPY", "1day"], ["QQQ", "1day"], ["TSLA", "1day"], ["TSLA", "5min"]]);
  expect(evidence.existing_premarket_evidence.returned_watchlist.map((row: { ticker: string }) => row.ticker)).toEqual(["TSLA"]);
});

test("actual existing premarket history has bounded whole-session utility without replacing the zero-setup baseline", () => {
  test.setTimeout(300000);
  const run = (mode: "zero_setup" | "original_preparation" | "retained_preparation") => {
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
      "--rotation-day", "--prospective-enrollment",
      ...(mode === "zero_setup" ? [] : ["--existing-premarket-setup"]),
      ...(mode === "original_preparation" ? ["--legacy-retention-baseline"] : [])],
    { cwd: process.cwd(), encoding: "utf8", timeout: 95000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    return JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  };
  const cold = run("zero_setup"), before = run("original_preparation"), retained = run("retained_preparation");
  expect(cold).toMatchObject({ scenario: "full_session_cold_rotation", setup_synthetic_requests: 0,
    fresh_member_observations: 123, prospective_enrollment_evidence: { enrolled_decisions: 0, excluded_decisions: 26 } });
  expect(before.existing_premarket_evidence.retained_daily_contexts).toEqual([]);
  expect(retained.existing_premarket_evidence.retained_daily_contexts).toEqual([
    { symbol: "TSLA", captured_at: "2026-10-01T13:00:00.000Z", latest_completed_market_date: "2026-09-30" }]);
  for (const property of ["original_universe", "requests", "returned_watchlist"] as const) {
    expect(retained.existing_premarket_evidence[property]).toEqual(before.existing_premarket_evidence[property]);
  }
  expect(retained).toMatchObject({ fresh_member_observations: 124,
    prospective_enrollment_evidence: { enrolled_decisions: 1, excluded_decisions: 25 } });
  for (const arm of [before, retained]) {
    expect(arm).toMatchObject({ scenario: "full_session_existing_premarket_preparation", setup_synthetic_requests: 4 });
  }
  for (const arm of [cold, before, retained]) {
    expect(arm).toMatchObject({ original_slots: 26, original_member_observations: 208, selected_unique_tickers: 95,
      ever_complete_tickers: 76, scheduled_synthetic_requests: 208, reserved_credits: 208,
      attempts: 26, cycles: 26, scan_runs: 26, reservations: 26, restarted_owner_read: true, wrong_owner_runs: 0,
      prospective_enrollment_evidence: { source_decisions: 26, original_member_observations: 208, quality_improvement_claimed: false },
      actual_provider_requests: 0, production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert" });
    expect(arm.slots.map((slot: { slot: string; members: { ticker: string }[] }) =>
      ({ slot: slot.slot, tickers: slot.members.map(member => member.ticker) })))
      .toEqual(cold.slots.map((slot: { slot: string; members: { ticker: string }[] }) =>
        ({ slot: slot.slot, tickers: slot.members.map(member => member.ticker) })));
    for (const slot of arm.slots) {
      expect(slot).toMatchObject({ requests: 8, reservations: 1 });
      expect(slot.synthetic_request_evidence).toHaveLength(slot.requests);
      expect(slot.synthetic_request_evidence.every((request: { requested_at: string }) =>
        request.requested_at === new Date(Date.parse(slot.slot) + 20000).toISOString())).toBe(true);
    }
  }
  const complete = retained.prospective_enrollment_evidence.decisions.filter((row: { status: string }) => row.status === "comparable");
  expect(complete).toHaveLength(1);
  expect(complete[0]).toMatchObject({ decision_at: "2026-10-01T19:30:20.000Z", original_population_count: 8,
    assessed_count: 8, unassessed_count: 0, exclusion: null });
  expect(complete[0].members.map((row: { ticker: string }) => row.ticker)).toEqual(["TSLA", "COIN", "AMD", "AAPL", "ORCL", "DIS", "CAT", "JPM"]);
  expect(retained.prospective_enrollment_evidence.partitions.map((row: { enrolled_decision_count: number; missing_outcome_count: number }) =>
    [row.enrolled_decision_count, row.missing_outcome_count])).toEqual([[0, 0], [1, 8], [0, 0]]);
});

test("late original complete inputs retain all eight partial outcomes without qualifying a shortened regular-session horizon", () => {
  test.setTimeout(120000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
    "--rotation-day", "--prospective-enrollment", "--existing-premarket-setup", "--late-original-outcomes"],
  { cwd: process.cwd(), encoding: "utf8", timeout: 110000 });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({ original_slots: 26, original_member_observations: 208,
    setup_synthetic_requests: 4, scheduled_synthetic_requests: 208, reserved_credits: 208,
    attempts: 26, cycles: 26, scan_runs: 26, reservations: 26,
    prospective_enrollment_evidence: { enrolled_decisions: 1, excluded_decisions: 25 },
    actual_provider_requests: 0, production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert" });
  const late = evidence.late_original_outcome_evidence;
  expect(late).toMatchObject({ original_scan_run_fingerprint: "rec_scan_run_alrnoh",
    decision_timestamp: "2026-10-01T19:30:20.000Z", session_close: "2026-10-01T20:00:00.000Z",
    evaluation_anchor_start_at: "2026-10-01T19:35:00.000Z", required_horizon_end_at: "2026-10-01T20:35:00.000Z",
    available_regular_minutes: 25, separate_synthetic_outcome_requests: 8,
    original_source_decisions: 26, physical_database_outcome_rows: 8, owner_read_outcome_rows: 8,
    canonical_outcome_count: 0, missing_outcome_count: 8, disposition: "evidence_incomplete",
    population_complete: false, precision_delta: null, baseline_precision_at_3: null, shadow_precision_at_3: null,
    baseline_expectancy_r: null, shadow_expectancy_r: null, original_membership_stable: true, quality_improvement_claimed: false });
  expect(late.original_members.map((row: { ticker: string }) => row.ticker))
    .toEqual(["TSLA", "COIN", "AMD", "AAPL", "ORCL", "DIS", "CAT", "JPM"]);
  expect(late.outcome_passes).toMatchObject([
    { requests: 4, eligible_snapshot_count: 8, persisted_outcome_count: 4, physical_database_rows: 4,
      persistence_status: "success", outcomes_created_count: 4, outcomes_updated_count: 0 },
    { requests: 4, eligible_snapshot_count: 4, persisted_outcome_count: 4, physical_database_rows: 8,
      persistence_status: "success", outcomes_created_count: 4, outcomes_updated_count: 0 },
  ]);
  expect(late.outcome_passes[1].selected_batch_fingerprint).toBe(late.outcome_passes[0].selected_batch_fingerprint);
  expect(late.outcome_passes.flatMap((pass: { requested_tickers: string[] }) => pass.requested_tickers).sort())
    .toEqual(late.original_members.map((row: { ticker: string }) => row.ticker).sort());
  expect(late.persisted_coverage).toHaveLength(8);
  expect(late.persisted_coverage.filter((row: { status: string }) => row.status === "target_before_stop")).toHaveLength(4);
  expect(late.persisted_coverage.filter((row: { status: string }) => row.status === "stop_before_target")).toHaveLength(4);
  for (const row of late.persisted_coverage) {
    expect(row).toMatchObject({ retained_candle_count: 5, coverage: {
      expected_candle_count: 12, observed_candle_count: 5, freshness: "unknown", horizon_elapsed: true,
      blockers: ["candle_coverage_incomplete"], required_horizon_end_at: late.required_horizon_end_at,
    } });
  }
});

test("doubling narrow existing preparation is rejected when original complete decisions remain too late", () => {
  test.setTimeout(240000);
  const run = (expanded: boolean) => {
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
      "--rotation-day", "--prospective-enrollment", "--existing-premarket-setup",
      ...(expanded ? ["--existing-premarket-budget8"] : [])],
    { cwd: process.cwd(), encoding: "utf8", timeout: 110000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    return JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  };
  const baseline = run(false), expanded = run(true);
  expect(baseline).toMatchObject({ setup_synthetic_requests: 4, fresh_member_observations: 124 });
  expect(expanded).toMatchObject({ setup_synthetic_requests: 8, fresh_member_observations: 125,
    existing_premarket_evidence: { setup_intraday_requests: 3, preparation_whole_request_cap: 8, scanner_request_cap: 6,
      product_policy_changed: false, capacity_question: { original_decisions: 26, original_member_observations: 208,
        disposition: "reject_no_earlier_full_regular_horizon", regular_horizon_eligible_decisions: [],
        quality_improvement_claimed: false, product_policy_changed: false } } });
  expect(expanded.existing_premarket_evidence.retained_daily_contexts.map((row: { symbol: string }) => row.symbol))
    .toEqual(["AMD", "COIN", "TSLA"]);
  expect(expanded.existing_premarket_evidence.original_universe).toEqual(baseline.existing_premarket_evidence.original_universe);
  const members = (arm: typeof baseline) => arm.slots.map((slot: { slot: string; members: { ticker: string }[] }) =>
    ({ slot: slot.slot, tickers: slot.members.map(member => member.ticker) }));
  expect(members(expanded)).toEqual(members(baseline));
  const complete = baseline.prospective_enrollment_evidence.decisions.filter((row: { status: string }) => row.status === "comparable");
  expect(complete).toHaveLength(1);
  expect(expanded.existing_premarket_evidence.capacity_question.complete_original_decisions)
    .toMatchObject([{ fingerprint: complete[0].fingerprint, decision_at: complete[0].decision_at,
      original_population_count: 8, required_horizon_end_at: "2026-10-01T20:35:00.000Z" }]);
  for (const arm of [baseline, expanded]) {
    expect(arm).toMatchObject({ original_slots: 26, original_member_observations: 208, scheduled_synthetic_requests: 208,
      reserved_credits: 208, attempts: 26, cycles: 26, scan_runs: 26, reservations: 26,
      prospective_enrollment_evidence: { enrolled_decisions: 1, excluded_decisions: 25 },
      actual_provider_requests: 0, production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert" });
  }
});

test("full original preopen histories supply an early canonical population without hiding the rest of the session", () => {
  test.setTimeout(450000);
  const run = (mode: "zero_setup" | "narrow" | "full_original") => {
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
      "--rotation-day", "--prospective-enrollment",
      ...(mode === "narrow" ? ["--existing-premarket-setup"] : []),
      ...(mode === "full_original" ? ["--full-original-history-setup"] : [])],
    { cwd: process.cwd(), encoding: "utf8", timeout: 140000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    return JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  };
  const cold = run("zero_setup"), narrow = run("narrow"), full = run("full_original");
  expect(cold).toMatchObject({ setup_synthetic_requests: 0, fresh_member_observations: 123,
    prospective_enrollment_evidence: { enrolled_decisions: 0, excluded_decisions: 26 } });
  expect(narrow).toMatchObject({ setup_synthetic_requests: 4, fresh_member_observations: 124,
    prospective_enrollment_evidence: { enrolled_decisions: 1, excluded_decisions: 25 } });
  expect(full).toMatchObject({ scenario: "full_session_original_universe_history_preparation",
    setup_synthetic_requests: 95, fresh_member_observations: 200, ever_complete_tickers: 95,
    prospective_enrollment_evidence: { enrolled_decisions: 22, excluded_decisions: 4 } });
  const originalSlots = (arm: typeof full) => arm.slots.map((slot: { slot: string; members: { ticker: string }[] }) =>
    ({ slot: slot.slot, tickers: slot.members.map(member => member.ticker) }));
  for (const arm of [cold, narrow, full]) {
    expect(arm).toMatchObject({ original_slots: 26, original_member_observations: 208, selected_unique_tickers: 95,
      scheduled_synthetic_requests: 208, reserved_credits: 208, attempts: 26, cycles: 26, scan_runs: 26, reservations: 26,
      restarted_owner_read: true, wrong_owner_runs: 0, actual_provider_requests: 0,
      production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert" });
    expect(originalSlots(arm)).toEqual(originalSlots(cold));
    expect(arm.slots.every((slot: { requests: number }) => slot.requests <= 8)).toBe(true);
  }
  const preparation = full.full_original_history_evidence;
  expect(preparation).toMatchObject({ setup_requests: 95, setup_intraday_requests: 0, maximum_requests_in_modeled_minute: 8,
    setup_credit_reservations: 0, setup_budget_scope: "modeled_request_cap_not_production_durable_reservation",
    total_separate_synthetic_data_requests: 311,
    normalized_preopen_guard: "completed_context_current_session_unavailable", product_policy_changed: false,
    same_day_digest_identity_rejections: 3, next_day_basis_rejected: true, validation_provider_requests: 0,
    provider_entitlement_proven: false, quality_improvement_claimed: false,
    source_capacity: { complete_decisions: 22, first_eligible_original_decision: {
      fingerprint: "rec_scan_run_r1l45", decision_at: "2026-10-01T14:30:20.000Z", original_population_count: 8,
      status: "comparable", assessed_count: 8, unassessed_count: 0 } },
    full_charter_evidence: { original_population_count: 176, canonical_outcome_count: 8, missing_outcome_count: 168,
      operational_attempts: 26, reserved_scheduled_provider_credits: 208, disposition: "evidence_incomplete",
      wrong_owner_learning: null, tampered_source_canonical_outcomes: 7, tampered_source_missing_outcomes: 169,
      original_membership_stable: true, restored_charter_unchanged: true, negative_readback_provider_requests: 0,
      trained_probability_model: null, terminal_quality_decision: null, quality_improvement_claimed: false } });
  expect(preparation.original_slots).toEqual(originalSlots(cold));
  expect(new Set(preparation.original_universe)).toEqual(new Set(cold.eligible_tickers));
  expect(preparation.requests).toHaveLength(95);
  expect(preparation.retained_daily_contexts).toHaveLength(95);
  for (const request of preparation.requests) {
    expect(request.interval).toBe("1day");
    expect(Date.parse(request.requested_at)).toBeLessThan(Date.parse("2026-10-01T13:30:00.000Z"));
    expect(preparation.requests.filter((row: { requested_at: string }) => row.requested_at === request.requested_at).length)
      .toBeLessThanOrEqual(8);
  }
  // Completed history is never a current price, and a short closed range is
  // never rescaled into the frozen hour. Original exclusions remain explicit.
  expect(full.slots[0].fresh_members).toBe(0);
  expect(full.prospective_enrollment_evidence.decisions.slice(0, 4).every((row: { status: string }) => row.status !== "comparable")).toBe(true);
  expect(preparation.source_capacity.regular_horizon_eligible_decisions).toHaveLength(18);
  const outcome = preparation.canonical_outcome_evidence;
  expect(outcome).toMatchObject({ original_scan_run_fingerprint: "rec_scan_run_r1l45",
    decision_timestamp: "2026-10-01T14:30:20.000Z", evaluation_anchor_start_at: "2026-10-01T14:35:00.000Z",
    required_horizon_end_at: "2026-10-01T15:35:00.000Z", session_close: "2026-10-01T20:00:00.000Z",
    available_regular_minutes: 325, separate_synthetic_outcome_requests: 8,
    original_source_decisions: 26, physical_database_outcome_rows: 8, owner_read_outcome_rows: 8,
    canonical_outcome_count: 8, missing_outcome_count: 0, disposition: "linked_complete",
    population_complete: true, precision_delta: 0, original_membership_stable: true, quality_improvement_claimed: false });
  expect(outcome.original_members.map((row: { ticker: string }) => row.ticker))
    .toEqual(["MARA", "NVDA", "ADBE", "SOFI", "TSM", "SBUX", "GS", "GE"]);
  expect(outcome.outcome_passes).toMatchObject([
    { requests: 4, eligible_snapshot_count: 8, persistence_status: "success", physical_database_rows: 4 },
    { requests: 4, eligible_snapshot_count: 4, persistence_status: "success", physical_database_rows: 8 },
  ]);
  expect(outcome.outcome_passes.flatMap((pass: { requested_tickers: string[] }) => pass.requested_tickers).sort())
    .toEqual(outcome.original_members.map((row: { ticker: string }) => row.ticker).sort());
  for (const row of outcome.persisted_coverage) expect(row).toMatchObject({ retained_candle_count: 12,
    coverage: { expected_candle_count: 12, observed_candle_count: 12, freshness: "fresh", blockers: [],
      evaluation_anchor_start_at: outcome.evaluation_anchor_start_at, required_horizon_end_at: outcome.required_horizon_end_at } });
  expect(preparation.full_charter_evidence.missing_dimensions).toContain("held_out_complete_original_canonical_60m_outcomes_required");
  expect(preparation.full_charter_evidence.missing_dimensions).toContain("held_out_durably_frozen_training_probability_model_required");
});

test("durable history preparation preserves the full original session while resuming without another purchase", () => {
  test.setTimeout(360000);
  const run = (budgeted: boolean) => {
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
      "--rotation-day", "--prospective-enrollment", "--full-original-history-setup",
      ...(budgeted ? ["--budgeted-history-setup"] : [])],
    { cwd: process.cwd(), encoding: "utf8", timeout: 165000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    return JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  };
  const feasibility = run(false), adopted = run(true);
  for (const arm of [feasibility, adopted]) expect(arm).toMatchObject({ original_slots: 26,
    original_member_observations: 208, selected_unique_tickers: 95, fresh_member_observations: 200,
    reserved_credits: 208, scheduled_synthetic_requests: 208, setup_synthetic_requests: 95,
    prospective_enrollment_evidence: { enrolled_decisions: 22, excluded_decisions: 4 },
    actual_provider_requests: 0, production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert" });
  const original = (arm: typeof adopted) => arm.slots.map((slot: { slot: string; members: { ticker: string }[] }) =>
    ({ slot: slot.slot, tickers: slot.members.map(member => member.ticker) }));
  expect(original(adopted)).toEqual(original(feasibility));
  const preparation = adopted.full_original_history_evidence;
  expect(preparation).toMatchObject({
    scope: "actual_budgeted_history_sql_sdk_full_original_history_synthetic_not_live",
    preparation_policy: "completed_session_history_preparation_v1",
    setup_credit_reservations: 95, setup_requests: 95, setup_intraday_requests: 0,
    setup_budget_scope: "actual_isolated_durable_owner_bound_reservation", restarted_batches: 12,
    maximum_requests_in_modeled_minute: 8, minute_budget_blocked_without_provider: true,
    corrupted_paid_history_retry_blocked: true, legacy_derived_price_unchanged: true,
    unproven_cached_finalization_blocks_acquisition: true, daily_budget_drift_blocked_without_provider: true,
    source_capacity: { complete_decisions: 22, first_eligible_original_decision: { fingerprint: "rec_scan_run_r1l45" } },
    canonical_outcome_evidence: { canonical_outcome_count: 8, population_complete: true, precision_delta: 0 },
    full_charter_evidence: { original_population_count: 176, canonical_outcome_count: 8, missing_outcome_count: 168,
      disposition: "evidence_incomplete", trained_probability_model: null, terminal_quality_decision: null },
    total_separate_synthetic_data_requests: 311, provider_entitlement_proven: false, quality_improvement_claimed: false });
  expect(preparation.preparation_passes).toHaveLength(12);
  expect(preparation.preparation_passes.every((pass: { original_members: unknown[]; publication_allowed: boolean; broker_allowed: boolean }) =>
    pass.original_members.length === 95 && !pass.publication_allowed && !pass.broker_allowed)).toBe(true);
  expect(preparation.preparation_passes.every((pass: { reservation_accounting_complete: boolean; cost_scope: string }) =>
    pass.reservation_accounting_complete && pass.cost_scope === "current_invocation_known_credits_durable_ledger_is_authoritative")).toBe(true);
  expect(preparation.preparation_passes.map((pass: { reserved_credits: number }) => pass.reserved_credits))
    .toEqual([...Array(11).fill(8), 7]);
  expect(new Set(preparation.preparation_passes.map((pass: { universe_fingerprint: string }) => pass.universe_fingerprint)).size).toBe(1);
});

for (const fault of ["rate_limit", "provider_identity", "cache_write", "reservation", "finalization", "daily_limit", "abort", "deadline"]) {
  test(`history preparation retains charged failure and missing members after ${fault} without buying a retry`, () => {
    test.setTimeout(90000);
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
      "--rotation-day", "--prospective-enrollment", "--full-original-history-setup", "--budgeted-history-setup",
      `--history-preparation-fault=${fault}`], { cwd: process.cwd(), encoding: "utf8", timeout: 70000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    const receipt = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
    expect(receipt).toMatchObject({ actual_provider_requests: 0, production_actions: 0, publications: 0,
      broker_actions: 0, cleanup: "inert", preparation_failure_evidence: { fault, original_population_count: 95,
        reserved_credits: fault === "reservation" ? 0 : 1, synthetic_provider_requests: fault === "reservation" ? 0 : 1,
        repeated_provider_requests: 0, first: { status: "blocked" },
        same_minute_restart: { status: "blocked" }, later_minute_restart: { status: "blocked" } } });
    const evidence = receipt.preparation_failure_evidence;
    expect(evidence.first.reservation_accounting_complete).toBe(!["reservation", "finalization"].includes(fault));
    for (const pass of [evidence.first, evidence.same_minute_restart, evidence.later_minute_restart]) {
      expect(pass.original_members).toHaveLength(95);
      expect(pass.original_members.map((row: { ticker: string }) => row.ticker))
        .toEqual(evidence.first.original_members.map((row: { ticker: string }) => row.ticker));
      expect(pass.publication_allowed).toBe(false);
      expect(pass.broker_allowed).toBe(false);
    }
    const blockers: Record<string, string> = { rate_limit: "history_preparation_provider_rate_limited",
      provider_identity: "history_preparation_attributable_context_unavailable",
      cache_write: "history_preparation_cache_write_unavailable", reservation: "basic_free_credit_reservation_unavailable",
      finalization: "history_preparation_finalization_unproven", daily_limit: "daily_credit_limit_reached", abort: "history_preparation_aborted",
      deadline: "history_preparation_deadline_exhausted" };
    expect(evidence.first.blocker).toBe(blockers[fault]);
    if (fault === "finalization") expect(evidence.cached_finalization_repair).toMatchObject({
      blocker: "daily_credit_limit_reached", requested_credits: 0 });
  });
}

test("concurrent history preparation has one provider winner and resumes different missing members", () => {
  test.setTimeout(90000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
    "--rotation-day", "--prospective-enrollment", "--full-original-history-setup", "--budgeted-history-setup",
    "--history-preparation-fault=concurrent"], { cwd: process.cwd(), encoding: "utf8", timeout: 70000 });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const receipt = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(receipt).toMatchObject({ actual_provider_requests: 0, production_actions: 0, publications: 0,
    broker_actions: 0, cleanup: "inert", preparation_concurrency_evidence: {
      original_population_count: 95, synthetic_provider_requests: 16, unique_requested_tickers: 16,
      repeated_provider_requests: 0, reserved_credits: 16, finalized_credits: 16, maximum_minute_credits: 8,
      same_minute_restart: { blocker: "per_minute_credit_limit_reached", requested_credits: 0 },
      later_minute_restart: { status: "partial", requested_credits: 8, reserved_credits: 8, finalized_credits: 8 },
    } });
  const evidence = receipt.preparation_concurrency_evidence;
  expect(evidence.overlapping.filter((pass: { status: string }) => pass.status === "partial")).toHaveLength(1);
  expect(evidence.overlapping.filter((pass: { blocker: string }) => pass.blocker === "attempt_in_progress")).toHaveLength(1);
  for (const pass of [...evidence.overlapping, evidence.same_minute_restart, evidence.later_minute_restart]) {
    expect(pass.original_members).toHaveLength(95);
    expect(pass.original_members.map((member: { ticker: string }) => member.ticker))
      .toEqual(evidence.overlapping[0].original_members.map((member: { ticker: string }) => member.ticker));
    expect(pass.publication_allowed).toBe(false);
    expect(pass.broker_allowed).toBe(false);
  }
});

test("whole-session outcome continuation discovers every original batch before claiming empty backlog", () => {
  test.setTimeout(240000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
    "--rotation-day", "--prospective-enrollment", "--full-original-history-setup", "--budgeted-history-setup",
    "--original-outcome-continuation"], { cwd: process.cwd(), encoding: "utf8", timeout: 230000 });
  expect(result.status, `${result.error?.message ?? ""}\n${result.stdout.slice(-2000)}\n${result.stderr.slice(-2000)}`).toBe(0);
  const receipt = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(receipt).toMatchObject({ actual_provider_requests: 0, production_actions: 0, publications: 0,
    broker_actions: 0, cleanup: "inert" });
  const continuation = receipt.full_original_history_evidence.original_outcome_continuation;
  expect(continuation).toMatchObject({ original_decisions: 26, original_batch_count: 26,
    original_population_count: 176, terminal_quality_decision: null, quality_improvement_claimed: false });
  expect(continuation.passes.every((pass: { requests: number }) => pass.requests <= 4)).toBe(true);
  // All original rows must be READ, not made eligible. The 13:30 original
  // decision has no completed research capsule; do not relax its admission.
  expect(continuation.original_source_read).toMatchObject({ status: "complete", original_batches_read: 26,
    excluded_batches: [{ batch_fingerprint: "rec_batch_5u9nnx", reason: "existing_official_source_admission_rejected" }] });
  expect(continuation.original_source_read.original_batch_fingerprints).toHaveLength(26);
  expect(new Set(continuation.original_source_read.original_batch_fingerprints).size).toBe(26);
  expect(continuation.passes.at(-1).source_selection.same_day_official_batches_discovered).toBe(25);
  expect(continuation.unvisited_original_batches).toEqual([]);
  expect(continuation.enrolled_coverage_diagnostic.members).toHaveLength(176);
  expect(continuation).toMatchObject({ canonical_outcome_count: 144, missing_outcome_count: 32,
    persisted_neither_horizon_marks_verified: 126 });
  expect(continuation.enrolled_coverage_diagnostic.reason_counts).toEqual({ resolved: 144, canonical_60m_outcome_missing: 32 });
  // Keep the full original scorecard, not a successful eight-member subset.
  // Known limit failures must remain separate from unavailable quality metrics.
  const charter = continuation.original_full_charter;
  expect(charter).toMatchObject({ disposition: "evidence_incomplete",
    original_population_count: 176, enrolled_decision_count: 22, required_decisions: 30,
    trading_day_count: 1, outcome_coverage: { numerator: 144, denominator: 176, value: 144 / 176 },
    evidence_missingness: { numerator: 0, denominator: 176, value: 0 },
    baseline_precision: null, challenger_precision: null, paired_precision_interval: null,
    terminal_quality_decision: null, quality_improvement_claimed: false });
  expect(charter.measured_limit_failures).toEqual([
    "outcome_coverage_charter_limit_not_met", "regime_concentration_charter_limit_not_met",
    "sector_concentration_charter_limit_not_met", "setup_concentration_charter_limit_not_met",
  ]);
  const threshold = (dimension: string) => charter.thresholds.find((row: { dimension: string }) => row.dimension === dimension);
  expect(threshold("outcome_coverage")).toMatchObject({ limit: 0.9, status: "fail" });
  expect(threshold("evidence_missingness")).toMatchObject({ limit: 0.1, status: "pass" });
  expect(threshold("runtime_reliability")).toMatchObject({ value: 1, limit: 0.95, status: "pass" });
  expect(threshold("provider_credits_per_decision")).toMatchObject({ value: 8, limit: 8, status: "pass" });
  for (const dimension of ["challenger_precision_at_3", "challenger_expectancy_r", "challenger_calibration_error"]) {
    expect(threshold(dimension)).toMatchObject({ value: null, status: "unavailable" });
  }
  for (const dimension of ["durably_frozen_training_probability_model_required",
    "complete_original_canonical_60m_outcomes_required", "original_first_thirty_decisions_required",
    "original_trading_day_and_ticker_diversity_required", "required_disclosed_feasibility_incomplete",
    "same_population_trading_day_paired_uncertainty_required"]) {
    expect(charter.missing_dimensions).toContain(dimension);
  }
  expect(continuation.remaining_missingness.map((row: {
    decision_at: string; required_horizon_end_at: string; original_population_count: number;
    missing_count: number; full_regular_horizon: boolean; session_close: string;
  }) => [row.decision_at, row.required_horizon_end_at, row.original_population_count,
    row.missing_count, row.full_regular_horizon, row.session_close])).toEqual([
    ["2026-10-01T19:00:20.000Z", "2026-10-01T20:05:00.000Z", 8, 8, false, "2026-10-01T20:00:00.000Z"],
    ["2026-10-01T19:15:20.000Z", "2026-10-01T20:20:00.000Z", 8, 8, false, "2026-10-01T20:00:00.000Z"],
    ["2026-10-01T19:30:20.000Z", "2026-10-01T20:35:00.000Z", 8, 8, false, "2026-10-01T20:00:00.000Z"],
    ["2026-10-01T19:45:20.000Z", "2026-10-01T20:50:00.000Z", 8, 8, false, "2026-10-01T20:00:00.000Z"],
  ]);
  // These original members remain enrolled and missing. Physical neither_hit
  // rows and incomplete regular-session candles cannot become usable labels.
  for (const row of continuation.remaining_missingness) {
    expect(row.members).toHaveLength(8);
    for (const member of row.members) {
      expect(member.reason).toBe("canonical_60m_outcome_missing");
      expect(member.persisted_original_60m).toHaveLength(1);
      expect(member.persisted_original_60m[0].status).toBe("neither_hit");
      expect(member.persisted_original_60m[0].coverage.blockers).toContain("candle_coverage_incomplete");
    }
  }
  expect(Object.values(continuation.enrolled_coverage_diagnostic.reason_counts)
    .reduce((sum: number, count) => sum + Number(count), 0)).toBe(176);
  console.info("Original outcome continuation (synthetic, not quality evidence):", JSON.stringify({
    original_decisions: continuation.original_decisions, original_population_count: continuation.original_population_count,
    original_batches_read: continuation.original_source_read.original_batches_read,
    admitted_batches: continuation.passes.at(-1).source_selection.same_day_official_batches_discovered,
    excluded_batches: continuation.original_source_read.excluded_batches,
    passes: continuation.passes.length, separate_synthetic_requests: continuation.separate_synthetic_requests,
    physical_outcomes: continuation.physical_outcomes, canonical_outcome_count: continuation.canonical_outcome_count,
    missing_outcome_count: continuation.missing_outcome_count,
    enrolled_reason_counts: continuation.enrolled_coverage_diagnostic.reason_counts,
    persisted_neither_horizon_marks_verified: continuation.persisted_neither_horizon_marks_verified,
    remaining_missingness: continuation.remaining_missingness,
    original_full_charter: continuation.original_full_charter,
    missing_r_examples: continuation.enrolled_coverage_diagnostic.members
      .filter((row: { outcome_reason: string }) => row.outcome_reason === "canonical_realized_r_unavailable").slice(0, 2),
    terminal_status: continuation.passes.at(-1).status,
    terminal_backlog: continuation.passes.at(-1).source_selection.remaining_backlog_after_run,
  }));
});

test("incomplete or over-bound original source reads fail before outcome provider work", () => {
  test.setTimeout(120000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold",
    "--rotation-day", "--prospective-enrollment", "--full-original-history-setup", "--budgeted-history-setup",
    "--original-source-read-controls"], { cwd: process.cwd(), encoding: "utf8", timeout: 110000 });
  expect(result.status, `${result.stdout.slice(-2000)}\n${result.stderr.slice(-2000)}`).toBe(0);
  const receipt = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(receipt).toMatchObject({ actual_provider_requests: 0, production_actions: 0, publications: 0,
    broker_actions: 0, cleanup: "inert" });
  const controls = receipt.full_original_history_evidence.original_source_read_controls;
  expect(controls.map((row: { fault: string }) => row.fault)).toEqual([
    "second_page", "missing_count", "truncated_page", "wrong_owner", "source_population_changed",
    "verification_error", "deadline", "source_read_limit",
  ]);
  for (const row of controls) {
    expect(row).toMatchObject({ status: "failed", provider_requests: 0, outcomes_unchanged: true });
    expect(row.blocker).toBeTruthy();
  }
  expect(controls.at(-1).blocker).toBe("official_batch_source_read_limit_exceeded");
  expect(receipt.full_original_history_evidence.original_source_read_isolation).toEqual({
    actual_other_owner_rows: 1, actual_other_date_rows: 1, original_batches_read: 26,
    provider_requests: 0, outcomes_unchanged: true,
  });
});

test("actual original complete input reaches full charter through canonical outcomes without granting quality authority", () => {
  test.setTimeout(120000);
  const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--benchmark-reuse", "--charter-composition"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 110000 });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({ setup_synthetic_requests: 32, scheduled_synthetic_requests: 16,
    attempts: 2, cycles: 2, claims: 2, fresh_inputs: 8, actual_provider_requests: 0,
    production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert",
    charter_composition_evidence: {
      evidence_scope: "synthetic_actual_original_source_and_canonical_outcomes_not_forward_seal",
      setup_requests: 32, scheduled_requests: 16, separate_synthetic_outcome_requests: 14,
      outcome_passes: [{ requests: 4, persisted_outcomes: 4 }, { requests: 2, persisted_outcomes: 6 },
        { requests: 4, persisted_outcomes: 10 }, { requests: 4, persisted_outcomes: 14 }],
      source_decisions: 2, source_research_snapshots: 14, retained_original_members: 16,
      enrolled_decisions: 1, excluded_partial_decisions: 1, original_enrolled_population: 8,
      canonical_enrolled_outcomes: 8, positive_enrolled_outcomes: 4, negative_enrolled_outcomes: 4,
      original_membership_stable: true, completed_repeat_requests: 0, prior_outcomes_unchanged: true,
      operational_attempts: 2, reserved_provider_credits: 16, disposition: "evidence_incomplete",
      wrong_owner_learning: null, tampered_source_missing_outcomes: 1, tampered_lineage_enrolled_decisions: 0,
      unproven_finalization_cost: null, unrecorded_as_of_outcomes: 0, restored_charter_unchanged: true,
      trained_model: null, terminal_quality_decision: null, quality_improvement_claimed: false,
    } });
  const composition = evidence.charter_composition_evidence;
  expect(composition.missing_dimensions).toContain("held_out_durably_frozen_training_probability_model_required");
  expect(composition.missing_dimensions).toContain("held_out_original_first_thirty_decisions_required");
  expect(composition.missing_dimensions).toContain("held_out_original_trading_day_and_ticker_diversity_required");
  expect(composition.observed_context_blockers).toHaveLength(8);
  expect(composition.observed_context_blockers.every((row: { blockers: string[] }) => row.blockers.length === 0)).toBe(true);
});

test("history-only setup is rejected when it changes original partial-decision ranking", () => {
  test.setTimeout(240000);
  const run = (historyOnly: boolean) => {
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs",
      "--benchmark-reuse", "--charter-composition", ...(historyOnly ? ["--history-only-setup"] : [])],
    { cwd: process.cwd(), encoding: "utf8", timeout: 110000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    return JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  };
  const baseline = run(false), history = run(true);
  expect(baseline.charter_composition_evidence.setup_requests).toBe(32);
  expect(history.charter_composition_evidence.setup_requests).toBe(16);
  expect(history.charter_composition_evidence.setup_intraday_requests).toBe(0);
  expect(baseline.charter_composition_evidence.original_input_fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
  // The frozen acceptance was exact ORIGINAL information equality, not only
  // the complete second decision. The failed experiment is retained as a
  // rejection; cheaper setup must not erase its differing partial population.
  expect(history.charter_composition_evidence.original_input_fingerprint)
    .not.toBe(baseline.charter_composition_evidence.original_input_fingerprint);
  expect(history.charter_composition_evidence.original_decision_fingerprints[0])
    .not.toBe(baseline.charter_composition_evidence.original_decision_fingerprints[0]);
  expect(history.charter_composition_evidence.original_decision_fingerprints[1])
    .toBe(baseline.charter_composition_evidence.original_decision_fingerprints[1]);
  expect(history.charter_composition_evidence.original_member_ids)
    .toEqual(baseline.charter_composition_evidence.original_member_ids);
  for (const evidence of [baseline, history]) {
    expect(evidence).toMatchObject({ fresh_inputs: 8, attempts: 2, claims: 2, cycles: 2,
      scheduled_synthetic_requests: 16, charter_composition_evidence: {
        source_research_snapshots: 14, retained_original_members: 16,
        excluded_partial_decisions: 1, original_enrolled_population: 8, canonical_enrolled_outcomes: 8,
        reserved_provider_credits: 16, separate_synthetic_outcome_requests: 14,
        positive_enrolled_outcomes: 4, negative_enrolled_outcomes: 4,
        disposition: "evidence_incomplete", trained_model: null, terminal_quality_decision: null,
        quality_improvement_claimed: false, completed_repeat_requests: 0, restored_charter_unchanged: true,
      } });
  }
  expect(history.charter_composition_evidence.missing_dimensions)
    .toEqual(baseline.charter_composition_evidence.missing_dimensions);
});

test("already-paid legacy history reaches original full charter without changing legacy information", () => {
  test.setTimeout(240000);
  const args=["scripts/completed-input-runtime-proof.mjs", "--benchmark-reuse", "--charter-composition", "--legacy-history-setup"];
  const baseline=spawnSync(process.execPath,[...args,"--legacy-retention-baseline"],
    {cwd:process.cwd(),encoding:"utf8",timeout:110000});
  expect(baseline.status,baseline.stderr).toBe(1);
  expect(baseline.stderr).toContain("3 !== 6");
  const before=JSON.parse(baseline.stderr.split("\n").find(line=>line.startsWith('{"legacy_setup_requests":'))!);
  expect(before).toMatchObject({legacy_setup_requests:16,retained_daily_contexts:0});
  const result=spawnSync(process.execPath,args,{cwd:process.cwd(),encoding:"utf8",timeout:110000});
  expect(result.status,`${result.stdout}\n${result.stderr}`).toBe(0);
  const retained=JSON.parse(result.stderr.split("\n").find(line=>line.startsWith('{"legacy_setup_requests":'))!);
  expect(retained).toMatchObject({legacy_setup_requests:16,retained_daily_contexts:16});
  expect(retained.legacy_original_information).toBe(before.legacy_original_information);
  expect(before.legacy_original_information).toBe("sha256:4ad7b9b0d82693deff5f4c0928a6cd26a215e9caab838545f1fcaef243c179cf");
  const evidence=JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(evidence).toMatchObject({setup_synthetic_requests:16,scheduled_synthetic_requests:16,
    benchmark_reuse_evidence:{first_fresh_inputs:6,second_fresh_inputs:8,original_members_per_decision:8,
      attempts:2,reservations:2,reserved_credits:16,restarted_owner_read:true,wrong_owner_runs:0},
    charter_composition_evidence:{setup_mode:"existing_legacy_fetch_retained_history",setup_intraday_requests:0,
      source_research_snapshots:14,retained_original_members:16,original_enrolled_population:8,
      canonical_enrolled_outcomes:8,separate_synthetic_outcome_requests:14,positive_enrolled_outcomes:4,
      negative_enrolled_outcomes:4,completed_repeat_requests:0,restored_charter_unchanged:true,
      disposition:"evidence_incomplete",trained_model:null,terminal_quality_decision:null,quality_improvement_claimed:false},
    actual_provider_requests:0,production_actions:0,publications:0,broker_actions:0,cleanup:"inert"});
});

test("full-session historical reuse improves breadth while retaining rejected allocation baselines", () => {
  test.setTimeout(420000);
  const evidence = ["baseline", "minimum", "guard", "fair", "regular", "first_closed_bar", "omitted_pair"].map(mode => {
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--rotation-day", "--cold",
      ...(mode === "baseline" ? ["--acquisition-baseline"] : mode === "minimum" ? ["--minimum-order-baseline"] : mode === "guard" ? ["--first-observation-baseline"] : mode === "fair" ? ["--fair-order-baseline"] : mode === "regular" ? ["--regular-session-baseline"] : mode === "omitted_pair" ? ["--omitted-pair-baseline"] : ["--first-closed-bar-baseline"])], { cwd: process.cwd(), encoding: "utf8", timeout: 180000 });
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
    expect(arm.synthetic_benchmark_requests).toBe(["original_order_regular_session_reuse", "original_order_first_closed_bar", "otherwise_omitted_first_pair_guard"].includes(arm.acquisition_mode) ? 2 : 20);
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
  const [baseline, minimum, guard, fair, regular, firstClosedBar, omittedPair] = evidence;
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
    expect(omittedPair.slots[index].members.map((member: { ticker: string }) => member.ticker))
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
  // More distinct inputs still fail the frozen non-regression contract.
  expect(omittedPair).toMatchObject({ ever_complete_tickers: 80, fresh_member_observations: 122 });
  expect(omittedPair.ever_complete_tickers).toBeGreaterThan(regular.ever_complete_tickers);
  expect(omittedPair.fresh_member_observations >= regular.fresh_member_observations).toBe(false);
  const guardedComplete = omittedPair.ticker_coverage.filter((member: { fresh: number }) => member.fresh > 0)
    .map((member: { ticker: string }) => member.ticker);
  expect(originalComplete.filter((ticker: string) => !guardedComplete.includes(ticker)))
    .toEqual(["AMAT", "AVGO", "BA", "DDOG", "GOOGL", "NFLX", "RDDT", "SBUX"]);
});
