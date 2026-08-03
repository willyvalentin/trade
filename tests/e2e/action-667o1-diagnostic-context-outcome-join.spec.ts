import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import {
  buildMarketContextDiagnosticContextFixtureResultV2,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-fixtures-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_BOUNDARY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_TAXONOMY_V1,
  createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
  createMarketContextDiagnosticContextOutcomeJoinBatchV1,
  createMarketContextDiagnosticContextOutcomeJoinV1,
  verifyMarketContextDiagnosticContextOutcomeJoinV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-outcome-join-v1";
import {
  buildSyntheticContextOutcomeGoldenMatrixV1,
  cloneSyntheticAuthorityWithRegistryV1,
  createSyntheticContextOutcomeJoinFixtureV1,
  rehashSyntheticOutcomeBundleV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-outcome-join-fixtures-v1";
import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";

const repositoryRoot = resolve(__dirname, "../..");

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

test("O.1 exposes the exact closed taxonomy and diagnostic-only boundary", () => {
  expect(MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_TAXONOMY_V1).toEqual([
    "joined",
    "insufficient_context",
    "incomplete_outcome",
    "conflicting",
    "not_point_in_time_safe",
    "unmappable",
  ]);
  expect(MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_BOUNDARY_V1).toEqual({
    diagnostic_only: true,
    shadow_only: true,
    official_ohlcv: false,
    canonical_performance_eligible: false,
    automatic_model_input_allowed: false,
    automatic_training_allowed: false,
    automatic_promotion_allowed: false,
    causal_claimed: false,
    live_ranking_effect: false,
  });
});

test("valid trusted handoffs create one diagnostic association with split digests", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const result = createMarketContextDiagnosticContextOutcomeJoinV1(
    fixture.request,
    { enabled: true, kill_switch: false, authority: fixture.authority },
  );
  expect(result.taxonomy).toBe("joined");
  expect(result.authority_binding.verification_status).toBe("verified");
  expect(result.predictor_projection).toMatchObject({
    canonical_decision_identity: "synthetic-decision-001",
    instrument_id: "SPY",
    opportunity_set_identity: "synthetic-opportunity-set-001",
    finalized_bucket_authority:
      "market_context_diagnostic_context_finalized_bucket_policy_v2",
  });
  expect(result.label_projection).toMatchObject({
    outcome_identity: "synthetic-outcome-001",
    evaluator_version: "synthetic-evaluator-v1",
    outcome_interval_start_unix_ns: (
      BigInt(fixture.request.decision_reference.decision_unix_ns) + BigInt(1)
    ).toString(),
  });
  expect(result.predictor_projection?.predictor_digest).toMatch(
    /^[a-f0-9]{64}$/,
  );
  expect(result.label_projection?.label_digest).toMatch(/^[a-f0-9]{64}$/);
  expect(result.predictor_projection?.predictor_digest).not.toBe(
    result.label_projection?.label_digest,
  );
  expect(result.diagnostic_association).toMatchObject({
    performance_publication_allowed: false,
    probability_mapping_allowed: false,
  });
  expect(
    verifyMarketContextDiagnosticContextOutcomeJoinV1(
      result,
      fixture.request,
      { enabled: true, kill_switch: false, authority: fixture.authority },
    ),
  ).toBe(true);
});

test("later outcome values cannot change the predictor-side projection", () => {
  const leftFixture = createSyntheticContextOutcomeJoinFixtureV1();
  const rightFixture = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_outcome: (bundle) => {
      bundle.later_observed_outcome.value = "-1.00";
      bundle.later_observed_outcome.label = "diagnostic_stop_observed";
    },
  });
  const left = createMarketContextDiagnosticContextOutcomeJoinV1(
    leftFixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: leftFixture.authority,
    },
  );
  const right = createMarketContextDiagnosticContextOutcomeJoinV1(
    rightFixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: rightFixture.authority,
    },
  );
  expect(left.taxonomy).toBe("joined");
  expect(right.taxonomy).toBe("joined");
  expect(right.predictor_projection).toEqual(left.predictor_projection);
  expect(right.label_projection?.label_digest).not.toBe(
    left.label_projection?.label_digest,
  );
});

