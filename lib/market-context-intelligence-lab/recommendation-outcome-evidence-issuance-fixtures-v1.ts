import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
  createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
  type MarketContextDiagnosticContextOutcomeAuthorityV1,
  type MarketContextDiagnosticContextOutcomeJoinRequestV1,
} from "./diagnostic-context-outcome-join-v1";
import {
  createSyntheticContextOutcomeJoinFixtureV1,
} from "./diagnostic-context-outcome-join-fixtures-v1";
import {
  createMarketContextDiagnosticContextOutcomeJoinV2,
} from "./diagnostic-context-outcome-join-v2";
import {
  DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
  captureDiagnosticDecisionOutcomeHandoffV2,
} from "./diagnostic-decision-outcome-handoff-capture-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_MATERIAL_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_VERIFIER_V1,
  admitMarketContextDiagnosticOutcomeSourceV1,
  type MarketContextDiagnosticOutcomeSourceAuthorityV1,
  type MarketContextDiagnosticOutcomeSourceMaterialV1,
  type MarketContextDiagnosticOutcomeSourceRegistryV1,
} from "./diagnostic-outcome-source-admission-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
  completeRepositoryOwnedRecommendationOutcomeEvidenceV2,
} from "./recommendation-outcome-evidence-completion-v2";
import type {
  RecommendationOutcomeEvidenceMaterialV1,
} from "./recommendation-outcome-evidence-completion-v1";
import {
  createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2,
} from "./recommendation-outcome-evidence-completion-fixtures-v2";
import {
  refreshSyntheticRecommendationOutcomeEvidenceBundleV1,
} from "./recommendation-outcome-evidence-completion-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
  projectRepositoryOwnedRecommendationOutcomeV1,
  type RecommendationOutcomeProjectionInputV1,
  type RecommendationOutcomeProjectionMaterialV1,
  type RecommendationOutcomeProjectionRegistryV1,
  type RecommendationOutcomeProjectionRequestV1,
} from "./recommendation-outcome-projection-successor-v1";
import {
  createSyntheticRecommendationOutcomeProjectionFixtureV1,
} from "./recommendation-outcome-projection-successor-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V1,
  completionMaterialFromIssuedEvidenceV1,
  issueRecommendationOutcomeEvidenceV1,
  type RecommendationOutcomeEvidenceIssuanceMaterialV1,
  type RecommendationOutcomeEvidenceIssuanceRequestV1,
  type RecommendationOutcomeEvidenceIssuerAuthorityV1,
  type RecommendationOutcomeEvidenceIssuerRegistryV1,
} from "./recommendation-outcome-evidence-issuance-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V1 =
  "repository_owned_recommendation_outcome_evidence_issuance_fixtures_v1" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

export type SyntheticRecommendationOutcomeEvidenceIssuanceOptionsV1 = {
  row_suffix?: string;
  reverse_closure_order?: boolean;
  remove_first_closure?: boolean;
  unsafe_source_instant?: boolean;
  mutate_registry?: (
    registry: RecommendationOutcomeEvidenceIssuerRegistryV1,
  ) => void;
  reanchor_after_registry_mutation?: boolean;
  mutate_material?: (
    material: RecommendationOutcomeEvidenceIssuanceMaterialV1,
  ) => void;
  mutate_anchor_before_read?: (
    anchor: RecommendationOutcomeEvidenceIssuerAuthorityV1[
      "expected_issuer_anchor"
    ],
  ) => void;
  mutate_anchor_during_read?: (
    anchor: RecommendationOutcomeEvidenceIssuerAuthorityV1[
      "expected_issuer_anchor"
    ],
  ) => void;
  material_override?: unknown;
  throw_on_read?: boolean;
};

