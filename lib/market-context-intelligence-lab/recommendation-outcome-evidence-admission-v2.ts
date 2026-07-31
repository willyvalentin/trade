import { createHash } from "node:crypto";

import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1,
  admitRecommendationOutcomeEvidenceV1,
  canonicalRecommendationOutcomeEvidenceAdmissionJsonV1,
  type RecommendationOutcomeEvidenceAdmissionResultV1,
  type RecommendationOutcomeEvidenceAdmissionTaxonomyV1,
} from "./recommendation-outcome-evidence-admission-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
} from "./recommendation-outcome-evidence-issuance-v4";
import {
  canonicalizeRecommendationOutcomeEvidencePreAdmissionV3,
} from "./recommendation-outcome-evidence-issuance-v3";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2 =
  "repository_owned_recommendation_outcome_evidence_admission_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_OBSERVATION_V2 =
  "repository_owned_recommendation_outcome_evidence_admission_observation_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FAILURE_IDENTITY_V2 =
  "repository_owned_recommendation_outcome_evidence_admission_failure_identity_v2" as const;
export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_VERIFIER_V2 =
  "repository_owned_recommendation_outcome_evidence_admission_verifier_v2" as const;

export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS = {
  candidate: {
    max_utf8_bytes: 1_500_000,
    max_string_code_units: 1_500_000,
  },
  authority: {
    max_utf8_bytes: 262_144,
    max_string_code_units: 262_144,
  },
} as const;

export type RecommendationOutcomeEvidenceAdmissionInputRoleV2 =
  | "candidate"
  | "authority";

export type RecommendationOutcomeEvidenceAdmissionParseStageV2 =
  | "not_observed"
  | "pre_parse"
  | "json_parse"
  | "bounded_validation"
  | "schema_delegation_ready";

export type RecommendationOutcomeEvidenceAdmissionObservationV2 = {
  observation_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_OBSERVATION_V2;
  role: RecommendationOutcomeEvidenceAdmissionInputRoleV2;
  disposition:
    | "not_observed"
    | "present"
    | "malformed"
    | "rejected";
  primitive_type_tag: string;
  input_read_count: 0 | 1;
  string_code_unit_length: number | null;
  utf8_byte_length: number | null;
  exact_utf8_sha256: string | null;
  exact_code_unit_sha256: string | null;
  unicode_scalar_well_formed: boolean | null;
  parse_stage: RecommendationOutcomeEvidenceAdmissionParseStageV2;
  sanitized_reason_codes: string[];
  observation_digest: string;
};

export type RecommendationOutcomeEvidenceAdmissionAuditV2 = {
  candidate_input_read_count: 0 | 1;
  authority_input_read_count: 0 | 1;
  candidate_getter_execution_count: 0;
  authority_getter_execution_count: 0;
  proxy_hook_execution_count: 0;
  coercion_hook_execution_count: 0;
  caller_callback_execution_count: 0;
  caller_input_reread_count: 0;
  verified_snapshot_only_downstream: true;
  canonical_snapshots_deep_frozen: boolean;
  admission_request_constructed: boolean;
  t_v4_rebuild_called: boolean;
  downstream_digest_work: boolean;
};

export type RecommendationOutcomeEvidenceAdmissionResultV2 = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2;
  predecessor_contract_version:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1;
  verifier_identity:
    typeof RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_VERIFIER_V2;
  taxonomy: RecommendationOutcomeEvidenceAdmissionTaxonomyV1;
  evidence_identity: string | null;
  observations: {
    candidate: RecommendationOutcomeEvidenceAdmissionObservationV2;
    authority: RecommendationOutcomeEvidenceAdmissionObservationV2;
  };
  audit: RecommendationOutcomeEvidenceAdmissionAuditV2;
  predecessor_result_digest: string | null;
  t_v4_result_digest: string | null;
  eighteen_gap_binding_digest: string | null;
  admitted_snapshot_digest: string | null;
  failure_identity_digest: string | null;
  reason_codes: string[];
  diagnostic_only: true;
  shadow_only: true;
  read_only: true;
  real_outcome_source_accessed: false;
  official_ohlcv: false;
  canonical_performance_eligible: false;
  automatic_model_input_allowed: false;
  automatic_training_allowed: false;
  automatic_promotion_allowed: false;
  causal_claimed: false;
  live_ranking_effect: false;
  result_digest: string;
};

