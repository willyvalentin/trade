import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

type FrozenRepositoryArtifact = {
  path: string;
  artifact_type: string;
  classification: string;
  version: string;
  sha256: string;
  git_status: "untracked" | "tracked_unmodified";
  lifecycle_status:
    | "normative_current"
    | "historical_retained"
    | "superseded_retained";
  lineage_stage: string;
};

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stable(child)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex");
}

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function freezeManifest() {
  return JSON.parse(
    readFileSync(
      "docs/evidence/action-667m5j-diagnostic-replay-foundation-freeze-manifest.json",
      "utf8",
    ),
  );
}

function reviewEvidence() {
  return JSON.parse(
    readFileSync(
      "docs/evidence/action-667m5j-diagnostic-replay-foundation-review.json",
      "utf8",
    ),
  );
}

test("M.5J freeze digest binds exactly 29 repository and two external artifacts", () => {
  const manifest = freezeManifest();
  expect(digest(manifest.freeze_material)).toBe(manifest.freeze_digest);
  expect(manifest.freeze_material.repository_artifact_count).toBe(29);
  expect(manifest.freeze_material.repository_artifacts).toHaveLength(29);
  expect(manifest.freeze_material.external_artifact_count).toBe(2);
  expect(manifest.freeze_material.external_artifacts).toHaveLength(2);
  expect(
    new Set(
      manifest.freeze_material.repository_artifacts.map(
        (artifact: FrozenRepositoryArtifact) => artifact.path,
      ),
    ).size,
  ).toBe(29);
  expect(manifest.freeze_material.lifecycle_summary).toEqual({
    normative_current: 20,
    historical_retained: 9,
    superseded_retained: 0,
  });
});

test("every frozen repository artifact exists at its exact SHA-256", () => {
  const artifacts = freezeManifest().freeze_material
    .repository_artifacts as FrozenRepositoryArtifact[];

  for (const artifact of artifacts) {
    expect(existsSync(artifact.path), artifact.path).toBe(true);
    expect(fileSha256(artifact.path), artifact.path).toBe(artifact.sha256);
    expect(artifact.version, artifact.path).not.toBe("");
    expect(artifact.classification, artifact.path).not.toBe("");
    expect(artifact.lineage_stage, artifact.path).not.toBe("");
  }
});

test("raw through replay lineage roots are complete and exact", () => {
  const lineage = freezeManifest().freeze_material.lineage;
  expect(lineage).toEqual({
    raw_record_count: 2_420_049,
    raw_file_digest_root:
      "7b9d1bdc9e9f75df2424f31da1e194a80f7ec875a34f38cd8782e6a72c09ac51",
    raw_to_record_lineage_digest:
      "fa874fd4747d16f9e1a03ef22ed4e9fa3be2491d767087372805992ab0ba3d5c",
    normalized_dataset_digest:
      "72fd0912e079be176a81748a01cad630dda3dc62322987ee3307e3e0e55b6d8c",
    normalized_output_tree_digest:
      "b76048092197c9a18ecfeff8b851a50e60a60142a9bfa4b82b6d5c6269d1fc1e",
    normalized_manifest_sha256:
      "d709a32280c7fb054f5b01141349418f1ff610d61147813866068a64d500a922",
    replay_dataset_digest:
      "be4ecb4c391e7415546a1fab41a4e9abab6eba5742e74abaeccb82783fac7555",
    replay_output_tree_digest:
      "9275616f957eb447f642bd06108823ba42d7f5179f08e28ec5dc565fe08005b1",
    replay_core_evidence_digest:
      "a9fbc4112cbdcf95ad8fd82f29156ed0f3d7625e6421d0b55b4127bd8d0497f3",
    sanitized_replay_evidence_digest:
      "678c2947ff3683260d86bf824beeb16c218592b833d258104a356e5db4aa1e9f",
  });
});