export function createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1(
  options: SyntheticRecommendationOutcomeEvidenceIssuanceOptionsV1 = {},
) {
  const completionFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      row_suffix: options.row_suffix,
      reverse_closure_order: options.reverse_closure_order,
      remove_gap_code: options.remove_first_closure
        ? "completeness_proof_missing"
        : undefined,
    });
  const completionMaterial = structuredClone(
    completionFixture.material,
  ) as unknown as RecommendationOutcomeEvidenceMaterialV1;
  const completionRegistry = completionMaterial.registry;
  const completionEntry = completionRegistry.completion_entry;
  const bundle = completionMaterial.observed_evidence_bundle as {
    bundle_identity: string;
    external_authority_root_digest: string;
    instants: Record<string, string>;
  };
  if (options.unsafe_source_instant) {
    bundle.instants.source_unix_ns = bundle.instants.decision_unix_ns;
    refreshSyntheticRecommendationOutcomeEvidenceBundleV1(
      bundle as never,
    );
    completionEntry.evidence_bundle_digest = sha(bundle);
  }
  const canonicalBundle = structuredClone(bundle) as typeof bundle & {
    gap_closures?: Array<{
      gap_code: string;
      evidence_identity: string;
      evidence_digest: string;
    }>;
  };
  canonicalBundle.gap_closures?.sort((left, right) =>
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
  const authorityAnchorDigest = sha({
    issuer: "synthetic-repository-outcome-evidence-issuer-001",
    version: "synthetic-issuer-v1",
    policy: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
  });
  const predecessorDigest = sha({
    issuance: "synthetic-predecessor-issuance-006",
    epoch: "6",
  });
  const registry: RecommendationOutcomeEvidenceIssuerRegistryV1 = {
    registry_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V1,
    registry_identity:
      "synthetic-recommendation-outcome-evidence-issuer-registry-001",
    issuer: {
      identity: "synthetic-repository-outcome-evidence-issuer-001",
      version: "synthetic-issuer-v1",
      authority_anchor_digest: authorityAnchorDigest,
    },
    epoch: {
      value: "7",
      predecessor_issuance_digest: predecessorDigest,
    },
    trust_root_digest: bundle.external_authority_root_digest,
    issuance_entry: {
      issuance_identity:
        "synthetic-recommendation-outcome-evidence-issuance-007",
      repository_row_identity: completionEntry.repository_row_identity,
      repository_row_digest: sha(
        completionMaterial.observed_repository_row,
      ),
      evidence_bundle_identity: bundle.bundle_identity,
      evidence_bundle_digest: sha(canonicalBundle),
      completion_registry_identity:
        completionRegistry.registry_identity,
      completion_registry_digest: sha(completionRegistry),
      verifier_identity:
        RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_VERIFIER_V1,
      verifier_version:
        RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
    },
  };
  const pristineRegistryDigest = sha(registry);
  options.mutate_registry?.(registry);
  const material: RecommendationOutcomeEvidenceIssuanceMaterialV1 = {
    material_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_MATERIAL_V1,
    issuer_registry: structuredClone(registry),
    completion_material: structuredClone(completionMaterial),
  };
  options.mutate_material?.(material);
  const request: RecommendationOutcomeEvidenceIssuanceRequestV1 = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
    issuance_identity: registry.issuance_entry.issuance_identity,
    expected_repository_row_identity:
      registry.issuance_entry.repository_row_identity,
    expected_evidence_bundle_identity:
      registry.issuance_entry.evidence_bundle_identity,
  };
  const anchor:
    RecommendationOutcomeEvidenceIssuerAuthorityV1[
      "expected_issuer_anchor"
    ] = {
      registry_identity: registry.registry_identity,
      registry_version:
        RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_REGISTRY_V1,
      registry_digest: options.reanchor_after_registry_mutation
        ? sha(registry)
        : pristineRegistryDigest,
      issuer_identity: "synthetic-repository-outcome-evidence-issuer-001",
      issuer_version: "synthetic-issuer-v1",
      authority_anchor_digest: authorityAnchorDigest,
      trust_root_digest: bundle.external_authority_root_digest,
      minimum_epoch: "7",
      expected_predecessor_issuance_digest: predecessorDigest,
    };
  options.mutate_anchor_before_read?.(anchor);
  let reads = 0;
  const authority: RecommendationOutcomeEvidenceIssuerAuthorityV1 = {
    authority_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUER_AUTHORITY_V1,
    expected_issuer_anchor: anchor,
    read_issuance_material: () => {
      reads += 1;
      options.mutate_anchor_during_read?.(anchor);
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
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V1,
    completion_fixture: completionFixture,
    request,
    registry,
    material,
    authority,
    authority_read_count: () => reads,
  };
}

function r2FixtureForCompletedProjection(
  projection: RecommendationOutcomeProjectionInputV1,
) {
  const base =
    createSyntheticRecommendationOutcomeProjectionFixtureV1();
  const registry: RecommendationOutcomeProjectionRegistryV1 = {
    registry_version: RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
    registry_identity: "synthetic-t1-to-r2-registry-001",
    expected_external_authority_root_digest:
      projection.external_authority_root_digest,
    projection_entry: {
      projection_identity: projection.read_only_projection.identity,
      source_snapshot_identity: projection.source_snapshot.identity,
      observed_input_digest: sha(projection),
      verifier_identity: RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
      verifier_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    },
  };
  const material: RecommendationOutcomeProjectionMaterialV1 = {
    material_version: RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1,
    registry,
    observed_projection_input: structuredClone(projection),
  };
  const request: RecommendationOutcomeProjectionRequestV1 = {
    contract_version: RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
    projection_identity: projection.read_only_projection.identity,
    expected_source_snapshot_identity: projection.source_snapshot.identity,
  };
  return {
    base,
    request,
    authority: {
      authority_version: RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
      expected_registry_anchor: {
        registry_identity: registry.registry_identity,
        registry_version: RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
        registry_digest: sha(registry),
      },
      read_projection_material: () => structuredClone(material),
    },
  };
}

