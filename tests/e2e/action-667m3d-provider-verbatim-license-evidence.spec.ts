import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";

type LicenseEntry = {
  topic: string;
  classification: string;
  allowed: boolean;
  evidence: string[];
};

type Evidence = {
  evidence_version: string;
  evidence_digest: string;
  decision_digest: string;
  canonical_evidence: {
    provenance: {
      evidence_type: string;
      direct_provider_file_available: boolean;
      local_sanitized_provider_copy_found: boolean;
      provider_response_date: null;
      questions_and_answers_transcribed_exactly_by_operator: boolean;
      invented_wording_or_provenance: boolean;
      sensitive_identifiers_preserved: boolean;
    };
    provider_question_answer_pairs: Array<{
      question_id: string;
      question_verbatim: string;
      response_verbatim: string;
    }>;
    prior_written_confirmation: {
      evidence_type: string;
      evidence_reference: string;
      statements: string[];
    };
    reconciliation: {
      contradictions_found: boolean;
      contradiction_count: number;
      new_answers_consistent_with_prior_confirmation: boolean;
    };
  };
  decision_material: {
    license_matrix: LicenseEntry[];
    binary_license_decision: Record<string, boolean>;
    scope_constraints: Record<string, string>;
    technical_pre_download_readiness: Record<
      string,
      string | boolean | number
    >;
    readiness_decision: {
      dataset_acquisition_ready: boolean;
      meaning: string;
      operator_acquisition_authorized: boolean;
      download_authorized: boolean;
      normalization_authorized: boolean;
      replay_authorized: boolean;
    };
    action_decisions: Record<string, boolean>;
    inactive_m4_authorization_phrase: string;
  };
  activity_attestation: Record<string, boolean | number>;
  regression: {
    full_relevant_action_667k_through_m3d: {
      tests: number;
      passed: number;
      failed: number;
    };
    cross_timezone_matrix: string[];
    cross_timezone_byte_identical: boolean;
    cross_timezone_digest: string;
    typescript: string;
    scoped_eslint: string;
    canonical_json_parity: string;
    predecessor_freeze_parity: string;
    git_diff_check: string;
    dependency_changes: number;
    deno_lock_changes: number;
  };
  review: {
    contradiction_count: number;
    unresolved_license_question_count: number;
    finding_counts: Record<string, number>;
    minor_findings: Array<Record<string, string>>;
    provenance_limitation: string;
  };
  canonical_binding_performed: boolean;
  shadow_only: boolean;
  live_ranking_effect: boolean;
};

type ManifestArtifact = {
  path: string;
  artifact_type: string;
  classification: string;
  version: string;
  sha256: string;
  git_status_at_freeze: "untracked";
  lineage: string[];
};

type Manifest = {
  manifest_version: string;
  stacked_base: string;
  artifact_count: number;
  artifacts: ManifestArtifact[];
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
  "docs/evidence/action-667m3d-provider-verbatim-license-evidence.json";
const manifestPath =
  "docs/evidence/action-667m3d-provider-verbatim-license-freeze-manifest.json";
const documentationPath =
  "docs/action-667m3d-provider-verbatim-license-evidence-admission.md";
const evidence = JSON.parse(
  readFileSync(resolve(repositoryRoot, evidencePath), "utf8"),
) as Evidence;
const manifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, manifestPath), "utf8"),
) as Manifest;

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

function currentM3dPaths() {
  return [
    ...recursiveFiles(resolve(repositoryRoot, "docs")).filter(
      (path) =>
        /^docs\/action-667m3d-/.test(path) ||
        /^docs\/evidence\/action-667m3d-/.test(path),
    ),
    ...recursiveFiles(resolve(repositoryRoot, "tests/e2e")).filter(
      (path) => /^tests\/e2e\/action-667m3d-/.test(path),
    ),
  ].sort((left, right) => left.localeCompare(right));
}

function matrix(topic: string) {
  return evidence.decision_material.license_matrix.find(
    (entry) => entry.topic === topic,
  )!;
}

test("operator transcription preserves every exact question and provider answer", () => {
  const provenance = evidence.canonical_evidence.provenance;
  expect(provenance.evidence_type).toBe(
    "operator_transcribed_provider_verbatim",
  );
  expect(provenance.direct_provider_file_available).toBe(false);
  expect(provenance.local_sanitized_provider_copy_found).toBe(false);
  expect(provenance.provider_response_date).toBeNull();
  expect(
    provenance.questions_and_answers_transcribed_exactly_by_operator,
  ).toBe(true);
  expect(provenance.invented_wording_or_provenance).toBe(false);
  expect(provenance.sensitive_identifiers_preserved).toBe(false);

  expect(
    evidence.canonical_evidence.provider_question_answer_pairs,
  ).toEqual([
    {
      question_id: "encrypted_backup_and_disaster_recovery",
      question_verbatim:
        "Om indefinite retention även omfattar encrypted backup/disaster-recovery copies:",
      response_verbatim: "Yes",
    },
    {
      question_id:
        "derived_retention_after_closure_and_organization_scope",
      question_verbatim:
        "Om derived candles, aggregate metrics, hashes och internal research evidence får behållas obegränsat, även efter kontoavslut och organisationsomfattande:",
      response_verbatim: "Yes",
    },
    {
      question_id:
        "special_audit_logging_notification_retention_deletion_requirements",
      question_verbatim:
        "Om särskilda audit-, logging-, notification-, evidence-retention- eller deletion requirements gäller:",
      response_verbatim: "No.",
    },
  ]);
});

