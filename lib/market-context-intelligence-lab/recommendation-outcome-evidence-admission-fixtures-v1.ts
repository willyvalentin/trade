import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  type RecommendationOutcomeEvidenceBundleV1,
} from "./recommendation-outcome-evidence-completion-v1";
import {
  buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2,
} from "./recommendation-outcome-evidence-issuance-fixtures-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
} from "./recommendation-outcome-evidence-issuance-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
} from "./recommendation-outcome-evidence-issuance-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
} from "./recommendation-outcome-evidence-issuance-v3";
import {
  createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4,
  rebindSyntheticRecommendationOutcomeEvidenceIssuanceV4,
} from "./recommendation-outcome-evidence-issuance-fixtures-v4";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
  issueRecommendationOutcomeEvidenceV4,
} from "./recommendation-outcome-evidence-issuance-v4";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_ENVELOPE_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_TAXONOMY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1,
  admitRecommendationOutcomeEvidenceV1,
  canonicalRecommendationOutcomeEvidenceAdmissionJsonV1,
  type RecommendationOutcomeEvidenceAdmissionAuthorityV1,
  type RecommendationOutcomeEvidenceAdmissionEnvelopeV1,
} from "./recommendation-outcome-evidence-admission-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V1 =
  "repository_owned_recommendation_outcome_evidence_admission_fixtures_v1" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

function issueV4(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4
  >,
) {
  return issueRecommendationOutcomeEvidenceV4(fixture.request_v4, {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
  });
}

export function createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1(
  mutateFixture?: (
    fixture: ReturnType<
      typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4
    >,
  ) => void,
) {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  mutateFixture?.(fixture);
  if (mutateFixture) {
    rebindSyntheticRecommendationOutcomeEvidenceIssuanceV4(fixture);
  }
  const result = issueV4(fixture);
  const anchor = structuredClone(
    fixture.authority.expected_issuer_anchor,
  );
  const candidate: RecommendationOutcomeEvidenceAdmissionEnvelopeV1 = {
    envelope_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_ENVELOPE_V1,
    evidence_identity: fixture.request_v4.issuance_identity,
    t_v4_contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
    t_v4_request: structuredClone(fixture.request_v4),
    t_v4_authority_anchor: anchor,
    t_v4_material: structuredClone(fixture.material),
    t_v4_result: structuredClone(result),
  };
  const trustedAuthority: RecommendationOutcomeEvidenceAdmissionAuthorityV1 = {
    authority_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_AUTHORITY_V1,
    ...structuredClone(anchor),
  };
  return {
    fixture,
    candidate,
    candidate_json:
      canonicalRecommendationOutcomeEvidenceAdmissionJsonV1(candidate),
    trusted_authority: trustedAuthority,
    trusted_authority_json:
      canonicalRecommendationOutcomeEvidenceAdmissionJsonV1(
        trustedAuthority,
      ),
  };
}

export function reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
  candidate: RecommendationOutcomeEvidenceAdmissionEnvelopeV1,
) {
  return canonicalRecommendationOutcomeEvidenceAdmissionJsonV1(candidate);
}

function materialBundle(
  candidate: RecommendationOutcomeEvidenceAdmissionEnvelopeV1,
) {
  return candidate.t_v4_material.completion_material
    .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
}

type MatrixEntry = {
  id: string;
  candidate_input: unknown;
  trusted_authority_json?: string;
  enabled?: boolean;
  kill_switch?: boolean;
};

