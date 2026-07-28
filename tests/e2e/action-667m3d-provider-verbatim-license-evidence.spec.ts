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

type M3d1SuccessorArtifact = {
  path: string;
  artifact_type: string;
  classification: string;
  version: string;
  sha256: string;
  predecessor_sha256: string;
};

type M3d1Manifest = {
  manifest_version: string;
  portability_successor_version: string;
  predecessor: {
    manifest_path: string;
    manifest_version: string;
    manifest_sha256: string;
    artifact_digest: string;
    historical_document_sha256: string;
    immutable_historical_evidence: boolean;
  };
  transformation: {
    policy_version: string;
    artifact_path: string;
    before_sha256: string;
    after_sha256: string;
    before_bytes: number;
    after_bytes: number;
    byte_delta: number;
    removed_occurrence_count: number;
    removed_bytes_per_occurrence: number;
    removed_character: string;
    line_numbers: number[];
    allowed_change: string;
    other_whitespace_changes_allowed: boolean;
    word_or_value_changes_allowed: boolean;
    non_whitespace_digest_algorithm: string;
    before_non_whitespace_sha256: string;
    after_non_whitespace_sha256: string;
    semantic_non_whitespace_parity: boolean;
  };
  successor_artifact_count: number;
  successor_artifacts: M3d1SuccessorArtifact[];
  successor_artifact_digest_algorithm: string;
  successor_artifact_digest: string;
  semantic_invariants: Record<string, boolean>;
  decisions: Record<string, boolean>;
};

type M3d1Review = {
  review_version: string;
  review_material: Record<string, unknown>;
  review_checks: Record<string, boolean>;
  findings: Record<string, unknown[]>;
  finding_counts: Record<string, number>;
  decisions: Record<string, boolean>;
  review_evidence_digest_algorithm: string;
  review_evidence_digest: string;
};

type M5nManifest = {
  manifest_version: string;
  predecessor_test_artifact: {
    path: string;
    sha256: string;
  };
  successor_test_artifact: {
    path: string;
    sha256: string;
  };
  immutable_predecessors: {
    m3d_manifest_sha256: string;
    m3d_artifact_digest: string;
    m3d1_manifest_sha256: string;
    m3d1_review_sha256: string;
    m3d1_review_evidence_digest: string;
  };
  decisions: Record<string, boolean>;
};

type M5nReview = {
  review_version: string;
  review_material: {
    successor_manifest_path: string;
    successor_manifest_sha256: string;
    predecessor_test_sha256: string;
    successor_test_sha256: string;
  };
  review_checks: Record<string, boolean>;
  findings: Record<string, unknown[]>;
  finding_counts: Record<string, number>;
  decisions: Record<string, boolean>;
  review_evidence_digest_algorithm: string;
  review_evidence_digest: string;
};

const repositoryRoot = resolve(process.cwd());
const evidencePath =
  "docs/evidence/action-667m3d-provider-verbatim-license-evidence.json";
const manifestPath =
  "docs/evidence/action-667m3d-provider-verbatim-license-freeze-manifest.json";
const documentationPath =
  "docs/action-667m3d-provider-verbatim-license-evidence-admission.md";
const historicalTestPath =
  "tests/e2e/action-667m3d-provider-verbatim-license-evidence.spec.ts";
const m3d1ManifestPath =
  "docs/evidence/action-667m3d1-whitespace-portability-refreeze-manifest.json";
const m3d1ReviewPath =
  "docs/evidence/action-667m3d1-whitespace-portability-refreeze-review.json";
const m5nManifestPath =
  "docs/evidence/action-667m5n-m3d-successor-portability-test-refreeze-manifest.json";
const m5nReviewPath =
  "docs/evidence/action-667m5n-m3d-successor-portability-test-review.json";
const historicalDocumentSha256 =
  "0917aede9d6eeeecd24949201fbcde91a7f802d72521ad640a35a7205968fa11";
const successorDocumentSha256 =
  "1ee0c890d0a96cd31b352ddf199eec68ec4d6591ca4cdcc5c3385c7b34c537f7";