test("external normalized and replay descriptors remain lossless and fail-closed", () => {
  const external = freezeManifest().freeze_material.external_artifacts;
  expect(external).toEqual([
    expect.objectContaining({
      external_artifact_identity:
        "market_context_diagnostic_all_reported_trades_1m_v1",
      classification: "external_normalized_dataset",
      artifact_count: 303,
      dataset_digest:
        "72fd0912e079be176a81748a01cad630dda3dc62322987ee3307e3e0e55b6d8c",
      output_tree_digest:
        "b76048092197c9a18ecfeff8b851a50e60a60142a9bfa4b82b6d5c6269d1fc1e",
      manifest_sha256:
        "d709a32280c7fb054f5b01141349418f1ff610d61147813866068a64d500a922",
      permission_drift_count: 0,
      verified: true,
    }),
    expect.objectContaining({
      external_artifact_identity:
        "market_context_diagnostic_replay_2026_20_sessions_v1",
      classification: "external_diagnostic_replay",
      artifact_count: 84,
      dataset_digest:
        "be4ecb4c391e7415546a1fab41a4e9abab6eba5742e74abaeccb82783fac7555",
      output_tree_digest:
        "9275616f957eb447f642bd06108823ba42d7f5179f08e28ec5dc565fe08005b1",
      core_evidence_digest:
        "a9fbc4112cbdcf95ad8fd82f29156ed0f3d7625e6421d0b55b4127bd8d0497f3",
      permission_drift_count: 0,
      verified: true,
    }),
  ]);
  expect(freezeManifest().freeze_material.freeze_policy).toEqual({
    unexpected_path_allowed: false,
    missing_path_allowed: false,
    sha_or_digest_drift_allowed: false,
    external_artifact_copy_into_git_allowed: false,
    historical_git_status_is_provenance: true,
    future_current_git_status_must_be_recomputed: true,
    normalization_or_replay_performed: false,
  });
});

test("independent review covers 21 dimensions and all twelve threat cases", () => {
  const evidence = reviewEvidence();
  expect(digest(evidence.review_material)).toBe(
    evidence.review_evidence_digest,
  );
  expect(evidence.review_material.independent_review).toHaveLength(21);
  expect(
    evidence.review_material.independent_review.every(
      (item: { verdict: string }) => item.verdict.startsWith("approved"),
    ),
  ).toBe(true);
  expect(evidence.review_material.threat_cases).toHaveLength(12);
  expect(
    evidence.review_material.threat_cases.every(
      (item: { result: string }) =>
        item.result === "fail_closed_control_verified",
    ),
  ).toBe(true);
});

test("findings stay transparent and approval does not widen authority", () => {
  const material = reviewEvidence().review_material;
  expect(material.review_findings).toMatchObject({
    blocker: 0,
    major: 0,
    minor: 2,
    nit: 0,
  });
  expect(
    material.review_findings.items.map(
      (finding: { id: string }) => finding.id,
    ),
  ).toEqual(["H-001", "J-001"]);
  expect(material.execution_boundary).toEqual({
    normalizations: 0,
    replays: 0,
    provider_calls: 0,
    credentials_loaded: 0,
    database_connections: 0,
    canonical_bindings: 0,
    live_consumer_changes: 0,
    commits: 0,
    pushes: 0,
    pull_request_updates: 0,
    deploys: 0,
  });
  expect(material.statuses).toEqual({
    action_667m5j_replay_foundation_frozen: true,
    action_667m5j_external_artifact_roots_verified: true,
    action_667m5j_independent_review_approved: true,
    action_667m5j_local_checkpoint_ready: true,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
});

test("frozen source keeps diagnostic, watermark, breadth, probability and live barriers", () => {
  const sources = [
    "lib/market-context-intelligence-lab/diagnostic-all-reported-trades-candle-policy-v1.ts",
    "lib/market-context-intelligence-lab/diagnostic-trade-to-candle-normalization-v1.ts",
    "lib/market-context-intelligence-lab/diagnostic-replay-schedule-v1.ts",
    "scripts/market_context_diagnostic_normalize_1m_v1.py",
    "scripts/market_context_diagnostic_replay_v1.ts",
  ]
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");

  expect(sources).toContain("official_ohlcv_claimed");
  expect(sources).toContain("sale_condition_semantics_available");
  expect(sources).toContain("empirically_unvalidated");
  expect(sources).toContain("not_full_market_breadth");
  expect(sources).toContain("calibrated_probability");
  expect(sources).toContain("live_ranking_effect");
  expect(sources).not.toContain("DATABENTO_API_KEY");
});
