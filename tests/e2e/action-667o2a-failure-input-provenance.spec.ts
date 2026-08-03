import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import {
  createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
  createMarketContextDiagnosticContextOutcomeJoinV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-outcome-join-v1";
import {
  cloneSyntheticAuthorityWithRegistryV1,
  createSyntheticContextOutcomeJoinFixtureV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-outcome-join-fixtures-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2_COMPATIBILITY,
  MARKET_CONTEXT_DIAGNOSTIC_FAILURE_INPUT_PROVENANCE_V1,
  MARKET_CONTEXT_DIAGNOSTIC_FAILURE_REBUILD_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OBSERVED_INPUT_DISPOSITIONS_V1,
  createMarketContextDiagnosticContextOutcomeJoinV2,
  verifyMarketContextDiagnosticContextOutcomeJoinV2,
  type MarketContextDiagnosticContextOutcomeJoinResultV2,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-outcome-join-v2";
import {
  authorityWithObservedContextV2,
  authorityWithObservedOutcomeV2,
  authorityWithObservedRegistryV2,
  buildSyntheticFailureProvenanceGoldenMatrixV2,
  createVerifierVersionSubstitutionFixtureV2,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-outcome-join-fixtures-v2";
import {
  marketContextDiagnosticContextSha256V1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function sha256File(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function rehashTerminalResult(
  candidate: MarketContextDiagnosticContextOutcomeJoinResultV2,
) {
  const clone = structuredClone(candidate);
  const provenanceMaterial = {
    provenance_version:
      clone.observed_input_provenance.provenance_version,
    sections: clone.observed_input_provenance.sections,
  };
  clone.observed_input_provenance.provenance_digest =
    marketContextDiagnosticContextSha256V1(provenanceMaterial);
  clone.failure_identity_digest =
    marketContextDiagnosticContextSha256V1({
      caller_recomputed_failure_identity: true,
      observed_input_provenance_digest:
        clone.observed_input_provenance.provenance_digest,
    });
  const resultMaterial = structuredClone(clone);
  delete (resultMaterial as Partial<
    MarketContextDiagnosticContextOutcomeJoinResultV2
  >).result_digest;
  clone.result_digest =
    marketContextDiagnosticContextSha256V1(resultMaterial);
  return clone;
}

test("V2 versions closed observed provenance and preserves the diagnostic boundary", () => {
  expect(MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2).toBe(
    "market_context_diagnostic_context_outcome_join_v2",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_FAILURE_INPUT_PROVENANCE_V1).toBe(
    "market_context_diagnostic_failure_input_provenance_v1",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_FAILURE_REBUILD_V1).toBe(
    "market_context_diagnostic_failure_rebuild_v1",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_OBSERVED_INPUT_DISPOSITIONS_V1).toEqual([
    "absent",
    "malformed",
    "verified",
    "rejected",
  ]);
  expect(
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2_COMPATIBILITY,
  ).toMatchObject({
    joined_projection_semantics_unchanged: true,
    predecessor_failure_results_implicitly_remediated: false,
    real_outcome_join_performed: false,
    canonical_binding_ready: false,
    automatic_model_input_allowed: false,
    live_ranking_effect: false,
  });
});

test("valid joined projection semantics and split predictor/label digests remain unchanged", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const dependencies = {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
  };
  const predecessor =
    createMarketContextDiagnosticContextOutcomeJoinV1(
      fixture.request,
      dependencies,
    );
  const successor =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      dependencies,
    );
  expect(successor.taxonomy).toBe("joined");
  expect(successor.predecessor_result_digest).toBe(
    predecessor.result_digest,
  );
  expect(successor.predictor_projection).toEqual(
    predecessor.predictor_projection,
  );
  expect(successor.label_projection).toEqual(
    predecessor.label_projection,
  );
  expect(successor.diagnostic_association).toEqual(
    predecessor.diagnostic_association,
  );
  expect(successor.failure_identity_digest).toBeNull();
  expect(
    Object.values(
      successor.observed_input_provenance.sections,
    ).map((section) => section.disposition),
  ).toEqual(["verified", "verified", "verified", "verified"]);
  expect(
    verifyMarketContextDiagnosticContextOutcomeJoinV2(
      successor,
      fixture.request,
      dependencies,
    ),
  ).toBe(true);
});

test("two invalid registries with the same reason have distinct failure identities", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const registryA = {
    ...structuredClone(fixture.registry),
    unsupported_marker: "registry-a-private",
  };
  const registryB = {
    ...structuredClone(fixture.registry),
    unsupported_marker: "registry-b-private",
  };
  const build = (registry: unknown) =>
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: authorityWithObservedRegistryV2(
          fixture,
          registry,
        ),
      },
    );
  const first = build(registryA);
  const second = build(registryB);
  expect(first.reason_codes).toEqual(second.reason_codes);
  expect(first.reason_codes).toEqual([
    "external_join_registry_invalid",
  ]);
  expect(
    first.observed_input_provenance.sections.registry.disposition,
  ).toBe("rejected");
  expect(
    first.observed_input_provenance.sections.registry
      .observed_input_digest,
  ).not.toBe(
    second.observed_input_provenance.sections.registry
      .observed_input_digest,
  );
  expect(first.failure_identity_digest).not.toBe(
    second.failure_identity_digest,
  );
  expect(first.result_digest).not.toBe(second.result_digest);
  expect(JSON.stringify(first)).not.toContain("registry-a-private");
});

