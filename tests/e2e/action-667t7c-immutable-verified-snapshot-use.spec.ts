import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v2";
import {
  createT7001SelfConsistentAttackFixtureV3,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v3";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V4,
  buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV4,
  createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4,
  createT7B001AuthorityMutationFixtureV4,
  reproduceT7B001AgainstV3,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v4";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
  RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_AUDIT_V4,
  RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_V4,
  computeRecommendationOutcomeEvidenceIssuanceResultDigestV4,
  issueRecommendationOutcomeEvidenceV4,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v4";
import type {
  RecommendationOutcomeEvidenceBundleV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";

const repositoryRoot = resolve(__dirname, "../..");

function issue(
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4
  >,
  steps: string[] = [],
  request: unknown = fixture.request_v4,
) {
  return issueRecommendationOutcomeEvidenceV4(request, {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
    observe_downstream_step: (step) => steps.push(step),
  });
}

function expectNoDownstream(
  result: ReturnType<typeof issue>,
  steps: string[] = [],
) {
  expect(result.taxonomy).not.toBe("issued");
  expect(result.s2a_request_constructed).toBe(false);
  expect(result.s2a_called).toBe(false);
  expect(result.downstream_digest_work).toBe(false);
  expect(result.downstream_steps).toEqual([]);
  expect("s2a_completion_result_digest" in result).toBe(false);
  expect(steps).toEqual([]);
}

test("V4 establishes the immutable verified-snapshot successor", () => {
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4).toBe(
    "repository_owned_recommendation_outcome_evidence_issuance_v4",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_V4).toBe(
    "repository_owned_recommendation_outcome_evidence_verified_snapshot_v4",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_VERIFIED_SNAPSHOT_AUDIT_V4).toBe(
    "repository_owned_recommendation_outcome_evidence_verified_snapshot_audit_v4",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_FIXTURES_V4).toBe(
    "repository_owned_recommendation_outcome_evidence_issuance_fixtures_v4",
  );
});

test("valid issued material crosses the snapshot-only downstream boundary", () => {
  const steps: string[] = [];
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(),
    steps,
  );
  expect(result.taxonomy).toBe("issued");
  expect(result.predecessor_result?.taxonomy).toBe("issued");
  expect(result.s2a_request_constructed).toBe(true);
  expect(result.s2a_called).toBe(true);
  expect(result.downstream_digest_work).toBe(true);
  expect(steps).toEqual([
    "s2a_request_constructed",
    "s2a_called",
    "s2a_result_digest_bound",
  ]);
  expect(result.snapshot_audit.verified_snapshot_only_downstream).toBe(true);
});

test("T7B-001 reproduces against V3 and is closed by V4", () => {
  expect(reproduceT7B001AgainstV3()).toEqual({
    predecessor_version:
      "repository_owned_recommendation_outcome_evidence_issuance_v3",
    downstream_steps: [],
    caller_material_reads: 1,
    sanitized_error: "v3_pre_admission_diverged_from_s2a_sanitized",
  });
  const fixture = createT7B001AuthorityMutationFixtureV4();
  const result = issue(fixture);
  expect(result.taxonomy).toBe("issued");
  expect(result.predecessor_result?.taxonomy).toBe("issued");
  expect(fixture.caller_material_reads()).toBe(1);
  expect(result.snapshot_audit.caller_request_snapshot_count).toBe(1);
  expect(result.snapshot_audit.caller_authority_snapshot_count).toBe(1);
  expect(result.snapshot_audit.caller_material_read_count).toBe(1);
  expect(result.snapshot_audit.caller_input_reread_count).toBe(0);
});

