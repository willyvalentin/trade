import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v1";
import {
  completeRepositoryOwnedRecommendationOutcomeEvidenceV1,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v1";
import {
  buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV2,
  createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-fixtures-v2";
import {
  completeRepositoryOwnedRecommendationOutcomeEvidenceV2,
} from "../../lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v2";

const repositoryRoot = resolve(__dirname, "../..");
const canonicalJson = (value: unknown): string =>
  Array.isArray(value)
    ? `[${value.map(canonicalJson).join(",")}]`
    : value !== null && typeof value === "object"
      ? `{${Object.keys(value)
          .sort()
          .map(
            (key) =>
              `${JSON.stringify(key)}:${canonicalJson(
                (value as Record<string, unknown>)[key],
              )}`,
          )
          .join(",")}}`
      : JSON.stringify(value);
const sha = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
const completeV2 = (
  fixture: ReturnType<
    typeof createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2
  >,
) =>
  completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );

test("successor refreeze verifies five normative bytes and canonical digest", () => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667s2a-outcome-evidence-completion-v2-refreeze-manifest.json",
      ),
      "utf8",
    ),
  );
  const inventory = manifest.successor.normative_artifacts
    .map((artifact: { path: string; sha256: string }) => {
      expect(
        sha(readFileSync(resolve(repositoryRoot, artifact.path))),
        artifact.path,
      ).toBe(artifact.sha256);
      return {
        path: artifact.path,
        sha256: artifact.sha256,
      };
    })
    .sort(
      (left: { path: string }, right: { path: string }) =>
        left.path.localeCompare(right.path),
    );
  expect(inventory).toHaveLength(5);
  expect(sha(JSON.stringify(inventory))).toBe(
    "d1ffb54d3179fd3213fdbe023d537681eeace72c06fb390784748d271fd69bc0",
  );
  const { freeze_digest: freezeDigest, ...basis } = manifest;
  expect(sha(canonicalJson(basis))).toBe(freezeDigest);
});

test("predecessor freeze and historical findings remain byte-identical", () => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667s2a-outcome-evidence-completion-v2-refreeze-manifest.json",
      ),
      "utf8",
    ),
  );
  expect(manifest.predecessor).toEqual({
    contract_version:
      "repository_owned_recommendation_outcome_evidence_completion_v1",
    normative_inventory_digest:
      "c5d969e48029539109b7f4cf0e7ca39ebc573d0572e9b3d11c897717cab52e99",
    freeze_digest:
      "2c12653bfc3a40cf6aff3e95e11014fef1351067f6b20c84b9888a4fb988ec55",
    review_evidence_digest:
      "e8f93db596e7503f7665ca19a33647e8d80c0eb9992232ecea5cce8db6929bc6",
    preserved_byte_identically: true,
    classification: "historical_predecessor_retained",
  });
});

test("independent rereview evidence is canonical and approves with no findings", () => {
  const evidence = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667s2a-outcome-evidence-completion-v2-independent-rereview.json",
      ),
      "utf8",
    ),
  );
  const {
    review_evidence_digest: reviewEvidenceDigest,
    ...basis
  } = evidence;
  expect(sha(canonicalJson(basis))).toBe(reviewEvidenceDigest);
  expect(evidence.finding_counts).toEqual({
    blocker: 0,
    major: 0,
    minor: 0,
    nit: 0,
  });
  expect(evidence.findings).toEqual([]);
  expect(evidence.decision).toMatchObject({
    independent_rereview_approved: true,
    local_checkpoint_ready: true,
    remediation_performed_during_rereview: false,
  });
});

test("clean-room review reproduces V1 authority mutation and verifies V2 closure", () => {
  const v1 =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  const trusted = structuredClone(
    v1.authority.expected_registry_anchor,
  );
  const originalRead = v1.authority.read_completion_material;
  v1.authority.expected_registry_anchor.registry_digest =
    "f".repeat(64);
  v1.authority.read_completion_material = () => {
    Object.assign(v1.authority.expected_registry_anchor, trusted);
    return originalRead();
  };
  expect(
    completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
      v1.request,
      {
        enabled: true,
        kill_switch: false,
        authority: v1.authority,
      },
    ).taxonomy,
  ).toBe("completed");

  const v2 =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      mutate_anchor_before_read: (anchor) => {
        anchor.registry_digest = "f".repeat(64);
      },
      mutate_anchor_during_read: (anchor) => {
        Object.assign(anchor, trusted);
      },
    });
  const v2Result = completeV2(v2);
  expect(v2Result.taxonomy).not.toBe("completed");
  expect(v2Result.authority_snapshot.registry_digest).toBe(
    "f".repeat(64),
  );
});

