import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, relative } from "node:path";

import {
  DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
} from "./databento-explicit-nanosecond-instant-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
  createMarketContextDiagnosticContextSnapshotBatchV1,
  deriveMarketContextDiagnosticTrustRootV1,
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
  type MarketContextDiagnosticContextSnapshotInputV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_REPLAY_DATASET_ID,
  MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1,
  buildMarketContextDiagnosticReplayScheduleV1,
  type MarketContextDiagnosticReplayCalendarSessionV1,
} from "./diagnostic-replay-schedule-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FIXTURE_ADAPTER_V1 =
  "market_context_diagnostic_context_fixture_adapter_v1" as const;

export const MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOT =
  "/Users/willysimonsson/Library/Application Support/trade-shadow-data/encrypted/databento/EQUS.MINI/trades/v1/diagnostic-shadow-replay-20-sessions/market_context_diagnostic_replay_2026_20_sessions_v1";

export const MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS = {
  normalized_dataset_digest:
    "72fd0912e079be176a81748a01cad630dda3dc62322987ee3307e3e0e55b6d8c",
  normalized_output_tree_digest:
    "b76048092197c9a18ecfeff8b851a50e60a60142a9bfa4b82b6d5c6269d1fc1e",
  normalized_lineage_digest:
    "fa874fd4747d16f9e1a03ef22ed4e9fa3be2491d767087372805992ab0ba3d5c",
  normalized_manifest_digest:
    "d709a32280c7fb054f5b01141349418f1ff610d61147813866068a64d500a922",
  replay_dataset_digest:
    "be4ecb4c391e7415546a1fab41a4e9abab6eba5742e74abaeccb82783fac7555",
  replay_output_tree_digest:
    "9275616f957eb447f642bd06108823ba42d7f5179f08e28ec5dc565fe08005b1",
  replay_manifest_digest:
    "86ceebf3e782136a27fbb7d1f314f122189103debdde2b03edc1770502e92a79",
  replay_core_evidence_digest:
    "a9fbc4112cbdcf95ad8fd82f29156ed0f3d7625e6421d0b55b4127bd8d0497f3",
} as const;

type CalendarArtifact = {
  canonical_json_material: {
    sessions: MarketContextDiagnosticReplayCalendarSessionV1[];
  };
};

type ReplayManifest = {
  artifact_inventory_excluding_manifest: {
    relative_path: string;
    sha256: string;
    size_bytes: number;
  }[];
  decision_count: number;
  session_count: number;
  replay_version: string;
  replay_contract_version: string;
  schedule_version: string;
  normalized_input: {
    dataset_digest: string;
    output_tree_digest: string;
    lineage_digest: string;
    manifest_digest: string;
  };
  replay_dataset_digest: string;
  replay_core_evidence_digest: string;
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function recursiveFiles(root: string, current = root): string[] {
  return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const path = join(current, entry.name);
    return entry.isDirectory() ? recursiveFiles(root, path) : [relative(root, path)];
  });
}

function treeInventory(root: string) {
  return recursiveFiles(root)
    .map((relativePath) => {
      const path = join(root, relativePath);
      return {
        relative_path: relativePath,
        sha256: fileSha256(path),
        size_bytes: statSync(path).size,
      };
    })
    .sort((left, right) => left.relative_path.localeCompare(right.relative_path));
}

