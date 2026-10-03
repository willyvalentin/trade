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
    expect(await runtime.isValidCompletedBenchmarkReuse(reused!, next)).toBe(true);
    expect(await runtime.isValidCompletedBenchmarkReuse(structuredClone(reused!), next)).toBe(false);
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
      policy_version: "completed_benchmark_reuse_allocation_v1", source_scan_run_id: run.id,
      source_scan_run_fingerprint: run.run_fingerprint, source_decision_timestamp: decision.decision_timestamp,
      original_classified_at: captured.toISOString(), revalidated_at: next.toISOString(),
      benchmark_provider_calls: 0, scanner_provider_call_cap: 8, whole_scan_provider_call_cap: 8,
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

for (const mode of ["baseline", "minimum_requests_first", "invalid_history"] as const) {
  test(`mixed original population ${mode} acquires more complete inputs without more credits`, () => {
    test.setTimeout(90000);
    const result = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--benchmark-reuse", "--mixed-history",
      ...(mode === "baseline" ? ["--acquisition-baseline"] : mode === "invalid_history" ? ["--mixed-history-invalid"] : [])],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
    expect(evidence).toMatchObject({ setup_synthetic_requests: 16, scheduled_synthetic_requests: 16,
      attempts: 2, cycles: 2, claims: 2, actual_provider_requests: 0,
      production_actions: 0, publications: 0, broker_actions: 0, cleanup: "inert",
      benchmark_reuse_evidence: { baseline_revision: "43fa089e2c7410f10834e148179dda1564765e46", history_start: "mixed",
        acquisition_mode: mode === "baseline" ? "original_order" : "minimum_requests_first",
        historical_context_integrity: mode === "invalid_history" ? "tampered" : "valid",
        first_scan_requests: 8, second_scan_requests: 8,
        first_fresh_inputs: mode === "minimum_requests_first" ? 5 : 3,
        second_fresh_inputs: mode === "minimum_requests_first" ? 6 : 4,
        original_members_per_decision: 8, reservations: 2, reserved_credits: 16,
        benchmark_calls_second: 0, restarted_owner_read: true, wrong_owner_runs: 0 } });
  });
}
