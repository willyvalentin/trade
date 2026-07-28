import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";

type LicenseMatrixEntry = {
  topic: string;
  status: string;
  basis: string[];
};

type Evidence = {
  evidence_version: string;
  evidence_digest: string;
  digest_material: {
    operator_evidence: {
      classification: string;
      evidence_reference: string;
      provider_verbatim_available: boolean;
      provider_confirmation_date: null;
      operator_summaries_are_not_provider_quotes: boolean;
      statements: Array<{
        id: string;
        operator_summary: string;
      }>;
      invented_wording_or_provenance: boolean;
      sensitive_identifiers_preserved: boolean;
    };
    official_documentation_reconciliation: Array<{
      fact_id: string;
      source: string;
      effect: string;
    }>;
    license_matrix: LicenseMatrixEntry[];
    unresolved_license_questions: string[];
    technical_pre_download_readiness: {
      status: string;
      stable_tiebreak: string;
      sequence_policy: string;
      watermark: {
        evidence_status: string;
        calibrated: boolean;
      };
      normalization_before_post_download_admission: boolean;
      replay_before_separate_calibration_and_admission: boolean;
    };
    decisions: Record<string, boolean>;
    inactive_m4_authorization_phrase: string;
  };
  activity_attestation: Record<string, boolean | number>;
  regression: {
    full_relevant_action_667a_through_m3c: {
      tests: number;
      passed: number;
      failed: number;
    };
    cross_timezone_matrix: string[];
    cross_timezone_byte_identical: boolean;
    cross_timezone_digest: string;
    typescript: string;
    scoped_eslint: string;
    json_parity: string;
    freeze_parity: string;
    git_diff_check: string;
    dependency_changes: number;
    deno_lock_changes: number;
  };
  review: {
    implementation_finding_counts: Record<string, number>;
    implementation_minor_findings: Array<{
      id: string;
      finding: string;
      disposition: string;
    }>;
    external_acquisition_blocker_count: number;
    external_acquisition_blockers: string[];
  };
  canonical_binding_performed: boolean;
  shadow_only: boolean;
  live_ranking_effect: boolean;
};

type FreezeArtifact = {
  path: string;
  artifact_type: string;
  classification: string;
  version: string;
  sha256: string;
  git_status_at_freeze: "untracked" | "modified";
  lineage: string[];
};

type FreezeManifest = {
  manifest_version: string;
  stacked_base: string;
  artifact_count: number;
  artifacts: FreezeArtifact[];
  self_exclusion: {
    path: string;
    reason: string;
  };
  artifact_digest: string;
  predecessor_digests: Record<string, string>;
  decisions: Record<string, boolean>;
};

const repositoryRoot = resolve(process.cwd());
const evidencePath =
  "docs/evidence/action-667m3c-license-evidence-reconciliation.json";
const manifestPath =
  "docs/evidence/action-667m3c-license-evidence-freeze-manifest.json";
const documentationPath =
  "docs/action-667m3c-databento-license-evidence-reconciliation.md";
const evidence = JSON.parse(
  readFileSync(resolve(repositoryRoot, evidencePath), "utf8"),
) as Evidence;
const manifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, manifestPath), "utf8"),
) as FreezeManifest;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort((left, right) => left.localeCompare(right))
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

function recursiveFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory()
      ? recursiveFiles(path)
      : [relative(repositoryRoot, path)];
  });
}

function currentM3cPaths() {
  return [
    ...recursiveFiles(resolve(repositoryRoot, "docs")).filter(
      (path) =>
        /^docs\/action-667m3c-/.test(path) ||
        /^docs\/evidence\/action-667m3c-/.test(path),
    ),
    ...recursiveFiles(resolve(repositoryRoot, "tests/e2e")).filter(
      (path) => /^tests\/e2e\/action-667m3c-/.test(path),
    ),
    "tests/e2e/action-667m3b-pilot-foundation-freeze.spec.ts",
  ].sort((left, right) => left.localeCompare(right));
}

function matrix(topic: string) {
  return evidence.digest_material.license_matrix.find(
    (entry) => entry.topic === topic,
  )!;
}

