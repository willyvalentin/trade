import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";
import {
  buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV1,
  buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV1,
  createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v1";
import {
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_ENVELOPE_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V1,
  RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1,
  completionMaterialFromIssuedEvidenceV1,
  independentlyVerifyRecommendationOutcomeEvidenceIssuanceV1,
  issueRecommendationOutcomeEvidenceV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v1";

const repositoryRoot = resolve(__dirname, "../..");
const issue = (
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1
  >,
) =>
  issueRecommendationOutcomeEvidenceV1(fixture.request, {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
  });

test("contract versions a closed taxonomy and diagnostic-only boundary", () => {
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_V1).toBe(
    "repository_owned_recommendation_outcome_evidence_issuance_v1",
  );
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_TAXONOMY_V1).toEqual([
    "issued",
    "incomplete",
    "conflicting",
    "not_point_in_time_safe",
    "unmappable",
  ]);
  expect(RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_BOUNDARY_V1).toEqual(
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

test("issued envelope binds all eighteen closure evidence records", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1();
  const result = issue(fixture);
  expect(result.taxonomy).toBe("issued");
  expect(result.reason_codes).toEqual([]);
  expect(result.issuance_envelope?.envelope_version).toBe(
    RECOMMENDATION_OUTCOME_EVIDENCE_ISSUANCE_ENVELOPE_V1,
  );
  const bundle = result.issuance_envelope?.completion_material
    .observed_evidence_bundle as {
      gap_closures: Array<{ gap_code: string }>;
    };
  expect(bundle.gap_closures.map((closure) => closure.gap_code).sort())
    .toEqual([...RECOMMENDATION_OUTCOME_NOT_BINDABLE_GAPS_V1]);
  expect(fixture.authority_read_count()).toBe(1);
  const reordered = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      reverse_closure_order: true,
    }),
  );
  expect(reordered.issuance_envelope?.issuance_digest).toBe(
    result.issuance_envelope?.issuance_digest,
  );
  expect(reordered.result_digest).toBe(result.result_digest);
});

test("only issued results expose material to S.2A", () => {
  const issued = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1(),
  );
  const incomplete = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      remove_first_closure: true,
    }),
  );
  expect(completionMaterialFromIssuedEvidenceV1(issued)).not.toBeNull();
  expect(incomplete.taxonomy).toBe("incomplete");
  expect(completionMaterialFromIssuedEvidenceV1(incomplete)).toBeNull();
});

test("synthetic issued envelope interoperates through S.2A, R.2, Q.1, P.2A and O.2A", () => {
  const interop =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceInteropV1();
  expect({
    t1: interop.issuance.taxonomy,
    s2a: interop.completion.taxonomy,
    r2: interop.projection.taxonomy,
    q1: interop.q1_admission.taxonomy,
    p2a: interop.p2a_capture.taxonomy,
    o2a: interop.o2a_join.taxonomy,
  }).toEqual({
    t1: "issued",
    s2a: "completed",
    r2: "bindable",
    q1: "ready",
    p2a: "captured",
    o2a: "joined",
  });
});

test("nanosecond instants, membership, lineage and trust roots remain bound", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1(),
  );
  const bundle = result.issuance_envelope?.completion_material
    .observed_evidence_bundle as {
      instants: Record<string, string>;
      opportunity_set: { immutable: boolean; membership_digest: string };
      model: { lineage_digest: string };
      evaluator: { lineage_digest: string };
      outcome: { lineage_digest: string };
      explanation: { lineage_digest: string };
    };
  for (const instant of Object.values(bundle.instants)) {
    expect(instant).toMatch(/^[0-9]+$/);
  }
  expect(bundle.opportunity_set.immutable).toBe(true);
  expect(bundle.opportunity_set.membership_digest).toMatch(/^[a-f0-9]{64}$/);
  for (
    const lineage of [
      bundle.model,
      bundle.evaluator,
      bundle.outcome,
      bundle.explanation,
    ]
  ) {
    expect(lineage.lineage_digest).toMatch(/^[a-f0-9]{64}$/);
  }
  expect(result.issuance_envelope?.trust_root_digest)
    .toMatch(/^[a-f0-9]{64}$/);
});