test("two invalid context handoffs with the same reason have distinct failure identities", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const contextA = {
    ...structuredClone(fixture.context_handoff),
    unsupported_marker: "context-a-private",
  };
  const contextB = {
    ...structuredClone(fixture.context_handoff),
    unsupported_marker: "context-b-private",
  };
  const build = (handoff: unknown) =>
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: authorityWithObservedContextV2(fixture, {
          status: "resolved",
          handoff,
        }),
      },
    );
  const first = build(contextA);
  const second = build(contextB);
  expect(first.reason_codes).toEqual(second.reason_codes);
  expect(
    first.observed_input_provenance.sections.context_handoff
      .observed_input_digest,
  ).not.toBe(
    second.observed_input_provenance.sections.context_handoff
      .observed_input_digest,
  );
  expect(first.failure_identity_digest).not.toBe(
    second.failure_identity_digest,
  );
  expect(first.result_digest).not.toBe(second.result_digest);
  expect(JSON.stringify(first)).not.toContain("context-a-private");
});

test("two invalid outcome payloads with the same reason have distinct failure identities", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const outcomeA = {
    ...structuredClone(fixture.outcome_bundle),
    unsupported_marker: "outcome-a-private",
  };
  const outcomeB = {
    ...structuredClone(fixture.outcome_bundle),
    unsupported_marker: "outcome-b-private",
  };
  const build = (bundle: unknown) =>
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: authorityWithObservedOutcomeV2(fixture, {
          status: "resolved",
          bundle,
        }),
      },
    );
  const first = build(outcomeA);
  const second = build(outcomeB);
  expect(first.reason_codes).toEqual(second.reason_codes);
  expect(
    first.observed_input_provenance.sections.outcome
      .observed_input_digest,
  ).not.toBe(
    second.observed_input_provenance.sections.outcome
      .observed_input_digest,
  );
  expect(first.failure_identity_digest).not.toBe(
    second.failure_identity_digest,
  );
  expect(first.result_digest).not.toBe(second.result_digest);
  expect(JSON.stringify(first)).not.toContain("outcome-a-private");
});

test("absent and malformed sections use distinct canonical provenance", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const absent =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: authorityWithObservedContextV2(fixture, {
          status: "not_found",
        }),
      },
    );
  const malformed =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: authorityWithObservedContextV2(fixture, {
          status: "unsupported",
          marker: "malformed-resolution",
        }),
      },
    );
  expect(absent.reason_codes).toEqual(malformed.reason_codes);
  expect(
    absent.observed_input_provenance.sections.context_handoff
      .disposition,
  ).toBe("absent");
  expect(
    malformed.observed_input_provenance.sections.context_handoff
      .disposition,
  ).toBe("malformed");
  expect(
    absent.observed_input_provenance.sections.context_handoff
      .observed_input_digest,
  ).not.toBe(
    malformed.observed_input_provenance.sections.context_handoff
      .observed_input_digest,
  );
  expect(absent.failure_identity_digest).not.toBe(
    malformed.failure_identity_digest,
  );
});

test("observed registry substitution stays distinct from the expected authority root", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const rogue =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity: "rogue-observed-registry-v2",
      context_authority: fixture.registry.context_authority,
      outcome_authority: fixture.registry.outcome_authority,
      context_handoff_digests:
        fixture.registry.context_handoff_digests,
      outcome_bundle_digests:
        fixture.registry.outcome_bundle_digests,
    });
  const result =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: cloneSyntheticAuthorityWithRegistryV1(
          fixture,
          rogue,
        ),
      },
    );
  const registry =
    result.observed_input_provenance.sections.registry;
  expect(result.reason_codes).toEqual([
    "external_join_registry_anchor_mismatch",
  ]);
  expect(registry.disposition).toBe("rejected");
  expect(registry.expected_authority_binding.registry_digest).toBe(
    fixture.authority.expected_registry_anchor.registry_digest,
  );
  expect(registry.observed_input_digest).not.toBe(
    registry.expected_authority_binding.registry_digest,
  );
});