test("operator attestation remains sanitized and distinct from unavailable provider-verbatim evidence", () => {
  const operator = evidence.digest_material.operator_evidence;
  expect(operator.classification).toBe(
    "operator_attested_provider_confirmation",
  );
  expect(operator.evidence_reference).toBe(
    "action-667m3c-operator-attestation",
  );
  expect(operator.provider_verbatim_available).toBe(false);
  expect(operator.provider_confirmation_date).toBeNull();
  expect(operator.operator_summaries_are_not_provider_quotes).toBe(
    true,
  );
  expect(operator.statements.map(({ id }) => id)).toEqual([
    "retention_indefinite",
    "retention_survives_cancellation",
    "organization_scope",
  ]);
  expect(operator.invented_wording_or_provenance).toBe(false);
  expect(operator.sensitive_identifiers_preserved).toBe(false);

  const serialized = JSON.stringify(operator);
  const forbiddenEvidencePattern = new RegExp(
    [
      ["DATABENTO", "API", "KEY"].join("_"),
      "account[_ -]?id",
      "request[_ -]?id",
      "@[a-z0-9.-]+\\.[a-z]{2,}",
    ].join("|"),
    "i",
  );
  expect(serialized).not.toMatch(
    forbiddenEvidencePattern,
  );
});

test("official facts are reconciled one-by-one without replacing dataset-specific evidence", () => {
  const facts =
    evidence.digest_material.official_documentation_reconciliation;
  expect(facts.map(({ fact_id }) => fact_id)).toEqual([
    "historical_license_norm",
    "historical_market_replay",
    "ohlcv_from_trades",
    "batch_redownload",
    "equs_mini_sequence",
    "trades_action",
    "nanosecond_timestamps",
    "flags_bitmask",
    "redistribution",
    "corporate_actions",
  ]);
  for (const fact of facts) {
    expect(fact.source).toMatch(/^https:\/\/(?:www\.)?databento\.com\//);
    expect(fact.effect.length).toBeGreaterThan(0);
  }
});

test("license matrix resolves only supported topics and leaves exactly three precise questions", () => {
  expect(matrix("indefinite_raw_retention").status).toBe(
    "confirmed",
  );
  expect(matrix("retention_after_cancellation").status).toBe(
    "confirmed",
  );
  expect(matrix("organization_team_scope").status).toBe(
    "confirmed",
  );
  expect(matrix("internal_non_display_research").status).toBe(
    "supported",
  );
  expect(matrix("derived_candles").status).toBe(
    "creation_supported_retention_written_confirmation_required",
  );
  expect(matrix("derived_evidence").status).toBe(
    "retention_written_confirmation_required",
  );
  expect(matrix("offline_replay").status).toBe("supported");
  expect(matrix("encrypted_backup").status).toBe(
    "written_confirmation_required",
  );
  expect(matrix("audit_log_requirements").status).toBe(
    "written_confirmation_required",
  );
  expect(matrix("redistribution").status).toBe("forbidden");
  expect(matrix("corporate_actions").status).toBe(
    "excluded_raw_unadjusted",
  );
  expect(
    evidence.digest_material.unresolved_license_questions,
  ).toHaveLength(3);
});

test("technical pre-download foundation is fail-closed for future evidence", () => {
  const readiness =
    evidence.digest_material.technical_pre_download_readiness;
  expect(readiness.status).toBe(
    "ready_to_validate_future_evidence_fail_closed",
  );
  expect(readiness.stable_tiebreak).toBe(
    "immutable_source_file_identity_plus_record_ordinal",
  );
  expect(readiness.sequence_policy).toBe(
    "equs_mini_sequence_zero_not_used_as_unique_identity",
  );
  expect(readiness.watermark).toEqual({
    policy_version:
      "market_context_trade_watermark_policy_2026_07_27_v2",
    evidence_status: "empirically_unvalidated",
    calibrated: false,
  });
  expect(readiness.normalization_before_post_download_admission).toBe(
    false,
  );
  expect(
    readiness.replay_before_separate_calibration_and_admission,
  ).toBe(false);

  const pilot = readFileSync(
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab/five-session-pilot-admission-v1.ts",
    ),
    "utf8",
  );
  for (const marker of [
    "pilot_session_condition_not_all_available",
    "pilot_quote_missing_or_cap_exceeded",
    "pilot_provider_encoder_or_dataset_revision_missing",
    "pilot_stable_tiebreak_evidence_missing",
    "pilot_publisher_semantics_not_fail_closed",
    "pilot_written_license_reference_missing_or_incomplete",
    "pilot_post_download_lineage_missing_or_cap_exceeded",
    "empirically_unvalidated",
  ]) {
    expect(pilot).toContain(marker);
  }
});

