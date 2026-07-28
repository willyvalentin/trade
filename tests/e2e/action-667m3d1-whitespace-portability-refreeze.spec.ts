import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ORIGINAL_MANIFEST_PATH =
  "docs/evidence/action-667m3d-provider-verbatim-license-freeze-manifest.json";
const SUCCESSOR_MANIFEST_PATH =
  "docs/evidence/action-667m3d1-whitespace-portability-refreeze-manifest.json";
const DOCUMENT_PATH =
  "docs/action-667m3d-provider-verbatim-license-evidence-admission.md";
const EVIDENCE_PATH =
  "docs/evidence/action-667m3d-provider-verbatim-license-evidence.json";
const HISTORICAL_TEST_PATH =
  "tests/e2e/action-667m3d-provider-verbatim-license-evidence.spec.ts";
const PORTABILITY_TEST_PATH =
  "tests/e2e/action-667m3d1-whitespace-portability-refreeze.spec.ts";
const M5N_MANIFEST_PATH =
  "docs/evidence/action-667m5n-m3d-successor-portability-test-refreeze-manifest.json";
const M5N_REVIEW_PATH =
  "docs/evidence/action-667m5n-m3d-successor-portability-test-review.json";

const ORIGINAL_MANIFEST_SHA256 =
  "5c86da3a491e2fd95a0343da7ee043571a6a15828a300f432cc2bb3b05d856a0";
const ORIGINAL_DOCUMENT_SHA256 =
  "0917aede9d6eeeecd24949201fbcde91a7f802d72521ad640a35a7205968fa11";
const CURRENT_DOCUMENT_SHA256 =
  "1ee0c890d0a96cd31b352ddf199eec68ec4d6591ca4cdcc5c3385c7b34c537f7";
const NON_WHITESPACE_SHA256 =
  "64975c8ca2ee61591d403841a007637d088fc5910b52c470ac084419577ce625";
const HISTORICAL_TEST_SHA256 =
  "cf9302d0e87af80cd1e62eb27e630f659716ec68f074596a2444c6685d3d2492";
const PORTABILITY_TEST_SHA256 =
  "02ef41944226ce8bd161bbf841040c09129d3728fc343182d80169726758c81b";

type SuccessorArtifact = {
  path: string;
  artifact_type: string;
  classification: string;
  version: string;
  sha256: string;
  predecessor_sha256: string;
};

type SuccessorManifest = {
  manifest_version: string;
  portability_successor_version: string;
  predecessor: {
    manifest_path: string;
    manifest_sha256: string;
    artifact_digest: string;
    historical_document_sha256: string;
    immutable_historical_evidence: boolean;
  };
  transformation: {
    before_sha256: string;
    after_sha256: string;
    byte_delta: number;
    removed_occurrence_count: number;
    removed_bytes_per_occurrence: number;
    line_numbers: number[];
    other_whitespace_changes_allowed: boolean;
    word_or_value_changes_allowed: boolean;
    before_non_whitespace_sha256: string;
    after_non_whitespace_sha256: string;
    semantic_non_whitespace_parity: boolean;
  };
  successor_artifact_count: number;
  successor_artifacts: SuccessorArtifact[];
  successor_artifact_digest: string;
  semantic_invariants: Record<string, boolean>;
  decisions: Record<string, boolean>;
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
  dependent_portability_test_artifact: {
    path: string;
    predecessor_sha256: string;
    successor_sha256: string;
  };
  immutable_predecessors: {
    m3d_manifest_sha256: string;
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
    predecessor_portability_test_sha256: string;
    successor_portability_test_sha256: string;
  };
  review_checks: Record<string, boolean>;
  findings: Record<string, unknown[]>;
  finding_counts: Record<string, number>;
  decisions: Record<string, boolean>;
  review_evidence_digest: string;
};

function bytes(relativePath: string): Buffer {
  return readFileSync(path.join(ROOT, relativePath));
}