test("context taxonomy maps deterministically without reading outcome values", () => {
  const cases = [
    ["insufficient_data", "insufficient_context"],
    ["conflicting", "conflicting"],
    ["not_point_in_time_safe", "not_point_in_time_safe"],
  ] as const;
  for (const [contextTaxonomy, joinTaxonomy] of cases) {
    let outcomeReads = 0;
    const fixture = createSyntheticContextOutcomeJoinFixtureV1({
      context_taxonomy: contextTaxonomy,
    });
    const authority = {
      ...fixture.authority,
      read_outcome_bundle: () => {
        outcomeReads += 1;
        throw new Error("outcome_must_not_be_read");
      },
    };
    const result = createMarketContextDiagnosticContextOutcomeJoinV1(
      fixture.request,
      { enabled: true, kill_switch: false, authority },
    );
    expect(result.taxonomy).toBe(joinTaxonomy);
    expect(result.label_projection).toBeNull();
    expect(outcomeReads).toBe(0);
  }
});

test("pending and not-yet-complete outcomes remain incomplete without labels", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1({
    outcome_status: "pending",
  });
  const result = createMarketContextDiagnosticContextOutcomeJoinV1(
    fixture.request,
    { enabled: true, kill_switch: false, authority: fixture.authority },
  );
  expect(result.taxonomy).toBe("incomplete_outcome");
  expect(result.reason_codes).toEqual(["outcome_window_not_completed"]);
  expect(result.predictor_projection).toBeNull();
  expect(result.label_projection).toBeNull();
});

test("nanosecond temporal boundaries are exact and offset equivalents canonicalize identically", () => {
  const accepted = createSyntheticContextOutcomeJoinFixtureV1();
  const equivalent = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_outcome: (bundle) => {
      bundle.outcome_window.start_timestamp =
        "2026-01-05T16:30:00.000000001+01:00";
      bundle.outcome_window.end_timestamp =
        "2026-01-05T17:30:00.000000000+01:00";
      bundle.outcome_completion.completion_timestamp =
        "2026-01-05T11:30:00.000000000-05:00";
      bundle.evaluation.capture_timestamp =
        "2026-01-05T11:30:00.000000001-05:00";
    },
  });
  const left = createMarketContextDiagnosticContextOutcomeJoinV1(
    accepted.request,
    { enabled: true, kill_switch: false, authority: accepted.authority },
  );
  const right = createMarketContextDiagnosticContextOutcomeJoinV1(
    equivalent.request,
    { enabled: true, kill_switch: false, authority: equivalent.authority },
  );
  expect(stableMarketContextDiagnosticContextJsonV1(right)).toBe(
    stableMarketContextDiagnosticContextJsonV1(left),
  );

  const exactDecision = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_outcome: (bundle) => {
      bundle.outcome_window.start_timestamp =
        "2026-01-05T15:30:00.000000000Z";
    },
  });
  expect(
    createMarketContextDiagnosticContextOutcomeJoinV1(
      exactDecision.request,
      {
        enabled: true,
        kill_switch: false,
        authority: exactDecision.authority,
      },
    ).taxonomy,
  ).toBe("not_point_in_time_safe");

  const completionMinusOne = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_outcome: (bundle) => {
      bundle.outcome_completion.completion_timestamp =
        "2026-01-05T16:29:59.999999999Z";
    },
  });
  expect(
    createMarketContextDiagnosticContextOutcomeJoinV1(
      completionMinusOne.request,
      {
        enabled: true,
        kill_switch: false,
        authority: completionMinusOne.authority,
      },
    ).reason_codes,
  ).toContain("outcome_temporal_separation_invalid");
});

