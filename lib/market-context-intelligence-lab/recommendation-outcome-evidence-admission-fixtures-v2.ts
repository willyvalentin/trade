import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  type RecommendationOutcomeEvidenceBundleV1,
} from "./recommendation-outcome-evidence-completion-v1";
import {
  buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV1,
  createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1,
  reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1,
} from "./recommendation-outcome-evidence-admission-fixtures-v1";
import {
  canonicalRecommendationOutcomeEvidenceAdmissionJsonV1,
} from "./recommendation-outcome-evidence-admission-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS,
  admitRecommendationOutcomeEvidenceV2,
  type RecommendationOutcomeEvidenceAdmissionControlsV2,
} from "./recommendation-outcome-evidence-admission-v2";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V2 =
  "repository_owned_recommendation_outcome_evidence_admission_fixtures_v2" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

type MatrixEntry = {
  id: string;
  candidate_input: unknown;
  authority_input: unknown;
  controls?: RecommendationOutcomeEvidenceAdmissionControlsV2;
};

function padJsonToUtf8Bytes(value: string, targetBytes: number) {
  const observed = Buffer.byteLength(value, "utf8");
  if (observed > targetBytes) throw new Error("synthetic_budget_target_too_small");
  return value + " ".repeat(targetBytes - observed);
}

function nonIssuedFixture() {
  return createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1(
    (issuance) => {
      const bundle = issuance.material.completion_material
        .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
      bundle.gap_closures = bundle.gap_closures.slice(1);
    },
  );
}

function depthBudgetFixture() {
  let nested: Record<string, unknown> = {};
  for (let depth = 0; depth < 66; depth += 1) nested = { nested };
  return JSON.stringify(nested);
}

export function createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2() {
  const predecessor =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  return {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V2,
    predecessor,
    candidate_input: predecessor.candidate_json,
    authority_input: predecessor.trusted_authority_json,
    controls: {
      enabled: true,
      kill_switch: false,
    } satisfies RecommendationOutcomeEvidenceAdmissionControlsV2,
  };
}

function matrixEntries(): MatrixEntry[] {
  const valid =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const incomplete = nonIssuedFixture();
  const invalidSchema = canonicalRecommendationOutcomeEvidenceAdmissionJsonV1(
    { schema: "invalid-but-valid-json" },
  );
  const candidateBudget =
    RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS.candidate
      .max_utf8_bytes;
  const belowBudget = padJsonToUtf8Bytes(
    valid.candidate_input,
    candidateBudget - 1,
  );
  const exactBudget = padJsonToUtf8Bytes(
    valid.candidate_input,
    candidateBudget,
  );
  const aboveBudget = padJsonToUtf8Bytes(
    valid.candidate_input,
    candidateBudget + 1,
  );
  const authorityBudget =
    RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2_BUDGETS.authority
      .max_utf8_bytes;
  const belowAuthorityBudget = padJsonToUtf8Bytes(
    valid.authority_input,
    authorityBudget - 1,
  );
  const exactAuthorityBudget = padJsonToUtf8Bytes(
    valid.authority_input,
    authorityBudget,
  );
  const aboveAuthorityBudget = padJsonToUtf8Bytes(
    valid.authority_input,
    authorityBudget + 1,
  );
  const digestTamper =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  digestTamper.candidate.t_v4_result.result_digest = "f".repeat(64);

  return [
    {
      id: "admitted_valid_v4",
      candidate_input: valid.candidate_input,
      authority_input: valid.authority_input,
    },
    {
      id: "empty_candidate",
      candidate_input: "",
      authority_input: valid.authority_input,
    },
    {
      id: "truncated_candidate_a",
      candidate_input: "{\"candidate_a\":",
      authority_input: valid.authority_input,
    },
    {
      id: "truncated_candidate_b",
      candidate_input: "{\"candidate_b\":",
      authority_input: valid.authority_input,
    },
    {
      id: "invalid_json_token",
      candidate_input: "{invalid-json}",
      authority_input: valid.authority_input,
    },
    {
      id: "valid_json_invalid_schema",
      candidate_input: invalidSchema,
      authority_input: valid.authority_input,
    },
    {
      id: "bounded_parse_depth_exceeded",
      candidate_input: depthBudgetFixture(),
      authority_input: valid.authority_input,
    },
    {
      id: "candidate_role_substitution",
      candidate_input: valid.authority_input,
      authority_input: valid.authority_input,
    },
    {
      id: "authority_role_substitution",
      candidate_input: valid.candidate_input,
      authority_input: valid.candidate_input,
    },
    {
      id: "identical_bytes_cross_role",
      candidate_input: valid.candidate_input,
      authority_input: valid.candidate_input,
    },
    {
      id: "unicode_nfc_truncated",
      candidate_input: "{\"label\":\"é\"",
      authority_input: valid.authority_input,
    },
    {
      id: "unicode_nfd_truncated",
      candidate_input: "{\"label\":\"é\"",
      authority_input: valid.authority_input,
    },
    {
      id: "embedded_nul_candidate",
      candidate_input: "{\"value\":\"\u0000\"}",
      authority_input: valid.authority_input,
    },
    {
      id: "unpaired_high_surrogate",
      candidate_input: "{\"value\":\"\ud800\"}",
      authority_input: valid.authority_input,
    },
    {
      id: "unpaired_low_surrogate",
      candidate_input: "{\"value\":\"\udc00\"}",
      authority_input: valid.authority_input,
    },
    {
      id: "escaped_unpaired_surrogate",
      candidate_input: "{\"value\":\"\\ud800\"}",
      authority_input: valid.authority_input,
    },
    {
      id: "candidate_budget_minus_one",
      candidate_input: belowBudget,
      authority_input: valid.authority_input,
    },
    {
      id: "candidate_budget_exact",
      candidate_input: exactBudget,
      authority_input: valid.authority_input,
    },
    {
      id: "candidate_budget_plus_one",
      candidate_input: aboveBudget,
      authority_input: valid.authority_input,
    },
    {
      id: "authority_budget_minus_one",
      candidate_input: valid.candidate_input,
      authority_input: belowAuthorityBudget,
    },
    {
      id: "authority_budget_exact",
      candidate_input: valid.candidate_input,
      authority_input: exactAuthorityBudget,
    },
    {
      id: "authority_budget_plus_one",
      candidate_input: valid.candidate_input,
      authority_input: aboveAuthorityBudget,
    },
    {
      id: "malformed_authority_a",
      candidate_input: valid.candidate_input,
      authority_input: "{\"authority_a\":",
    },
    {
      id: "malformed_authority_b",
      candidate_input: valid.candidate_input,
      authority_input: "{\"authority_b\":",
    },
    {
      id: "non_issued_zero_work",
      candidate_input: incomplete.candidate_json,
      authority_input: incomplete.trusted_authority_json,
    },
    {
      id: "supplied_t_digest_tamper",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          digestTamper.candidate,
        ),
      authority_input: digestTamper.trusted_authority_json,
    },
    {
      id: "default_off",
      candidate_input: valid.candidate_input,
      authority_input: valid.authority_input,
      controls: { enabled: false, kill_switch: false },
    },
    {
      id: "kill_switch",
      candidate_input: valid.candidate_input,
      authority_input: valid.authority_input,
      controls: { enabled: true, kill_switch: true },
    },
  ];
}