function text(relativePath: string): string {
  return bytes(relativePath).toString("utf8");
}

function sha256(value: Buffer | string): string {
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

function nonWhitespaceDigest(value: string): string {
  return sha256(value.replace(/\s/gu, ""));
}

function parseJson<T>(relativePath: string): T {
  return JSON.parse(text(relativePath)) as T;
}

function reconstructHistoricalDocument(current: string): string {
  const requiredLines = [
    "indefinite retention även omfattar encrypted backup",
    "derived candles, aggregate metrics, hashes",
    "särskilda audit-, logging-, notification-",
  ];
  const lines = current.split("\n");

  for (const phrase of requiredLines) {
    const matches = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.includes(phrase));
    if (matches.length !== 1) {
      throw new Error(`Expected one declared portability line for ${phrase}`);
    }
    lines[matches[0].index] += "  ";
  }

  return lines.join("\n");
}

function successorDigest(artifacts: SuccessorArtifact[]): string {
  const material = artifacts
    .slice()
    .sort((left, right) => left.path.localeCompare(right.path))
    .map(
      (artifact) =>
        `${artifact.path}\0${artifact.artifact_type}\0${artifact.classification}\0` +
        `${artifact.version}\0${artifact.sha256}\0${artifact.predecessor_sha256}\n`,
    )
    .join("");
  return sha256(material);
}

function verifyM5nSuccessor(
  historicalTestSha256: string,
  portabilityTestSha256: string,
): boolean {
  try {
    const manifestBytes = bytes(M5N_MANIFEST_PATH);
    const manifest = parseJson<M5nManifest>(M5N_MANIFEST_PATH);
    const review = parseJson<M5nReview>(M5N_REVIEW_PATH);
    const reviewDigest = sha256(canonicalJson({
      review_material: review.review_material,
      review_checks: review.review_checks,
      findings: review.findings,
      finding_counts: review.finding_counts,
      decisions: review.decisions,
    }));
    return (
      manifest.manifest_version ===
        "market_context_action_667m5n_m3d_test_portability_refreeze_manifest_v1" &&
      manifest.predecessor_test_artifact.path === HISTORICAL_TEST_PATH &&
      manifest.predecessor_test_artifact.sha256 === HISTORICAL_TEST_SHA256 &&
      manifest.successor_test_artifact.path === HISTORICAL_TEST_PATH &&
      manifest.successor_test_artifact.sha256 === historicalTestSha256 &&
      manifest.dependent_portability_test_artifact.path ===
        PORTABILITY_TEST_PATH &&
      manifest.dependent_portability_test_artifact.predecessor_sha256 ===
        PORTABILITY_TEST_SHA256 &&
      manifest.dependent_portability_test_artifact.successor_sha256 ===
        portabilityTestSha256 &&
      manifest.immutable_predecessors.m3d_manifest_sha256 ===
        ORIGINAL_MANIFEST_SHA256 &&
      manifest.immutable_predecessors.m3d1_manifest_sha256 ===
        "ec52f739165a5bbadf9d557d06a197af9415df1c3d13ab3da340ddb58d1c2c3d" &&
      manifest.immutable_predecessors.m3d1_review_sha256 ===
        "744b8793a688ab2477640fd64f9515cece15c8020ab17a9899421eca2a592df2" &&
      manifest.immutable_predecessors.m3d1_review_evidence_digest ===
        "88d79d41e1f06dd370898a03acfaf01a57e7548ce4143f4d2f9e8b5443668655" &&
      manifest.decisions.historical_test_freeze_preserved === true &&
      manifest.decisions.successor_portability_only === true &&
      manifest.decisions.test_semantics_weakened === false &&
      review.review_version ===
        "market_context_action_667m5n_m3d_test_portability_independent_review_v1" &&
      review.review_material.successor_manifest_path === M5N_MANIFEST_PATH &&
      review.review_material.successor_manifest_sha256 ===
        sha256(manifestBytes) &&
      review.review_material.predecessor_test_sha256 ===
        HISTORICAL_TEST_SHA256 &&
      review.review_material.successor_test_sha256 === historicalTestSha256 &&
      review.review_material.predecessor_portability_test_sha256 ===
        PORTABILITY_TEST_SHA256 &&
      review.review_material.successor_portability_test_sha256 ===
        portabilityTestSha256 &&
      review.review_checks.strict_two_state_validation === true &&
      review.review_checks.negative_matrix_fail_closed === true &&
      review.review_checks.semantic_scope_unchanged === true &&
      Object.values(review.findings).every((items) => items.length === 0) &&
      Object.values(review.finding_counts).every((count) => count === 0) &&
      review.decisions.action_667m5n_refreeze_complete === true &&
      review.decisions.action_667m5n_independent_rereview_approved === true &&
      review.review_evidence_digest === reviewDigest
    );
  } catch {
    return false;
  }
}