test("future provider observations and unfinalized buckets fail point-in-time safety", () => {
  const futureProvider = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_context: (snapshot) => {
      const timestamps = snapshot.context?.provider_context_timestamps as Array<
        Record<string, unknown>
      >;
      timestamps[0]!.received_timestamp =
        "2026-01-05T15:30:00.000000001Z";
    },
  });
  const unfinalized = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_context: (snapshot) => {
      snapshot.point_in_time.record_finalization_violation_count = 1;
    },
  });
  for (const fixture of [futureProvider, unfinalized]) {
    expect(
      createMarketContextDiagnosticContextOutcomeJoinV1(
        fixture.request,
        { enabled: true, kill_switch: false, authority: fixture.authority },
      ).taxonomy,
    ).toBe("not_point_in_time_safe");
  }
});

test("decision, instrument and complete opportunity membership must agree", () => {
  const fixtures = [
    createSyntheticContextOutcomeJoinFixtureV1({
      mutate_request: (request) => {
        request.decision_reference.external_decision_id = "other-decision";
      },
    }),
    createSyntheticContextOutcomeJoinFixtureV1({
      mutate_request: (request) => {
        request.decision_reference.instrument_id = "AAPL";
      },
    }),
    createSyntheticContextOutcomeJoinFixtureV1({
      mutate_outcome: (bundle) => {
        bundle.opportunity_set.completeness = "partial";
      },
    }),
  ];
  for (const fixture of fixtures) {
    const result = createMarketContextDiagnosticContextOutcomeJoinV1(
      fixture.request,
      { enabled: true, kill_switch: false, authority: fixture.authority },
    );
    expect(result.taxonomy).toBe("conflicting");
    expect(result.diagnostic_association).toBeNull();
  }
});

test("outcome evaluator version and lineage drift fail closed", () => {
  const versionDrift = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_outcome: (bundle) => {
      bundle.versions.evaluator = "unexpected-evaluator-v2";
    },
  });
  const lineageDrift = createSyntheticContextOutcomeJoinFixtureV1({
    mutate_outcome: (bundle) => {
      bundle.lineage.evaluator_lineage_digest =
        marketContextDiagnosticContextSha256V1("other-lineage");
    },
  });
  expect(
    createMarketContextDiagnosticContextOutcomeJoinV1(
      versionDrift.request,
      { enabled: true, kill_switch: false, authority: versionDrift.authority },
    ).reason_codes,
  ).toContain("outcome_evaluator_version_mismatch");
  expect(
    createMarketContextDiagnosticContextOutcomeJoinV1(
      lineageDrift.request,
      { enabled: true, kill_switch: false, authority: lineageDrift.authority },
    ).reason_codes,
  ).toContain("outcome_evaluator_lineage_mismatch");
});

test("external registry substitution and self-consistent payload tampering are rejected", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const rogueRegistry =
    createMarketContextDiagnosticContextOutcomeAuthorityRegistryV1({
      registry_identity: "rogue-registry",
      context_authority: fixture.registry.context_authority,
      outcome_authority: fixture.registry.outcome_authority,
      context_handoff_digests:
        fixture.registry.context_handoff_digests,
      outcome_bundle_digests:
        fixture.registry.outcome_bundle_digests,
    });
  expect(rogueRegistry.registry_version).toBe(
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_REGISTRY_V1,
  );
  const substitution =
    createMarketContextDiagnosticContextOutcomeJoinV1(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: cloneSyntheticAuthorityWithRegistryV1(
          fixture,
          rogueRegistry,
        ),
      },
    );
  expect(substitution.reason_codes).toEqual([
    "external_join_registry_anchor_mismatch",
  ]);

  const tampered = structuredClone(fixture.outcome_bundle);
  tampered.later_observed_outcome.value = "999.00";
  const selfConsistent = rehashSyntheticOutcomeBundleV1(tampered);
  const tamperedAuthority = {
    ...fixture.authority,
    read_outcome_bundle: () => ({
      status: "resolved" as const,
      bundle: structuredClone(selfConsistent),
    }),
  };
  const tamperResult =
    createMarketContextDiagnosticContextOutcomeJoinV1(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: tamperedAuthority,
      },
    );
  expect(tamperResult.taxonomy).toBe("conflicting");
  expect(tamperResult.reason_codes).toContain(
    "outcome_bundle_digest_or_version_mismatch",
  );
});

