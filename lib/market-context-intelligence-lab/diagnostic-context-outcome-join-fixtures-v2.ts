import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
  createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
} from "./diagnostic-context-outcome-join-v1";
import {
  cloneSyntheticAuthorityWithRegistryV1,
  createSyntheticContextOutcomeJoinFixtureV1,
  rehashSyntheticContextHandoffV1,
} from "./diagnostic-context-outcome-join-fixtures-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2,
  createMarketContextDiagnosticContextOutcomeJoinV2,
} from "./diagnostic-context-outcome-join-v2";
import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_SYNTHETIC_FIXTURES_V2 =
  "market_context_diagnostic_context_outcome_synthetic_fixtures_v2" as const;

export type SyntheticContextOutcomeFixtureV2 =
  ReturnType<typeof createSyntheticContextOutcomeJoinFixtureV1>;

export function authorityWithObservedRegistryV2(
  fixture: SyntheticContextOutcomeFixtureV2,
  registry: unknown,
) {
  return {
    ...fixture.authority,
    read_registry: () => structuredClone(registry),
  };
}

export function authorityWithObservedContextV2(
  fixture: SyntheticContextOutcomeFixtureV2,
  handoffResolution: unknown,
) {
  return {
    ...fixture.authority,
    read_context_handoff: () =>
      structuredClone(handoffResolution) as ReturnType<
        typeof fixture.authority.read_context_handoff
      >,
  };
}

export function authorityWithObservedOutcomeV2(
  fixture: SyntheticContextOutcomeFixtureV2,
  outcomeResolution: unknown,
) {
  return {
    ...fixture.authority,
    read_outcome_bundle: () =>
      structuredClone(outcomeResolution) as ReturnType<
        typeof fixture.authority.read_outcome_bundle
      >,
  };
}

export function createVerifierVersionSubstitutionFixtureV2() {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const changed = structuredClone(fixture.context_handoff);
  changed.snapshot_verifier.version = "substituted-context-verifier-v2";
  const handoff = rehashSyntheticContextHandoffV1(changed);
  const registry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity: fixture.registry.registry_identity,
      context_authority: fixture.registry.context_authority,
      outcome_authority: fixture.registry.outcome_authority,
      context_handoff_digests: {
        ...fixture.registry.context_handoff_digests,
        [fixture.request.context_snapshot_identity]:
          handoff.handoff_digest,
      },
      outcome_bundle_digests:
        fixture.registry.outcome_bundle_digests,
    });
  return {
    ...fixture,
    context_handoff: handoff,
    registry,
    authority: {
      ...fixture.authority,
      expected_registry_anchor: {
        registry_identity: registry.registry_identity,
        registry_version:
          MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
        registry_digest: registry.registry_digest,
      },
      read_registry: () => structuredClone(registry),
      read_context_handoff: () => ({
        status: "resolved" as const,
        handoff: structuredClone(handoff),
      }),
    },
  };
}

function matrixCase(
  id: string,
  fixture: Pick<
    SyntheticContextOutcomeFixtureV2,
    "request" | "authority"
  >,
  authority: SyntheticContextOutcomeFixtureV2["authority"] | undefined,
  request: unknown = fixture.request,
  enabled = true,
  killSwitch = false,
) {
  const result =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      request,
      {
        enabled,
        kill_switch: killSwitch,
        authority,
      },
    );
  return {
    id,
    taxonomy: result.taxonomy,
    reason_codes: result.reason_codes,
    dispositions: Object.fromEntries(
      Object.entries(
        result.observed_input_provenance.sections,
      ).map(([key, section]) => [key, section.disposition]),
    ),
    observed_input_digests: Object.fromEntries(
      Object.entries(
        result.observed_input_provenance.sections,
      ).map(([key, section]) => [
        key,
        section.observed_input_digest,
      ]),
    ),
    failure_identity_digest: result.failure_identity_digest,
    result_digest: result.result_digest,
  };
}