function verifyExactPortabilityTransformation(
  candidate: string,
  manifest: SuccessorManifest,
): boolean {
  if (sha256(candidate) !== manifest.transformation.after_sha256) return false;
  if (
    nonWhitespaceDigest(candidate) !==
    manifest.transformation.after_non_whitespace_sha256
  ) {
    return false;
  }
  if (/[ \t]+(?=\n|$)/u.test(candidate)) return false;
  if (!candidate.endsWith("\n") || candidate.endsWith("\n\n")) return false;
  return (
    sha256(reconstructHistoricalDocument(candidate)) ===
    manifest.transformation.before_sha256
  );
}

test("original M.3D manifest remains byte-identical historical evidence", () => {
  const original = parseJson<{
    manifest_version: string;
    artifact_digest: string;
    artifacts: Array<{ path: string; sha256: string }>;
  }>(ORIGINAL_MANIFEST_PATH);

  expect(sha256(bytes(ORIGINAL_MANIFEST_PATH))).toBe(
    ORIGINAL_MANIFEST_SHA256,
  );
  expect(original.manifest_version).toBe(
    "market_context_action_667m3d_provider_verbatim_license_freeze_manifest_v1",
  );
  expect(original.artifact_digest).toBe(
    "c9398b9c2321ed778ea089931a7491c03ed7b91cf8ba6bade72b239c2dd5330c",
  );
  expect(
    original.artifacts.find((artifact) => artifact.path === DOCUMENT_PATH)
      ?.sha256,
  ).toBe(ORIGINAL_DOCUMENT_SHA256);
});

test("successor binds exactly the three declared trailing-space removals", () => {
  const manifest = parseJson<SuccessorManifest>(SUCCESSOR_MANIFEST_PATH);
  const current = text(DOCUMENT_PATH);

  expect(sha256(current)).toBe(CURRENT_DOCUMENT_SHA256);
  expect(nonWhitespaceDigest(current)).toBe(NON_WHITESPACE_SHA256);
  expect(sha256(reconstructHistoricalDocument(current))).toBe(
    ORIGINAL_DOCUMENT_SHA256,
  );
  expect(manifest.transformation).toMatchObject({
    before_sha256: ORIGINAL_DOCUMENT_SHA256,
    after_sha256: CURRENT_DOCUMENT_SHA256,
    byte_delta: -6,
    removed_occurrence_count: 3,
    removed_bytes_per_occurrence: 2,
    line_numbers: [19, 21, 23],
    other_whitespace_changes_allowed: false,
    word_or_value_changes_allowed: false,
    before_non_whitespace_sha256: NON_WHITESPACE_SHA256,
    after_non_whitespace_sha256: NON_WHITESPACE_SHA256,
    semantic_non_whitespace_parity: true,
  });
  expect(verifyExactPortabilityTransformation(current, manifest)).toBe(true);
});