export type RecommendationOutcomeEvidenceAdmissionControlsV2 = {
  enabled: boolean;
  kill_switch: boolean;
};

type PlainRecord = Record<string, unknown>;
type ParsedObservation = {
  observation: RecommendationOutcomeEvidenceAdmissionObservationV2;
  canonical_json: string | null;
  snapshot: unknown;
};

const BOUNDARY = {
  diagnostic_only: true,
  shadow_only: true,
  read_only: true,
  real_outcome_source_accessed: false,
  official_ohlcv: false,
  canonical_performance_eligible: false,
  automatic_model_input_allowed: false,
  automatic_training_allowed: false,
  automatic_promotion_allowed: false,
  causal_claimed: false,
  live_ranking_effect: false,
} as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);
const sortedUnique = (values: string[]) =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right));
const isRecord = (value: unknown): value is PlainRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function deepFreeze<T>(value: T): T {
  const pending: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (
      current === null || typeof current !== "object" || seen.has(current)
    ) {
      continue;
    }
    seen.add(current);
    Object.freeze(current);
    for (const child of Object.values(current)) pending.push(child);
  }
  return value;
}

function isDeepFrozen(value: unknown) {
  const pending: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (
      current === null || typeof current !== "object" || seen.has(current)
    ) {
      continue;
    }
    seen.add(current);
    if (!Object.isFrozen(current)) return false;
    for (const child of Object.values(current)) pending.push(child);
  }
  return true;
}

function codeUnitBytes(value: string) {
  const bytes = Buffer.allocUnsafe(value.length * 2);
  for (let index = 0; index < value.length; index += 1) {
    bytes.writeUInt16LE(value.charCodeAt(index), index * 2);
  }
  return bytes;
}

function hasUnpairedSurrogate(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) return true;
  }
  return false;
}

function snapshotHasUnpairedSurrogate(value: unknown) {
  const pending: unknown[] = [value];
  while (pending.length > 0) {
    const current = pending.pop();
    if (typeof current === "string") {
      if (hasUnpairedSurrogate(current)) return true;
      continue;
    }
    if (Array.isArray(current)) {
      for (const child of current) pending.push(child);
      continue;
    }
    if (isRecord(current)) {
      for (const child of Object.values(current)) pending.push(child);
    }
  }
  return false;
}

function primitiveTypeTag(input: unknown) {
  if (input === null) return "null";
  return typeof input;
}

function observation(
  role: RecommendationOutcomeEvidenceAdmissionInputRoleV2,
  core: Omit<
    RecommendationOutcomeEvidenceAdmissionObservationV2,
    "observation_version" | "role" | "observation_digest"
  >,
): RecommendationOutcomeEvidenceAdmissionObservationV2 {
  const basis = {
    observation_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_OBSERVATION_V2,
    role,
    ...core,
    sanitized_reason_codes: sortedUnique(core.sanitized_reason_codes),
  };
  return deepFreeze({
    ...basis,
    observation_digest: sha(basis),
  });
}

function notObserved(
  role: RecommendationOutcomeEvidenceAdmissionInputRoleV2,
) {
  return observation(role, {
    disposition: "not_observed",
    primitive_type_tag: "not_read",
    input_read_count: 0,
    string_code_unit_length: null,
    utf8_byte_length: null,
    exact_utf8_sha256: null,
    exact_code_unit_sha256: null,
    unicode_scalar_well_formed: null,
    parse_stage: "not_observed",
    sanitized_reason_codes: [],
  });
}