test("payload verifier-version substitution is bound and rejected", () => {
  const fixture = createVerifierVersionSubstitutionFixtureV2();
  const result =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    );
  expect(result.reason_codes).toContain(
    "context_snapshot_verifier_mismatch",
  );
  expect(
    result.observed_input_provenance.sections.context_handoff
      .disposition,
  ).toBe("rejected");
  expect(
    result.observed_input_provenance.sections.context_handoff
      .verifier.version,
  ).toBe("synthetic_n2a_snapshot_verifier_v1");
  expect(
    result.observed_input_provenance.sections.context_handoff
      .schema_version,
  ).toBe("market_context_diagnostic_context_snapshot_handoff_v1");
});

test("caller-supplied digest, disposition or verifier outcome is rejected before authority reads", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  let reads = 0;
  const authority = {
    ...fixture.authority,
    read_registry: () => {
      reads += 1;
      return structuredClone(fixture.registry);
    },
  };
  const request = {
    ...structuredClone(fixture.request),
    observed_input_provenance: {
      registry: {
        disposition: "verified",
        observed_input_digest: "0".repeat(64),
        verifier_outcome: "trusted",
      },
    },
  };
  const result =
    createMarketContextDiagnosticContextOutcomeJoinV2(request, {
      enabled: true,
      kill_switch: false,
      authority,
    });
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toContain(
    "closed_schema_unknown_field:$.observed_input_provenance",
  );
  expect(reads).toBe(0);
  expect(
    Object.values(result.observed_input_provenance.sections).every(
      (section) => section.disposition === "absent",
    ),
  ).toBe(true);
});

test("independent rebuild rejects self-consistently recalculated terminal tampering", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const invalidRegistry = {
    ...structuredClone(fixture.registry),
    unsupported_marker: "independent-rebuild-probe",
  };
  const dependencies = {
    enabled: true,
    kill_switch: false,
    authority: authorityWithObservedRegistryV2(
      fixture,
      invalidRegistry,
    ),
  };
  const result =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      dependencies,
    );
  const tampered = structuredClone(result);
  tampered.observed_input_provenance.sections.registry.observed_input_digest =
    "f".repeat(64);
  const selfConsistent = rehashTerminalResult(tampered);
  expect(
    marketContextDiagnosticContextSha256V1(
      Object.fromEntries(
        Object.entries(selfConsistent).filter(
          ([key]) => key !== "result_digest",
        ),
      ),
    ),
  ).toBe(selfConsistent.result_digest);
  expect(
    verifyMarketContextDiagnosticContextOutcomeJoinV2(
      selfConsistent,
      fixture.request,
      dependencies,
    ),
  ).toBe(false);
  expect(
    verifyMarketContextDiagnosticContextOutcomeJoinV2(
      result,
      fixture.request,
      dependencies,
    ),
  ).toBe(true);
});

test("lookup exceptions are sanitized and never expose messages or stacks", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const build = (message: string) =>
    createMarketContextDiagnosticContextOutcomeJoinV2(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: {
          ...fixture.authority,
          read_registry: () => {
            throw new Error(message);
          },
        },
      },
    );
  const first = build("private-account-request-identifier-a");
  const second = build("private-account-request-identifier-b");
  expect(first.reason_codes).toEqual([
    "external_join_registry_lookup_failed",
  ]);
  expect(
    first.observed_input_provenance.sections.registry.disposition,
  ).toBe("malformed");
  expect(first.result_digest).toBe(second.result_digest);
  expect(JSON.stringify(first)).not.toContain("private-account");
  expect(JSON.stringify(first)).not.toContain("stack");
});