test("default-off and kill switch perform zero request, registry, verifier or join work", () => {
  for (const dependencies of [
    { enabled: false, kill_switch: false },
    { enabled: true, kill_switch: true },
  ]) {
    let reads = 0;
    const unreadable = new Proxy(
      {},
      {
        ownKeys: () => {
          reads += 1;
          throw new Error("request_read_forbidden");
        },
      },
    );
    const authority = {
      authority_version:
        "market_context_diagnostic_context_outcome_authority_v1" as const,
      expected_registry_anchor: {
        registry_identity: "must-not-read",
        registry_version:
          "market_context_diagnostic_context_outcome_authority_registry_v1" as const,
        registry_digest: "0".repeat(64),
      },
      read_registry: () => {
        reads += 1;
        throw new Error("registry_read_forbidden");
      },
      read_context_handoff: () => {
        reads += 1;
        throw new Error("context_read_forbidden");
      },
      read_outcome_bundle: () => {
        reads += 1;
        throw new Error("outcome_read_forbidden");
      },
    };
    const result = createMarketContextDiagnosticContextOutcomeJoinV1(
      unreadable,
      { ...dependencies, authority },
    );
    expect(result.reason_codes).toEqual([
      dependencies.enabled
        ? "join_kill_switch_active"
        : "join_default_off",
    ]);
    expect(reads).toBe(0);
  }
});

test("caller authority assertions are rejected recursively in objects and arrays", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const claims = [
    { canonical: true },
    { nested: [{ deeper: { complete: true } }] },
    { point_in_time_safe: true },
    { profitable: true },
    { causal: true },
  ];
  for (const claim of claims) {
    const request = {
      ...structuredClone(fixture.request),
      metadata: claim,
    };
    const result = createMarketContextDiagnosticContextOutcomeJoinV1(
      request,
      { enabled: true, kill_switch: false, authority: fixture.authority },
    );
    expect(result.taxonomy).toBe("conflicting");
    expect(
      result.reason_codes.some((reason) =>
        reason.startsWith("caller_authority_claim_forbidden:"),
      ),
    ).toBe(true);
  }
});

test("duplicate and collision identities are explicit and input-order deterministic", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const duplicate =
    createMarketContextDiagnosticContextOutcomeJoinBatchV1(
      [fixture.request, structuredClone(fixture.request)],
      { enabled: true, kill_switch: false, authority: fixture.authority },
    );
  expect(duplicate).toHaveLength(2);
  expect(
    duplicate.every((item) =>
      item.reason_codes.includes("duplicate_join_identity"),
    ),
  ).toBe(true);

  const collisionRequest = structuredClone(fixture.request);
  collisionRequest.outcome_identity = "other-outcome";
  const collision =
    createMarketContextDiagnosticContextOutcomeJoinBatchV1(
      [fixture.request, collisionRequest],
      { enabled: true, kill_switch: false, authority: fixture.authority },
    );
  expect(
    collision.every((item) =>
      item.reason_codes.includes("join_identity_collision"),
    ),
  ).toBe(true);

  const second = structuredClone(fixture.request);
  second.external_join_id = "synthetic-join-002";
  const forward =
    createMarketContextDiagnosticContextOutcomeJoinBatchV1(
      [fixture.request, second],
      { enabled: true, kill_switch: false, authority: fixture.authority },
    );
  const reverse =
    createMarketContextDiagnosticContextOutcomeJoinBatchV1(
      [second, fixture.request],
      { enabled: true, kill_switch: false, authority: fixture.authority },
    );
  expect(stableMarketContextDiagnosticContextJsonV1(reverse)).toBe(
    stableMarketContextDiagnosticContextJsonV1(forward),
  );
});

