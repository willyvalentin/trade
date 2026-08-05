import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
  completeRepositoryOwnedRecommendationOutcomeEvidenceV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
  classifyRecommendationOutcomeEvidencePreAdmissionV3,
  issueRecommendationOutcomeEvidenceV3,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v3";
import {
  buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV3,
  createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3,
  createT7001SelfConsistentAttackFixtureV3,
  rebindSyntheticRecommendationOutcomeEvidenceIssuanceV3,
  reproduceT7001AgainstV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v3";
import {
  buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v2";
import type {
  RecommendationOutcomeEvidenceBundleV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";

const repositoryRoot = resolve(__dirname, "../..");

function issue(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3
  >,
  steps: string[] = [],
) {
  return issueRecommendationOutcomeEvidenceV3(
    fixture.request_v3,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
      observe_downstream_step: (step) => steps.push(step),
    },
  );
}

function classifyWithS2A(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3
  >,
) {
  const completion = fixture.material.completion_material;
  const registry = completion.registry;
  const entry = registry.completion_entry;
  return completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
    {
      contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_V2,
      completion_identity: entry.completion_identity,
      expected_repository_row_identity: entry.repository_row_identity,
      expected_evidence_bundle_identity: entry.evidence_bundle_identity,
    },
    {
      enabled: true,
      kill_switch: false,
      authority: {
        authority_version:
          RECOMMENDATION_OUTCOME_EVIDENCE_COMPLETION_AUTHORITY_V2,
        expected_registry_anchor: {
          registry_identity: registry.registry_identity,
          registry_version: registry.registry_version,
          registry_digest:
            fixture.material.issuer_registry.issuance_entry
              .completion_registry_digest,
          expected_trust_root_digest:
            registry.expected_trust_root_digest,
          expected_lineage_root_digest:
            entry.lineage_root_digest,
        },
        read_completion_material: () => structuredClone(completion),
      },
    },
  );
}

function expectNoDownstream(
  result: ReturnType<typeof issue>,
  steps: string[] = [],
) {
  expect(result.taxonomy).not.toBe("issued");
  expect(result.s2a_request_constructed).toBe(false);
  expect(result.s2a_called).toBe(false);
  expect(result.downstream_digest_work).toBe(false);
  expect("s2a_completion_result_digest" in result).toBe(false);
  expect(steps).toEqual([]);
}

test("V3 establishes a versioned pure pre-admission boundary", () => {
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3).toBe(
    "repository_owned_recommendation_outcome_evidence_issuance_v3",
  );
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  const classified = classifyRecommendationOutcomeEvidencePreAdmissionV3(
    fixture.request_v3,
    fixture.authority,
  );
  expect(classified.taxonomy).toBe("issued");
  expect(classified.reason_codes).toEqual([]);
  expect(classified.failure_identity_digest).toBeNull();
  expect(classified.material).not.toBeNull();
});

test("valid issued material alone crosses the downstream boundary", () => {
  const steps: string[] = [];
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(),
    steps,
  );
  expect(result.taxonomy).toBe("issued");
  expect(result.s2a_request_constructed).toBe(true);
  expect(result.s2a_called).toBe(true);
  expect(result.downstream_digest_work).toBe(true);
  expect(steps).toEqual([
    "s2a_request_constructed",
    "s2a_called",
    "s2a_result_digest_bound",
  ]);
  expect(result.predecessor_result?.taxonomy).toBe("issued");
});

test("T7-001 self-consistent completion extra-field attack is closed", () => {
  const predecessor = reproduceT7001AgainstV2();
  expect(predecessor.downstream_steps).toEqual([
    "s2a_request_constructed",
    "s2a_called",
  ]);
  expect(predecessor.sanitized_error).toBe(
    "issued_pre_downstream_admission_diverged_from_s2a_sanitized",
  );
  const fixture = createT7001SelfConsistentAttackFixtureV3();
  const steps: string[] = [];
  const result = issue(fixture, steps);
  expect(result.reason_codes).toContain(
    "completion_material:closed_schema_violation",
  );
  expectNoDownstream(result, steps);
  expect(classifyWithS2A(fixture).taxonomy).not.toBe("completed");
});