test("new answers bind to prior retention and organization evidence without contradiction", () => {
  const prior = evidence.canonical_evidence.prior_written_confirmation;
  expect(prior.evidence_type).toBe(
    "operator_attested_provider_confirmation",
  );
  expect(prior.evidence_reference).toBe(
    "action-667m3c-operator-attestation",
  );
  expect(prior.statements).toHaveLength(3);
  expect(evidence.canonical_evidence.reconciliation).toMatchObject({
    contradictions_found: false,
    contradiction_count: 0,
    new_answers_consistent_with_prior_confirmation: true,
  });
});

test("canonical evidence and decision digests are deterministic", () => {
  expect(evidence.evidence_version).toBe(
    "market_context_action_667m3d_provider_verbatim_license_evidence_v1",
  );
  expect(
    sha256(canonicalJson(evidence.canonical_evidence)),
  ).toBe(evidence.evidence_digest);
  expect(
    sha256(canonicalJson(evidence.decision_material)),
  ).toBe(evidence.decision_digest);
});

test("license matrix resolves each right independently and preserves prohibitions", () => {
  for (
    const topic of [
      "raw_retention",
      "encrypted_backup_and_disaster_recovery",
      "derived_candles_retention",
      "derived_aggregate_metrics_hashes_and_research_evidence_retention",
      "offline_replay",
      "organization_team_scope",
      "retention_after_account_closure",
    ]
  ) {
    expect(matrix(topic).allowed).toBe(true);
    expect(matrix(topic).evidence.length).toBeGreaterThan(0);
  }
  expect(matrix("special_deletion_requirements")).toMatchObject({
    classification: "none",
    allowed: false,
  });
  expect(
    matrix(
      "special_audit_logging_notification_or_evidence_retention_requirements",
    ),
  ).toMatchObject({
    classification: "none",
    allowed: false,
  });
  expect(matrix("redistribution")).toMatchObject({
    classification: "forbidden",
    allowed: false,
  });
  expect(matrix("corporate_actions")).toMatchObject({
    classification: "excluded_raw_unadjusted",
    allowed: false,
  });
});

test("binary license decision is sufficient only inside the fixed pilot scope", () => {
  expect(evidence.decision_material.binary_license_decision).toEqual({
    license_sufficient: true,
    raw_retention_allowed: true,
    encrypted_backup_allowed: true,
    retention_after_account_closure_allowed: true,
    organization_wide_internal_use_allowed: true,
    derived_candles_retention_allowed: true,
    derived_evidence_retention_allowed: true,
    offline_replay_allowed: true,
    special_audit_or_deletion_requirements: false,
    redistribution_allowed: false,
    corporate_actions_included: false,
  });
  expect(evidence.decision_material.scope_constraints).toEqual({
    use: "internal_non_display",
    adjustment_state: "raw_unadjusted",
    redistribution: "forbidden",
    corporate_actions: "excluded",
    performance_claims: "forbidden",
  });
});

test("future M.4 preflight requirements and hard stops remain exact", () => {
  expect(
    evidence.decision_material.technical_pre_download_readiness,
  ).toEqual({
    technical_pre_download_ready: true,
    future_quote_and_entitlement_max_age_seconds: 900,
    all_five_days_must_be_available: true,
    exact_scope_contract_enforced: true,
    provider_decoder_dataset_revision_required: true,
    immutable_xnys_calendar_required: true,
    encrypted_destination_outside_git_required: true,
    cost_cap_usd: 0.25,
    billable_cap_bytes: 33_554_432,
    transfer_cap_bytes: 33_554_432,
    local_total_cap_bytes: 1_073_741_824,
    batch_metadata_required_post_download: true,
    actual_file_sha256_required_post_download: true,
    watermark_evidence_status: "empirically_unvalidated",
    watermark_calibrated: false,
  });

  const pilot = readFileSync(
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab/five-session-pilot-admission-v1.ts",
    ),
    "utf8",
  );
  for (const marker of [
    "MARKET_CONTEXT_FIVE_SESSION_PILOT_QUOTE_MAX_AGE_SECONDS",
    "pilot_session_condition_not_all_available",
    "pilot_quote_missing_or_cap_exceeded",
    "pilot_provider_encoder_or_dataset_revision_missing",
    "pilot_calendar_artifact_digest_invalid",
    "pilot_encrypted_outside_repository_destination_invalid",
    "pilot_post_download_lineage_missing_or_cap_exceeded",
    "empirically_unvalidated",
  ]) {
    expect(pilot).toContain(marker);
  }
});

