import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
  issueRecommendationOutcomeEvidenceV3,
} from "./recommendation-outcome-evidence-issuance-v3";
import {
  createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3,
  createT7001SelfConsistentAttackFixtureV3,
  rebindSyntheticRecommendationOutcomeEvidenceIssuanceV3,
} from "./recommendation-outcome-evidence-issuance-fixtures-v3";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
  issueRecommendationOutcomeEvidenceV4,
  type RecommendationOutcomeEvidenceIssuanceRequestV4,
} from "./recommendation-outcome-evidence-issuance-v4";
import type {
  RecommendationOutcomeEvidenceIssuanceMaterialV2,
} from "./recommendation-outcome-evidence-issuance-v2";
import type {
  RecommendationOutcomeEvidenceBundleV1,
} from "./recommendation-outcome-evidence-completion-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V4 =
  "repository_owned_recommendation_outcome_evidence_issuance_fixtures_v4" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

export function createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(
  mutate?: (
    material: RecommendationOutcomeEvidenceIssuanceMaterialV2,
  ) => void,
) {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(mutate);
  const requestV4: RecommendationOutcomeEvidenceIssuanceRequestV4 = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
    issuance_identity: fixture.request_v3.issuance_identity,
    expected_repository_row_identity:
      fixture.request_v3.expected_repository_row_identity,
    expected_evidence_bundle_identity:
      fixture.request_v3.expected_evidence_bundle_identity,
  };
  return { ...fixture, request_v4: requestV4 };
}

export function createT7B001AuthorityMutationFixtureV4() {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  const originalRead = fixture.authority.read_issuance_material;
  let callerMaterialReads = 0;
  fixture.authority.read_issuance_material = () => {
    callerMaterialReads += 1;
    const material = originalRead();
    fixture.request_v3.expected_repository_row_identity =
      "mutated-after-snapshot";
    fixture.request_v4.expected_repository_row_identity =
      "mutated-after-snapshot";
    fixture.authority.expected_issuer_anchor.trust_root_digest =
      "f".repeat(64);
    return material;
  };
  return {
    ...fixture,
    caller_material_reads: () => callerMaterialReads,
  };
}

export function reproduceT7B001AgainstV3() {
  const fixture = createT7B001AuthorityMutationFixtureV4();
  const steps: string[] = [];
  let sanitized_error: string | null = null;
  try {
    issueRecommendationOutcomeEvidenceV3(
      {
        contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
        issuance_identity: fixture.request_v3.issuance_identity,
        expected_repository_row_identity:
          fixture.request_v3.expected_repository_row_identity,
        expected_evidence_bundle_identity:
          fixture.request_v3.expected_evidence_bundle_identity,
      },
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
        observe_downstream_step: (step) => steps.push(step),
      },
    );
  } catch {
    sanitized_error =
      "v3_pre_admission_diverged_from_s2a_sanitized";
  }
  return {
    predecessor_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
    downstream_steps: steps,
    caller_material_reads: fixture.caller_material_reads(),
    sanitized_error,
  };
}

type MatrixCase = {
  id: string;
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4
  >;
  enabled?: boolean;
  kill_switch?: boolean;
  request?: unknown;
};

function evidenceBundle(
  material: RecommendationOutcomeEvidenceIssuanceMaterialV2,
) {
  return material.completion_material
    .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
}

