import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV2,
  buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2,
  createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2,
  reproduceT2001AgainstV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V2,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
  independentlyVerifyRecommendationOutcomeEvidenceIssuanceV2,
  issueRecommendationOutcomeEvidenceV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v2";

const issue = (
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2
  >,
  steps: string[] = [],
) =>
  issueRecommendationOutcomeEvidenceV2(fixture.request, {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
    observe_downstream_step: (step) => steps.push(step),
  });
const repositoryRoot = resolve(__dirname, "../..");

test("V2 versions a closed taxonomy and diagnostic-only boundary", () => {
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2).toBe(
    "repository_owned_recommendation_outcome_evidence_issuance_v2",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V2).toEqual([
    "issued",
    "incomplete",
    "conflicting",
    "not_point_in_time_safe",
    "unmappable",
  ]);
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V2).toEqual(
    expect.objectContaining({
      diagnostic_only: true,
      shadow_only: true,
      read_only: true,
      real_outcome_source_accessed: false,
      canonical_performance_eligible: false,
      automatic_model_input_allowed: false,
      live_ranking_effect: false,
    }),
  );
});

test("issued status is established before exactly one downstream sequence", () => {
  const steps: string[] = [];
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2(),
    steps,
  );
  expect(result.reason_codes).toEqual([]);
  expect(result.taxonomy).toBe("issued");
  expect(steps).toEqual([
    "s2a_request_constructed",
    "s2a_called",
    "s2a_result_digest_bound",
  ]);
  expect(result.downstream_activity).toEqual({
    s2a_request_construction_count: 1,
    s2a_call_count: 1,
    s2a_result_digest_work_count: 1,
  });
  expect("s2a_completion_result_digest" in result).toBe(true);
});

test("T2-001 reproduces in V1 and is closed in V2", () => {
  const historical = reproduceT2001AgainstV1();
  expect(historical.taxonomy).toBe("incomplete");
  expect(historical.downstream_digest_exposed).toBe(true);
  const current = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      remove_first_closure: true,
    }),
  );
  expect(current.reason_codes).toContain(
    "all_eighteen_gap_closures_required",
  );
  expect(current.taxonomy).toBe("incomplete");
  expect("s2a_completion_result_digest" in current).toBe(false);
  expect(current.downstream_activity).toEqual({
    s2a_request_construction_count: 0,
    s2a_call_count: 0,
    s2a_result_digest_work_count: 0,
  });
});

test("missing closure performs no S.2A work", () => {
  const steps: string[] = [];
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      remove_first_closure: true,
    }),
    steps,
  );
  expect(result.reason_codes).toEqual([
    "all_eighteen_gap_closures_required",
  ]);
  expect(result.taxonomy).toBe("incomplete");
  expect(result.reason_codes).toContain(
    "all_eighteen_gap_closures_required",
  );
  expect(steps).toEqual([]);
});

test("conflicting issuer performs no S.2A work", () => {
  const steps: string[] = [];
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      conflict_registry: true,
    }),
    steps,
  );
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toContain("issuer_identity_mismatch");
  expect(steps).toEqual([]);
});

test("point-in-time unsafe material performs no S.2A work", () => {
  const steps: string[] = [];
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      unsafe_source_instant: true,
    }),
    steps,
  );
  expect(result.taxonomy).toBe("not_point_in_time_safe");
  expect(steps).toEqual([]);
});

test("unmappable material performs no S.2A work", () => {
  const steps: string[] = [];
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      material_override: ["malformed"],
    }),
    steps,
  );
  expect(result.taxonomy).toBe("unmappable");
  expect(steps).toEqual([]);
});