test("default-off and kill switch preserve zero work with explicit absent sentinels", () => {
  const request = new Proxy(
    {},
    {
      get() {
        throw new Error("request must not be read");
      },
      ownKeys() {
        throw new Error("request must not be enumerated");
      },
    },
  );
  let authorityReads = 0;
  const disabledDependencies = {
    enabled: false,
    kill_switch: false,
    get authority(): undefined {
      authorityReads += 1;
      throw new Error("authority must not be read");
    },
  };
  const killedDependencies = {
    enabled: true,
    kill_switch: true,
    get authority(): undefined {
      authorityReads += 1;
      throw new Error("authority must not be read");
    },
  };
  const disabled =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      request,
      disabledDependencies,
    );
  const killed =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      request,
      killedDependencies,
    );
  expect(authorityReads).toBe(0);
  for (const result of [disabled, killed]) {
    expect(
      Object.values(result.observed_input_provenance.sections).every(
        (section) =>
          section.disposition === "absent" &&
          /^[a-f0-9]{64}$/.test(section.observed_input_digest),
      ),
    ).toBe(true);
    expect(result.failure_identity_digest).toMatch(/^[a-f0-9]{64}$/);
  }
});

test("deterministic retry, reversed ordering and deep-frozen inputs remain byte-identical", () => {
  const fixtures = [
    createSyntheticContextOutcomeJoinFixtureV1(),
    createSyntheticContextOutcomeJoinFixtureV1({
      mutate_request: (request) => {
        request.external_join_id = "synthetic-join-002";
        request.outcome_identity = "synthetic-outcome-002";
      },
      mutate_outcome: (outcome) => {
        outcome.outcome_identity = "synthetic-outcome-002";
      },
    }),
  ];
  const build = (
    values: typeof fixtures,
  ) =>
    values
      .map((fixture) =>
        createMarketContextDiagnosticContextOutcomeJoinV2(
          deepFreeze(structuredClone(fixture.request)),
          {
            enabled: true,
            kill_switch: false,
            authority: fixture.authority,
          },
        ),
      )
      .sort((left, right) =>
        left.request_identity.external_join_id.localeCompare(
          right.request_identity.external_join_id,
        ),
      );
  expect(build(fixtures)).toEqual(build([...fixtures].reverse()));
  expect(build(fixtures)).toEqual(build(fixtures));
});

test("O.1 and O.2 predecessor freezes remain byte-identical", () => {
  expect(
    sha256File(
      "docs/evidence/action-667o2-context-outcome-join-freeze-manifest.json",
    ),
  ).toBe(
    "2941d014fafaddc35a1dd344163981a32255bc6d03bb2f6a4f04b4ed3c7f7c45",
  );
  expect(
    sha256File(
      "docs/evidence/action-667o2-context-outcome-join-independent-review.json",
    ),
  ).toBe(
    "79979352ed50a184e7eccf4ce2bee42cab08c8fb58406af80cf7cfa5d3fbbb78",
  );
  const freeze = JSON.parse(
    readFileSync(
      "docs/evidence/action-667o2-context-outcome-join-freeze-manifest.json",
      "utf8",
    ),
  );
  const review = JSON.parse(
    readFileSync(
      "docs/evidence/action-667o2-context-outcome-join-independent-review.json",
      "utf8",
    ),
  );
  expect(freeze.freeze_digest).toBe(
    "1d0566d17b4682108ec1697e6ad7c0b8953a1c001b74da4bf801705cef72734f",
  );
  expect(review.review_evidence_digest).toBe(
    "e408b01bec81208eb29588abaa0da6b542dffffdadf2b65e85e037ffee0e0814",
  );
});

test("V2 synthetic golden matrix is deterministic and evidence-bound", () => {
  const matrix = buildSyntheticFailureProvenanceGoldenMatrixV2();
  const evidence = JSON.parse(
    readFileSync(
      "docs/evidence/action-667o2a-failure-input-provenance-synthetic-golden.json",
      "utf8",
    ),
  );
  expect({
    fixture_version: matrix.fixture_version,
    contract_version: matrix.contract_version,
    case_count: matrix.case_count,
    matrix_digest: matrix.matrix_digest,
  }).toEqual(evidence.synthetic_golden_matrix);
  const byId = new Map(
    matrix.cases.map((item) => [item.id, item]),
  );
  for (const proof of evidence.collision_proofs) {
    const first = byId.get(proof.first_case);
    const second = byId.get(proof.second_case);
    expect(first?.reason_codes).toEqual(second?.reason_codes);
    expect(first?.failure_identity_digest).not.toBe(
      second?.failure_identity_digest,
    );
    expect(first?.result_digest).not.toBe(second?.result_digest);
  }
  expect(evidence.real_outcome_join_performed).toBe(false);
  expect(evidence.external_activity).toEqual({
    provider_calls: 0,
    database_calls: 0,
    persistence_writes: 0,
    real_outcome_joins: 0,
  });
});