const historicalTestSha256 =
  "cf9302d0e87af80cd1e62eb27e630f659716ec68f074596a2444c6685d3d2492";
const originalManifestSha256 =
  "5c86da3a491e2fd95a0343da7ee043571a6a15828a300f432cc2bb3b05d856a0";
const originalArtifactDigest =
  "c9398b9c2321ed778ea089931a7491c03ed7b91cf8ba6bade72b239c2dd5330c";
const m3d1ManifestSha256 =
  "ec52f739165a5bbadf9d557d06a197af9415df1c3d13ab3da340ddb58d1c2c3d";
const m3d1ReviewSha256 =
  "744b8793a688ab2477640fd64f9515cece15c8020ab17a9899421eca2a592df2";
const m3d1ReviewEvidenceDigest =
  "88d79d41e1f06dd370898a03acfaf01a57e7548ce4143f4d2f9e8b5443668655";
const semanticNonWhitespaceSha256 =
  "64975c8ca2ee61591d403841a007637d088fc5910b52c470ac084419577ce625";
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

function manifestArtifactDigest(value: Manifest) {
  return sha256(
    value.artifacts
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
      .join(""),
  );
}

function m3d1SuccessorArtifactDigest(artifacts: M3d1SuccessorArtifact[]) {
  return sha256(
    [...artifacts]
      .sort((left, right) => left.path.localeCompare(right.path))
      .map((artifact) =>
        [
          artifact.path,
          artifact.artifact_type,
          artifact.classification,
          artifact.version,
          artifact.sha256,
          artifact.predecessor_sha256,
        ].join("\u0000") + "\n"
      )
      .join(""),
  );
}

function nonWhitespaceDigest(value: string) {
  return sha256(value.replace(/\p{White_Space}/gu, ""));
}

function reconstructHistoricalDocument(successor: string) {
  const markers = [
    "indefinite retention även omfattar encrypted backup",
    "derived candles, aggregate metrics, hashes",
    "särskilda audit-, logging-, notification-",
  ];
  const lines = successor.split("\n");
  for (const marker of markers) {
    const matching = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.includes(marker));
    if (matching.length !== 1) {
      return null;
    }
    lines[matching[0].index] = `${matching[0].line}  `;
  }
  return lines.join("\n");
}

function m3d1ReviewDigest(review: M3d1Review) {
  return sha256(canonicalJson({
    review_material: review.review_material,
    review_checks: review.review_checks,
    findings: review.findings,
    finding_counts: review.finding_counts,
    decisions: review.decisions,
  }));
}

function m5nReviewDigest(review: M5nReview) {
  return sha256(canonicalJson({
    review_material: review.review_material,
    review_checks: review.review_checks,
    findings: review.findings,
    finding_counts: review.finding_counts,
    decisions: review.decisions,
  }));
}

function validateOriginalManifest(
  candidate: Manifest,
  candidateBytes: Buffer,
) {
  const documentArtifact = candidate.artifacts.find(
    (artifact) => artifact.path === documentationPath,
  );
  return (
    sha256(candidateBytes) === originalManifestSha256 &&
    candidate.manifest_version ===
      "market_context_action_667m3d_provider_verbatim_license_freeze_manifest_v1" &&
    candidate.artifact_digest === originalArtifactDigest &&
    manifestArtifactDigest(candidate) === originalArtifactDigest &&
    documentArtifact?.sha256 === historicalDocumentSha256
  );
}

type DocumentStateValidation = {
  accepted: boolean;
  state: "historical" | "successor" | "rejected";
};