test("readiness permits only a future authorization request", () => {
  expect(evidence.decision_material.readiness_decision).toEqual({
    dataset_acquisition_ready: true,
    meaning: "ready_to_request_separate_operator_authorization_only",
    operator_acquisition_authorized: false,
    download_authorized: false,
    normalization_authorized: false,
    replay_authorized: false,
  });
  expect(evidence.decision_material.action_decisions).toEqual({
    action_667m3d_provider_evidence_admitted: true,
    action_667m3d_license_sufficient: true,
    action_667m3d_pilot_pre_download_ready: true,
    action_667m4_dataset_acquisition_ready: true,
  });
  expect(
    evidence.decision_material.inactive_m4_authorization_phrase,
  ).toContain("SPÅR 3 — Action 667M.4");
  expect(
    evidence.decision_material.inactive_m4_authorization_phrase,
  ).toContain("Ingen normalization, replay");
});

test("documentation and machine-readable decisions remain in parity", () => {
  const documentation = readFileSync(
    resolve(repositoryRoot, documentationPath),
    "utf8",
  );
  for (const marker of [
    "`operator_transcribed_provider_verbatim`",
    "`license_sufficient: true`",
    "`technical_pre_download_ready: true`",
    "`dataset_acquisition_ready: true`",
    "`operator_acquisition_authorized: false`",
    "`download_authorized: false`",
    "`normalization_authorized: false`",
    "`replay_authorized: false`",
    "`empirically_unvalidated`",
  ]) {
    expect(documentation).toContain(marker);
  }
  expect(documentation).toContain(
    evidence.decision_material.inactive_m4_authorization_phrase,
  );
});

test("M.3C frozen evidence remains byte-identical", () => {
  const predecessor = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667m3c-license-evidence-freeze-manifest.json",
      ),
      "utf8",
    ),
  ) as Manifest;
  expect(predecessor.artifact_digest).toBe(
    "f30202c86df83d0cbebacbca5a2ff1dfe92e0d6b6a57e905f0a805c7e0af126c",
  );
  for (const artifact of predecessor.artifacts) {
    expect(
      sha256(readFileSync(resolve(repositoryRoot, artifact.path))),
    ).toBe(artifact.sha256);
  }
});

test("M.3D freeze manifest preserves exact paths, bytes, lineage, and scope", () => {
  expect(manifest.manifest_version).toBe(
    "market_context_action_667m3d_provider_verbatim_license_freeze_manifest_v1",
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
    expect([`?? ${artifact.path}`, `A  ${artifact.path}`, ""]).toContain(
      status,
    );
  }
  const payload = manifest.artifacts
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
  expect(sha256(payload)).toBe(manifest.artifact_digest);
  expect(currentM3dPaths()).toEqual([
    ...manifest.artifacts.map((artifact) => artifact.path),
    manifest.self_exclusion.path,
  ].sort((left, right) => left.localeCompare(right)));
});

test("M.3D has no credential, provider-client, database, replay-runtime, or live import", () => {
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
  ).toEqual([]);
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
  expect(evidence.canonical_binding_performed).toBe(false);
  expect(evidence.shadow_only).toBe(true);
  expect(evidence.live_ranking_effect).toBe(false);
});

test("freeze decisions equal the admitted evidence decisions", () => {
  expect(manifest.decisions).toEqual({
    ...evidence.decision_material.action_decisions,
    license_sufficient: true,
    technical_pre_download_ready: true,
    dataset_acquisition_ready: true,
    operator_acquisition_authorized: false,
    download_authorized: false,
    normalization_authorized: false,
    replay_authorized: false,
  });
  expect(evidence.regression).toEqual({
    full_relevant_action_667k_through_m3d: {
      tests: 125,
      passed: 125,
      failed: 0,
    },
    cross_timezone_matrix: [
      "UTC",
      "Europe/Stockholm",
      "America/New_York",
    ],
    cross_timezone_byte_identical: true,
    cross_timezone_digest:
      "5ff51f6ddcde3bf531dfd3d7436cf962d043be11c7db698911005dd1d19a18e1",
    typescript: "passed",
    scoped_eslint: "passed",
    canonical_json_parity: "passed",
    predecessor_freeze_parity: "passed",
    git_diff_check: "passed",
    dependency_changes: 0,
    deno_lock_changes: 0,
  });
  expect(evidence.review).toMatchObject({
    contradiction_count: 0,
    unresolved_license_question_count: 0,
    finding_counts: {
      blocker: 0,
      major: 0,
      minor: 1,
      nit: 0,
    },
    provenance_limitation:
      "operator_transcription_only_no_direct_provider_file",
  });
});
