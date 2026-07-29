import {
  parseDatabentoExplicitNanosecondInstantV1,
} from "./databento-explicit-nanosecond-instant-v1";
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
  type DiagnosticOutcomeAuthorityMaterialV2,
} from "./diagnostic-decision-outcome-handoff-capture-v2";
import {
  createSyntheticDiagnosticCaptureFixtureV2,
  type SyntheticDiagnosticCaptureFixtureOptionsV2,
} from "./diagnostic-decision-outcome-handoff-capture-fixtures-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_MATERIAL_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_PAYLOAD_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_VERIFIER_V1,
  admitMarketContextDiagnosticOutcomeSourceBatchV1,
  admitMarketContextDiagnosticOutcomeSourceV1,
  type MarketContextDiagnosticOutcomeSourceAdmissionRequestV1,
  type MarketContextDiagnosticOutcomeSourceAuthorityV1,
  type MarketContextDiagnosticOutcomeSourceMaterialV1,
  type MarketContextDiagnosticOutcomeSourcePayloadV1,
  type MarketContextDiagnosticOutcomeSourceRegistryV1,
} from "./diagnostic-outcome-source-admission-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_FIXTURES_V1 =
  "market_context_diagnostic_outcome_source_fixtures_v1" as const;

const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

function unixNs(value: unknown) {
  const parsed = parseDatabentoExplicitNanosecondInstantV1(
    value,
    "synthetic_outcome_source_fixture",
  );
  if (!parsed.ok) throw new Error("synthetic_fixture_instant_invalid");
  return parsed.unix_nanoseconds;
}

function sortedMembershipDigest(material: DiagnosticOutcomeAuthorityMaterialV2) {
  const source = material.source_payloads.opportunity_set_source as {
    membership: Array<{ instrument_id: string; ordinal: number }>;
  };
  return sha(
    [...source.membership].sort(
      (left, right) =>
        left.ordinal - right.ordinal ||
        left.instrument_id.localeCompare(right.instrument_id),
    ),
  );
}

export type SyntheticOutcomeSourceAdmissionOptionsV1 = {
  mutate_p2a_payloads?:
    SyntheticDiagnosticCaptureFixtureOptionsV2["mutate_payloads"];
  mutate_source_payload?: (
    payload: MarketContextDiagnosticOutcomeSourcePayloadV1,
  ) => void;
  mutate_registry?: (
    registry: MarketContextDiagnosticOutcomeSourceRegistryV1,
  ) => void;
  mutate_material?: (
    material: MarketContextDiagnosticOutcomeSourceMaterialV1,
  ) => void;
  mutate_request?: (
    request: MarketContextDiagnosticOutcomeSourceAdmissionRequestV1,
  ) => void;
  material_override?: unknown;
  anchor_override?: Partial<
    MarketContextDiagnosticOutcomeSourceAuthorityV1["expected_registry_anchor"]
  >;
  throw_on_read?: boolean;
};