function matrixEntries(): MatrixEntry[] {
  const valid =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();

  const historicalV1 =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  historicalV1.candidate.t_v4_contract_version =
    RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1 as never;
  (
    historicalV1.candidate.t_v4_result as unknown as Record<string, unknown>
  ).contract_version = RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1;

  const historicalV2 =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  historicalV2.candidate.t_v4_contract_version =
    RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2 as never;
  (
    historicalV2.candidate.t_v4_result as unknown as Record<string, unknown>
  ).contract_version = RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2;

  const historicalV3 =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  historicalV3.candidate.t_v4_contract_version =
    RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3 as never;
  (
    historicalV3.candidate.t_v4_result as unknown as Record<string, unknown>
  ).contract_version = RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3;

  const unknown =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  unknown.candidate.t_v4_contract_version = "unknown-t-v99" as never;
  (
    unknown.candidate.t_v4_result as unknown as Record<string, unknown>
  ).contract_version = "unknown-t-v99";

  const incomplete =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1(
      (fixture) => {
        const bundle = fixture.material.completion_material
          .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
        bundle.gap_closures = bundle.gap_closures.slice(1);
      },
    );
  const conflicting =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1(
      (fixture) => {
        const bundle = fixture.material.completion_material
          .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
        bundle.gap_closures = [
          ...bundle.gap_closures,
          structuredClone(bundle.gap_closures[0]),
        ];
      },
    );
  const unsafe =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1(
      (fixture) => {
        const bundle = fixture.material.completion_material
          .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
        bundle.instants.finalization_unix_ns =
          bundle.instants.decision_unix_ns;
      },
    );
  const unmappable =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1(
      (fixture) => {
        delete (
          fixture.material.completion_material as unknown as Record<
            string,
            unknown
          >
        ).observed_repository_row;
      },
    );

  const trustMismatch =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  trustMismatch.trusted_authority.trust_root_digest = "d".repeat(64);

  const digestTamper =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  digestTamper.candidate.t_v4_result.result_digest = "a".repeat(64);

  const gapTamper =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  materialBundle(gapTamper.candidate).gap_closures =
    materialBundle(gapTamper.candidate).gap_closures.slice(1);

  const lineageTamper =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  materialBundle(lineageTamper.candidate).lineage.source_lineage_digest =
    "b".repeat(64);

  const failureA =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  failureA.candidate.t_v4_contract_version = "unknown-t-v98" as never;
  (
    failureA.candidate.t_v4_result as unknown as Record<string, unknown>
  ).contract_version = "unknown-t-v98";
  const failureB =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  failureB.candidate.evidence_identity = "synthetic-u1-failure-b";
  failureB.candidate.t_v4_contract_version = "unknown-t-v98" as never;
  (
    failureB.candidate.t_v4_result as unknown as Record<string, unknown>
  ).contract_version = "unknown-t-v98";

  return [
    {
      id: "admitted_valid_v4",
      candidate_input: valid.candidate_json,
      trusted_authority_json: valid.trusted_authority_json,
    },
    {
      id: "historical_v1_rejected",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          historicalV1.candidate,
        ),
      trusted_authority_json: historicalV1.trusted_authority_json,
    },
    {
      id: "historical_v2_rejected",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          historicalV2.candidate,
        ),
      trusted_authority_json: historicalV2.trusted_authority_json,
    },
    {
      id: "historical_v3_rejected",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          historicalV3.candidate,
        ),
      trusted_authority_json: historicalV3.trusted_authority_json,
    },
    {
      id: "unknown_version_rejected",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          unknown.candidate,
        ),
      trusted_authority_json: unknown.trusted_authority_json,
    },
    {
      id: "incomplete_non_issued_zero_work",
      candidate_input: incomplete.candidate_json,
      trusted_authority_json: incomplete.trusted_authority_json,
    },
    {
      id: "conflicting_non_issued_zero_work",
      candidate_input: conflicting.candidate_json,
      trusted_authority_json: conflicting.trusted_authority_json,
    },
    {
      id: "unsafe_non_issued_zero_work",
      candidate_input: unsafe.candidate_json,
      trusted_authority_json: unsafe.trusted_authority_json,
    },
    {
      id: "unmappable_non_issued_zero_work",
      candidate_input: unmappable.candidate_json,
      trusted_authority_json: unmappable.trusted_authority_json,
    },
    {
      id: "trusted_authority_mismatch",
      candidate_input: trustMismatch.candidate_json,
      trusted_authority_json:
        canonicalRecommendationOutcomeEvidenceAdmissionJsonV1(
          trustMismatch.trusted_authority,
        ),
    },
    {
      id: "supplied_digest_tamper",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          digestTamper.candidate,
        ),
      trusted_authority_json: digestTamper.trusted_authority_json,
    },
    {
      id: "eighteen_gap_tamper",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          gapTamper.candidate,
        ),
      trusted_authority_json: gapTamper.trusted_authority_json,
    },
    {
      id: "lineage_tamper",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          lineageTamper.candidate,
        ),
      trusted_authority_json: lineageTamper.trusted_authority_json,
    },
    {
      id: "failure_collision_observation_a",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          failureA.candidate,
        ),
      trusted_authority_json: failureA.trusted_authority_json,
    },
    {
      id: "failure_collision_observation_b",
      candidate_input:
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(
          failureB.candidate,
        ),
      trusted_authority_json: failureB.trusted_authority_json,
    },
    {
      id: "malformed_json",
      candidate_input: "{\"bad\":",
      trusted_authority_json: valid.trusted_authority_json,
    },
    {
      id: "default_off",
      candidate_input: valid.candidate_json,
      trusted_authority_json: valid.trusted_authority_json,
      enabled: false,
    },
    {
      id: "kill_switch",
      candidate_input: valid.candidate_json,
      trusted_authority_json: valid.trusted_authority_json,
      kill_switch: true,
    },
  ];
}