export function buildSyntheticFailureProvenanceGoldenMatrixV2() {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const invalidRegistryA = {
    ...structuredClone(fixture.registry),
    unsupported_marker: "registry-a",
  };
  const invalidRegistryB = {
    ...structuredClone(fixture.registry),
    unsupported_marker: "registry-b",
  };
  const invalidContextA = {
    ...structuredClone(fixture.context_handoff),
    unsupported_marker: "context-a",
  };
  const invalidContextB = {
    ...structuredClone(fixture.context_handoff),
    unsupported_marker: "context-b",
  };
  const invalidOutcomeA = {
    ...structuredClone(fixture.outcome_bundle),
    unsupported_marker: "outcome-a",
  };
  const invalidOutcomeB = {
    ...structuredClone(fixture.outcome_bundle),
    unsupported_marker: "outcome-b",
  };
  const rogueRegistry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity: "synthetic-rogue-registry-v2",
      context_authority: fixture.registry.context_authority,
      outcome_authority: fixture.registry.outcome_authority,
      context_handoff_digests:
        fixture.registry.context_handoff_digests,
      outcome_bundle_digests:
        fixture.registry.outcome_bundle_digests,
    });
  const versionSubstitution =
    createVerifierVersionSubstitutionFixtureV2();
  const callerClaim = {
    ...structuredClone(fixture.request),
    observed_input_provenance: {
      registry: {
        disposition: "verified",
        observed_input_digest: "0".repeat(64),
      },
    },
  };
  const throwingAuthority = {
    ...fixture.authority,
    read_registry: () => {
      throw new Error("private provider diagnostic must not escape");
    },
  };
  const cases = [
    matrixCase(
      "valid_joined",
      fixture,
      fixture.authority,
    ),
    matrixCase(
      "invalid_registry_a",
      fixture,
      authorityWithObservedRegistryV2(
        fixture,
        invalidRegistryA,
      ),
    ),
    matrixCase(
      "invalid_registry_b",
      fixture,
      authorityWithObservedRegistryV2(
        fixture,
        invalidRegistryB,
      ),
    ),
    matrixCase(
      "invalid_context_a",
      fixture,
      authorityWithObservedContextV2(fixture, {
        status: "resolved",
        handoff: invalidContextA,
      }),
    ),
    matrixCase(
      "invalid_context_b",
      fixture,
      authorityWithObservedContextV2(fixture, {
        status: "resolved",
        handoff: invalidContextB,
      }),
    ),
    matrixCase(
      "invalid_outcome_a",
      fixture,
      authorityWithObservedOutcomeV2(fixture, {
        status: "resolved",
        bundle: invalidOutcomeA,
      }),
    ),
    matrixCase(
      "invalid_outcome_b",
      fixture,
      authorityWithObservedOutcomeV2(fixture, {
        status: "resolved",
        bundle: invalidOutcomeB,
      }),
    ),
    matrixCase(
      "context_absent",
      fixture,
      authorityWithObservedContextV2(fixture, {
        status: "not_found",
      }),
    ),
    matrixCase(
      "context_malformed",
      fixture,
      authorityWithObservedContextV2(fixture, {
        status: "unexpected",
        marker: "malformed",
      }),
    ),
    matrixCase(
      "observed_expected_root_mismatch",
      fixture,
      cloneSyntheticAuthorityWithRegistryV1(
        fixture,
        rogueRegistry,
      ),
    ),
    matrixCase(
      "verifier_version_substitution",
      versionSubstitution,
      versionSubstitution.authority,
    ),
    matrixCase(
      "caller_supplied_provenance",
      fixture,
      fixture.authority,
      callerClaim,
    ),
    matrixCase(
      "sanitized_lookup_exception",
      fixture,
      throwingAuthority,
    ),
    matrixCase(
      "default_off",
      fixture,
      fixture.authority,
      fixture.request,
      false,
      false,
    ),
    matrixCase(
      "kill_switch",
      fixture,
      fixture.authority,
      fixture.request,
      true,
      true,
    ),
  ];
  const material = {
    fixture_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_SYNTHETIC_FIXTURES_V2,
    contract_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2,
    case_count: cases.length,
    cases,
  };
  return {
    ...material,
    matrix_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}
