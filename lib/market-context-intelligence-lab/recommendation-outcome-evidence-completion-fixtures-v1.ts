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
  canonicalizeDiagnosticOutcomeAuthorityPlainDataV2,
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
  RECOMMENDATION_OUTCOME_PROJECTION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_SUCCESSOR_V1,
  RECOMMENDATION_OUTCOME_PROJECTION_VERIFIER_V1,
  computeRecommendationOutcomeProjectionDigestV1,
  projectRepositoryOwnedRecommendationOutcomeV1,
  type RecommendationOutcomeProjectionInputV1,
  type RecommendationOutcomeProjectionMaterialV1,
  type RecommendationOutcomeProjectionRegistryV1,
  type RecommendationOutcomeProjectionRequestV1,
} from "./recommendation-outcome-projection-successor-v1";
import {
  createSyntheticCurrentRecommendationOutcomeRowV1,
  createSyntheticRecommendationOutcomeProjectionFixtureV1,
} from "./recommendation-outcome-projection-successor-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUNDLE_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1,
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
  completeRepositoryOwnedRecommendationOutcomeEvidenceV1,
  computeRecommendationOutcomeEvidenceBundleDigestV1,
  computeRecommendationOutcomeEvidenceLineageRootV1,
  type RecommendationOutcomeEvidenceAuthorityV1,
  type RecommendationOutcomeEvidenceBundleV1,
  type RecommendationOutcomeEvidenceCompletionRequestV1,
  type RecommendationOutcomeEvidenceMaterialV1,
  type RecommendationOutcomeEvidenceRegistryV1,
} from "./recommendation-outcome-evidence-completion-v1";

export const RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_FIXTURES_V1 =
  "repository_owned_recommendation_outcome_evidence_completion_fixtures_v1" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

const observedDigest = (value: unknown) => {
  const canonical = canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(value);
  return canonical.ok
    ? sha(canonical.value)
    : canonical.sanitized_projection_digest;
};

export type SyntheticRecommendationOutcomeEvidenceCompletionOptionsV1 = {
  row_suffix?: string;
  observed_row_override?: unknown;
  observed_bundle_override?: unknown;
  mutate_bundle?: (
    bundle: RecommendationOutcomeEvidenceBundleV1,
  ) => void;
  recompute_bundle_after_mutation?: boolean;
  mutate_registry?: (
    registry: RecommendationOutcomeEvidenceRegistryV1,
  ) => void;
  mutate_material?: (
    material: RecommendationOutcomeEvidenceMaterialV1,
  ) => void;
  mutate_request?: (
    request: RecommendationOutcomeEvidenceCompletionRequestV1,
  ) => void;
  anchor_override?: Partial<
    RecommendationOutcomeEvidenceAuthorityV1["expected_registry_anchor"]
  >;
  material_override?: unknown;
  throw_on_read?: boolean;
};

function refreshProjectionDigest(
  projection: RecommendationOutcomeProjectionInputV1,
) {
  projection.read_only_projection.projection_digest =
    computeRecommendationOutcomeProjectionDigestV1(projection);
}

export function refreshSyntheticRecommendationOutcomeEvidenceBundleV1(
  bundle: RecommendationOutcomeEvidenceBundleV1,
) {
  refreshProjectionDigest(bundle.completed_projection);
  bundle.q1_interop_digest = sha(bundle.completed_projection.q1_interop);
  bundle.lineage_root_digest =
    computeRecommendationOutcomeEvidenceLineageRootV1(bundle);
  bundle.bundle_digest =
    computeRecommendationOutcomeEvidenceBundleDigestV1(bundle);
}

