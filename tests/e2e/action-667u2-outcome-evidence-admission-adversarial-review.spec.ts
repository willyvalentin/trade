import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
  type RecommendationOutcomeEvidenceBundleV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V1,
  buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1,
  buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV1,
  createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1,
  reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1,
  admitRecommendationOutcomeEvidenceV1,
  computeRecommendationOutcomeEvidenceAdmissionResultDigestV1,
  type RecommendationOutcomeEvidenceAdmissionEnvelopeV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-admission-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v2";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v3";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v4";

const repositoryRoot = resolve(__dirname, "../..");
const freezeManifestPath = resolve(
  repositoryRoot,
  "docs/evidence/action-667u2-outcome-evidence-admission-foundation-freeze-manifest.json",
);
const normativeDigest =
  "d32e110db2d82997dca0cd9c7d974affb570fbc11342ae7c495f72e9ed55ac2b";
const goldenDigest =
  "de833b06bfcb99f055abf91f82be844da6443585413f29744fa345b395c56a1d";

const canonicalJson = (value: unknown): string =>
  Array.isArray(value)
    ? `[${value.map(canonicalJson).join(",")}]`
    : value !== null && typeof value === "object"
      ? `{${Object.keys(value)
          .sort()
          .map((key) =>
            `${JSON.stringify(key)}:${canonicalJson(
              (value as Record<string, unknown>)[key],
            )}`
          )
          .join(",")}}`
      : JSON.stringify(value);

function admit(
  candidateInput: unknown,
  trustedAuthorityJson?: string,
) {
  return admitRecommendationOutcomeEvidenceV1(candidateInput, {
    enabled: true,
    kill_switch: false,
    trusted_authority_json: trustedAuthorityJson,
  });
}

function expectNoDownstream(
  result: ReturnType<typeof admitRecommendationOutcomeEvidenceV1>,
) {
  expect(result.taxonomy).not.toBe("admitted");
  expect(result.admission_request_constructed).toBe(false);
  expect(result.t_v4_rebuild_called).toBe(false);
  expect(result.downstream_digest_work).toBe(false);
  expect(result.t_v4_result_digest).toBeNull();
  expect(result.admitted_snapshot_digest).toBeNull();
}

function materialBundle(
  candidate: RecommendationOutcomeEvidenceAdmissionEnvelopeV1,
) {
  return candidate.t_v4_material.completion_material
    .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
}

test("freeze manifest binds exactly five immutable U.1 artifacts", () => {
  const manifest = JSON.parse(readFileSync(freezeManifestPath, "utf8"));
  const inventory = manifest.normative_artifacts
    .map((artifact: { path: string; sha256: string }) => {
      const bytes = readFileSync(resolve(repositoryRoot, artifact.path));
      expect(
        createHash("sha256").update(bytes).digest("hex"),
        artifact.path,
      ).toBe(artifact.sha256);
      return { path: artifact.path, sha256: artifact.sha256 };
    })
    .sort(
      (
        left: { path: string },
        right: { path: string },
      ) => left.path.localeCompare(right.path),
    );
  expect(inventory).toHaveLength(5);
  expect(
    createHash("sha256").update(JSON.stringify(inventory)).digest("hex"),
  ).toBe(normativeDigest);
  expect(manifest.golden_result_digest).toBe(goldenDigest);
  const { freeze_digest: freezeDigest, ...freezeBasis } = manifest;
  expect(
    createHash("sha256")
      .update(canonicalJson(freezeBasis))
      .digest("hex"),
  ).toBe(freezeDigest);
});

test("only final T V4 authority can reach admitted", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  expect(admit(fixture.candidate_json, fixture.trusted_authority_json).taxonomy)
    .toBe("admitted");
  for (
    const predecessor of [
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V2,
      RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V3,
      "unknown-t-version",
    ]
  ) {
    const candidate = structuredClone(fixture.candidate);
    candidate.t_v4_contract_version = predecessor as never;
    (
      candidate.t_v4_result as unknown as Record<string, unknown>
    ).contract_version = predecessor;
    const result = admit(
      reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(candidate),
      fixture.trusted_authority_json,
    );
    expectNoDownstream(result);
    expect(result.taxonomy).toBe("unmappable");
  }
  expect(fixture.candidate.t_v4_contract_version).toBe(
    RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V4,
  );
});

test("authority and trust-root substitution fail closed", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  const candidate = structuredClone(fixture.candidate);
  candidate.t_v4_authority_anchor.trust_root_digest = "a".repeat(64);
  const candidateResult = admit(
    reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(candidate),
    fixture.trusted_authority_json,
  );
  expectNoDownstream(candidateResult);
  expect(candidateResult.reason_codes).toContain(
    "external_t_v4_authority_anchor_mismatch",
  );

  const authority = structuredClone(fixture.trusted_authority);
  authority.registry_digest = "b".repeat(64);
  const authorityResult = admit(
    fixture.candidate_json,
    canonicalJson(authority),
  );
  expectNoDownstream(authorityResult);
  expect(authorityResult.reason_codes).toContain(
    "external_t_v4_authority_anchor_mismatch",
  );
});

