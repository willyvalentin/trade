import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  refreshSyntheticRecommendationOutcomeEvidenceBundleV1,
} from "./recommendation-outcome-evidence-completion-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
  issueRecommendationOutcomeEvidenceV2,
  type RecommendationOutcomeEvidenceIssuanceMaterialV2,
} from "./recommendation-outcome-evidence-issuance-v2";
import {
  createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2,
} from "./recommendation-outcome-evidence-issuance-fixtures-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
  classifyRecommendationOutcomeEvidencePreAdmissionV3,
  issueRecommendationOutcomeEvidenceV3,
  type RecommendationOutcomeEvidenceIssuanceRequestV3,
} from "./recommendation-outcome-evidence-issuance-v3";
import type {
  RecommendationOutcomeEvidenceBundleV1,
} from "./recommendation-outcome-evidence-completion-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V3 =
  "repository_owned_recommendation_outcome_evidence_issuance_fixtures_v3" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);
const safeSha = (value: unknown, namespace: string) =>
  value === undefined
    ? sha({ namespace, disposition: "absent" })
    : sha(value);

export function rebindSyntheticRecommendationOutcomeEvidenceIssuanceV3(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2
  >,
) {
  const material = fixture.material;
  const completion = material.completion_material;
  const bundle =
    completion.observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
  const closures = [...bundle.gap_closures].sort((left, right) =>
    [
      left.gap_code,
      left.evidence_identity,
      left.evidence_digest,
    ].join(":").localeCompare(
      [
        right.gap_code,
        right.evidence_identity,
        right.evidence_digest,
      ].join(":"),
    )
  );
  bundle.gap_closures = closures;
  refreshSyntheticRecommendationOutcomeEvidenceBundleV1(bundle);
  const completionEntry = completion.registry.completion_entry;
  completionEntry.repository_row_digest = safeSha(
    completion.observed_repository_row,
    "repository_row",
  );
  completionEntry.evidence_bundle_digest = sha(bundle);
  completionEntry.lineage_root_digest = bundle.lineage_root_digest;
  const registry = material.issuer_registry;
  registry.trust_root_digest = bundle.external_authority_root_digest;
  registry.issuance_entry.repository_row_digest = safeSha(
    completion.observed_repository_row,
    "repository_row",
  );
  registry.issuance_entry.evidence_bundle_digest = sha(bundle);
  registry.issuance_entry.completion_registry_digest = sha(
    completion.registry,
  );
  const admission = registry.pre_downstream_admission;
  admission.completion_material_digest = sha(completion);
  admission.gap_closure_set_digest = sha(closures);
  const admissionCore = {
    admission_version: admission.admission_version,
    completion_material_digest: admission.completion_material_digest,
    gap_closure_set_digest: admission.gap_closure_set_digest,
    expected_s2a_taxonomy: admission.expected_s2a_taxonomy,
    verifier_identity: admission.verifier_identity,
    verifier_version: admission.verifier_version,
  };
  admission.admission_digest = sha(admissionCore);
  fixture.authority.expected_issuer_anchor.registry_digest = sha(registry);
  fixture.authority.expected_issuer_anchor.trust_root_digest =
    bundle.external_authority_root_digest;
  return fixture;
}

export function createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
  mutate?: (
    material: RecommendationOutcomeEvidenceIssuanceMaterialV2,
  ) => void,
) {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2();
  mutate?.(fixture.material);
  rebindSyntheticRecommendationOutcomeEvidenceIssuanceV3(fixture);
  const request: RecommendationOutcomeEvidenceIssuanceRequestV3 = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
    issuance_identity: fixture.request.issuance_identity,
    expected_repository_row_identity:
      fixture.request.expected_repository_row_identity,
    expected_evidence_bundle_identity:
      fixture.request.expected_evidence_bundle_identity,
  };
  return { ...fixture, request_v3: request };
}

export function createT7001SelfConsistentAttackFixtureV3() {
  return createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
    (material) => {
      (
        material.completion_material as unknown as Record<string, unknown>
      ).unexpected_self_consistent_field = "x";
    },
  );
}