test("all non-issued terminal results omit downstream result fields", () => {
  const results = [
    issue(createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      remove_first_closure: true,
    })),
    issue(createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      conflict_registry: true,
    })),
    issue(createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      unsafe_source_instant: true,
    })),
    issue(createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      material_override: ["malformed"],
    })),
  ];
  for (const result of results) {
    expect(result.taxonomy).not.toBe("issued");
    expect("s2a_completion_result_digest" in result).toBe(false);
    expect(result.downstream_activity).toEqual({
      s2a_request_construction_count: 0,
      s2a_call_count: 0,
      s2a_result_digest_work_count: 0,
    });
  }
});

test("pre-downstream attestation tampering is rejected before S.2A", () => {
  const steps: string[] = [];
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      mutate_admission: (admission) => {
        admission.completion_material_digest = "a".repeat(64);
      },
    }),
    steps,
  );
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toEqual(
    expect.arrayContaining([
      "pre_downstream_admission_digest_mismatch",
      "pre_downstream_completion_material_digest_mismatch",
    ]),
  );
  expect(steps).toEqual([]);
});

test("epoch rollback is rejected before S.2A", () => {
  const steps: string[] = [];
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      rollback_epoch: true,
    }),
    steps,
  );
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toContain("issuer_epoch_rollback_detected");
  expect(steps).toEqual([]);
});

test("default-off returns before request, authority, and digest work", () => {
  let requestReads = 0;
  const request = new Proxy({}, {
    ownKeys() {
      requestReads += 1;
      throw new Error("must not inspect");
    },
  });
  let authorityReads = 0;
  const result = issueRecommendationOutcomeEvidenceV2(
    request,
    {
      enabled: false,
      kill_switch: false,
      get authority(): never {
        authorityReads += 1;
        throw new Error("must not inspect");
      },
    },
  );
  expect(result.taxonomy).toBe("incomplete");
  expect(result.reason_codes).toEqual(["issuance_default_off"]);
  expect(requestReads).toBe(0);
  expect(authorityReads).toBe(0);
  expect(result.downstream_activity).toEqual({
    s2a_request_construction_count: 0,
    s2a_call_count: 0,
    s2a_result_digest_work_count: 0,
  });
});

test("kill switch returns before request, authority, and digest work", () => {
  let requestReads = 0;
  const request = new Proxy({}, {
    ownKeys() {
      requestReads += 1;
      throw new Error("must not inspect");
    },
  });
  let authorityReads = 0;
  const result = issueRecommendationOutcomeEvidenceV2(
    request,
    {
      enabled: true,
      kill_switch: true,
      get authority(): never {
        authorityReads += 1;
        throw new Error("must not inspect");
      },
    },
  );
  expect(result.reason_codes).toEqual(["issuance_kill_switch_active"]);
  expect(requestReads).toBe(0);
  expect(authorityReads).toBe(0);
});

test("failure provenance distinguishes rejected observed inputs", () => {
  const first = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      row_suffix: "failure-a",
      conflict_registry: true,
    }),
  );
  const second = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      row_suffix: "failure-b",
      conflict_registry: true,
    }),
  );
  expect(first.taxonomy).toBe(second.taxonomy);
  expect(first.failure_identity_digest)
    .not.toBe(second.failure_identity_digest);
  expect(first.result_digest).not.toBe(second.result_digest);
});

test("different malformed materials retain distinct no-downstream failure identities", () => {
  const build = (material: unknown) =>
    issue(
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
        material_override: material,
      }),
    );
  const first = build(["malformed-a"]);
  const second = build(["malformed-b"]);
  expect(first.taxonomy).toBe("unmappable");
  expect(second.taxonomy).toBe("unmappable");
  expect(first.failure_identity_digest)
    .not.toBe(second.failure_identity_digest);
  expect(first.downstream_activity).toEqual({
    s2a_request_construction_count: 0,
    s2a_call_count: 0,
    s2a_result_digest_work_count: 0,
  });
  expect("s2a_completion_result_digest" in first).toBe(false);
});