test("all eighteen gap bindings fail independently when omitted", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  expect(RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1).toHaveLength(18);
  for (const gapCode of RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1) {
    const candidate = structuredClone(fixture.candidate);
    const bundle = materialBundle(candidate);
    bundle.gap_closures = bundle.gap_closures.filter(
      (closure) => closure.gap_code !== gapCode,
    );
    const result = admit(
      reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(candidate),
      fixture.trusted_authority_json,
    );
    expectNoDownstream(result);
    expect(result.taxonomy, gapCode).toBe("conflicting");
    expect(result.reason_codes, gapCode).toContain(
      "all_eighteen_gap_bindings_required_without_inference",
    );
  }
});

test("candidate and trusted authority each have exactly one admitted read", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  let authorityReads = 0;
  const dependencies = {
    enabled: true,
    kill_switch: false,
    get trusted_authority_json() {
      authorityReads += 1;
      return fixture.trusted_authority_json;
    },
  };
  const result = admitRecommendationOutcomeEvidenceV1(
    fixture.candidate_json,
    dependencies,
  );
  expect(result.taxonomy).toBe("admitted");
  expect(authorityReads).toBe(1);
  expect(result.audit.candidate_input_read_count).toBe(1);
  expect(result.audit.candidate_descriptor_pass_count).toBe(1);
  expect(result.audit.trusted_authority_read_count).toBe(1);
  expect(result.audit.caller_input_reread_count).toBe(0);
});

test("nested accessors, proxies and cycles execute no caller hooks", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  let getterReads = 0;
  let proxyReads = 0;
  const accessor = Object.defineProperty({}, "candidate", {
    enumerable: true,
    get() {
      getterReads += 1;
      return fixture.candidate_json;
    },
  });
  const proxy = new Proxy(accessor, {
    ownKeys() {
      proxyReads += 1;
      return [];
    },
  });
  const proxyResult = admit(proxy, fixture.trusted_authority_json);
  expectNoDownstream(proxyResult);
  expect(getterReads).toBe(0);
  expect(proxyReads).toBe(0);

  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  const cycleResult = admit(cycle, fixture.trusted_authority_json);
  expectNoDownstream(cycleResult);
  expect(cycleResult.reason_codes).toContain(
    "admission_candidate:canonical_json_string_required",
  );
});

test("bounded-depth exhaustion is sanitized before admission work", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  let nested: Record<string, unknown> = {};
  for (let depth = 0; depth < 200; depth += 1) nested = { nested };
  const candidate = {
    ...structuredClone(fixture.candidate),
    nested,
  };
  const result = admit(canonicalJson(candidate), fixture.trusted_authority_json);
  expectNoDownstream(result);
  expect(result.reason_codes).toContain(
    "bounded_validation:depth_budget_exceeded",
  );
});

test("snapshots and results are deeply frozen and mutation-isolated", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  const result = admit(fixture.candidate_json, fixture.trusted_authority_json);
  const digest = result.result_digest;
  fixture.candidate.evidence_identity = "post-snapshot-mutation";
  fixture.trusted_authority.trust_root_digest = "c".repeat(64);
  expect(result.result_digest).toBe(digest);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.audit)).toBe(true);
  expect(result.audit.candidate_snapshot_deep_frozen).toBe(true);
  expect(result.audit.verified_snapshot_only_downstream).toBe(true);
});

test("all non-issued taxonomies perform zero downstream work", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1();
  for (
    const id of [
      "incomplete_non_issued_zero_work",
      "conflicting_non_issued_zero_work",
      "unsafe_non_issued_zero_work",
      "unmappable_non_issued_zero_work",
    ]
  ) {
    const scenario = matrix.scenarios.find((entry) => entry.id === id);
    expect(scenario, id).toBeDefined();
    expect(scenario?.admission_request_constructed, id).toBe(false);
    expect(scenario?.t_v4_rebuild_called, id).toBe(false);
    expect(scenario?.downstream_digest_work, id).toBe(false);
    expect(scenario?.trusted_authority_read_count, id).toBe(0);
  }
});

test("temporal finality is exact at minus one, boundary and plus one ns", () => {
  const results = [-1n, 0n, 1n].map((offset) => {
    const fixture =
      createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1(
        (issuance) => {
          const bundle = issuance.material.completion_material
            .observed_evidence_bundle as RecommendationOutcomeEvidenceBundleV1;
          bundle.instants.finalization_unix_ns = (
            BigInt(bundle.instants.receive_unix_ns) + offset
          ).toString();
          bundle.completed_projection.instants.outcome_finalization_unix_ns =
            bundle.instants.finalization_unix_ns;
        },
      );
    return admit(fixture.candidate_json, fixture.trusted_authority_json);
  });
  expect(results[0].taxonomy).toBe("not_point_in_time_safe");
  expectNoDownstream(results[0]);
  expect(results[1].taxonomy).toBe("admitted");
  expect(results[2].taxonomy).toBe("admitted");
});