test("all current M.3D artifacts match the successor manifest", () => {
  const manifest = parseJson<SuccessorManifest>(SUCCESSOR_MANIFEST_PATH);
  const currentHistoricalTestSha256 = sha256(bytes(HISTORICAL_TEST_PATH));
  const currentPortabilityTestSha256 = sha256(bytes(PORTABILITY_TEST_PATH));

  expect(manifest.successor_artifact_count).toBe(3);
  for (const artifact of manifest.successor_artifacts) {
    if (artifact.path === HISTORICAL_TEST_PATH) {
      expect(
        verifyM5nSuccessor(
          currentHistoricalTestSha256,
          currentPortabilityTestSha256,
        ),
      ).toBe(true);
    } else {
      expect(sha256(bytes(artifact.path))).toBe(artifact.sha256);
    }
  }
  expect(successorDigest(manifest.successor_artifacts)).toBe(
    manifest.successor_artifact_digest,
  );
  expect(manifest.predecessor).toEqual({
    manifest_path: ORIGINAL_MANIFEST_PATH,
    manifest_version:
      "market_context_action_667m3d_provider_verbatim_license_freeze_manifest_v1",
    manifest_sha256: ORIGINAL_MANIFEST_SHA256,
    artifact_digest:
      "c9398b9c2321ed778ea089931a7491c03ed7b91cf8ba6bade72b239c2dd5330c",
    historical_document_sha256: ORIGINAL_DOCUMENT_SHA256,
    immutable_historical_evidence: true,
  });
});

test("provider transcription, license decisions, and readiness remain identical", () => {
  const manifest = parseJson<SuccessorManifest>(SUCCESSOR_MANIFEST_PATH);
  const evidence = parseJson<{
    evidence_version: string;
    provider_verbatim: Array<{ question: string; answer: string }>;
    decision: Record<string, boolean>;
  }>(EVIDENCE_PATH);
  const document = text(DOCUMENT_PATH);

  expect(sha256(bytes(EVIDENCE_PATH))).toBe(
    "544aff46b9ed2e804972894f320e100c0567da09b0a07554f3b93106bf4120d1",
  );
  expect(evidence.evidence_version).toBe(
    "market_context_action_667m3d_provider_verbatim_license_evidence_v1",
  );
  expect(document).toContain("`Yes`");
  expect(document).toContain("`No.`");
  expect(document).toContain("- redistribution is forbidden;");
  expect(document).toContain("- corporate actions are excluded;");
  expect(manifest.semantic_invariants).toMatchObject({
    provider_transcription_unchanged: true,
    license_rights_unchanged: true,
    readiness_fields_unchanged: true,
    canonical_evidence_unchanged: true,
    operator_acquisition_authorized: false,
    download_authorized: false,
    normalization_authorized: false,
    replay_authorized: false,
  });
  expect(manifest.decisions).toMatchObject({
    action_667m3d1_portability_refreeze_complete: true,
    action_667m3d1_historical_freeze_preserved: true,
    action_667m3d1_semantic_equivalence_verified: true,
    staging_performed: false,
    commit_performed: false,
  });
});

test("word, answer, digest, and additional whitespace tampering fail closed", () => {
  const manifest = parseJson<SuccessorManifest>(SUCCESSOR_MANIFEST_PATH);
  const current = text(DOCUMENT_PATH);

  expect(
    verifyExactPortabilityTransformation(
      current.replace("organization", "organisation"),
      manifest,
    ),
  ).toBe(false);
  expect(
    verifyExactPortabilityTransformation(
      current.replace("   `Yes`", "   `No`"),
      manifest,
    ),
  ).toBe(false);
  expect(
    verifyExactPortabilityTransformation(`${current} `, manifest),
  ).toBe(false);
  const digestTamperedManifest = structuredClone(manifest);
  digestTamperedManifest.transformation.after_sha256 = "0".repeat(64);
  expect(
    verifyExactPortabilityTransformation(current, digestTamperedManifest),
  ).toBe(false);
});