export function createSyntheticOutcomeSourceAdmissionFixtureV1(
  options: SyntheticOutcomeSourceAdmissionOptionsV1 = {},
) {
  const p2a = createSyntheticDiagnosticCaptureFixtureV2({
    mutate_payloads: options.mutate_p2a_payloads,
  });
  const material = p2a.material;
  const decision = material.source_payloads.decision_source as {
    external_decision_id: string;
    instrument_id: string;
    decision_timestamp: string;
    context_snapshot_digest: string;
  };
  const opportunity = material.source_payloads.opportunity_set_source as {
    opportunity_set_identity: string;
  };
  const evaluator = material.source_payloads.evaluator_outcome_source as {
    outcome_identity: string;
    evaluator_identity: string;
    evaluator_version: string;
    outcome_window: {
      start_timestamp: string;
      end_timestamp: string;
    };
    completion: {
      status: string;
      completion_timestamp: string | null;
      evidence_digest: string;
    };
    capture_timestamp: string;
  };
  const provider = material.source_payloads.provider_context_source as {
    provider_source: string;
    provider_version: string;
    evaluator_lineage_digest: string;
    outcome_lineage_digest: string;
  };
  const decisionNs = unixNs(decision.decision_timestamp);
  const outcomeEndNs = unixNs(evaluator.outcome_window.end_timestamp);
  const captureNs = unixNs(evaluator.capture_timestamp);
  const finalizationNs =
    evaluator.completion.completion_timestamp === null
      ? outcomeEndNs
      : unixNs(evaluator.completion.completion_timestamp);
  const sourcePayload: MarketContextDiagnosticOutcomeSourcePayloadV1 = {
    payload_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_PAYLOAD_V1,
    source_identity: "synthetic-admissible-outcome-source-001",
    schema_version: "synthetic_owned_outcome_source_schema_v1",
    contract_version: "synthetic_owned_outcome_source_contract_v1",
    producer: {
      identity: evaluator.evaluator_identity,
      version: evaluator.evaluator_version,
    },
    decision_identity: {
      external_decision_id: decision.external_decision_id,
      instrument_id: decision.instrument_id,
    },
    opportunity_set: {
      identity: opportunity.opportunity_set_identity,
      membership_digest: sortedMembershipDigest(material),
    },
    outcome: {
      identity: evaluator.outcome_identity,
      evaluator_identity: evaluator.evaluator_identity,
      evaluator_version: evaluator.evaluator_version,
    },
    lineage: {
      identity: "synthetic-outcome-lineage-001",
      provider_source: provider.provider_source,
      provider_version: provider.provider_version,
      evaluator_lineage_digest: provider.evaluator_lineage_digest,
      outcome_lineage_digest: provider.outcome_lineage_digest,
    },
    instants: {
      decision_unix_ns: decisionNs,
      outcome_start_unix_ns: unixNs(
        evaluator.outcome_window.start_timestamp,
      ),
      outcome_end_unix_ns: outcomeEndNs,
      outcome_finalization_unix_ns: finalizationNs,
      capture_unix_ns: captureNs,
      cutoff_unix_ns: (BigInt(captureNs) + BigInt(1)).toString(),
    },
    finality: {
      status:
        evaluator.completion.status === "completed"
          ? "final"
          : "pending",
      proof_identity: "synthetic-outcome-finality-proof-001",
      proof_digest: evaluator.completion.evidence_digest,
    },
    completeness: {
      status:
        evaluator.completion.status === "completed"
          ? "complete"
          : "incomplete",
      evidence_digest: sha("synthetic-outcome-completeness-evidence"),
    },
    point_in_time: {
      predictor_cutoff_unix_ns: decisionNs,
      context_snapshot_digest: decision.context_snapshot_digest,
      predictor_projection_digest: sha(
        "synthetic-predictor-projection-before-outcome",
      ),
      outcome_visible_to_predictor: false,
    },
    access: {
      mode: "read_only",
      writes_permitted: false,
      persistence_permitted: false,
    },
    p2a_capture_request: structuredClone(p2a.request),
    p2a_registry_anchor: structuredClone(
      p2a.authority.expected_registry_anchor,
    ),
    p2a_authority_material: structuredClone(p2a.material),
  };
  options.mutate_source_payload?.(sourcePayload);
  let registry: MarketContextDiagnosticOutcomeSourceRegistryV1 = {
    registry_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
    registry_identity: "synthetic-owned-outcome-source-registry-001",
    producer: structuredClone(sourcePayload.producer),
    expected_trust_root_digest: sha(
      "synthetic-owned-outcome-source-trust-root",
    ),
    validity: {
      effective_from_unix_ns: (
        BigInt(decisionNs) - BigInt(86_400_000_000_000)
      ).toString(),
      effective_until_unix_ns: (
        BigInt(decisionNs) + BigInt(172_800_000_000_000)
      ).toString(),
    },
    source: {
      namespace: "diagnostic_outcome_source",
      schema_version: sourcePayload.schema_version,
      contract_version: sourcePayload.contract_version,
      payload_identity: sourcePayload.source_identity,
      payload_digest: sha(sourcePayload),
      verifier_identity:
        MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_VERIFIER_V1,
      verifier_version:
        MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
    },
  };
  if (options.mutate_registry) {
    const mutable = structuredClone(registry);
    options.mutate_registry(mutable);
    registry = mutable;
  }
  const observedMaterial: MarketContextDiagnosticOutcomeSourceMaterialV1 = {
    material_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_MATERIAL_V1,
    registry: structuredClone(registry),
    observed_source_payload: structuredClone(sourcePayload),
  };
  options.mutate_material?.(observedMaterial);
  const request: MarketContextDiagnosticOutcomeSourceAdmissionRequestV1 = {
    contract_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
    admission_identity: "synthetic-outcome-source-admission-001",
    expected_source_identity: sourcePayload.source_identity,
    period: "synthetic-period-2026-01",
    cohort: "synthetic-cohort-a",
  };
  options.mutate_request?.(request);
  const anchor = {
    registry_identity: registry.registry_identity,
    registry_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
    registry_digest: sha(registry),
    ...options.anchor_override,
  };
  let authorityReadCount = 0;
  const authority: MarketContextDiagnosticOutcomeSourceAuthorityV1 = {
    authority_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
    expected_registry_anchor: anchor,
    read_admission_material: () => {
      authorityReadCount += 1;
      if (options.throw_on_read) {
        throw new Error("synthetic private source detail");
      }
      return structuredClone(
        options.material_override ?? observedMaterial,
      );
    },
  };
  return {
    fixture_version: MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_FIXTURES_V1,
    request,
    source_payload: sourcePayload,
    registry,
    material: observedMaterial,
    authority,
    authority_read_count: () => authorityReadCount,
  };
}