test("sanitized lookup failure exposes no private exception", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      throw_on_read: true,
    }),
  );
  expect(result.taxonomy).toBe("incomplete");
  expect(result.reason_codes).toEqual([
    "issuance_material_lookup_failed_sanitized",
  ]);
  expect(JSON.stringify(result)).not.toContain("private issuer");
});

test("caller authority claims in request are rejected before authority read", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2();
  const result = issueRecommendationOutcomeEvidenceV2(
    {
      ...fixture.request,
      canonical: true,
      finality: "caller-claimed",
      trust_root_digest: "a".repeat(64),
    },
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(result.taxonomy).toBe("unmappable");
  expect(fixture.authority_read_count()).toBe(0);
});

test("reordered closure input is canonical and byte-deterministic", () => {
  const ordered = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2(),
  );
  const reversed = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2({
      reverse_closure_order: true,
    }),
  );
  expect(reversed.taxonomy).toBe("issued");
  expect(reversed.result_digest).toBe(ordered.result_digest);
  expect(reversed.issuance_envelope?.issuance_digest)
    .toBe(ordered.issuance_envelope?.issuance_digest);
});

test("request and material inputs remain immutable", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2();
  const requestBefore = JSON.stringify(fixture.request);
  const materialBefore = JSON.stringify(fixture.material);
  issue(fixture);
  expect(JSON.stringify(fixture.request)).toBe(requestBefore);
  expect(JSON.stringify(fixture.material)).toBe(materialBefore);
});

test("issued result independently verifies and self-consistent tampering fails", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV2(),
  );
  expect(
    independentlyVerifyRecommendationOutcomeEvidenceIssuanceV2(result),
  ).toEqual(expect.objectContaining({ verified: true }));
  const tampered = structuredClone(result);
  tampered.downstream_activity.s2a_call_count = 0;
  expect(
    independentlyVerifyRecommendationOutcomeEvidenceIssuanceV2(tampered),
  ).toEqual(expect.objectContaining({ verified: false }));
});

test("V2 issued material traverses the unchanged S.2A/R.2/Q.1/P.2A/O.2A chain", () => {
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2();
  expect(interp(interop)).toEqual({
    t2a: "issued",
    s2a: "completed",
    r2: "bindable",
    q1: "ready",
    p2a: "captured",
    o2a: "joined",
  });
  expect(interop.completion_material_digest).toBe(
    interop.predecessor_completion_material_digest,
  );
});

test("golden matrix is stable across reversed scenario construction", () => {
  const forward =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV2();
  const reverse =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV2({
      reverse_input_order: true,
    });
  expect(forward.result_digest).toBe(reverse.result_digest);
  expect(forward.scenario_count).toBe(12);
  expect(forward.taxonomy_counts).toEqual({
    issued: 2,
    incomplete: 3,
    conflicting: 5,
    not_point_in_time_safe: 1,
    unmappable: 1,
  });
});

test("golden matrix keeps non-issued downstream activity at zero", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV2();
  for (const scenario of matrix.scenarios) {
    if (scenario.taxonomy === "issued") continue;
    expect(scenario.downstream_activity).toEqual({
      s2a_request_construction_count: 0,
      s2a_call_count: 0,
      s2a_result_digest_work_count: 0,
    });
    expect(scenario.downstream_steps).toEqual([]);
    expect(scenario.s2a_result_field_present).toBe(false);
  }
});

test("machine-readable golden evidence matches canonical runtime output", () => {
  const golden = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667t2a-issued-only-downstream-invocation-synthetic-golden.json",
      ),
      "utf8",
    ),
  );
  expect(golden).toEqual(
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV2(),
  );
});

function interp(
  interop: ReturnType<
    typeof buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV2
  >,
) {
  return {
    t2a: interop.issuance.taxonomy,
    s2a: interop.completion.taxonomy,
    r2: interop.projection.taxonomy,
    q1: interop.q1_admission.taxonomy,
    p2a: interop.p2a_capture.taxonomy,
    o2a: interop.o2a_join.taxonomy,
  };
}