function observeAndParse(
  role: RecommendationOutcomeEvidenceAdmissionInputRoleV2,
  input: unknown,
): ParsedObservation {
  // This is the single caller-input read. All later work uses observedString
  // and parser-owned snapshots only. typeof and identity comparison execute no
  // getters, proxy hooks, coercion hooks, or callbacks.
  const observedInput = input;
  const typeTag = primitiveTypeTag(observedInput);
  if (typeof observedInput !== "string") {
    return {
      observation: observation(role, {
        disposition: "rejected",
        primitive_type_tag: typeTag,
        input_read_count: 1,
        string_code_unit_length: null,
        utf8_byte_length: null,
        exact_utf8_sha256: null,
        exact_code_unit_sha256: null,
        unicode_scalar_well_formed: null,
        parse_stage: "pre_parse",
        sanitized_reason_codes: [
          `${role}:canonical_json_string_required`,
        ],
      }),
      canonical_json: null,
      snapshot: null,
    };
  }

  const observedString = observedInput;
  const utf8Bytes = Buffer.from(observedString, "utf8");
  const exactUtf8Sha256 = createHash("sha256")
    .update(utf8Bytes)
    .digest("hex");
  const exactCodeUnitSha256 = createHash("sha256")
    .update(codeUnitBytes(observedString))
    .digest("hex");
  const wellFormed = !hasUnpairedSurrogate(observedString);
  const budgets =
    RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS[role];
  const preParseReasons: string[] = [];
  if (utf8Bytes.byteLength > budgets.max_utf8_bytes) {
    preParseReasons.push(`${role}:utf8_byte_budget_exceeded`);
  }
  if (observedString.length > budgets.max_string_code_units) {
    preParseReasons.push(`${role}:string_code_unit_budget_exceeded`);
  }
  if (!wellFormed) preParseReasons.push(`${role}:invalid_unicode_surrogate`);
  const shared = {
    primitive_type_tag: "string",
    input_read_count: 1 as const,
    string_code_unit_length: observedString.length,
    utf8_byte_length: utf8Bytes.byteLength,
    exact_utf8_sha256: exactUtf8Sha256,
    exact_code_unit_sha256: exactCodeUnitSha256,
    unicode_scalar_well_formed: wellFormed,
  };
  if (preParseReasons.length > 0) {
    return {
      observation: observation(role, {
        disposition: "rejected",
        ...shared,
        parse_stage: "pre_parse",
        sanitized_reason_codes: preParseReasons,
      }),
      canonical_json: null,
      snapshot: null,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(observedString);
  } catch {
    return {
      observation: observation(role, {
        disposition: "malformed",
        ...shared,
        parse_stage: "json_parse",
        sanitized_reason_codes: [`${role}:malformed_json_sanitized`],
      }),
      canonical_json: null,
      snapshot: null,
    };
  }

  const canonical =
    canonicalizeRecommendationOutcomeEvidencePreAdmissionV3(parsed);
  const boundedReasons = canonical.ok
    ? []
    : canonical.reason_codes.map((reason) => `${role}:${reason}`);
  if (snapshotHasUnpairedSurrogate(canonical.value)) {
    boundedReasons.push(`${role}:parsed_invalid_unicode_surrogate`);
  }
  if (!canonical.ok || boundedReasons.length > 0) {
    return {
      observation: observation(role, {
        disposition: "rejected",
        ...shared,
        parse_stage: "bounded_validation",
        sanitized_reason_codes: boundedReasons,
      }),
      canonical_json: null,
      snapshot: null,
    };
  }
  const snapshot = deepFreeze(canonical.value);
  return {
    observation: observation(role, {
      disposition: "present",
      ...shared,
      parse_stage: "schema_delegation_ready",
      sanitized_reason_codes: [],
    }),
    canonical_json:
      canonicalRecommendationOutcomeEvidenceAdmissionJsonV1(snapshot),
    snapshot,
  };
}

function looksIssuedV4(snapshot: unknown) {
  if (!isRecord(snapshot) || !isRecord(snapshot.t_v4_result)) return false;
  return snapshot.t_v4_contract_version ===
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4 &&
    snapshot.t_v4_result.contract_version ===
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4 &&
    snapshot.t_v4_result.taxonomy === "issued";
}

function emptyAudit(
  candidateRead: 0 | 1,
  authorityRead: 0 | 1,
): RecommendationOutcomeEvidenceAdmissionAuditV2 {
  return deepFreeze({
    candidate_input_read_count: candidateRead,
    authority_input_read_count: authorityRead,
    candidate_getter_execution_count: 0,
    authority_getter_execution_count: 0,
    proxy_hook_execution_count: 0,
    coercion_hook_execution_count: 0,
    caller_callback_execution_count: 0,
    caller_input_reread_count: 0,
    verified_snapshot_only_downstream: true,
    canonical_snapshots_deep_frozen: true,
    admission_request_constructed: false,
    t_v4_rebuild_called: false,
    downstream_digest_work: false,
  });
}

function auditFromPredecessor(
  candidate: ParsedObservation,
  authority: ParsedObservation,
  predecessor: RecommendationOutcomeEvidenceAdmissionResultV1,
) {
  return deepFreeze({
    ...emptyAudit(
      candidate.observation.input_read_count,
      authority.observation.input_read_count,
    ),
    canonical_snapshots_deep_frozen:
      isDeepFrozen(candidate.snapshot) &&
      (
        authority.observation.input_read_count === 0 ||
        isDeepFrozen(authority.snapshot)
      ),
    admission_request_constructed:
      predecessor.admission_request_constructed,
    t_v4_rebuild_called: predecessor.t_v4_rebuild_called,
    downstream_digest_work: predecessor.downstream_digest_work,
  });
}

function terminal(
  taxonomy: RecommendationOutcomeEvidenceAdmissionTaxonomyV1,
  candidate: RecommendationOutcomeEvidenceAdmissionObservationV2,
  authority: RecommendationOutcomeEvidenceAdmissionObservationV2,
  audit: RecommendationOutcomeEvidenceAdmissionAuditV2,
  reasons: string[],
  predecessor: RecommendationOutcomeEvidenceAdmissionResultV1 | null = null,
): RecommendationOutcomeEvidenceAdmissionResultV2 {
  const reasonCodes = sortedUnique(reasons);
  const evidenceIdentity = predecessor?.evidence_identity ?? null;
  const failureIdentity = taxonomy === "admitted"
    ? null
    : sha({
        failure_identity_version:
          RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FAILURE_IDENTITY_V2,
        contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2,
        taxonomy,
        evidence_identity: evidenceIdentity,
        candidate: {
          role: candidate.role,
          observation_digest: candidate.observation_digest,
          parse_stage: candidate.parse_stage,
          sanitized_reason_codes: candidate.sanitized_reason_codes,
        },
        authority: {
          role: authority.role,
          observation_digest: authority.observation_digest,
          parse_stage: authority.parse_stage,
          sanitized_reason_codes: authority.sanitized_reason_codes,
        },
        predecessor_result_digest: predecessor?.result_digest ?? null,
        reason_codes: reasonCodes,
      });
  const core = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2,
    predecessor_contract_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1,
    verifier_identity:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_VERIFIER_V2,
    taxonomy,
    evidence_identity: evidenceIdentity,
    observations: { candidate, authority },
    audit,
    predecessor_result_digest: predecessor?.result_digest ?? null,
    t_v4_result_digest: predecessor?.t_v4_result_digest ?? null,
    eighteen_gap_binding_digest:
      predecessor?.eighteen_gap_binding_digest ?? null,
    admitted_snapshot_digest: predecessor?.admitted_snapshot_digest ?? null,
    failure_identity_digest: failureIdentity,
    reason_codes: reasonCodes,
    ...BOUNDARY,
  };
  return deepFreeze({
    ...core,
    result_digest: sha(core),
  });
}