function q1AuthorityForProjectedPayload(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeProjectionFixtureV1
  >,
  projectedPayload: NonNullable<
    ReturnType<
      typeof projectRepositoryOwnedRecommendationOutcomeV1
    >["bindable_projection"]
  >["q1_source_payload"],
) {
  const registry: MarketContextDiagnosticOutcomeSourceRegistryV1 = {
    ...structuredClone(fixture.q1_fixture.registry),
    producer: structuredClone(projectedPayload.producer),
    source: {
      namespace: "diagnostic_outcome_source",
      schema_version: projectedPayload.schema_version,
      contract_version: projectedPayload.contract_version,
      payload_identity: projectedPayload.source_identity,
      payload_digest: sha(projectedPayload),
      verifier_identity:
        MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_VERIFIER_V1,
      verifier_version:
        MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
    },
  };
  const material: MarketContextDiagnosticOutcomeSourceMaterialV1 = {
    material_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_MATERIAL_V1,
    registry: structuredClone(registry),
    observed_source_payload: structuredClone(projectedPayload),
  };
  const authority: MarketContextDiagnosticOutcomeSourceAuthorityV1 = {
    authority_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
    expected_registry_anchor: {
      registry_identity: registry.registry_identity,
      registry_version:
        MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
      registry_digest: sha(registry),
    },
    read_admission_material: () => structuredClone(material),
  };
  return authority;
}

export function buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV1() {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1();
  const issuance = issueRecommendationOutcomeEvidenceV1(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  const completionMaterial =
    completionMaterialFromIssuedEvidenceV1(issuance);
  if (!completionMaterial) throw new Error("synthetic_t1_not_issued");
  const completionRegistry = completionMaterial.registry;
  const completionEntry = completionRegistry.completion_entry;
  const completion = completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
    {
      contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
      completion_identity: completionEntry.completion_identity,
      expected_repository_row_identity:
        completionEntry.repository_row_identity,
      expected_evidence_bundle_identity:
        completionEntry.evidence_bundle_identity,
    },
    {
      enabled: true,
      kill_switch: false,
      authority: {
        authority_version:
          RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
        expected_registry_anchor: {
          registry_identity: completionRegistry.registry_identity,
          registry_version: completionRegistry.registry_version,
          registry_digest: sha(completionRegistry),
          expected_trust_root_digest:
            completionRegistry.expected_trust_root_digest,
          expected_lineage_root_digest:
            (completionMaterial.observed_evidence_bundle as {
              lineage_root_digest: string;
            }).lineage_root_digest,
        },
        read_completion_material: () =>
          structuredClone(completionMaterial),
      },
    },
  );
  if (!completion.completed_projection) {
    throw new Error("synthetic_t1_s2a_not_completed");
  }
  const r2Fixture = r2FixtureForCompletedProjection(
    structuredClone(completion.completed_projection),
  );
  const projection = projectRepositoryOwnedRecommendationOutcomeV1(
    r2Fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: r2Fixture.authority,
    },
  );
  if (!projection.bindable_projection) {
    throw new Error("synthetic_t1_r2_not_bindable");
  }
  const q1Admission = admitMarketContextDiagnosticOutcomeSourceV1(
    r2Fixture.base.q1_fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: q1AuthorityForProjectedPayload(
        r2Fixture.base,
        projection.bindable_projection.q1_source_payload,
      ),
    },
  );
  if (!q1Admission.ready_handoff) {
    throw new Error("synthetic_t1_q1_not_ready");
  }
  const capture = captureDiagnosticDecisionOutcomeHandoffV2(
    q1Admission.ready_handoff.p2a_capture_request,
    {
      enabled: true,
      kill_switch: false,
      authority: {
        authority_version: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
        expected_registry_anchor:
          q1Admission.ready_handoff.p2a_authority
            .expected_registry_anchor,
        read_capture_material: () =>
          structuredClone(
            q1Admission.ready_handoff?.p2a_authority.authority_material,
          ),
      },
    },
  );
  if (!capture.bundle) throw new Error("synthetic_t1_p2a_not_captured");
  const context = createSyntheticContextOutcomeJoinFixtureV1();
  const outcomeHandoff = capture.bundle.outcome_handoff;
  const o2aRegistry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity: "synthetic-t1-to-o2a-registry-001",
      context_authority: context.registry.context_authority,
      outcome_authority: {
        ...context.registry.outcome_authority,
        evaluator_version: outcomeHandoff.versions.evaluator,
        evaluator_lineage_digest:
          outcomeHandoff.lineage.evaluator_lineage_digest,
      },
      context_handoff_digests: {
        [context.context_handoff.snapshot_identity]:
          context.context_handoff.handoff_digest,
      },
      outcome_bundle_digests: {
        [outcomeHandoff.outcome_identity]:
          outcomeHandoff.bundle_digest,
      },
    });
  const o2aAuthority: MarketContextDiagnosticContextOutcomeAuthorityV1 = {
    authority_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1,
    expected_registry_anchor: {
      registry_identity: o2aRegistry.registry_identity,
      registry_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
      registry_digest: o2aRegistry.registry_digest,
    },
    read_registry: () => structuredClone(o2aRegistry),
    read_context_handoff: (identity) =>
      identity === context.context_handoff.snapshot_identity
        ? {
            status: "resolved" as const,
            handoff: structuredClone(context.context_handoff),
          }
        : { status: "not_found" as const },
    read_outcome_bundle: (identity) =>
      identity === outcomeHandoff.outcome_identity
        ? {
            status: "resolved" as const,
            bundle: structuredClone(outcomeHandoff),
          }
        : { status: "not_found" as const },
  };
  const o2aRequest: MarketContextDiagnosticContextOutcomeJoinRequestV1 = {
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
    external_join_id: "synthetic-t1-to-o2a-join-001",
    context_snapshot_identity:
      context.context_handoff.snapshot_identity,
    outcome_identity: outcomeHandoff.outcome_identity,
    decision_reference: {
      external_decision_id:
        outcomeHandoff.decision_identity.external_decision_id,
      decision_unix_ns:
        outcomeHandoff.decision_identity.decision_unix_ns,
      instrument_id: outcomeHandoff.decision_identity.instrument_id,
      opportunity_set_identity: outcomeHandoff.opportunity_set.identity,
    },
  };
  const joined = createMarketContextDiagnosticContextOutcomeJoinV2(
    o2aRequest,
    {
      enabled: true,
      kill_switch: false,
      authority: o2aAuthority,
    },
  );
  return {
    issuance,
    completion,
    projection,
    q1_admission: q1Admission,
    p2a_capture: capture,
    o2a_join: joined,
  };
}

