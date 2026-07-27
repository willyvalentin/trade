import { createHash } from "node:crypto";

export const PRE_TRUNCATION_CANDIDATE_CAPTURE_EVIDENCE_VERSION =
  "pre_truncation_candidate_capture_evidence_v1" as const;
export const PRE_TRUNCATION_CANDIDATE_CAPTURE_STAGE_IDENTITY =
  "scanner-full-ranking-boundary" as const;
export const PRE_TRUNCATION_CANDIDATE_CAPTURE_STAGE_VERSION =
  "scanner-full-ranking-boundary-v1" as const;

export type PreTruncationCandidateCaptureEvidence = {
  evidence_version: typeof PRE_TRUNCATION_CANDIDATE_CAPTURE_EVIDENCE_VERSION;
  scan_identity: string;
  producer_decision_id: string;
  capture_stage_identity: string;
  capture_stage_version: string;
  full_candidate_count: number;
  sorted_candidate_identities: string[];
  full_candidate_set_digest: string;
  capture_timestamp: string;
  point_in_time_cutoff: string;
  scanner_version: string;
  universe_version: string;
  provider_contract_version: string;
  evidence_digest_algorithm: "sha256_canonical_json_v1";
  evidence_digest: string;
};

export type PreTruncationCandidateCaptureEvidenceInput = Omit<
  PreTruncationCandidateCaptureEvidence,
  | "evidence_version"
  | "full_candidate_count"
  | "sorted_candidate_identities"
  | "full_candidate_set_digest"
  | "evidence_digest_algorithm"
  | "evidence_digest"
> & {
  candidate_identities: string[];
};

const identityPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,239}$/;
const instantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const fullShaPattern = /^[0-9a-f]{64}$/;

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function exactIdentity(value: unknown) {
  return typeof value === "string" && identityPattern.test(value);
}

function explicitInstant(value: unknown) {
  return (
    typeof value === "string" &&
    instantPattern.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function evidencePayload(
  evidence: Omit<PreTruncationCandidateCaptureEvidence, "evidence_digest">,
) {
  return evidence;
}

export function buildPreTruncationCandidateCaptureEvidence(
  input: PreTruncationCandidateCaptureEvidenceInput,
):
  | { ok: true; evidence: PreTruncationCandidateCaptureEvidence; reason_codes: [] }
  | { ok: false; evidence: null; reason_codes: string[] } {
  const reasons: string[] = [];
  const identities = [...input.candidate_identities].sort();
  if (
    !exactIdentity(input.scan_identity) ||
    !exactIdentity(input.producer_decision_id) ||
    input.capture_stage_identity !==
      PRE_TRUNCATION_CANDIDATE_CAPTURE_STAGE_IDENTITY ||
    input.capture_stage_version !==
      PRE_TRUNCATION_CANDIDATE_CAPTURE_STAGE_VERSION
  ) {
    reasons.push("capture_identity_invalid");
  }
  if (
    !explicitInstant(input.capture_timestamp) ||
    !explicitInstant(input.point_in_time_cutoff) ||
    Date.parse(input.capture_timestamp) > Date.parse(input.point_in_time_cutoff)
  ) {
    reasons.push("capture_timestamp_not_point_in_time_safe");
  }
  if (
    !exactIdentity(input.scanner_version) ||
    !exactIdentity(input.universe_version) ||
    !exactIdentity(input.provider_contract_version)
  ) {
    reasons.push("capture_version_invalid");
  }
  if (
    identities.length === 0 ||
    identities.some((identity) => !exactIdentity(identity)) ||
    new Set(identities).size !== identities.length
  ) {
    reasons.push("capture_candidate_identity_set_invalid");
  }
  if (reasons.length > 0) {
    return {
      ok: false,
      evidence: null,
      reason_codes: Array.from(new Set(reasons)).sort(),
    };
  }
  const payload: Omit<
    PreTruncationCandidateCaptureEvidence,
    "evidence_digest"
  > = {
    evidence_version: PRE_TRUNCATION_CANDIDATE_CAPTURE_EVIDENCE_VERSION,
    scan_identity: input.scan_identity,
    producer_decision_id: input.producer_decision_id,
    capture_stage_identity: input.capture_stage_identity,
    capture_stage_version: input.capture_stage_version,
    full_candidate_count: identities.length,
    sorted_candidate_identities: identities,
    full_candidate_set_digest: digest(identities),
    capture_timestamp: input.capture_timestamp,
    point_in_time_cutoff: input.point_in_time_cutoff,
    scanner_version: input.scanner_version,
    universe_version: input.universe_version,
    provider_contract_version: input.provider_contract_version,
    evidence_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    ok: true,
    evidence: {
      ...payload,
      evidence_digest: digest(evidencePayload(payload)),
    },
    reason_codes: [],
  };
}

export function verifyPreTruncationCandidateCaptureEvidence(
  evidence: PreTruncationCandidateCaptureEvidence,
) {
  const rebuilt = buildPreTruncationCandidateCaptureEvidence({
    scan_identity: evidence.scan_identity,
    producer_decision_id: evidence.producer_decision_id,
    capture_stage_identity: evidence.capture_stage_identity,
    capture_stage_version: evidence.capture_stage_version,
    candidate_identities: evidence.sorted_candidate_identities,
    capture_timestamp: evidence.capture_timestamp,
    point_in_time_cutoff: evidence.point_in_time_cutoff,
    scanner_version: evidence.scanner_version,
    universe_version: evidence.universe_version,
    provider_contract_version: evidence.provider_contract_version,
  });
  const reasons = [
    ...(evidence.evidence_version !==
    PRE_TRUNCATION_CANDIDATE_CAPTURE_EVIDENCE_VERSION
      ? ["capture_evidence_version_invalid"]
      : []),
    ...(evidence.evidence_digest_algorithm !== "sha256_canonical_json_v1"
      ? ["capture_evidence_digest_algorithm_invalid"]
      : []),
    ...(!fullShaPattern.test(evidence.full_candidate_set_digest) ||
    !fullShaPattern.test(evidence.evidence_digest)
      ? ["capture_evidence_digest_format_invalid"]
      : []),
    ...(rebuilt.ok &&
    (rebuilt.evidence.full_candidate_count !== evidence.full_candidate_count ||
      rebuilt.evidence.full_candidate_set_digest !==
        evidence.full_candidate_set_digest ||
      rebuilt.evidence.evidence_digest !== evidence.evidence_digest)
      ? ["capture_evidence_semantic_digest_invalid"]
      : []),
    ...(!rebuilt.ok ? rebuilt.reason_codes : []),
  ];
  return {
    valid: reasons.length === 0,
    reason_codes: Array.from(new Set(reasons)).sort(),
  };
}