test("request and authority are captured by one descriptor-safe snapshot pass", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  let requestSnapshotPasses = 0;
  let authoritySnapshotPasses = 0;
  const request = new Proxy(fixture.request_v4, {
    ownKeys: (target) => {
      requestSnapshotPasses += 1;
      return Reflect.ownKeys(target);
    },
  });
  const authority = new Proxy(fixture.authority, {
    ownKeys: (target) => {
      authoritySnapshotPasses += 1;
      return Reflect.ownKeys(target);
    },
  });
  const result = issueRecommendationOutcomeEvidenceV4(request, {
    enabled: true,
    kill_switch: false,
    authority,
  });
  expect(result.taxonomy).toBe("issued");
  expect(requestSnapshotPasses).toBe(1);
  expect(authoritySnapshotPasses).toBe(1);
  expect(result.snapshot_audit).toEqual(expect.objectContaining({
    caller_request_snapshot_count: 1,
    caller_authority_snapshot_count: 1,
    caller_material_read_count: 1,
    caller_input_reread_count: 0,
    request_snapshot_deep_frozen: true,
    authority_snapshot_deep_frozen: true,
    material_snapshot_deep_frozen: true,
    snapshot_input_separated: true,
    verified_snapshot_only_downstream: true,
  }));
  expect(Object.isFrozen(result.snapshot_audit)).toBe(true);
});

test("request and authority getters are rejected without execution", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  let requestGetterCalls = 0;
  const request = { ...fixture.request_v4 } as Record<string, unknown>;
  Object.defineProperty(request, "issuance_identity", {
    enumerable: true,
    get: () => {
      requestGetterCalls += 1;
      return fixture.request_v4.issuance_identity;
    },
  });
  const requestResult = issue(fixture, [], request);
  expectNoDownstream(requestResult);
  expect(requestGetterCalls).toBe(0);

  let authorityGetterCalls = 0;
  const authority = {
    authority_version: fixture.authority.authority_version,
    read_issuance_material: fixture.authority.read_issuance_material,
  } as Record<string, unknown>;
  Object.defineProperty(authority, "expected_issuer_anchor", {
    enumerable: true,
    get: () => {
      authorityGetterCalls += 1;
      return fixture.authority.expected_issuer_anchor;
    },
  });
  const authorityResult = issueRecommendationOutcomeEvidenceV4(
    fixture.request_v4,
    {
      enabled: true,
      kill_switch: false,
      authority: authority as never,
    },
  );
  expectNoDownstream(authorityResult);
  expect(authorityGetterCalls).toBe(0);
});

test("throwing proxy and cyclic material fail with sanitized zero-downstream results", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  const proxyRequest = new Proxy(fixture.request_v4, {
    ownKeys: () => {
      throw new Error("private-proxy-message");
    },
  });
  const proxyResult = issue(fixture, [], proxyRequest);
  expectNoDownstream(proxyResult);
  expect(proxyResult.reason_codes.join(":")).not.toContain("private");

  const cyclic = createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  const material = cyclic.authority.read_issuance_material() as Record<
    string,
    unknown
  >;
  material.cycle = material;
  cyclic.authority.read_issuance_material = () => material as never;
  const cyclicResult = issue(cyclic);
  expectNoDownstream(cyclicResult);
  expect(cyclicResult.reason_codes).toContain(
    "bounded_validation:cycle_rejected",
  );
});

test("post-verification caller mutation cannot alter the V4 result", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  const result = issue(fixture);
  const digest = result.result_digest;
  fixture.request_v4.issuance_identity = "post-verification-request-mutation";
  fixture.authority.expected_issuer_anchor.trust_root_digest = "d".repeat(64);
  fixture.material.issuer_registry.registry_identity =
    "post-verification-material-mutation";
  expect(result.result_digest).toBe(digest);
  expect(computeRecommendationOutcomeEvidenceIssuanceResultDigestV4(result))
    .toBe(digest);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.predecessor_result)).toBe(true);
});

test("the original T7-001 closed-schema boundary remains closed", () => {
  const predecessor = createT7001SelfConsistentAttackFixtureV3();
  const request = {
    contract_version: RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
    issuance_identity: predecessor.request_v3.issuance_identity,
    expected_repository_row_identity:
      predecessor.request_v3.expected_repository_row_identity,
    expected_evidence_bundle_identity:
      predecessor.request_v3.expected_evidence_bundle_identity,
  };
  const result = issueRecommendationOutcomeEvidenceV4(request, {
    enabled: true,
    kill_switch: false,
    authority: predecessor.authority,
  });
  expect(result.taxonomy).toBe("unmappable");
  expect(result.reason_codes).toContain(
    "completion_material:closed_schema_violation",
  );
  expectNoDownstream(result);
});