function matrixScenario(entry: MatrixEntry) {
  const result = admitRecommendationOutcomeEvidenceV2(
    entry.candidate_input,
    entry.authority_input,
    entry.controls ?? { enabled: true, kill_switch: false },
  );
  return {
    id: entry.id,
    taxonomy: result.taxonomy,
    reason_codes: result.reason_codes,
    candidate: {
      disposition: result.observations.candidate.disposition,
      primitive_type_tag:
        result.observations.candidate.primitive_type_tag,
      utf8_byte_length: result.observations.candidate.utf8_byte_length,
      exact_utf8_sha256:
        result.observations.candidate.exact_utf8_sha256,
      exact_code_unit_sha256:
        result.observations.candidate.exact_code_unit_sha256,
      parse_stage: result.observations.candidate.parse_stage,
      observation_digest:
        result.observations.candidate.observation_digest,
    },
    authority: {
      disposition: result.observations.authority.disposition,
      primitive_type_tag:
        result.observations.authority.primitive_type_tag,
      utf8_byte_length: result.observations.authority.utf8_byte_length,
      exact_utf8_sha256:
        result.observations.authority.exact_utf8_sha256,
      exact_code_unit_sha256:
        result.observations.authority.exact_code_unit_sha256,
      parse_stage: result.observations.authority.parse_stage,
      observation_digest:
        result.observations.authority.observation_digest,
    },
    audit: result.audit,
    failure_identity_digest: result.failure_identity_digest,
    predecessor_result_digest: result.predecessor_result_digest,
    admitted_snapshot_digest: result.admitted_snapshot_digest,
    result_digest: result.result_digest,
  };
}

export function buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV2() {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV2();
  const admission = admitRecommendationOutcomeEvidenceV2(
    fixture.candidate_input,
    fixture.authority_input,
    fixture.controls,
  );
  if (admission.taxonomy !== "admitted") {
    throw new Error("synthetic_u2a_v4_not_admitted");
  }
  const downstream =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV1();
  return {
    admission,
    s2a_completion: downstream.s2a_completion,
    r2_projection: downstream.r2_projection,
    q1_admission: downstream.q1_admission,
    p2a_capture: downstream.p2a_capture,
    o2a_join: downstream.o2a_join,
  };
}

export function buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV2(
  options: { reverse_input_order?: boolean } = {},
) {
  const entries = matrixEntries();
  if (options.reverse_input_order) entries.reverse();
  const scenarios = entries.map(matrixScenario).sort((left, right) =>
    left.id.localeCompare(right.id)
  );
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV2();
  const core = {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V2,
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V2,
    synthetic_only: true,
    real_outcome_source_accessed: false,
    scenario_count: scenarios.length,
    taxonomy_counts: {
      admitted:
        scenarios.filter((scenario) => scenario.taxonomy === "admitted")
          .length,
      rejected:
        scenarios.filter((scenario) => scenario.taxonomy === "rejected")
          .length,
      conflicting:
        scenarios.filter((scenario) => scenario.taxonomy === "conflicting")
          .length,
      not_point_in_time_safe:
        scenarios.filter(
          (scenario) => scenario.taxonomy === "not_point_in_time_safe",
        ).length,
      unmappable:
        scenarios.filter((scenario) => scenario.taxonomy === "unmappable")
          .length,
    },
    scenarios,
    interop: {
      admission_taxonomy: interop.admission.taxonomy,
      s2a_completion_taxonomy: interop.s2a_completion.taxonomy,
      r2_projection_taxonomy: interop.r2_projection.taxonomy,
      q1_admission_taxonomy: interop.q1_admission.taxonomy,
      p2a_capture_taxonomy: interop.p2a_capture.taxonomy,
      o2a_join_taxonomy: interop.o2a_join.taxonomy,
    },
  };
  return {
    ...core,
    result_digest: sha(core),
  };
}
