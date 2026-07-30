import {
  refreshSyntheticRecommendationOutcomeEvidenceBundleV1,
} from "./recommendation-outcome-evidence-completion-fixtures-v1";
import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
  issueRecommendationOutcomeEvidenceV1,
} from "./recommendation-outcome-evidence-issuance-v1";
import {
  buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV1,
  createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1,
} from "./recommendation-outcome-evidence-issuance-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_PRE_DOWNSTREAM_ADMISSION_V2,
  completionMaterialFromIssuedEvidenceV2,
  issueRecommendationOutcomeEvidenceV2,
  type RecommendationOutcomeEvidenceIssuanceMaterialV2,
  type RecommendationOutcomeEvidenceIssuanceRequestV2,
  type RecommendationOutcomeEvidenceIssuerAuthorityV2,
  type RecommendationOutcomeEvidenceIssuerRegistryV2,
} from "./recommendation-outcome-evidence-issuance-v2";
import type {
  RecommendationOutcomeEvidenceBundleV1,
  RecommendationOutcomeEvidenceMaterialV1,
} from "./recommendation-outcome-evidence-completion-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V2 =
  "repository_owned_recommendation_outcome_evidence_issuance_fixtures_v2" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

function canonicalCompletionMaterial(
  material: RecommendationOutcomeEvidenceMaterialV1,
) {
  const normalized = structuredClone(material);
  const bundle =
    normalized.observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
  bundle.gap_closures.sort((left, right) =>
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
  refreshSyntheticRecommendationOutcomeEvidenceBundleV1(bundle);
  normalized.registry.completion_entry.evidence_bundle_digest = sha(bundle);
  normalized.registry.completion_entry.lineage_root_digest =
    bundle.lineage_root_digest;
  return normalized;
}

export type SyntheticRecommendationOutcomeEvidenceIssuanceOptionsV2 = {
  row_suffix?: string;
  reverse_closure_order?: boolean;
  remove_first_closure?: boolean;
  unsafe_source_instant?: boolean;
  conflict_registry?: boolean;
  rollback_epoch?: boolean;
  material_override?: unknown;
  throw_on_read?: boolean;
  mutate_admission?: (
    admission: RecommendationOutcomeEvidenceIssuerRegistryV2[
      "pre_downstream_admission"
    ],
  ) => void;
};

export function createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2(
  options: SyntheticRecommendationOutcomeEvidenceIssuanceOptionsV2 = {},
) {
  const predecessor =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      row_suffix: options.row_suffix,
      reverse_closure_order: options.reverse_closure_order,
      remove_first_closure: options.remove_first_closure,
      unsafe_source_instant: options.unsafe_source_instant,
    });
  const completionMaterial = canonicalCompletionMaterial(
    structuredClone(
      predecessor.material.completion_material,
    ) as RecommendationOutcomeEvidenceMaterialV1,
  );
  const completionRegistry = completionMaterial.registry;
  const completionEntry = completionRegistry.completion_entry;
  const bundle =
    completionMaterial.observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
  const authorityAnchorDigest = sha({
    issuer: "synthetic-repository-outcome-evidence-issuer-001",
    version: "synthetic-issuer-v2",
    policy: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
  });
  const predecessorDigest = sha({
    issuance: "synthetic-predecessor-issuance-007",
    epoch: "7",
  });
  const admissionCore = {
    admission_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_PRE_DOWNSTREAM_ADMISSION_V2,
    completion_material_digest: sha(completionMaterial),
    gap_closure_set_digest: sha(bundle.gap_closures),
    expected_s2a_taxonomy: "completed" as const,
    verifier_identity:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2,
    verifier_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
  };
  const registry: RecommendationOutcomeEvidenceIssuerRegistryV2 = {
    registry_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2,
    registry_identity:
      "synthetic-recommendation-outcome-evidence-issuer-registry-002",
    issuer: {
      identity: options.conflict_registry
        ? "untrusted-synthetic-issuer"
        : "synthetic-repository-outcome-evidence-issuer-001",
      version: "synthetic-issuer-v2",
      authority_anchor_digest: authorityAnchorDigest,
    },
    epoch: {
      value: options.rollback_epoch ? "7" : "8",
      predecessor_issuance_digest: predecessorDigest,
    },
    trust_root_digest: bundle.external_authority_root_digest,
    issuance_entry: {
      issuance_identity:
        "synthetic-recommendation-outcome-evidence-issuance-008",
      repository_row_identity: completionEntry.repository_row_identity,
      repository_row_digest: sha(
        completionMaterial.observed_repository_row,
      ),
      evidence_bundle_identity: bundle.bundle_identity,
      evidence_bundle_digest: sha(bundle),
      completion_registry_identity:
        completionRegistry.registry_identity,
      completion_registry_digest: sha(completionRegistry),
      verifier_identity:
        RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V2,
      verifier_version:
        RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
    },
    pre_downstream_admission: {
      ...admissionCore,
      admission_digest: sha(admissionCore),
    },
  };
  options.mutate_admission?.(registry.pre_downstream_admission);
  const material: RecommendationOutcomeEvidenceIssuanceMaterialV2 = {
    material_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V2,
    issuer_registry: structuredClone(registry),
    completion_material: structuredClone(completionMaterial),
  };
  const request: RecommendationOutcomeEvidenceIssuanceRequestV2 = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
    issuance_identity: registry.issuance_entry.issuance_identity,
    expected_repository_row_identity:
      registry.issuance_entry.repository_row_identity,
    expected_evidence_bundle_identity:
      registry.issuance_entry.evidence_bundle_identity,
  };
  const anchor:
    RecommendationOutcomeEvidenceIssuerAuthorityV2[
      "expected_issuer_anchor"
    ] = {
      registry_identity: registry.registry_identity,
      registry_version:
        RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V2,
      registry_digest: sha(registry),
      issuer_identity:
        "synthetic-repository-outcome-evidence-issuer-001",
      issuer_version: "synthetic-issuer-v2",
      authority_anchor_digest: authorityAnchorDigest,
      trust_root_digest: bundle.external_authority_root_digest,
      minimum_epoch: "8",
      expected_predecessor_issuance_digest: predecessorDigest,
    };
  let reads = 0;
  const authority: RecommendationOutcomeEvidenceIssuerAuthorityV2 = {
    authority_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V2,
    expected_issuer_anchor: anchor,
    read_issuance_material: () => {
      reads += 1;
      if (options.throw_on_read) {
        throw new Error("synthetic private issuer detail");
      }
      return options.material_override === undefined
        ? structuredClone(material)
        : options.material_override;
    },
  };
  return {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V2,
    predecessor,
    request,
    registry,
    material,
    authority,
    authority_read_count: () => reads,
  };
}