function validateDocumentState(input: {
  documentBytes: Buffer;
  originalManifest: Manifest;
  originalManifestBytes: Buffer;
  successorManifest?: M3d1Manifest;
  successorManifestBytes?: Buffer;
  successorReview?: M3d1Review;
  successorReviewBytes?: Buffer;
}): DocumentStateValidation {
  try {
    if (
      !validateOriginalManifest(
        input.originalManifest,
        input.originalManifestBytes,
      )
    ) {
      return { accepted: false, state: "rejected" };
    }
    const documentSha = sha256(input.documentBytes);
    if (documentSha === historicalDocumentSha256) {
      return { accepted: true, state: "historical" };
    }
    if (
      documentSha !== successorDocumentSha256 ||
      !input.successorManifest ||
      !input.successorManifestBytes ||
      !input.successorReview ||
      !input.successorReviewBytes
    ) {
      return { accepted: false, state: "rejected" };
    }

    const successor = input.successorManifest;
    const review = input.successorReview;
    const transformation = successor.transformation;
    const document = input.documentBytes.toString("utf8");
    const reconstructed = reconstructHistoricalDocument(document);
    const documentArtifact = successor.successor_artifacts.find(
      (artifact) => artifact.path === documentationPath,
    );
    const historicalTestArtifact = successor.successor_artifacts.find(
      (artifact) => artifact.path === historicalTestPath,
    );
    const evidenceArtifact = successor.successor_artifacts.find(
      (artifact) => artifact.path === evidencePath,
    );
    const expectedChecks: M3d1Review["review_checks"] = {
      original_freeze_byte_identical: true,
      historical_artifact_hashes_preserved: true,
      exact_three_occurrence_transformation: true,
      non_whitespace_digest_identical: true,
      provider_transcription_reinterpreted: false,
      license_rights_reinterpreted: false,
      readiness_fields_changed: false,
      canonical_evidence_changed: false,
      historical_provenance_lossless: true,
      successor_relation_lossless: true,
      tampering_fail_closed: true,
      review_step_remediation_performed: false,
    };

    const accepted =
      sha256(input.successorManifestBytes) === m3d1ManifestSha256 &&
      successor.manifest_version ===
        "market_context_action_667m3d1_whitespace_portability_refreeze_manifest_v1" &&
      successor.portability_successor_version ===
        "market_context_m3d_whitespace_portability_successor_v1" &&
      successor.predecessor.manifest_path === manifestPath &&
      successor.predecessor.manifest_version ===
        input.originalManifest.manifest_version &&
      successor.predecessor.manifest_sha256 === originalManifestSha256 &&
      successor.predecessor.artifact_digest === originalArtifactDigest &&
      successor.predecessor.historical_document_sha256 ===
        historicalDocumentSha256 &&
      successor.predecessor.immutable_historical_evidence === true &&
      transformation.policy_version ===
        "market_context_whitespace_portability_transformation_v1" &&
      transformation.artifact_path === documentationPath &&
      transformation.before_sha256 === historicalDocumentSha256 &&
      transformation.after_sha256 === successorDocumentSha256 &&
      transformation.before_bytes === 6363 &&
      transformation.after_bytes === 6357 &&
      transformation.byte_delta === -6 &&
      transformation.removed_occurrence_count === 3 &&
      transformation.removed_bytes_per_occurrence === 2 &&
      transformation.removed_character === "U+0020 SPACE" &&
      JSON.stringify(transformation.line_numbers) === "[19,21,23]" &&
      transformation.allowed_change ===
        "remove exactly two trailing U+0020 characters immediately before LF on each declared line" &&
      transformation.other_whitespace_changes_allowed === false &&
      transformation.word_or_value_changes_allowed === false &&
      transformation.before_non_whitespace_sha256 ===
        semanticNonWhitespaceSha256 &&
      transformation.after_non_whitespace_sha256 ===
        semanticNonWhitespaceSha256 &&
      transformation.semantic_non_whitespace_parity === true &&
      input.documentBytes.length === transformation.after_bytes &&
      nonWhitespaceDigest(document) === semanticNonWhitespaceSha256 &&
      reconstructed !== null &&
      Buffer.byteLength(reconstructed) === transformation.before_bytes &&
      sha256(reconstructed) === historicalDocumentSha256 &&
      successor.successor_artifact_count === 3 &&
      successor.successor_artifact_count ===
        successor.successor_artifacts.length &&
      documentArtifact?.sha256 === successorDocumentSha256 &&
      documentArtifact?.predecessor_sha256 === historicalDocumentSha256 &&
      historicalTestArtifact?.sha256 === historicalTestSha256 &&
      historicalTestArtifact?.predecessor_sha256 === historicalTestSha256 &&
      evidenceArtifact?.sha256 ===
        "544aff46b9ed2e804972894f320e100c0567da09b0a07554f3b93106bf4120d1" &&
      evidenceArtifact?.predecessor_sha256 === evidenceArtifact?.sha256 &&
      m3d1SuccessorArtifactDigest(successor.successor_artifacts) ===
        successor.successor_artifact_digest &&
      successor.successor_artifact_digest ===
        "0d48f9a04b3bfd5bbf9d6259fff5ba277eedba00539f914883d7d4f1ed5689e7" &&
      successor.semantic_invariants.provider_transcription_unchanged === true &&
      successor.semantic_invariants.license_rights_unchanged === true &&
      successor.semantic_invariants.readiness_fields_unchanged === true &&
      successor.semantic_invariants.canonical_evidence_unchanged === true &&
      successor.semantic_invariants.operator_acquisition_authorized ===
        false &&
      successor.semantic_invariants.download_authorized === false &&
      successor.semantic_invariants.normalization_authorized === false &&
      successor.semantic_invariants.replay_authorized === false &&
      successor.decisions.action_667m3d1_portability_refreeze_complete ===
        true &&
      successor.decisions.action_667m3d1_historical_freeze_preserved === true &&
      successor.decisions.action_667m3d1_semantic_equivalence_verified ===
        true &&
      sha256(input.successorReviewBytes) === m3d1ReviewSha256 &&
      review.review_version ===
        "market_context_action_667m3d1_whitespace_portability_independent_review_v1" &&
      JSON.stringify(review.review_checks) === JSON.stringify(expectedChecks) &&
      Object.values(review.findings).every((findings) => findings.length === 0) &&
      Object.values(review.finding_counts).every((count) => count === 0) &&
      review.decisions.action_667m3d1_independent_review_approved === true &&
      review.decisions.action_667m3d1_historical_freeze_preserved === true &&
      review.decisions.action_667m3d1_semantic_equivalence_verified === true &&
      review.review_evidence_digest === m3d1ReviewEvidenceDigest &&
      m3d1ReviewDigest(review) === m3d1ReviewEvidenceDigest;
    return {
      accepted,
      state: accepted ? "successor" : "rejected",
    };
  } catch {
    return { accepted: false, state: "rejected" };
  }
}