function buildSyntheticBundle(
  row: ReturnType<typeof createSyntheticCurrentRecommendationOutcomeRowV1>,
  projection: RecommendationOutcomeProjectionInputV1,
) {
  const rowDigest = sha(row);
  const closures = RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1.map(
    (gapCode) => ({
      gap_code: gapCode,
      evidence_identity: `synthetic-evidence:${gapCode}`,
      evidence_digest: sha({
        gap_code: gapCode,
        repository_row_digest: rowDigest,
        projection_identity: projection.read_only_projection.identity,
      }),
      verifier_identity:
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1,
      verifier_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
    }),
  );
  const bundle: RecommendationOutcomeEvidenceBundleV1 = {
    bundle_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_BUNDLE_V1,
    bundle_identity: "synthetic-recommendation-outcome-evidence-bundle-001",
    repository_row_identity: row.id,
    repository_row_digest: rowDigest,
    original_not_bindable_gap_codes: [
      ...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
    ],
    gap_closures: closures,
    external_authority_root_digest:
      projection.external_authority_root_digest,
    source_snapshot: structuredClone(projection.source_snapshot),
    producer: {
      owner_identity: projection.producer_owner.identity,
      owner_version: projection.producer_owner.version,
      schema_version: projection.source_contract.schema_version,
      contract_version: projection.source_contract.contract_version,
    },
    decision: structuredClone(projection.decision),
    opportunity_set: structuredClone(projection.opportunity_set),
    model: {
      identity: "synthetic-recommendation-model-001",
      version: "synthetic-recommendation-model-v1",
      lineage_digest:
        projection.point_in_time.predictor_projection_digest,
    },
    evaluator: {
      identity: projection.outcome.evaluator_identity,
      version: projection.outcome.evaluator_version,
      lineage_digest: projection.lineage.evaluator_lineage_digest,
    },
    outcome: {
      identity: projection.outcome.identity,
      lineage_digest: projection.lineage.outcome_lineage_digest,
    },
    explanation: {
      identity: "synthetic-recommendation-explanation-001",
      version: "synthetic-recommendation-explanation-v1",
      lineage_digest: projection.lineage.context_lineage_digest,
    },
    lineage: {
      identity: projection.lineage.identity,
      source_lineage_digest: projection.lineage.source_lineage_digest,
      provider_source: projection.lineage.provider_source,
      provider_version: projection.lineage.provider_version,
    },
    instants: {
      decision_unix_ns: projection.instants.decision_unix_ns,
      outcome_start_unix_ns: projection.instants.outcome_start_unix_ns,
      outcome_end_unix_ns: projection.instants.outcome_end_unix_ns,
      source_unix_ns: projection.instants.outcome_end_unix_ns,
      receive_unix_ns:
        projection.instants.outcome_finalization_unix_ns,
      finalization_unix_ns:
        projection.instants.outcome_finalization_unix_ns,
      evaluation_unix_ns: projection.instants.capture_unix_ns,
      evidence_cutoff_unix_ns:
        projection.instants.evidence_cutoff_unix_ns,
    },
    finality: structuredClone(projection.finality),
    completeness: structuredClone(projection.completeness),
    q1_interop_digest: sha(projection.q1_interop),
    completed_projection: structuredClone(projection),
    lineage_root_digest: "0".repeat(64),
    bundle_digest: "0".repeat(64),
  };
  refreshSyntheticRecommendationOutcomeEvidenceBundleV1(bundle);
  return bundle;
}

export function createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1(
  options: SyntheticRecommendationOutcomeEvidenceCompletionOptionsV1 = {},
) {
  const row = createSyntheticCurrentRecommendationOutcomeRowV1(
    options.row_suffix,
  );
  const projectionFixture =
    createSyntheticRecommendationOutcomeProjectionFixtureV1();
  const projection = structuredClone(
    projectionFixture.observed_input,
  ) as RecommendationOutcomeProjectionInputV1;
  const bundle = buildSyntheticBundle(row, projection);
  const pristineTrustRoot = bundle.external_authority_root_digest;
  const pristineLineageRoot = bundle.lineage_root_digest;
  options.mutate_bundle?.(bundle);
  if (options.recompute_bundle_after_mutation) {
    refreshSyntheticRecommendationOutcomeEvidenceBundleV1(bundle);
  }
  const observedRow = options.observed_row_override ?? structuredClone(row);
  const observedBundle =
    options.observed_bundle_override ?? structuredClone(bundle);
  const registry: RecommendationOutcomeEvidenceRegistryV1 = {
    registry_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1,
    registry_identity: "synthetic-recommendation-outcome-evidence-registry-001",
    expected_trust_root_digest: bundle.external_authority_root_digest,
    completion_entry: {
      completion_identity: "synthetic-recommendation-outcome-completion-001",
      repository_row_identity: row.id,
      repository_row_digest: observedDigest(observedRow),
      evidence_bundle_identity: bundle.bundle_identity,
      evidence_bundle_digest: observedDigest(observedBundle),
      lineage_root_digest: bundle.lineage_root_digest,
      verifier_identity:
        RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_VERIFIER_V1,
      verifier_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
    },
  };
  options.mutate_registry?.(registry);
  const material: RecommendationOutcomeEvidenceMaterialV1 = {
    material_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_MATERIAL_V1,
    registry: structuredClone(registry),
    observed_repository_row: structuredClone(observedRow),
    observed_evidence_bundle: structuredClone(observedBundle),
  };
  options.mutate_material?.(material);
  const request: RecommendationOutcomeEvidenceCompletionRequestV1 = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V1,
    completion_identity: registry.completion_entry.completion_identity,
    expected_repository_row_identity:
      registry.completion_entry.repository_row_identity,
    expected_evidence_bundle_identity:
      registry.completion_entry.evidence_bundle_identity,
  };
  options.mutate_request?.(request);
  const anchor = {
    registry_identity: registry.registry_identity,
    registry_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_REGISTRY_V1,
    registry_digest: sha(registry),
    expected_trust_root_digest: pristineTrustRoot,
    expected_lineage_root_digest: pristineLineageRoot,
    ...options.anchor_override,
  };
  let authorityReadCount = 0;
  const authority: RecommendationOutcomeEvidenceAuthorityV1 = {
    authority_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V1,
    expected_registry_anchor: anchor,
    read_completion_material: () => {
      authorityReadCount += 1;
      if (options.throw_on_read) {
        throw new Error("synthetic private completion source detail");
      }
      return structuredClone(options.material_override ?? material);
    },
  };
  return {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_FIXTURES_V1,
    request,
    row,
    projection_fixture: projectionFixture,
    bundle,
    registry,
    material,
    authority,
    authority_read_count: () => authorityReadCount,
  };
}