export function buildSyntheticOutcomeSourceP2AO2AInteropV1() {
  const fixture = createSyntheticOutcomeSourceAdmissionFixtureV1();
  const admission = admitMarketContextDiagnosticOutcomeSourceV1(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  if (!admission.ready_handoff) {
    throw new Error("synthetic_outcome_source_not_ready");
  }
  const p2aHandoff = admission.ready_handoff;
  const capture = captureDiagnosticDecisionOutcomeHandoffV2(
    p2aHandoff.p2a_capture_request,
    {
      enabled: true,
      kill_switch: false,
      authority: {
        authority_version: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
        expected_registry_anchor:
          p2aHandoff.p2a_authority.expected_registry_anchor,
        read_capture_material: () =>
          structuredClone(
            p2aHandoff.p2a_authority.authority_material,
          ),
      },
    },
  );
  if (!capture.bundle) {
    throw new Error("synthetic_outcome_source_p2a_capture_failed");
  }
  const context = createSyntheticContextOutcomeJoinFixtureV1();
  const outcomeHandoff = capture.bundle.outcome_handoff;
  const o2aRegistry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity:
        "synthetic-q1-to-o2a-authority-registry-v1",
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
    external_join_id: "synthetic-q1-to-o2a-join-001",
    context_snapshot_identity: context.context_handoff.snapshot_identity,
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
    admission,
    capture,
    joined,
  };
}

function matrixCase(
  id: string,
  fixture: ReturnType<
    typeof createSyntheticOutcomeSourceAdmissionFixtureV1
  >,
  enabled = true,
  killSwitch = false,
) {
  const result = admitMarketContextDiagnosticOutcomeSourceV1(
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
    registry_disposition:
      result.observed_input_provenance.sections.find(
        (entry) => entry.namespace === "source_registry",
      )?.disposition ?? null,
    payload_disposition:
      result.observed_input_provenance.sections.find(
        (entry) => entry.namespace === "source_payload",
      )?.disposition ?? null,
    failure_identity_digest: result.failure_identity_digest,
    result_digest: result.result_digest,
  };
}