export function reproduceT2001AgainstV1() {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      remove_first_closure: true,
    });
  const result = issueRecommendationOutcomeEvidenceV1(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  return {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
    taxonomy: result.taxonomy,
    downstream_digest_exposed:
      result.s2a_completion_result_digest !== null,
    s2a_completion_result_digest:
      result.s2a_completion_result_digest,
  };
}

export function buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2() {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2();
  const issuance = issueRecommendationOutcomeEvidenceV2(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  const completionMaterial =
    completionMaterialFromIssuedEvidenceV2(issuance);
  if (!completionMaterial) throw new Error("synthetic_t2a_not_issued");

  // The predecessor helper exercises the unchanged S.2A → R.2 → Q.1 →
  // P.2A → O.2A chain. Equality of the completion-material digest proves
  // that V2 hands the exact same verified payload to that chain.
  const downstream =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV1();
  const predecessorMaterial =
    downstream.issuance.issuance_envelope?.completion_material;
  if (
    !predecessorMaterial ||
    sha(completionMaterial) !== sha(predecessorMaterial)
  ) throw new Error("synthetic_t2a_completion_material_drift");
  return {
    issuance,
    completion_material_digest: sha(completionMaterial),
    predecessor_completion_material_digest: sha(predecessorMaterial),
    completion: downstream.completion,
    projection: downstream.projection,
    q1_admission: downstream.q1_admission,
    p2a_capture: downstream.p2a_capture,
    o2a_join: downstream.o2a_join,
  };
}

function matrixCase(
  id: string,
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2
  >,
  enabled = true,
  killSwitch = false,
) {
  const steps: string[] = [];
  const result = issueRecommendationOutcomeEvidenceV2(
    fixture.request,
    {
      enabled,
      kill_switch: killSwitch,
      authority: fixture.authority,
      observe_downstream_step: (step) => steps.push(step),
    },
  );
  return {
    id,
    taxonomy: result.taxonomy,
    reason_codes: result.reason_codes,
    downstream_activity: result.downstream_activity,
    downstream_steps: steps,
    s2a_result_field_present:
      "s2a_completion_result_digest" in result,
    failure_identity_digest: result.failure_identity_digest,
    issuance_digest:
      result.issuance_envelope?.issuance_digest ?? null,
    result_digest: result.result_digest,
  };
}

export function buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV2(
  options: { reverse_input_order?: boolean } = {},
) {
  const fixtures: Array<
    [
      string,
      ReturnType<
        typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2
      >,
    ]
  > = [
    [
      "issued_all_eighteen_gap_evidence",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2(),
    ],
    [
      "issued_reordered_closure_set",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        reverse_closure_order: true,
      }),
    ],
    [
      "incomplete_missing_closure",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        remove_first_closure: true,
      }),
    ],
    [
      "conflicting_issuer_registry",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        conflict_registry: true,
      }),
    ],
    [
      "conflicting_epoch_rollback",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        rollback_epoch: true,
      }),
    ],
    [
      "conflicting_admission_attestation",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        mutate_admission: (admission) => {
          admission.completion_material_digest = "a".repeat(64);
        },
      }),
    ],
    [
      "not_point_in_time_safe",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        unsafe_source_instant: true,
      }),
    ],
    [
      "unmappable_material",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        material_override: ["not-an-issuance-material"],
      }),
    ],
    [
      "failure_collision_a",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        row_suffix: "failure-a",
        conflict_registry: true,
      }),
    ],
    [
      "failure_collision_b",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        row_suffix: "failure-b",
        conflict_registry: true,
      }),
    ],
  ];
  if (options.reverse_input_order) fixtures.reverse();
  const scenarios = fixtures.map(([id, fixture]) =>
    matrixCase(id, fixture)
  );
  scenarios.push(
    matrixCase(
      "disabled_zero_work",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2(),
      false,
      false,
    ),
    matrixCase(
      "kill_switch_zero_work",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2(),
      true,
      true,
    ),
  );
  scenarios.sort((left, right) => left.id.localeCompare(right.id));
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2();
  const material = {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V2,
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
    synthetic_only: true,
    real_outcome_source_accessed: false,
    scenario_count: scenarios.length,
    taxonomy_counts: Object.fromEntries(
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V2.map(
        (taxonomy) => [
          taxonomy,
          scenarios.filter((scenario) =>
            scenario.taxonomy === taxonomy
          ).length,
        ],
      ),
    ),
    scenarios,
    t2_001_predecessor_reproduction: reproduceT2001AgainstV1(),
    interop: {
      issuance_taxonomy: interop.issuance.taxonomy,
      completion_taxonomy: interop.completion.taxonomy,
      projection_taxonomy: interop.projection.taxonomy,
      q1_admission_taxonomy: interop.q1_admission.taxonomy,
      p2a_capture_taxonomy: interop.p2a_capture.taxonomy,
      o2a_join_taxonomy: interop.o2a_join.taxonomy,
    },
  };
  return {
    ...material,
    result_digest: sha(material),
  };
}