test("field stripping and nested extra fields fail before request construction", () => {
  const fixtures = [
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        delete (
          material.completion_material as unknown as Record<string, unknown>
        ).observed_repository_row;
      },
    ),
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        (
          material.completion_material.observed_evidence_bundle as Record<
            string,
            unknown
          >
        ).caller_verified = true;
      },
    ),
  ];
  for (const fixture of fixtures) {
    const steps: string[] = [];
    const result = issue(fixture, steps);
    expectNoDownstream(result, steps);
    expect(classifyWithS2A(fixture).taxonomy).not.toBe("completed");
  }
});

test("closure order is canonical while missing, duplicate, and substitution fail closed", () => {
  const reordered =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.gap_closures.reverse();
      },
    );
  expect(issue(reordered).taxonomy).toBe("issued");
  const invalid = [
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.gap_closures.pop();
      },
    ),
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.gap_closures[1] = structuredClone(bundle.gap_closures[0]);
      },
    ),
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.gap_closures[0].gap_code =
          bundle.gap_closures[1].gap_code;
      },
    ),
  ];
  for (const fixture of invalid) expectNoDownstream(issue(fixture));
});

test("caller-side closure substitution cannot replace the external anchor", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  const externalAnchor = structuredClone(
    fixture.authority.expected_issuer_anchor,
  );
  const bundle =
    fixture.material.completion_material.observed_evidence_bundle as
      RecommendationOutcomeEvidenceBundleV1;
  bundle.gap_closures[0].evidence_identity = "caller-substitution";
  rebindSyntheticRecommendationOutcomeEvidenceIssuanceV3(fixture);
  fixture.authority.expected_issuer_anchor = externalAnchor;
  const steps: string[] = [];
  const result = issue(fixture, steps);
  expect(result.reason_codes).toContain("issuer_registry_digest_mismatch");
  expectNoDownstream(result, steps);
});

test("authority and trust-root substitution fail before S.2A", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  fixture.authority.expected_issuer_anchor.trust_root_digest = "a".repeat(64);
  const steps: string[] = [];
  expectNoDownstream(issue(fixture, steps), steps);
});

test("temporal finality and immutable membership are pre-admitted locally", () => {
  const unsafe =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        bundle.instants.finalization_unix_ns =
          bundle.instants.decision_unix_ns;
      },
    );
  const mutable =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        const bundle =
          material.completion_material.observed_evidence_bundle as
            RecommendationOutcomeEvidenceBundleV1;
        (bundle.opportunity_set as { immutable: boolean }).immutable = false;
      },
    );
  expect(issue(unsafe).taxonomy).toBe("not_point_in_time_safe");
  expectNoDownstream(issue(unsafe));
  expectNoDownstream(issue(mutable));
});

test("locally issued versus S.2A differential matrix has no false-issued result", () => {
  const mutations: Array<
    (material: Parameters<
      NonNullable<
        Parameters<
          typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3
        >[0]
      >
    >[0]) => void
  > = [
    (material) => {
      (material.completion_material as unknown as Record<string, unknown>).extra =
        "x";
    },
    (material) => {
      const bundle =
        material.completion_material.observed_evidence_bundle as
          RecommendationOutcomeEvidenceBundleV1;
      bundle.completed_projection.decision.instrument_id = "substituted";
    },
    (material) => {
      const bundle =
        material.completion_material.observed_evidence_bundle as
          RecommendationOutcomeEvidenceBundleV1;
      bundle.finality.status = "not-final" as "final";
    },
  ];
  for (const mutate of mutations) {
    const fixture =
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(mutate);
    const local = issue(fixture);
    const downstream = classifyWithS2A(fixture);
    expect(downstream.taxonomy).not.toBe("completed");
    expectNoDownstream(local);
  }
});