function r2FixtureForCompletedProjection(
  projection: RecommendationOutcomeProjectionInputV1,
) {
  const base =
    createSyntheticRecommendationOutcomeProjectionFixtureV1();
  const registry: RecommendationOutcomeProjectionRegistryV1 = {
    registry_version: RECOMMENDATION_OUTCOME_PROJECTION_REGISTRY_V1,
    registry_identity: "synthetic-s1-to-r2-registry-001",
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

export function buildSyntheticRecommendationOutcomeEvidenceCompletionInteropV1() {
  const completionFixture =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const completion =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
      completionFixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: completionFixture.authority,
      },
    );
  if (!completion.completed_projection) {
    throw new Error("synthetic_completion_not_completed");
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
    throw new Error("synthetic_completion_r2_not_bindable");
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
    throw new Error("synthetic_completion_q1_not_ready");
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
  if (!capture.bundle) {
    throw new Error("synthetic_completion_p2a_not_captured");
  }
  const context = createSyntheticContextOutcomeJoinFixtureV1();
  const outcomeHandoff = capture.bundle.outcome_handoff;
  const o2aRegistry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity: "synthetic-s1-to-o2a-registry-001",
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
    external_join_id: "synthetic-s1-to-o2a-join-001",
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
    typeof createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1
  >,
  enabled = true,
  killSwitch = false,
) {
  const result =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
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
    result_digest: result.result_digest,
  };
}

function missingGapFixture(gapCode: string) {
  return createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
    mutate_bundle: (bundle) => {
      bundle.gap_closures = bundle.gap_closures.filter(
        (closure) => closure.gap_code !== gapCode,
      );
    },
    recompute_bundle_after_mutation: true,
  });
}

export function buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV1(
  options: { reverse_input_order?: boolean } = {},
) {
  const fixtures: Array<
    [
      string,
      ReturnType<
        typeof createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1
      >,
    ]
  > = [
    [
      "completed_all_eighteen_gaps",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1(),
    ],
    ...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1.map(
      (gapCode) =>
        [`incomplete:${gapCode}`, missingGapFixture(gapCode)] as [
          string,
          ReturnType<
            typeof createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1
          >,
        ],
    ),
    [
      "conflicting_trust_root",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
        mutate_registry: (registry) => {
          registry.expected_trust_root_digest = "a".repeat(64);
        },
      }),
    ],
    [
      "conflicting_lineage",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
        mutate_bundle: (bundle) => {
          bundle.model.lineage_digest = "b".repeat(64);
          bundle.completed_projection.point_in_time.predictor_projection_digest =
            "b".repeat(64);
        },
        recompute_bundle_after_mutation: true,
      }),
    ],
    [
      "not_point_in_time_safe",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
        mutate_bundle: (bundle) => {
          bundle.instants.source_unix_ns =
            bundle.instants.decision_unix_ns;
        },
        recompute_bundle_after_mutation: true,
      }),
    ],
    [
      "unmappable_bundle",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
        observed_bundle_override: ["unsupported"],
      }),
    ],
    [
      "failure_collision_a",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
        row_suffix: "collision-a",
        mutate_bundle: (bundle) => {
          bundle.gap_closures = bundle.gap_closures.slice(1);
        },
        recompute_bundle_after_mutation: true,
      }),
    ],
    [
      "failure_collision_b",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1({
        row_suffix: "collision-b",
        mutate_bundle: (bundle) => {
          bundle.gap_closures = bundle.gap_closures.slice(1);
        },
        recompute_bundle_after_mutation: true,
      }),
    ],
  ];
  const cases = fixtures.map(([id, fixture]) => matrixCase(id, fixture));
  cases.push(
    matrixCase(
      "disabled_zero_work",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1(),
      false,
      false,
    ),
    matrixCase(
      "kill_switch_zero_work",
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1(),
      true,
      true,
    ),
  );
  if (options.reverse_input_order) cases.reverse();
  cases.sort((left, right) => left.id.localeCompare(right.id));
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceCompletionInteropV1();
  const material = {
    fixture_version:
      RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_FIXTURES_V1,
    synthetic_only: true,
    real_outcome_source_accessed: false,
    real_outcome_capture_performed: false,
    real_outcome_join_performed: false,
    case_count: cases.length,
    cases,
    taxonomy_counts: Object.fromEntries(
      [
        "completed",
        "incomplete",
        "conflicting",
        "not_point_in_time_safe",
        "unmappable",
      ].map((taxonomy) => [
        taxonomy,
        cases.filter((item) => item.taxonomy === taxonomy).length,
      ]),
    ),
    interop: {
      completion_taxonomy: interop.completion.taxonomy,
      projection_taxonomy: interop.projection.taxonomy,
      q1_admission_taxonomy: interop.q1_admission.taxonomy,
      p2a_capture_taxonomy: interop.p2a_capture.taxonomy,
      o2a_join_taxonomy: interop.o2a_join.taxonomy,
    },
  };
  return {
    ...material,
    matrix_digest: sha(material),
  };
}