export function buildSyntheticOutcomeSourceAdmissionGoldenMatrixV1(
  options: { reverse_input_order?: boolean } = {},
) {
  const fixtures = [
    ["admissible_ready", createSyntheticOutcomeSourceAdmissionFixtureV1()],
    [
      "missing_incomplete_outcome",
      createSyntheticOutcomeSourceAdmissionFixtureV1({
        mutate_p2a_payloads: (payloads) => {
          const completion = payloads.evaluator_outcome_source
            .completion as {
              status: string;
              completion_timestamp: string | null;
            };
          completion.status = "pending";
          completion.completion_timestamp = null;
        },
      }),
    ],
    [
      "conflicting_source_binding",
      createSyntheticOutcomeSourceAdmissionFixtureV1({
        mutate_material: (material) => {
          material.observed_source_payload.source_identity =
            "synthetic-source-binding-conflict";
        },
      }),
    ],
    [
      "registry_drift",
      createSyntheticOutcomeSourceAdmissionFixtureV1({
        anchor_override: {
          registry_digest: sha("synthetic-registry-drift"),
        },
      }),
    ],
    [
      "opportunity_membership_drift",
      createSyntheticOutcomeSourceAdmissionFixtureV1({
        mutate_source_payload: (payload) => {
          payload.opportunity_set.membership_digest = sha(
            "synthetic-membership-drift",
          );
        },
      }),
    ],
    [
      "evaluator_outcome_lineage_drift",
      createSyntheticOutcomeSourceAdmissionFixtureV1({
        mutate_source_payload: (payload) => {
          payload.lineage.outcome_lineage_digest = sha(
            "synthetic-lineage-drift",
          );
        },
      }),
    ],
    [
      "outcome_at_forbidden_boundary",
      createSyntheticOutcomeSourceAdmissionFixtureV1({
        mutate_source_payload: (payload) => {
          payload.instants.outcome_start_unix_ns =
            payload.instants.decision_unix_ns;
        },
      }),
    ],
    [
      "unfinalized_outcome",
      createSyntheticOutcomeSourceAdmissionFixtureV1({
        mutate_source_payload: (payload) => {
          payload.finality.status = "pending";
        },
      }),
    ],
    [
      "failure_collision_a",
      createSyntheticOutcomeSourceAdmissionFixtureV1({
        mutate_material: (material) => {
          material.observed_source_payload.source_identity =
            "synthetic-rejected-source-a";
        },
      }),
    ],
    [
      "failure_collision_b",
      createSyntheticOutcomeSourceAdmissionFixtureV1({
        mutate_material: (material) => {
          material.observed_source_payload.source_identity =
            "synthetic-rejected-source-b";
        },
      }),
    ],
  ] as const;
  const cases = fixtures.map(([id, fixture]) => matrixCase(id, fixture));
  cases.push(
    matrixCase(
      "disabled_zero_work",
      createSyntheticOutcomeSourceAdmissionFixtureV1(),
      false,
      false,
    ),
    matrixCase(
      "kill_switch_zero_work",
      createSyntheticOutcomeSourceAdmissionFixtureV1(),
      true,
      true,
    ),
  );
  if (options.reverse_input_order) cases.reverse();
  cases.sort((left, right) => left.id.localeCompare(right.id));
  const duplicateFixture =
    createSyntheticOutcomeSourceAdmissionFixtureV1();
  const duplicate = admitMarketContextDiagnosticOutcomeSourceBatchV1(
    [duplicateFixture.request, duplicateFixture.request],
    {
      enabled: true,
      kill_switch: false,
      authority: duplicateFixture.authority,
    },
  );
  const interop = buildSyntheticOutcomeSourceP2AO2AInteropV1();
  const material = {
    fixture_version: MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_FIXTURES_V1,
    case_count: cases.length,
    cases,
    duplicate_identity_taxonomies: duplicate.map(
      (entry) => entry.taxonomy,
    ),
    duplicate_identity_reason_codes: duplicate.map(
      (entry) => entry.reason_codes,
    ),
    interop: {
      admission_taxonomy: interop.admission.taxonomy,
      p2a_capture_taxonomy: interop.capture.taxonomy,
      o2a_join_taxonomy: interop.joined.taxonomy,
      predictor_digest:
        interop.joined.predictor_projection?.predictor_digest ?? null,
      label_digest:
        interop.joined.label_projection?.label_digest ?? null,
    },
  };
  return {
    ...material,
    matrix_digest: sha(material),
  };
}