function matrixCase(
  id: string,
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1
  >,
  enabled = true,
  killSwitch = false,
) {
  const result = issueRecommendationOutcomeEvidenceV1(
    fixture.request,
    {
      enabled,
      kill_switch: killSwitch,
      authority: fixture.authority,
    },
  );
  return {
    id,
    taxonomy: result.taxonomy,
    reason_codes: result.reason_codes,
    failure_identity_digest: result.failure_identity_digest,
    issuance_digest:
      result.issuance_envelope?.issuance_digest ?? null,
    result_digest: result.result_digest,
  };
}

export function buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV1(
  options: { reverse_input_order?: boolean } = {},
) {
  const fixtures: Array<
    [
      string,
      ReturnType<
        typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1
      >,
    ]
  > = [
    [
      "issued_all_eighteen_gap_evidence",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1(),
    ],
    [
      "issued_reordered_closure_set",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        reverse_closure_order: true,
      }),
    ],
    [
      "incomplete_missing_closure",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        remove_first_closure: true,
      }),
    ],
    [
      "conflicting_issuer_registry",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        mutate_registry: (registry) => {
          registry.issuer.identity = "untrusted-issuer";
        },
      }),
    ],
    [
      "conflicting_epoch_rollback",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        mutate_registry: (registry) => {
          registry.epoch.value = "6";
        },
        reanchor_after_registry_mutation: true,
      }),
    ],
    [
      "conflicting_predecessor",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        mutate_registry: (registry) => {
          registry.epoch.predecessor_issuance_digest = "a".repeat(64);
        },
        reanchor_after_registry_mutation: true,
      }),
    ],
    [
      "not_point_in_time_safe",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        unsafe_source_instant: true,
      }),
    ],
    [
      "unmappable_material",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        material_override: ["not-an-issuance-material"],
      }),
    ],
    [
      "failure_collision_a",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        row_suffix: "failure-a",
        mutate_registry: (registry) => {
          registry.issuer.identity = "invalid-issuer";
        },
      }),
    ],
    [
      "failure_collision_b",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        row_suffix: "failure-b",
        mutate_registry: (registry) => {
          registry.issuer.identity = "invalid-issuer";
        },
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
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1(),
      false,
      false,
    ),
    matrixCase(
      "kill_switch_zero_work",
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1(),
      true,
      true,
    ),
  );
  scenarios.sort((left, right) => left.id.localeCompare(right.id));
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV1();
  const material = {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V1,
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
    synthetic_only: true,
    real_outcome_source_accessed: false,
    scenario_count: scenarios.length,
    taxonomy_counts: Object.fromEntries(
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V1.map(
        (taxonomy) => [
          taxonomy,
          scenarios.filter((scenario) =>
            scenario.taxonomy === taxonomy
          ).length,
        ],
      ),
    ),
    scenarios,
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