function matrixCases(): MatrixCase[] {
  const t7001 = createT7001SelfConsistentAttackFixtureV3();
  const t7001V4 = {
    ...t7001,
    request_v4: {
      contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
      issuance_identity: t7001.request_v3.issuance_identity,
      expected_repository_row_identity:
        t7001.request_v3.expected_repository_row_identity,
      expected_evidence_bundle_identity:
        t7001.request_v3.expected_evidence_bundle_identity,
    },
  };
  const missingClosure =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(
      (material) => {
        evidenceBundle(material).gap_closures =
          evidenceBundle(material).gap_closures.slice(1);
      },
    );
  const duplicateClosure =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(
      (material) => {
        const bundle = evidenceBundle(material);
        bundle.gap_closures = [
          ...bundle.gap_closures,
          structuredClone(bundle.gap_closures[0]),
        ];
      },
    );
  const temporal =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(
      (material) => {
        const bundle = evidenceBundle(material);
        bundle.instants.finalization_unix_ns =
          bundle.instants.decision_unix_ns;
      },
    );
  const trustConflict =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  trustConflict.material.issuer_registry.trust_root_digest = "e".repeat(64);
  const extraRequest =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  const extraRequestValue = {
    ...extraRequest.request_v4,
    caller_claimed_verified: true,
  };
  const lookupFailure =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  lookupFailure.authority.read_issuance_material = () => {
    throw new Error("synthetic-private-error");
  };
  return [
    {
      id: "issued_valid",
      fixture: createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(),
    },
    {
      id: "issued_t7b_001_mutating_callback",
      fixture: createT7B001AuthorityMutationFixtureV4(),
    },
    {
      id: "unmappable_t7_001_extra_completion_field",
      fixture: t7001V4,
    },
    {
      id: "unmappable_missing_repository_row",
      fixture: createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(
        (material) => {
          delete (
            material.completion_material as unknown as Record<string, unknown>
          ).observed_repository_row;
        },
      ),
    },
    { id: "incomplete_missing_closure", fixture: missingClosure },
    { id: "conflicting_duplicate_closure", fixture: duplicateClosure },
    { id: "not_point_in_time_safe_temporal", fixture: temporal },
    { id: "conflicting_trust_root", fixture: trustConflict },
    {
      id: "unmappable_extra_request_field",
      fixture: extraRequest,
      request: extraRequestValue,
    },
    {
      id: "incomplete_material_lookup_failure",
      fixture: lookupFailure,
    },
    {
      id: "default_off",
      fixture: createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(),
      enabled: false,
    },
    {
      id: "kill_switch",
      fixture: createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(),
      kill_switch: true,
    },
  ];
}

function matrixCase(entry: MatrixCase) {
  const steps: string[] = [];
  const result = issueRecommendationOutcomeEvidenceV4(
    entry.request ?? entry.fixture.request_v4,
    {
      enabled: entry.enabled ?? true,
      kill_switch: entry.kill_switch ?? false,
      authority: entry.fixture.authority,
      observe_downstream_step: (step) => steps.push(step),
    },
  );
  return {
    id: entry.id,
    taxonomy: result.taxonomy,
    reason_codes: result.reason_codes,
    request_snapshot_count:
      result.snapshot_audit.caller_request_snapshot_count,
    authority_snapshot_count:
      result.snapshot_audit.caller_authority_snapshot_count,
    caller_material_read_count:
      result.snapshot_audit.caller_material_read_count,
    caller_input_reread_count:
      result.snapshot_audit.caller_input_reread_count,
    s2a_request_constructed: result.s2a_request_constructed,
    s2a_called: result.s2a_called,
    downstream_digest_work: result.downstream_digest_work,
    downstream_steps: steps,
    failure_identity_digest: result.failure_identity_digest,
    snapshot_bundle_digest: result.snapshot_audit.snapshot_bundle_digest,
    result_digest: result.result_digest,
  };
}

export function buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV4(
  options: { reverse_input_order?: boolean } = {},
) {
  const entries = matrixCases();
  if (options.reverse_input_order) entries.reverse();
  const scenarios = entries.map(matrixCase).sort((left, right) =>
    left.id.localeCompare(right.id)
  );
  const taxonomyCounts = Object.fromEntries(
    ["issued", "incomplete", "conflicting", "not_point_in_time_safe", "unmappable"]
      .map((taxonomy) => [
        taxonomy,
        scenarios.filter((scenario) => scenario.taxonomy === taxonomy).length,
      ]),
  );
  const core = {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V4,
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
    synthetic_only: true,
    real_outcome_source_accessed: false,
    scenario_count: scenarios.length,
    taxonomy_counts: taxonomyCounts,
    scenarios,
    t7b_001_predecessor_reproduction: reproduceT7B001AgainstV3(),
  };
  return {
    ...core,
    result_digest: sha(core),
  };
}

export function rebindSyntheticRecommendationOutcomeEvidenceIssuanceV4(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4
  >,
) {
  rebindSyntheticRecommendationOutcomeEvidenceIssuanceV3(fixture);
  return fixture;
}