test("inputs remain immutable under deterministic retries", () => {
  const fixture = createSyntheticContextOutcomeJoinFixtureV1();
  const request = deepFreeze(structuredClone(fixture.request));
  const before = stableMarketContextDiagnosticContextJsonV1(request);
  const first = createMarketContextDiagnosticContextOutcomeJoinV1(
    request,
    { enabled: true, kill_switch: false, authority: fixture.authority },
  );
  const second = createMarketContextDiagnosticContextOutcomeJoinV1(
    request,
    { enabled: true, kill_switch: false, authority: fixture.authority },
  );
  expect(stableMarketContextDiagnosticContextJsonV1(second)).toBe(
    stableMarketContextDiagnosticContextJsonV1(first),
  );
  expect(stableMarketContextDiagnosticContextJsonV1(request)).toBe(before);
});

test("the synthetic golden report is canonical and byte-identical", () => {
  const matrix = buildSyntheticContextOutcomeGoldenMatrixV1();
  const evidence = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667o1-diagnostic-context-outcome-join-synthetic-golden.json",
      ),
      "utf8",
    ),
  );
  expect(evidence.contract_version).toBe(
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
  );
  expect(evidence.synthetic_golden_matrix).toEqual(matrix);
  expect(evidence.real_outcome_join_performed).toBe(false);
  expect(evidence.external_activity).toEqual({
    provider_calls: 0,
    database_calls: 0,
    persistence_writes: 0,
    real_outcome_joins: 0,
    normalization_runs: 0,
    replay_runs: 0,
  });
});

test("all 60 N.2A identities are interface-compatible without constructing outcome rows", () => {
  const source = buildMarketContextDiagnosticContextFixtureResultV2({
    repo_root: repositoryRoot,
  });
  expect(source.decision_count).toBe(60);
  expect(
    new Set(
      source.snapshots.map(
        (snapshot) => snapshot.decision_identity.external_decision_id,
      ),
    ).size,
  ).toBe(60);
  expect(source.snapshots.every((snapshot) => snapshot.result_version)).toBe(
    true,
  );
  const compatibilityMaterial = source.snapshots.map((snapshot) => ({
    decision_identity: snapshot.decision_identity.external_decision_id,
    decision_unix_ns: snapshot.decision_unix_ns,
    snapshot_digest: snapshot.feature_snapshot_digest,
    registry_digest:
      snapshot.identities.trusted_source_registry.registry_digest,
  }));
  expect(
    marketContextDiagnosticContextSha256V1(compatibilityMaterial),
  ).toMatch(/^[a-f0-9]{64}$/);
});

test("O.1 scope has no provider, database, live, dependency, lock or Action 665/666 import", () => {
  const implementationPaths = [
    "lib/market-context-intelligence-lab/diagnostic-context-outcome-join-v1.ts",
    "lib/market-context-intelligence-lab/diagnostic-context-outcome-join-fixtures-v1.ts",
  ];
  for (const path of implementationPaths) {
    const source = readFileSync(resolve(repositoryRoot, path), "utf8");
    expect(source).not.toMatch(/from ["'][^"']*(action-665|action-666)/i);
    expect(source).not.toMatch(
      /from ["'][^"']*(supabase|postgres|database|provider-client|live-ranking)/i,
    );
    expect(source).not.toMatch(/\bfetch\s*\(/);
  }
  const changedPaths = [
    ...implementationPaths,
    "tests/e2e/action-667o1-diagnostic-context-outcome-join.spec.ts",
    "docs/action-667o1-diagnostic-context-outcome-join-contract.md",
    "docs/evidence/action-667o1-diagnostic-context-outcome-join-synthetic-golden.json",
  ];
  expect(changedPaths.some((path) => /lock|package\.json|migration/.test(path))).toBe(
    false,
  );
});