export function reproduceT7001AgainstV2() {
  const fixture = createT7001SelfConsistentAttackFixtureV3();
  const steps: string[] = [];
  let sanitized_error: string | null = null;
  try {
    issueRecommendationOutcomeEvidenceV2(
      {
        contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
        issuance_identity: fixture.request.issuance_identity,
        expected_repository_row_identity:
          fixture.request.expected_repository_row_identity,
        expected_evidence_bundle_identity:
          fixture.request.expected_evidence_bundle_identity,
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
      "issued_pre_downstream_admission_diverged_from_s2a_sanitized";
  }
  return {
    predecessor_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
    downstream_steps: steps,
    sanitized_error,
  };
}

type MatrixCase = {
  id: string;
  mutate?: (
    material: RecommendationOutcomeEvidenceIssuanceMaterialV2,
  ) => void;
};

function matrixCases(): MatrixCase[] {
  return [
    { id: "issued_valid" },
    {
      id: "t7_001_self_consistent_extra_field",
      mutate: (material) => {
        (material.completion_material as unknown as Record<string, unknown>)
          .unexpected_self_consistent_field = "x";
      },
    },
    {
      id: "completion_field_stripped",
      mutate: (material) => {
        delete (
          material.completion_material as unknown as Record<string, unknown>
        ).observed_repository_row;
      },
    },
    {
      id: "bundle_extra_field",
      mutate: (material) => {
        (
          material.completion_material.observed_evidence_bundle as Record<
            string,
            unknown
          >
        ).caller_verified = true;
      },
    },
    {
      id: "closure_substitution",
      mutate: (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.gap_closures[0].evidence_identity = "substituted-evidence";
      },
    },
    {
      id: "closure_missing",
      mutate: (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.gap_closures.pop();
      },
    },
    {
      id: "closure_duplicate",
      mutate: (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.gap_closures[1] = structuredClone(bundle.gap_closures[0]);
      },
    },
    {
      id: "trust_root_substitution",
      mutate: (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.external_authority_root_digest = "b".repeat(64);
      },
    },
    {
      id: "membership_substitution",
      mutate: (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.opportunity_set.membership_digest = "c".repeat(64);
      },
    },
    {
      id: "temporal_finality_violation",
      mutate: (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.instants.finalization_unix_ns =
          bundle.instants.decision_unix_ns;
      },
    },
  ];
}

export function buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV3(
  options: { reverse_input_order?: boolean } = {},
) {
  const cases = matrixCases();
  if (options.reverse_input_order) cases.reverse();
  const scenarios = cases.map(({ id, mutate }) => {
    const fixture =
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(mutate);
    const steps: string[] = [];
    const result = issueRecommendationOutcomeEvidenceV3(
      fixture.request_v3,
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
        observe_downstream_step: (step) => steps.push(step),
      },
    );
    return {
      id,
      taxonomy: result.taxonomy,
      reason_codes: result.reason_codes,
      s2a_request_constructed: result.s2a_request_constructed,
      s2a_called: result.s2a_called,
      downstream_digest_work: result.downstream_digest_work,
      downstream_steps: steps,
      failure_identity_digest: result.failure_identity_digest,
      result_digest: result.result_digest,
    };
  });
  for (
    const [id, enabled, killSwitch] of [
      ["default_off", false, false],
      ["kill_switch", true, true],
    ] as const
  ) {
    const fixture =
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
    const result = issueRecommendationOutcomeEvidenceV3(
      new Proxy(fixture.request_v3, {
        ownKeys() {
          throw new Error("request_must_not_be_read");
        },
      }),
      {
        enabled,
        kill_switch: killSwitch,
        authority: new Proxy(fixture.authority, {
          ownKeys() {
            throw new Error("authority_must_not_be_read");
          },
        }),
      },
    );
    scenarios.push({
      id,
      taxonomy: result.taxonomy,
      reason_codes: result.reason_codes,
      s2a_request_constructed: result.s2a_request_constructed,
      s2a_called: result.s2a_called,
      downstream_digest_work: result.downstream_digest_work,
      downstream_steps: [],
      failure_identity_digest: result.failure_identity_digest,
      result_digest: result.result_digest,
    });
  }
  scenarios.sort((left, right) => left.id.localeCompare(right.id));
  const valid =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  const classifier = classifyRecommendationOutcomeEvidencePreAdmissionV3(
    valid.request_v3,
    valid.authority,
  );
  const material = {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V3,
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
    synthetic_only: true,
    real_outcome_source_accessed: false,
    scenario_count: scenarios.length,
    scenarios,
    t7_001_predecessor_reproduction: reproduceT7001AgainstV2(),
    valid_classifier_admission_digest: classifier.admission_digest,
  };
  return {
    ...material,
    result_digest: sha(material),
  };
}
