import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

test("actual original daily features reproduce from durable parsed bars after cache deletion and reader restart", () => {
  test.setTimeout(90000);
  const proof = spawnSync(process.execPath, ["scripts/completed-input-runtime-proof.mjs", "--cold", "--historical-feature-replay"],
    { cwd: process.cwd(), encoding: "utf8", timeout: 80000 });
  expect(proof.status, `${proof.stdout}\n${proof.stderr}`).toBe(0);
  const rows = proof.stdout.trim().split("\n").map(line => JSON.parse(line));
  const replay = rows.find(row => row.historical_feature_replay);
  expect(replay).toMatchObject({ historical_feature_replay: "passed", original_population_count: 8,
    matched: 3, missing: 5, features_per_matched_member: 6, cache_deleted_restart_exact: true,
    valid_replacement_source_rejected: true, partial_archive_original_population_retained: true,
    original_decision_unchanged: true, extra_requests: 0, actual_provider_requests: 0, production_actions: 0,
    current_session_features_checked: false, original_provider_json_reproduced: false, quality_improvement_claimed: false });
  expect(replay.archive_bytes).toBeGreaterThan(0);
  expect(replay.archive_bytes).toBeLessThan(2 * 1048576);
  expect(replay.fail_closed_controls).toHaveLength(13);
  expect(rows.at(-1)).toMatchObject({ attempts: 1, claims: 1, scheduled_synthetic_requests: 8,
    decision_version: "candidate_decision_record_v4", fresh_inputs: 3, publications: 0,
    actual_provider_requests: 0, production_actions: 0, broker_actions: 0, cleanup: "inert" });
});

test("invalid owner and run identities fail before any transport; legacy captures never invent raw bars", async () => {
  const bundle = await build({ entryPoints: [resolve(process.cwd(), "lib/server/scanner-historical-input-replay.ts")],
    bundle: true, write: false, platform: "node", format: "cjs", conditions: ["react-server"] });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", bundle.outputFiles[0].text)(
    createRequire(resolve(process.cwd(), "package.json")), loaded, loaded.exports);
  const { readOwnedScannerHistoricalInputReplay, buildScannerHistoricalInputArchive } = loaded.exports as
    typeof import("@/lib/server/scanner-historical-input-replay");
  const previousFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error("Unexpected CLOSED transport"); };
  try {
    for (const [owner, id] of [["invalid", "rec_scan_run_abc"],
      ["00000000-0000-4000-8000-000000000001", "unbounded-run-id"],
      ["00000000-0000-4000-8000-000000000001", `rec_scan_run_${"a".repeat(1000)}`]]) {
      expect(await readOwnedScannerHistoricalInputReplay(owner, id)).toMatchObject({ status: "unavailable",
        scan_run_id: null, members: [], matched_count: 0, recommendation_quality_proven: false });
    }
    expect(buildScannerHistoricalInputArchive(null, null)).toBeNull();
    expect(requests).toBe(0);
  } finally { globalThis.fetch = previousFetch; }
});