test("authority anchor is atomically snapshotted before the single callback", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      mutate_anchor_during_read: (anchor) => {
        anchor.registry_digest = "f".repeat(64);
        anchor.minimum_epoch = "999";
      },
    });
  const result = issue(fixture);
  expect(result.taxonomy).toBe("issued");
  expect(result.issuer_authority_snapshot.registry_digest)
    .not.toBe("f".repeat(64));
  expect(result.issuer_authority_snapshot.minimum_epoch).toBe("7");
  expect(fixture.authority_read_count()).toBe(1);
});

test("caller authority, finality or trust-root claims are rejected before authority reads", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1();
  const request = {
    ...fixture.request,
    authority: { trusted: true },
    finality: true,
    trust_root_digest: "a".repeat(64),
  };
  const result = issueRecommendationOutcomeEvidenceV1(
    request as never,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(result.taxonomy).toBe("unmappable");
  expect(result.reason_codes).toContain(
    "issuance_request:closed_schema_mismatch",
  );
  expect(fixture.authority_read_count()).toBe(0);
});

test("epoch rollback is fail-closed even with a self-consistent registry digest", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      mutate_registry: (registry) => {
        registry.epoch.value = "6";
      },
      reanchor_after_registry_mutation: true,
    }),
  );
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toContain("issuer_epoch_rollback_detected");
});

test("predecessor substitution fails closed", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      mutate_registry: (registry) => {
        registry.epoch.predecessor_issuance_digest = "a".repeat(64);
      },
      reanchor_after_registry_mutation: true,
    }),
  );
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toContain(
    "predecessor_issuance_digest_mismatch",
  );
});

test("issuer, registry and trust-root replacement cannot be caller-reanchored", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      mutate_registry: (registry) => {
        registry.issuer.identity = "caller-issuer";
        registry.trust_root_digest = "b".repeat(64);
      },
      reanchor_after_registry_mutation: true,
    }),
  );
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toEqual(
    expect.arrayContaining(["issuer_identity_mismatch", "trust_root_digest_mismatch"]),
  );
});

test("missing closure evidence remains incomplete and cannot expose an envelope", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      remove_first_closure: true,
    }),
  );
  expect(result.taxonomy).toBe("incomplete");
  expect(result.issuance_envelope).toBeNull();
  expect(result.s2a_completion_result_digest).toMatch(/^[a-f0-9]{64}$/);
});

test("point-in-time unsafe evidence cannot be issued", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      unsafe_source_instant: true,
    }),
  );
  expect(result.taxonomy).not.toBe("issued");
  expect(result.issuance_envelope).toBeNull();
});

test("failure provenance binds different rejected observed inputs distinctly", () => {
  const build = (suffix: string) =>
    issue(
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        row_suffix: suffix,
        mutate_registry: (registry) => {
          registry.issuer.identity = "rejected-issuer";
        },
      }),
    );
  const first = build("failure-a");
  const second = build("failure-b");
  expect(first.taxonomy).toBe(second.taxonomy);
  expect(first.failure_identity_digest)
    .not.toBe(second.failure_identity_digest);
  expect(first.result_digest).not.toBe(second.result_digest);
  expect(
    first.observed_input_provenance.sections.every((section) =>
      section.observed_digest.match(/^[a-f0-9]{64}$/)
    ),
  ).toBe(true);
});

test("lookup exceptions are sanitized and do not leak raw messages", () => {
  const fixture =
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
      throw_on_read: true,
    });
  const result = issue(fixture);
  expect(result.taxonomy).toBe("incomplete");
  expect(result.reason_codes).toEqual([
    "issuance_material_lookup_failed_sanitized",
  ]);
  expect(JSON.stringify(result)).not.toContain("private issuer");
  expect(fixture.authority_read_count()).toBe(1);
});

test("accessors, proxies, cycles and excessive arrays fail closed without unsafe reads", () => {
  let accessorReads = 0;
  const accessor: Record<string, unknown> = {};
  Object.defineProperty(accessor, "secret", {
    enumerable: true,
    get() {
      accessorReads += 1;
      return "must-not-read";
    },
  });
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  const hostile = [
    accessor,
    cycle,
    { values: Array(4_097).fill(null) },
    new Proxy({}, {
      ownKeys() {
        throw new Error("private proxy detail");
      },
    }),
  ];
  for (const material of hostile) {
    const result = issue(
      createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1({
        material_override: material,
      }),
    );
    expect(result.taxonomy).not.toBe("issued");
    expect(JSON.stringify(result)).not.toContain("private proxy");
  }
  expect(accessorReads).toBe(0);
});