test("clean-room review reproduces V1 recursion and verifies bounded V2", () => {
  const v1 =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV1();
  let extreme: Record<string, unknown> = {};
  for (let depth = 0; depth < 25_000; depth += 1) {
    extreme = { child: extreme };
  }
  expect(() =>
    completeRepositoryOwnedRecommendationOutcomeEvidenceV1(
      { ...v1.request, extreme },
      {
        enabled: true,
        kill_switch: false,
        authority: v1.authority,
      },
    ),
  ).toThrow();

  const v2 =
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2();
  const result =
    completeRepositoryOwnedRecommendationOutcomeEvidenceV2(
      { ...v2.request, extreme },
      {
        enabled: true,
        kill_switch: false,
        authority: v2.authority,
      },
    );
  expect(result.taxonomy).toBe("unmappable");
  expect(result.reason_codes).toContain(
    "bounded_validation:depth_budget_exceeded",
  );
});

test("clean-room review verifies closure-set identity and closed schema", () => {
  const canonical = completeV2(
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2(),
  );
  const reordered = completeV2(
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      reverse_closure_order: true,
    }),
  );
  expect(canonical.taxonomy).toBe("completed");
  expect(reordered.taxonomy).toBe("completed");
  expect(reordered.result_digest).toBe(canonical.result_digest);
  const callerClaim = completeV2(
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
      add_unknown_closure_field: true,
    }),
  );
  expect(callerClaim.taxonomy).not.toBe("completed");
});

test("clean-room review verifies rejected material forensic separation", () => {
  const resultFor = (suffix: string) =>
    completeV2(
      createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2({
        mutate_material: (material) => {
          (
            material.registry as Record<string, unknown>
          ).registry_identity = "invalid-registry";
          (
            material.observed_repository_row as Record<string, unknown>
          ).name = `row-${suffix}`;
          (
            material.observed_evidence_bundle as Record<string, unknown>
          ).bundle_identity = `bundle-${suffix}`;
        },
      }),
    );
  const first = resultFor("a");
  const second = resultFor("b");
  expect(first.failure_identity_digest).not.toBe(
    second.failure_identity_digest,
  );
  for (const namespace of ["repository_row", "evidence_bundle"]) {
    expect(
      first.observed_input_provenance.sections.find(
        (section) => section.namespace === namespace,
      )?.disposition,
    ).toBe("present_rejected");
  }
});

test("clean-room review verifies deterministic golden and diagnostic boundary", () => {
  const matrix =
    buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV2();
  const reversed =
    buildSyntheticRecommendationOutcomeEvidenceCompletionGoldenMatrixV2({
      reverse_input_order: true,
    });
  expect(reversed.result_digest).toBe(matrix.result_digest);
  const result = completeV2(
    createSyntheticRecommendationOutcomeEvidenceCompletionFixtureV2(),
  );
  expect(result).toMatchObject({
    taxonomy: "completed",
    diagnostic_only: true,
    real_outcome_source_accessed: false,
    canonical_performance_eligible: false,
    automatic_model_input_allowed: false,
    live_ranking_effect: false,
  });
});

test("clean-room review finds no caller authority or external side-effect path", () => {
  const implementation = readFileSync(
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab/recommendation-outcome-evidence-completion-v2.ts",
    ),
    "utf8",
  );
  expect(implementation).not.toContain("DATABENTO_API_KEY");
  expect(implementation).not.toContain("fetch(");
  expect(implementation).not.toContain("createClient(");
  expect(implementation).not.toContain("process.env");
  expect(implementation).not.toContain("665");
  expect(implementation).not.toContain("666");
});