test("readiness decisions never imply operator or download authorization", () => {
  expect(evidence.digest_material.decisions).toEqual({
    license_sufficient: false,
    technical_pre_download_ready: true,
    operator_acquisition_authorized: false,
    dataset_acquisition_ready: false,
    download_authorized: false,
    action_667m3c_license_evidence_reconciled: true,
    action_667m3c_license_sufficient: false,
    action_667m3c_pilot_pre_download_ready: true,
    action_667m4_dataset_acquisition_ready: false,
  });
  expect(evidence.canonical_binding_performed).toBe(false);
  expect(evidence.shadow_only).toBe(true);
  expect(evidence.live_ranking_effect).toBe(false);
  expect(
    evidence.digest_material.inactive_m4_authorization_phrase,
  ).toContain("endast efter att");
  expect(
    evidence.digest_material.inactive_m4_authorization_phrase,
  ).toContain("license_sufficient:true");
});

test("readable and machine-readable decisions are in parity", () => {
  const documentation = readFileSync(
    resolve(repositoryRoot, documentationPath),
    "utf8",
  );
  for (const marker of [
    "`operator_attested_provider_confirmation`",
    "`license_sufficient: false`",
    "`technical_pre_download_ready: true`",
    "`operator_acquisition_authorized: false`",
    "`dataset_acquisition_ready: false`",
    "`download_authorized: false`",
    "`action_667m4_dataset_acquisition_ready: false`",
    "`empirically_unvalidated`",
    "record ordinal",
  ]) {
    expect(documentation).toContain(marker);
  }
  expect(documentation).toContain(
    evidence.digest_material.inactive_m4_authorization_phrase,
  );
});

test("evidence digest and current-state freeze hashes are deterministic", () => {
  expect(evidence.evidence_version).toBe(
    "market_context_action_667m3c_license_evidence_v1",
  );
  expect(
    sha256(canonicalJson(evidence.digest_material)),
  ).toBe(evidence.evidence_digest);

  expect(manifest.manifest_version).toBe(
    "market_context_action_667m3c_license_freeze_manifest_v1",
  );
  expect(manifest.stacked_base).toBe(
    "becee774a270e078fbd8bb55a01d7a59b2205599",
  );
  expect(manifest.artifact_count).toBe(manifest.artifacts.length);
  expect(manifest.self_exclusion.path).toBe(manifestPath);
  for (const artifact of manifest.artifacts) {
    expect(
      sha256(readFileSync(resolve(repositoryRoot, artifact.path))),
    ).toBe(artifact.sha256);
  }
  const freezePayload = manifest.artifacts
    .map((artifact) =>
      [
        artifact.path,
        artifact.artifact_type,
        artifact.classification,
        artifact.version,
        artifact.sha256,
        artifact.git_status_at_freeze,
        artifact.lineage.join(","),
      ].join("\u0000") + "\n"
    )
    .join("");
  expect(sha256(freezePayload)).toBe(manifest.artifact_digest);
});

test("M.3C scope is exact and predecessor freezes remain bound", () => {
  const expected = [
    ...manifest.artifacts.map((artifact) => artifact.path),
    manifest.self_exclusion.path,
  ].sort((left, right) => left.localeCompare(right));
  expect(currentM3cPaths()).toEqual(expected);
  expect(manifest.predecessor_digests).toEqual({
    m2a_v1_freeze:
      "28b5ef0a42023605d299671c05d926e4fbf7e129f421f4feed02a6c6b02f9370",
    m2c_v2_freeze:
      "f5b3ad14fb10fb8fd7fed6547f521f430d8b30895bccb5b684db457160e2de4f",
    m3a_evidence:
      "0a61bbe1bad00077386ebc3abfaa5ebd3759b1b0f523ee679475ef90df12b030",
    m3b_foundation_freeze:
      "d94c986ba4d988b4cf2c4b5ac939b7a0916de60dd46e28c1e2620dd00b36023c",
  });
});