test("getter, proxy, cycle, and depth-budget attacks are sanitized", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  const getter = structuredClone(fixture.material) as Record<string, unknown>;
  Object.defineProperty(getter, "completion_material", {
    enumerable: true,
    get() {
      throw new Error("private getter detail");
    },
  });
  const getterFixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  getterFixture.authority.read_issuance_material = () => getter;
  expectNoDownstream(issue(getterFixture));

  const proxyFixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  proxyFixture.authority.read_issuance_material = () =>
    new Proxy({}, {
      ownKeys() {
        throw new Error("private proxy detail");
      },
    });
  expectNoDownstream(issue(proxyFixture));

  const cycleFixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  cycleFixture.authority.read_issuance_material = () => cycle;
  expectNoDownstream(issue(cycleFixture));

  const depthFixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  let deep: Record<string, unknown> = {};
  const root = deep;
  for (let index = 0; index < 70; index += 1) {
    deep.next = {};
    deep = deep.next as Record<string, unknown>;
  }
  depthFixture.authority.read_issuance_material = () => root;
  expectNoDownstream(issue(depthFixture));
});

test("distinct rejected observations retain distinct failure identities", () => {
  const left =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        (material.completion_material as unknown as Record<string, unknown>)
          .unexpected_self_consistent_field = "left";
      },
    );
  const right =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(
      (material) => {
        (material.completion_material as unknown as Record<string, unknown>)
          .unexpected_self_consistent_field = "right";
      },
    );
  const leftResult = issue(left);
  const rightResult = issue(right);
  expect(leftResult.taxonomy).toBe(rightResult.taxonomy);
  expect(leftResult.reason_codes).toEqual(rightResult.reason_codes);
  expect(leftResult.failure_identity_digest).not.toBe(
    rightResult.failure_identity_digest,
  );
  expect(leftResult.result_digest).not.toBe(rightResult.result_digest);
});

test("default-off and kill switch perform zero observable work", () => {
  for (
    const [enabled, killSwitch] of [
      [false, false],
      [true, true],
    ] as const
  ) {
    let reads = 0;
    const request = new Proxy({}, {
      ownKeys() {
        reads += 1;
        throw new Error("must not read request");
      },
    });
    const authority = new Proxy({}, {
      ownKeys() {
        reads += 1;
        throw new Error("must not read authority");
      },
    });
    const result = issueRecommendationOutcomeEvidenceV3(request, {
      enabled,
      kill_switch: killSwitch,
      authority: authority as never,
    });
    expect(reads).toBe(0);
    expectNoDownstream(result);
  }
});

test("verified material is deeply frozen before predecessor invocation", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3();
  const admission = classifyRecommendationOutcomeEvidencePreAdmissionV3(
    fixture.request_v3,
    fixture.authority,
  );
  expect(admission.taxonomy).toBe("issued");
  expect(Object.isFrozen(admission.material)).toBe(true);
  expect(
    Object.isFrozen(
      (admission.material?.completion_material as Record<string, unknown>)
        .observed_evidence_bundle,
    ),
  ).toBe(true);
});

test("issued material preserves the full S.2A to O.2A interop chain", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV3(),
  );
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2();
  expect(result.taxonomy).toBe("issued");
  expect(result.predecessor_result?.taxonomy).toBe("issued");
  expect(interop.completion.taxonomy).toBe("completed");
  expect(interop.projection.taxonomy).toBe("bindable");
  expect(interop.q1_admission.taxonomy).toBe("ready");
  expect(interop.p2a_capture.taxonomy).toBe("captured");
  expect(interop.o2a_join.taxonomy).toBe("joined");
});

test("synthetic golden matrix is deterministic under reversed case order", () => {
  const forward =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV3();
  const reverse =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV3({
      reverse_input_order: true,
    });
  expect(reverse).toEqual(forward);
  expect(forward.scenario_count).toBe(12);
  expect(
    forward.scenarios.find((scenario) =>
      scenario.id === "t7_001_self_consistent_extra_field"
    ),
  ).toEqual(expect.objectContaining({
    s2a_request_constructed: false,
    s2a_called: false,
    downstream_digest_work: false,
  }));
});

test("machine-readable golden evidence matches the synthetic rebuild", () => {
  const persisted = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667t7a-issued-only-pre-admission-remediation-synthetic-golden.json",
      ),
      "utf8",
    ),
  );
  expect(persisted).toEqual(
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV3(),
  );
});