test("verified snapshots and envelopes are deeply frozen against post-verification mutation", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1(),
  );
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.issuer_authority_snapshot)).toBe(true);
  expect(Object.isFrozen(result.issuance_envelope)).toBe(true);
  expect(Object.isFrozen(result.issuance_envelope?.completion_material))
    .toBe(true);
  expect(
    Object.isFrozen(
      result.issuance_envelope?.completion_material
        .observed_evidence_bundle,
    ),
  ).toBe(true);
});

test("default-off performs zero request and authority work", () => {
  let requestReads = 0;
  const request = new Proxy({}, {
    ownKeys() {
      requestReads += 1;
      throw new Error("must not inspect disabled request");
    },
  });
  let authorityReads = 0;
  const authority = new Proxy({}, {
    ownKeys() {
      authorityReads += 1;
      throw new Error("must not inspect disabled authority");
    },
  });
  const result = issueRecommendationOutcomeEvidenceV1(
    request as never,
    {
      enabled: false,
      kill_switch: false,
      authority: authority as never,
    },
  );
  expect(result.taxonomy).toBe("incomplete");
  expect(result.reason_codes).toEqual(["issuance_default_off"]);
  expect(requestReads).toBe(0);
  expect(authorityReads).toBe(0);
});

test("kill switch performs zero request and authority work", () => {
  let reads = 0;
  const hostile = new Proxy({}, {
    ownKeys() {
      reads += 1;
      throw new Error("must not inspect killed work");
    },
  });
  const result = issueRecommendationOutcomeEvidenceV1(
    hostile as never,
    {
      enabled: true,
      kill_switch: true,
      authority: hostile as never,
    },
  );
  expect(result.taxonomy).toBe("incomplete");
  expect(result.reason_codes).toEqual(["issuance_kill_switch_active"]);
  expect(reads).toBe(0);
});

test("independent rebuild detects self-consistent result and envelope tampering", () => {
  const result = issue(
    createSyntheticRecommendationOutcomeEvidenceIssuanceFixtureV1(),
  );
  expect(
    independentlyVerifyRecommendationOutcomeEvidenceIssuanceV1(result),
  ).toEqual(expect.objectContaining({ verified: true }));
  const tampered = structuredClone(result) as unknown as {
    issuance_envelope: {
      issuer_epoch: string;
    } | null;
  } & typeof result;
  if (!tampered.issuance_envelope) throw new Error("missing envelope");
  tampered.issuance_envelope.issuer_epoch = "8";
  expect(
    independentlyVerifyRecommendationOutcomeEvidenceIssuanceV1(tampered),
  ).toEqual(expect.objectContaining({ verified: false }));
});

test("golden matrix is input-order deterministic and byte-equal across timezones", () => {
  const forward =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV1();
  const reverse =
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV1({
      reverse_input_order: true,
    });
  expect(reverse).toEqual(forward);
  const script = [
    "const module = await import('./lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-fixtures-v1.ts');",
    "const build = module.default?.buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV1",
    "?? module.buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV1;",
    "process.stdout.write(JSON.stringify(build()));",
  ].join(" ");
  const outputs = ["UTC", "Europe/Stockholm", "America/New_York"].map(
    (timezone) => {
      const child = spawnSync(
        process.execPath,
        ["--import", "jiti/register", "-e", script],
        {
          cwd: repositoryRoot,
          encoding: "utf8",
          env: { ...process.env, TZ: timezone },
        },
      );
      expect(child.status, child.stderr).toBe(0);
      return child.stdout;
    },
  );
  expect(new Set(outputs).size).toBe(1);
  expect(JSON.parse(outputs[0])).toEqual(forward);
});

test("machine-readable golden evidence has exact runtime parity", () => {
  const golden = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667t1-recommendation-outcome-evidence-issuance-synthetic-golden.json",
      ),
      "utf8",
    ),
  );
  expect(golden).toEqual(
    buildSyntheticRecommendationOutcomeEvidenceIssuanceGoldenMatrixV1(),
  );
});

test("implementation has no provider, database, writer or live import path", () => {
  const source = readFileSync(
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab/recommendation-outcome-evidence-issuance-v1.ts",
    ),
    "utf8",
  );
  for (
    const forbidden of [
      "DATABENTO_API_KEY",
      "@databento",
      "from \"@/lib/db",
      "from \"@/lib/supabase",
      "prisma",
      "drizzle",
      "insert(",
      "update(",
      "delete(",
      "live-ranking",
    ]
  ) {
    expect(source).not.toContain(forbidden);
  }
});