test("all non-issued synthetic scenarios perform zero S2A work", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV4();
  for (
    const scenario of matrix.scenarios.filter((entry) =>
      entry.taxonomy !== "issued"
    )
  ) {
    expect(scenario.s2a_request_constructed, scenario.id).toBe(false);
    expect(scenario.s2a_called, scenario.id).toBe(false);
    expect(scenario.downstream_digest_work, scenario.id).toBe(false);
    expect(scenario.downstream_steps, scenario.id).toEqual([]);
  }
});

test("temporal, membership, and authority drift fail before downstream", () => {
  const temporal =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(
      (material) => {
        const bundle = material.completion_material
          .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
        bundle.instants.finalization_unix_ns =
          bundle.instants.decision_unix_ns;
      },
    );
  const membership =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(
      (material) => {
        const bundle = material.completion_material
          .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
        (
          bundle.opportunity_set as unknown as Record<string, unknown>
        ).immutable = false;
      },
    );
  const authority =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  authority.material.issuer_registry.trust_root_digest = "c".repeat(64);
  for (const fixture of [temporal, membership, authority]) {
    expectNoDownstream(issue(fixture));
  }
});

test("different rejected snapshots retain distinct failure identities", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  const left = issue(fixture, [], {
    ...fixture.request_v4,
    unexpected: "left",
  });
  const right = issue(fixture, [], {
    ...fixture.request_v4,
    unexpected: "right",
  });
  expect(left.taxonomy).toBe("unmappable");
  expect(right.taxonomy).toBe("unmappable");
  expect(left.reason_codes).toEqual(right.reason_codes);
  expect(left.failure_identity_digest).not.toBe(
    right.failure_identity_digest,
  );
  expect(left.result_digest).not.toBe(right.result_digest);
});

test("default-off and kill switch perform zero caller-visible work", () => {
  for (const [enabled, killSwitch] of [[false, false], [true, true]]) {
    let requestReads = 0;
    let authorityReads = 0;
    const request = new Proxy({}, {
      ownKeys: () => {
        requestReads += 1;
        throw new Error("must-not-read-request");
      },
    });
    const authority = new Proxy({}, {
      ownKeys: () => {
        authorityReads += 1;
        throw new Error("must-not-read-authority");
      },
    });
    const result = issueRecommendationOutcomeEvidenceV4(request, {
      enabled,
      kill_switch: killSwitch,
      authority: authority as never,
    });
    expect(requestReads).toBe(0);
    expect(authorityReads).toBe(0);
    expect(result.snapshot_audit.caller_request_snapshot_count).toBe(0);
    expect(result.snapshot_audit.caller_authority_snapshot_count).toBe(0);
    expect(result.snapshot_audit.caller_material_read_count).toBe(0);
    expectNoDownstream(result);
  }
});

test("verified snapshots and caller inputs remain separate", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4();
  const beforeRequest = structuredClone(fixture.request_v4);
  const beforeAnchor = structuredClone(
    fixture.authority.expected_issuer_anchor,
  );
  const result = issue(fixture);
  expect(result.taxonomy).toBe("issued");
  expect(fixture.request_v4).toEqual(beforeRequest);
  expect(fixture.authority.expected_issuer_anchor).toEqual(beforeAnchor);
  expect(Object.isFrozen(fixture.request_v4)).toBe(false);
  expect(Object.isFrozen(fixture.authority.expected_issuer_anchor)).toBe(false);
  expect(result.snapshot_audit.snapshot_input_separated).toBe(true);
});

test("issued V4 preserves the complete S2A through O2A interop chain", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV4(),
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

test("the synthetic matrix is deterministic under reversed input order", () => {
  const forward =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV4();
  const reverse =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV4({
      reverse_input_order: true,
    });
  expect(reverse).toEqual(forward);
  expect(forward.scenario_count).toBe(12);
  expect(
    forward.scenarios.find((scenario) =>
      scenario.id === "issued_t7b_001_mutating_callback"
    ),
  ).toEqual(expect.objectContaining({
    taxonomy: "issued",
    caller_input_reread_count: 0,
    s2a_called: true,
  }));
});

test("machine-readable golden evidence matches the synthetic rebuild", () => {
  const persisted = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667t7c-immutable-verified-snapshot-use-synthetic-golden.json",
      ),
      "utf8",
    ),
  );
  expect(persisted).toEqual(
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV4(),
  );
});