test("membership, lineage and exact duplicate semantics remain bound", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  for (const mutate of [
    (candidate: RecommendationOutcomeEvidenceAdmissionEnvelopeV1) => {
      materialBundle(candidate).opportunity_set.membership_digest =
        "d".repeat(64);
    },
    (candidate: RecommendationOutcomeEvidenceAdmissionEnvelopeV1) => {
      materialBundle(candidate).lineage.source_lineage_digest =
        "e".repeat(64);
    },
  ]) {
    const candidate = structuredClone(fixture.candidate);
    mutate(candidate);
    expect(
      admit(
        reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(candidate),
        fixture.trusted_authority_json,
      ).taxonomy,
    ).not.toBe("admitted");
  }
  const first = admit(fixture.candidate_json, fixture.trusted_authority_json);
  const duplicate = admit(
    fixture.candidate_json,
    fixture.trusted_authority_json,
  );
  expect(duplicate).toEqual(first);
  expect(duplicate.result_digest).toBe(first.result_digest);
});

test("U2-001 reproduces rejected-input failure identity collisions", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  const malformedCandidateA = admit(
    "{\"candidate_a\":",
    fixture.trusted_authority_json,
  );
  const malformedCandidateB = admit(
    "{\"candidate_b\":",
    fixture.trusted_authority_json,
  );
  expect(malformedCandidateA.reason_codes).toEqual(
    malformedCandidateB.reason_codes,
  );
  expect(malformedCandidateA.failure_identity_digest).toBe(
    malformedCandidateB.failure_identity_digest,
  );
  expect(malformedCandidateA.result_digest).toBe(
    malformedCandidateB.result_digest,
  );

  const malformedAuthorityA = admit(fixture.candidate_json, "{\"authority_a\":");
  const malformedAuthorityB = admit(fixture.candidate_json, "{\"authority_b\":");
  expect(malformedAuthorityA.reason_codes).toEqual(
    malformedAuthorityB.reason_codes,
  );
  expect(malformedAuthorityA.failure_identity_digest).toBe(
    malformedAuthorityB.failure_identity_digest,
  );
  expect(malformedAuthorityA.result_digest).toBe(
    malformedAuthorityB.result_digest,
  );
});

test("supplied and terminal digests are rebuilt independently", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  const candidate = structuredClone(fixture.candidate);
  candidate.t_v4_result.result_digest = "f".repeat(64);
  const result = admit(
    reserializeRecommendationOutcomeEvidenceAdmissionCandidateV1(candidate),
    fixture.trusted_authority_json,
  );
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toContain(
    "independent_t_v4_digest_rebuild_mismatch",
  );
  expect(computeRecommendationOutcomeEvidenceAdmissionResultDigestV1(result))
    .toBe(result.result_digest);
});

test("full synthetic V4 through O.2A interoperability remains exact", () => {
  const interop = buildSyntheticRecommendationOutcomeEvidenceAdmissionInteropV1();
  expect({
    t_v4: interop.t_v4_admission.taxonomy,
    s2a: interop.s2a_completion.taxonomy,
    r2: interop.r2_projection.taxonomy,
    q1: interop.q1_admission.taxonomy,
    p2a: interop.p2a_capture.taxonomy,
    o2a: interop.o2a_join.taxonomy,
  }).toEqual({
    t_v4: "admitted",
    s2a: "completed",
    r2: "bindable",
    q1: "ready",
    p2a: "captured",
    o2a: "joined",
  });
});

test("default-off and kill switch retain zero-work audit", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceAdmissionFixtureV1();
  for (
    const dependencies of [
      {
        enabled: false,
        kill_switch: false,
        trusted_authority_json: fixture.trusted_authority_json,
      },
      {
        enabled: true,
        kill_switch: true,
        trusted_authority_json: fixture.trusted_authority_json,
      },
    ]
  ) {
    const result = admitRecommendationOutcomeEvidenceV1(
      fixture.candidate_json,
      dependencies,
    );
    expectNoDownstream(result);
    expect(result.audit.candidate_input_read_count).toBe(0);
    expect(result.audit.trusted_authority_read_count).toBe(0);
    expect(result.audit.candidate_getter_execution_count).toBe(0);
    expect(result.audit.candidate_proxy_hook_execution_count).toBe(0);
    expect(result.audit.candidate_callback_execution_count).toBe(0);
  }
});

test("golden rebuild is timezone and reversed-order deterministic", () => {
  const canonical =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1();
  const reversed =
    buildSyntheticRecommendationOutcomeEvidenceAdmissionGoldenMatrixV1({
      reverse_input_order: true,
    });
  expect(canonical.result_digest).toBe(goldenDigest);
  expect(reversed).toEqual(canonical);
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_FIXTURES_V1).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_fixtures_v1",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ADMISSION_V1).toBe(
    "repository_owned_recommendation_outcome_evidence_admission_v1",
  );
});