test("M.3C has no credential, provider client, database, replay runtime, or live import", () => {
  const sources = manifest.artifacts
    .map((artifact) =>
      readFileSync(resolve(repositoryRoot, artifact.path), "utf8")
    )
    .join("\n");
  expect(sources).not.toContain(
    ["DATABENTO", "API", "KEY"].join("_"),
  );
  expect(sources).not.toContain(["process", "env"].join("."));
  expect(sources).not.toContain([".env", "local"].join("."));
  const imports = manifest.artifacts
    .filter((artifact) => artifact.path.endsWith(".ts"))
    .flatMap((artifact) =>
      Array.from(
        readFileSync(
          resolve(repositoryRoot, artifact.path),
          "utf8",
        ).matchAll(/from\s+["']([^"']+)["']/g),
      ).map((match) => match[1] ?? "")
    );
  expect(
    imports.filter((source) =>
      /databento|supabase|provider-client|collector|scanner|recommendation|app\/api/.test(
        source,
      )
    ),
  ).toEqual(
    [],
  );
  expect(evidence.activity_attestation).toEqual({
    credentials_read_or_inspected: false,
    provider_requests: 0,
    quotes: 0,
    downloads: 0,
    purchases: 0,
    real_data_normalizations: 0,
    historical_replays: 0,
    database_connections: 0,
    commits: 0,
    pushes: 0,
    pull_request_updates: 0,
    deploys: 0,
  });
});

test("freeze decisions approve reconciliation but keep acquisition closed", () => {
  expect(manifest.decisions).toEqual(
    evidence.digest_material.decisions,
  );
});

test("fresh regression, cross-TZ evidence, and findings are explicit", () => {
  expect(
    evidence.regression.full_relevant_action_667a_through_m3c,
  ).toEqual({
    tests: 162,
    passed: 162,
    failed: 0,
  });
  expect(evidence.regression.cross_timezone_matrix).toEqual([
    "UTC",
    "Europe/Stockholm",
    "America/New_York",
  ]);
  expect(evidence.regression.cross_timezone_byte_identical).toBe(true);
  expect(evidence.regression.cross_timezone_digest).toBe(
    "dbbb2449a220896bbca43d9603b5dcb1c5b0d3401c84de29da657de38f8f2323",
  );
  expect({
    typescript: evidence.regression.typescript,
    scoped_eslint: evidence.regression.scoped_eslint,
    json_parity: evidence.regression.json_parity,
    freeze_parity: evidence.regression.freeze_parity,
    git_diff_check: evidence.regression.git_diff_check,
  }).toEqual({
    typescript: "passed",
    scoped_eslint: "passed",
    json_parity: "passed",
    freeze_parity: "passed",
    git_diff_check: "passed",
  });
  expect(evidence.regression.dependency_changes).toBe(0);
  expect(evidence.regression.deno_lock_changes).toBe(0);
  expect(evidence.review.implementation_finding_counts).toEqual({
    blocker: 0,
    major: 0,
    minor: 1,
    nit: 0,
  });
  expect(evidence.review.external_acquisition_blocker_count).toBe(3);
  expect(evidence.review.external_acquisition_blockers).toHaveLength(3);
});

test("M.3B broad-scope regression is explicitly bounded before M.3C", () => {
  const historicalTest = readFileSync(
    resolve(
      repositoryRoot,
      "tests/e2e/action-667m3b-pilot-foundation-freeze.spec.ts",
    ),
    "utf8",
  );
  expect(historicalTest).toContain(
    "action-667m3c-license-evidence-freeze-manifest.json",
  );
  expect(historicalTest).toContain(
    "m3-|m3a-|m3b-",
  );
  expect(historicalTest).not.toContain(
    "/^docs\\/action-667(?:k|m)/",
  );
});

test("Git status provenance is recorded without weakening current byte checks", () => {
  for (const artifact of manifest.artifacts) {
    const status = execFileSync(
      "git",
      [
        "status",
        "--porcelain=v1",
        "--untracked-files=all",
        "--",
        artifact.path,
      ],
      { cwd: repositoryRoot, encoding: "utf8" },
    ).trimEnd();
    const allowed = artifact.git_status_at_freeze === "modified"
      ? [` M ${artifact.path}`, `M  ${artifact.path}`]
      : [`?? ${artifact.path}`, `A  ${artifact.path}`, ""];
    expect(allowed).toContain(status);
  }
});