function validateHistoricalTestSuccessor(input: {
  currentTestSha256: string;
  successorManifest: M5nManifest;
  successorManifestBytes: Buffer;
  successorReview: M5nReview;
}) {
  try {
    const manifestSha = sha256(input.successorManifestBytes);
    const successor = input.successorManifest;
    const review = input.successorReview;
    return (
      successor.manifest_version ===
        "market_context_action_667m5n_m3d_test_portability_refreeze_manifest_v1" &&
      successor.predecessor_test_artifact.path === historicalTestPath &&
      successor.predecessor_test_artifact.sha256 === historicalTestSha256 &&
      successor.successor_test_artifact.path === historicalTestPath &&
      successor.successor_test_artifact.sha256 === input.currentTestSha256 &&
      successor.immutable_predecessors.m3d_manifest_sha256 ===
        originalManifestSha256 &&
      successor.immutable_predecessors.m3d_artifact_digest ===
        originalArtifactDigest &&
      successor.immutable_predecessors.m3d1_manifest_sha256 ===
        m3d1ManifestSha256 &&
      successor.immutable_predecessors.m3d1_review_sha256 ===
        m3d1ReviewSha256 &&
      successor.immutable_predecessors.m3d1_review_evidence_digest ===
        m3d1ReviewEvidenceDigest &&
      successor.decisions.historical_test_freeze_preserved === true &&
      successor.decisions.successor_portability_only === true &&
      successor.decisions.test_semantics_weakened === false &&
      review.review_version ===
        "market_context_action_667m5n_m3d_test_portability_independent_review_v1" &&
      review.review_material.successor_manifest_path === m5nManifestPath &&
      review.review_material.successor_manifest_sha256 === manifestSha &&
      review.review_material.predecessor_test_sha256 === historicalTestSha256 &&
      review.review_material.successor_test_sha256 === input.currentTestSha256 &&
      review.review_checks.original_m3d_freeze_byte_identical === true &&
      review.review_checks.m3d1_successor_byte_identical === true &&
      review.review_checks.strict_two_state_validation === true &&
      review.review_checks.negative_matrix_fail_closed === true &&
      review.review_checks.semantic_scope_unchanged === true &&
      review.review_checks.review_step_remediation_performed === false &&
      Object.values(review.findings).every((findings) => findings.length === 0) &&
      Object.values(review.finding_counts).every((count) => count === 0) &&
      review.decisions.action_667m5n_refreeze_complete === true &&
      review.decisions.action_667m5n_independent_rereview_approved === true &&
      review.review_evidence_digest === m5nReviewDigest(review)
    );
  } catch {
    return false;
  }
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
  const originalManifestBytes = readFileSync(
    resolve(repositoryRoot, manifestPath),
  );
  const m3d1ManifestBytes = readFileSync(
    resolve(repositoryRoot, m3d1ManifestPath),
  );
  const m3d1ReviewBytes = readFileSync(
    resolve(repositoryRoot, m3d1ReviewPath),
  );
  const m3d1Manifest = JSON.parse(
    m3d1ManifestBytes.toString("utf8"),
  ) as M3d1Manifest;
  const m3d1Review = JSON.parse(
    m3d1ReviewBytes.toString("utf8"),
  ) as M3d1Review;
  const m5nManifestBytes = readFileSync(
    resolve(repositoryRoot, m5nManifestPath),
  );
  const m5nManifest = JSON.parse(
    m5nManifestBytes.toString("utf8"),
  ) as M5nManifest;
  const m5nReview = JSON.parse(
    readFileSync(resolve(repositoryRoot, m5nReviewPath), "utf8"),
  ) as M5nReview;

  expect(manifest.manifest_version).toBe(
    "market_context_action_667m3d_provider_verbatim_license_freeze_manifest_v1",
  );
  expect(manifest.stacked_base).toBe(
    "becee774a270e078fbd8bb55a01d7a59b2205599",
  );
  expect(manifest.artifact_count).toBe(manifest.artifacts.length);
  expect(manifest.self_exclusion.path).toBe(manifestPath);
  for (const artifact of manifest.artifacts) {
    const artifactBytes = readFileSync(resolve(repositoryRoot, artifact.path));
    if (artifact.path === documentationPath) {
      expect(
        validateDocumentState({
          documentBytes: artifactBytes,
          originalManifest: manifest,
          originalManifestBytes,
          successorManifest: m3d1Manifest,
          successorManifestBytes: m3d1ManifestBytes,
          successorReview: m3d1Review,
          successorReviewBytes: m3d1ReviewBytes,
        }),
      ).toEqual({ accepted: true, state: "successor" });
    } else if (artifact.path === historicalTestPath) {
      expect(
        validateHistoricalTestSuccessor({
          currentTestSha256: sha256(artifactBytes),
          successorManifest: m5nManifest,
          successorManifestBytes: m5nManifestBytes,
          successorReview: m5nReview,
        }),
      ).toBe(true);
    } else {
      expect(sha256(artifactBytes)).toBe(artifact.sha256);
    }
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
    const acceptedStatuses = [
      `?? ${artifact.path}`,
      `A  ${artifact.path}`,
      "",
    ];
    if (artifact.path === historicalTestPath) {
      acceptedStatuses.push(` M ${artifact.path}`);
    }
    expect(acceptedStatuses).toContain(status);
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

  const successorDocument = readFileSync(
    resolve(repositoryRoot, documentationPath),
  );
  const historicalDocument = reconstructHistoricalDocument(
    successorDocument.toString("utf8"),
  );
  expect(historicalDocument).not.toBeNull();
  const validInput = {
    documentBytes: successorDocument,
    originalManifest: manifest,
    originalManifestBytes,
    successorManifest: m3d1Manifest,
    successorManifestBytes: m3d1ManifestBytes,
    successorReview: m3d1Review,
    successorReviewBytes: m3d1ReviewBytes,
  };
  expect(
    validateDocumentState({
      ...validInput,
      documentBytes: Buffer.from(historicalDocument!),
    }),
  ).toEqual({ accepted: true, state: "historical" });

  expect(
    validateDocumentState({
      ...validInput,
      documentBytes: Buffer.from(`${successorDocument.toString("utf8")}x`),
    }).accepted,
  ).toBe(false);
  expect(
    validateDocumentState({
      ...validInput,
      documentBytes: Buffer.from(
        successorDocument
          .toString("utf8")
          .replace("license_sufficient: true", "license_sufficient: false"),
      ),
    }).accepted,
  ).toBe(false);

  const wrongPredecessor = structuredClone(m3d1Manifest);
  wrongPredecessor.predecessor.manifest_sha256 = "0".repeat(64);
  expect(
    validateDocumentState({
      ...validInput,
      successorManifest: wrongPredecessor,
    }).accepted,
  ).toBe(false);

  const wrongSuccessor = structuredClone(m3d1Manifest);
  wrongSuccessor.transformation.after_sha256 = "1".repeat(64);
  expect(
    validateDocumentState({
      ...validInput,
      successorManifest: wrongSuccessor,
    }).accepted,
  ).toBe(false);

  const tamperedTransformation = structuredClone(m3d1Manifest);
  tamperedTransformation.transformation.removed_occurrence_count = 2;
  expect(
    validateDocumentState({
      ...validInput,
      successorManifest: tamperedTransformation,
    }).accepted,
  ).toBe(false);

  expect(
    validateDocumentState({
      ...validInput,
      successorManifest: undefined,
      successorManifestBytes: undefined,
    }).accepted,
  ).toBe(false);
  expect(
    validateDocumentState({
      ...validInput,
      successorManifestBytes: Buffer.from(
        `${m3d1ManifestBytes.toString("utf8")} `,
      ),
    }).accepted,
  ).toBe(false);

  const wrongReviewDigest = structuredClone(m3d1Review);
  wrongReviewDigest.review_evidence_digest = "2".repeat(64);
  expect(
    validateDocumentState({
      ...validInput,
      successorReview: wrongReviewDigest,
    }).accepted,
  ).toBe(false);

  const alternativeDocument = Buffer.from(
    successorDocument
      .toString("utf8")
      .replace("raw_unadjusted", "raw_unadjusted_alternative"),
  );
  const selfConsistentAlternative = structuredClone(m3d1Manifest);
  selfConsistentAlternative.transformation.after_sha256 =
    sha256(alternativeDocument);
  selfConsistentAlternative.successor_artifacts.find(
    (artifact) => artifact.path === documentationPath,
  )!.sha256 = sha256(alternativeDocument);
  selfConsistentAlternative.successor_artifact_digest =
    m3d1SuccessorArtifactDigest(
      selfConsistentAlternative.successor_artifacts,
    );
  expect(
    validateDocumentState({
      ...validInput,
      documentBytes: alternativeDocument,
      successorManifest: selfConsistentAlternative,
      successorManifestBytes: Buffer.from(
        JSON.stringify(selfConsistentAlternative),
      ),
    }).accepted,
  ).toBe(false);

  const modifiedHistoricalManifest = structuredClone(manifest);
  modifiedHistoricalManifest.artifacts.find(
    (artifact) => artifact.path === documentationPath,
  )!.sha256 = "3".repeat(64);
  modifiedHistoricalManifest.artifact_digest =
    manifestArtifactDigest(modifiedHistoricalManifest);
  expect(
    validateDocumentState({
      ...validInput,
      documentBytes: Buffer.from(historicalDocument!),
      originalManifest: modifiedHistoricalManifest,
      originalManifestBytes: Buffer.from(
        JSON.stringify(modifiedHistoricalManifest),
      ),
    }).accepted,
  ).toBe(false);
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