function matrixScenario(entry: MatrixEntry) {
  const result = admitRecommendationOutcomeEvidenceV1(
    entry.candidate_input,
    {
      enabled: entry.enabled ?? true,
      kill_switch: entry.kill_switch ?? false,
      trusted_authority_json: entry.trusted_authority_json,
    },
  );
  return {
    id: entry.id,
    taxonomy: result.taxonomy,
    reason_codes: result.reason_codes,
    candidate_input_read_count: result.audit.candidate_input_read_count,
    trusted_authority_read_count:
      result.audit.trusted_authority_read_count,
    admission_request_constructed: result.admission_request_constructed,
    t_v4_rebuild_called: result.t_v4_rebuild_called,
    downstream_digest_work: result.downstream_digest_work,
    failure_identity_digest: result.failure_identity_digest,
    admitted_snapshot_digest: result.admitted_snapshot_digest,
    result_digest: result.result_digest,
  };
}

export function buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV1() {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  const admission = admitRecommendationOutcomeEvidenceV1(
    fixture.candidate_json,
    {
      enabled: true,
      kill_switch: false,
      trusted_authority_json: fixture.trusted_authority_json,
    },
  );
  if (admission.taxonomy !== "admitted") {
    throw new Error("synthetic_u1_v4_not_admitted");
  }
  const downstream =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2();
  return {
    t_v4_admission: admission,
    s2a_completion: downstream.completion,
    r2_projection: downstream.projection,
    q1_admission: downstream.q1_admission,
    p2a_capture: downstream.p2a_capture,
    o2a_join: downstream.o2a_join,
  };
}

export function buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1(
  options: { reverse_input_order?: boolean } = {},
) {
  const entries = matrixEntries();
  if (options.reverse_input_order) entries.reverse();
  const scenarios = entries.map(matrixScenario).sort((left, right) =>
    left.id.localeCompare(right.id)
  );
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV1();
  const taxonomyCounts = Object.fromEntries(
    RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_TAXONOMY_V1.map(
      (taxonomy) => [
        taxonomy,
        scenarios.filter((scenario) => scenario.taxonomy === taxonomy)
          .length,
      ],
    ),
  );
  const core = {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V1,
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1,
    source_contract_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
    synthetic_only: true,
    real_outcome_source_accessed: false,
    scenario_count: scenarios.length,
    taxonomy_counts: taxonomyCounts,
    scenarios,
    interop: {
      t_v4_admission_taxonomy: interop.t_v4_admission.taxonomy,
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