export function admitRecommendationOutcomeEvidenceV2(
  candidateInput: unknown,
  trustedAuthorityInput: unknown,
  controls: RecommendationOutcomeEvidenceAdmissionControlsV2,
): RecommendationOutcomeEvidenceAdmissionResultV2 {
  if (!controls.enabled) {
    const candidate = notObserved("candidate");
    const authority = notObserved("authority");
    return terminal(
      "rejected",
      candidate,
      authority,
      emptyAudit(0, 0),
      ["outcome_evidence_admission_v2_default_off"],
    );
  }
  if (controls.kill_switch) {
    const candidate = notObserved("candidate");
    const authority = notObserved("authority");
    return terminal(
      "rejected",
      candidate,
      authority,
      emptyAudit(0, 0),
      ["outcome_evidence_admission_v2_kill_switch_active"],
    );
  }

  const candidate = observeAndParse("candidate", candidateInput);
  if (!candidate.canonical_json) {
    return terminal(
      "unmappable",
      candidate.observation,
      notObserved("authority"),
      emptyAudit(1, 0),
      candidate.observation.sanitized_reason_codes,
    );
  }

  if (!looksIssuedV4(candidate.snapshot)) {
    const predecessor = admitRecommendationOutcomeEvidenceV1(
      candidate.canonical_json,
      {
        enabled: true,
        kill_switch: false,
      },
    );
    const authority = {
      observation: notObserved("authority"),
      canonical_json: null,
      snapshot: null,
    };
    return terminal(
      predecessor.taxonomy,
      candidate.observation,
      authority.observation,
      auditFromPredecessor(candidate, authority, predecessor),
      predecessor.reason_codes,
      predecessor,
    );
  }

  const authority = observeAndParse("authority", trustedAuthorityInput);
  if (!authority.canonical_json) {
    return terminal(
      "conflicting",
      candidate.observation,
      authority.observation,
      emptyAudit(1, 1),
      authority.observation.sanitized_reason_codes,
    );
  }

  const predecessor = admitRecommendationOutcomeEvidenceV1(
    candidate.canonical_json,
    {
      enabled: true,
      kill_switch: false,
      trusted_authority_json: authority.canonical_json,
    },
  );
  return terminal(
    predecessor.taxonomy,
    candidate.observation,
    authority.observation,
    auditFromPredecessor(candidate, authority, predecessor),
    predecessor.reason_codes,
    predecessor,
  );
}