function calendarSessions(repoRoot: string) {
  return [
    "docs/evidence/market-context-xnys-calibration-calendar-2026-v1.json",
    "docs/evidence/market-context-xnys-acquisition-calendar-2026-v1.json",
  ]
    .flatMap(
      (path) =>
        readJson<CalendarArtifact>(join(repoRoot, path)).canonical_json_material
          .sessions,
    )
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function loadMarketContextDiagnosticContextFixtureInputsV1(options: {
  repo_root: string;
  replay_root?: string;
  input_order?: "canonical" | "reverse";
}) {
  const replayRoot =
    options.replay_root ?? MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOT;
  const manifestPath = join(replayRoot, "replay-manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error("diagnostic_context_replay_manifest_missing");
  }
  if (
    fileSha256(manifestPath) !==
    MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.replay_manifest_digest
  ) {
    throw new Error("diagnostic_context_replay_manifest_digest_drift");
  }
  const manifest = readJson<ReplayManifest>(manifestPath);
  if (
    manifest.decision_count !== 60 ||
    manifest.session_count !== 20 ||
    manifest.replay_version !== MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1 ||
    manifest.schedule_version !==
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1 ||
    manifest.replay_dataset_digest !==
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.replay_dataset_digest ||
    manifest.replay_core_evidence_digest !==
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.replay_core_evidence_digest ||
    stableMarketContextDiagnosticContextJsonV1(manifest.normalized_input) !==
      stableMarketContextDiagnosticContextJsonV1({
        dataset_digest:
          MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS
            .normalized_dataset_digest,
        lineage_digest:
          MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS
            .normalized_lineage_digest,
        manifest_digest:
          MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS
            .normalized_manifest_digest,
        normalized_artifact_count: 303,
        output_tree_digest:
          MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS
            .normalized_output_tree_digest,
        raw_root:
          "7b9d1bdc9e9f75df2424f31da1e194a80f7ec875a34f38cd8782e6a72c09ac51",
      })
  ) {
    throw new Error("diagnostic_context_replay_manifest_scope_drift");
  }
  const declaredInventory = [
    ...manifest.artifact_inventory_excluding_manifest,
  ].sort((left, right) => left.relative_path.localeCompare(right.relative_path));
  for (const item of declaredInventory) {
    const path = join(replayRoot, item.relative_path);
    if (
      !existsSync(path) ||
      statSync(path).size !== item.size_bytes ||
      fileSha256(path) !== item.sha256
    ) {
      throw new Error(
        `diagnostic_context_replay_artifact_drift:${item.relative_path}`,
      );
    }
  }
  const completeInventory = treeInventory(replayRoot);
  if (
    completeInventory.length !== 84 ||
    marketContextDiagnosticContextSha256V1(completeInventory) !==
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.replay_output_tree_digest
  ) {
    throw new Error("diagnostic_context_replay_output_tree_drift");
  }

  const sessions = calendarSessions(options.repo_root);
  const schedule = buildMarketContextDiagnosticReplayScheduleV1(sessions);
  const calendar = {
    identity: "market_context_xnys_diagnostic_20_sessions_calendar_bundle_v1",
    digest: marketContextDiagnosticContextSha256V1({
      identity: "market_context_xnys_diagnostic_20_sessions_calendar_bundle_v1",
      sessions,
    }),
  };
  const decisionSource = {
    contract: "market_context_shadow_replay_v1",
    version: MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1,
  };
  const normalizedDataset = {
    identity: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_DATASET_ID,
    dataset_digest:
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.normalized_dataset_digest,
    output_tree_digest:
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS
        .normalized_output_tree_digest,
    lineage_digest:
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.normalized_lineage_digest,
    manifest_digest:
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.normalized_manifest_digest,
  };
  const replay = {
    identity: MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1,
    dataset_digest:
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.replay_dataset_digest,
    output_tree_digest:
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.replay_output_tree_digest,
    manifest_digest:
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.replay_manifest_digest,
    core_evidence_digest:
      MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS
        .replay_core_evidence_digest,
  };
  const decisionInventory = new Map(
    declaredInventory
      .filter((item) => item.relative_path.startsWith("decisions/"))
      .map((item) => [item.relative_path, item]),
  );
  let orderedSchedule = [...schedule];
  if (options.input_order === "reverse") orderedSchedule = orderedSchedule.reverse();
  const inputs = orderedSchedule.map((entry) => {
    const relativePath = `decisions/${entry.session_date}/${entry.slot_id}.json`;
    const inventoryItem = decisionInventory.get(relativePath);
    if (!inventoryItem) {
      throw new Error(`diagnostic_context_decision_missing:${relativePath}`);
    }
    const sourceDecision = readJson<unknown>(join(replayRoot, relativePath));
    const sourceDecisionSha256 = createHash("sha256")
      .update(stableMarketContextDiagnosticContextJsonV1(sourceDecision))
      .digest("hex");
    const inputMaterial = {
      contract_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
      decision_identity: {
        external_decision_id: entry.decision_id,
        session_id: entry.session_date,
        symbol_identity: null,
        opportunity_set_identity:
          "spy_qqq_eleven_sector_etf_diagnostic_opportunity_set_v1",
      },
      decision_unix_ns: entry.decision_unix_ns,
      decision_source: decisionSource,
      normalized_dataset: normalizedDataset,
      replay,
      calendar,
      policy_bundle: {
        diagnostic_candle_policy:
          "market_context_diagnostic_all_reported_trades_candle_policy_v1",
        replay_contract: manifest.replay_contract_version,
        replay_schedule: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1,
        market_context_contract: "market_context_intelligence_v2",
        market_context_thresholds:
          "market_context_intelligence_thresholds_2026_07_26_v2",
        watermark_policy:
          "market_context_trade_watermark_policy_2s_empirically_unvalidated_v2",
        watermark_status: "empirically_unvalidated" as const,
        instant_parser: DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      },
      source_decision_sha256: sourceDecisionSha256,
      source_decision: sourceDecision,
    };
    const input: MarketContextDiagnosticContextSnapshotInputV1 = {
      ...inputMaterial,
      external_trust_root_digest:
        deriveMarketContextDiagnosticTrustRootV1(inputMaterial),
    };
    return input;
  });
  const externalTrustRootDigest = marketContextDiagnosticContextSha256V1(
    inputs
      .map((input) => input.external_trust_root_digest)
      .sort(),
  );
  return {
    adapter_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FIXTURE_ADAPTER_V1,
    inputs,
    external_roots: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS,
    calendar,
    external_trust_root_digest: externalTrustRootDigest,
    source_inventory_digest: marketContextDiagnosticContextSha256V1(
      declaredInventory,
    ),
  };
}

export function buildMarketContextDiagnosticContextFixtureResultV1(options: {
  repo_root: string;
  replay_root?: string;
  input_order?: "canonical" | "reverse";
}) {
  const fixtures = loadMarketContextDiagnosticContextFixtureInputsV1(options);
  const snapshots = createMarketContextDiagnosticContextSnapshotBatchV1(
    fixtures.inputs,
  );
  const taxonomy_counts = Object.fromEntries(
    ["mapped", "insufficient_data", "conflicting", "not_point_in_time_safe"].map(
      (taxonomy) => [
        taxonomy,
        snapshots.filter((snapshot) => snapshot.taxonomy === taxonomy).length,
      ],
    ),
  );
  const canonicalMaterial = {
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
    adapter_version: fixtures.adapter_version,
    decision_count: snapshots.length,
    taxonomy_counts,
    external_roots: fixtures.external_roots,
    calendar: fixtures.calendar,
    external_trust_root_digest: fixtures.external_trust_root_digest,
    source_inventory_digest: fixtures.source_inventory_digest,
    snapshots,
  };
  return {
    ...canonicalMaterial,
    canonical_result_digest:
      marketContextDiagnosticContextSha256V1(canonicalMaterial),
  };
}