export function computeRecommendationOutcomeEvidenceAdmissionObservationDigestV2(
  value: RecommendationOutcomeEvidenceAdmissionObservationV2,
) {
  const basis = { ...value } as Partial<
    RecommendationOutcomeEvidenceAdmissionObservationV2
  >;
  delete basis.observation_digest;
  return sha(basis);
}

export function computeRecommendationOutcomeEvidenceAdmissionFailureIdentityV2(
  result: RecommendationOutcomeEvidenceAdmissionResultV2,
) {
  if (result.taxonomy === "admitted") return null;
  return sha({
    failure_identity_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FAILURE_IDENTITY_V2,
    contract_version: result.contract_version,
    taxonomy: result.taxonomy,
    evidence_identity: result.evidence_identity,
    candidate: {
      role: result.observations.candidate.role,
      observation_digest:
        result.observations.candidate.observation_digest,
      parse_stage: result.observations.candidate.parse_stage,
      sanitized_reason_codes:
        result.observations.candidate.sanitized_reason_codes,
    },
    authority: {
      role: result.observations.authority.role,
      observation_digest:
        result.observations.authority.observation_digest,
      parse_stage: result.observations.authority.parse_stage,
      sanitized_reason_codes:
        result.observations.authority.sanitized_reason_codes,
    },
    predecessor_result_digest: result.predecessor_result_digest,
    reason_codes: result.reason_codes,
  });
}

export function computeRecommendationOutcomeEvidenceAdmissionResultDigestV2(
  result: RecommendationOutcomeEvidenceAdmissionResultV2,
) {
  const basis = { ...result } as Partial<
    RecommendationOutcomeEvidenceAdmissionResultV2
  >;
  delete basis.result_digest;
  return sha(basis);
}
