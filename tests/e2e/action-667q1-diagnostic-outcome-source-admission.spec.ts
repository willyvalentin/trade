import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import {
  stableMarketContextDiagnosticContextJsonV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";
import {
  buildSyntheticOutcomeSourceAdmissionGoldenMatrixV1,
  buildSyntheticOutcomeSourceP2AO2AInteropV1,
  createSyntheticOutcomeSourceAdmissionFixtureV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-outcome-source-admission-fixtures-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_BOUNDARY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_COMPATIBILITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_TAXONOMY_V1,
  admitMarketContextDiagnosticOutcomeSourceBatchV1,
  admitMarketContextDiagnosticOutcomeSourceV1,
  verifyMarketContextDiagnosticOutcomeSourceAdmissionV1,
  type MarketContextDiagnosticOutcomeSourceAuthorityV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-outcome-source-admission-v1";

const repositoryRoot = resolve(__dirname, "../..");

function recursivelyFrozen(value: unknown): boolean {
  if (value === null || typeof value !== "object") return true;
  return (
    Object.isFrozen(value) &&
    Object.values(value).every((child) => recursivelyFrozen(child))
  );
}

test("Q.1 versions a closed taxonomy and diagnostic read-only boundary", () => {
  expect(MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_ADMISSION_V1).toBe(
    "market_context_diagnostic_outcome_source_admission_v1",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1).toBe(
    "market_context_diagnostic_outcome_source_registry_v1",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1).toBe(
    "market_context_diagnostic_outcome_source_authority_v1",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_TAXONOMY_V1).toEqual([
    "ready",
    "incomplete",
    "conflicting",
    "not_point_in_time_safe",
    "unmappable",
  ]);
  expect(MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_BOUNDARY_V1).toEqual({
    diagnostic_only: true,
    shadow_only: true,
    read_only: true,
    official_ohlcv: false,
    canonical_performance_eligible: false,
    automatic_model_input_allowed: false,
    automatic_training_allowed: false,
    automatic_promotion_allowed: false,
    probability_claimed: false,
    causal_claimed: false,
    live_ranking_effect: false,
  });
});

test("externally anchored admissible source becomes one deeply frozen ready handoff", () => {
  const fixture = createSyntheticOutcomeSourceAdmissionFixtureV1();
  const result = admitMarketContextDiagnosticOutcomeSourceV1(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(result.taxonomy).toBe("ready");
  expect(result.reason_codes).toEqual([
    "diagnostic_outcome_source_ready",
  ]);
  expect(result.authority_binding.verification_status).toBe("verified");
  expect(result.registry_binding.expected_registry_digest).toBe(
    fixture.authority.expected_registry_anchor.registry_digest,
  );
  expect(result.ready_handoff?.source_identity).toBe(
    fixture.source_payload.source_identity,
  );
  expect(fixture.authority_read_count()).toBe(1);
  expect(recursivelyFrozen(result)).toBe(true);
  expect(result.ready_handoff?.p2a_authority.authority_material).not.toBe(
    fixture.material.observed_source_payload.p2a_authority_material,
  );
});

test("default-off and kill switch perform zero request, authority, source, or digest work", () => {
  for (const mode of ["disabled", "kill_switch"] as const) {
    let requestReads = 0;
    let anchorReads = 0;
    let sourceReads = 0;
    const request = {};
    Object.defineProperty(request, "contract_version", {
      enumerable: true,
      get: () => {
        requestReads += 1;
        throw new Error("request must not be read");
      },
    });
    const authority: MarketContextDiagnosticOutcomeSourceAuthorityV1 = {
      authority_version:
        MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
      get expected_registry_anchor():
        MarketContextDiagnosticOutcomeSourceAuthorityV1["expected_registry_anchor"] {
        anchorReads += 1;
        throw new Error("anchor must not be read");
      },
      read_admission_material: () => {
        sourceReads += 1;
        throw new Error("source must not be read");
      },
    };
    const result = admitMarketContextDiagnosticOutcomeSourceV1(request, {
      enabled: mode !== "disabled",
      kill_switch: mode === "kill_switch",
      authority,
    });
    expect(requestReads).toBe(0);
    expect(anchorReads).toBe(0);
    expect(sourceReads).toBe(0);
    expect(result.ready_handoff).toBeNull();
    expect(result.authority_binding.verification_status).toBe(
      mode === "disabled"
        ? "not_read_default_off"
        : "not_read_kill_switch",
    );
  }
});

test("missing or incomplete outcome remains incomplete and never produces a handoff", () => {
  const fixture = createSyntheticOutcomeSourceAdmissionFixtureV1({
    mutate_p2a_payloads: (payloads) => {
      const completion = payloads.evaluator_outcome_source.completion as {
        status: string;
        completion_timestamp: string | null;
      };
      completion.status = "pending";
      completion.completion_timestamp = null;
    },
  });
  const result = admitMarketContextDiagnosticOutcomeSourceV1(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(result.taxonomy).toBe("incomplete");
  expect(result.reason_codes).toEqual([
    "outcome_not_final",
    "outcome_source_incomplete",
  ]);
  expect(result.ready_handoff).toBeNull();
});

test("source binding and external registry drift fail closed with observed provenance", () => {
  const sourceBinding = createSyntheticOutcomeSourceAdmissionFixtureV1({
    mutate_material: (material) => {
      material.observed_source_payload.source_identity =
        "synthetic-conflicting-source";
    },
  });
  const bindingResult = admitMarketContextDiagnosticOutcomeSourceV1(
    sourceBinding.request,
    {
      enabled: true,
      kill_switch: false,
      authority: sourceBinding.authority,
    },
  );
  expect(bindingResult.taxonomy).toBe("conflicting");
  expect(bindingResult.reason_codes).toContain(
    "observed_source_payload_binding_mismatch",
  );
  expect(
    bindingResult.observed_input_provenance.sections.find(
      (entry) => entry.namespace === "source_payload",
    )?.disposition,
  ).toBe("rejected");

  const registryDrift = createSyntheticOutcomeSourceAdmissionFixtureV1({
    anchor_override: {
      registry_digest: "a".repeat(64),
    },
  });
  const driftResult = admitMarketContextDiagnosticOutcomeSourceV1(
    registryDrift.request,
    {
      enabled: true,
      kill_switch: false,
      authority: registryDrift.authority,
    },
  );
  expect(driftResult.taxonomy).toBe("conflicting");
  expect(driftResult.reason_codes).toEqual([
    "external_registry_anchor_mismatch",
  ]);
  expect(driftResult.authority_binding.verification_status).toBe(
    "mismatch",
  );
});

test("opportunity membership and evaluator/outcome lineage drift are rejected", () => {
  const membership = createSyntheticOutcomeSourceAdmissionFixtureV1({
    mutate_source_payload: (payload) => {
      payload.opportunity_set.membership_digest = "b".repeat(64);
    },
  });
  const membershipResult = admitMarketContextDiagnosticOutcomeSourceV1(
    membership.request,
    {
      enabled: true,
      kill_switch: false,
      authority: membership.authority,
    },
  );
  expect(membershipResult.taxonomy).toBe("conflicting");
  expect(membershipResult.reason_codes).toContain(
    "decision_opportunity_outcome_identity_drift",
  );

  const lineage = createSyntheticOutcomeSourceAdmissionFixtureV1({
    mutate_source_payload: (payload) => {
      payload.lineage.evaluator_lineage_digest = "c".repeat(64);
    },
  });
  const lineageResult = admitMarketContextDiagnosticOutcomeSourceV1(
    lineage.request,
    {
      enabled: true,
      kill_switch: false,
      authority: lineage.authority,
    },
  );
  expect(lineageResult.taxonomy).toBe("conflicting");
  expect(lineageResult.reason_codes).toContain(
    "evaluator_outcome_lineage_drift",
  );
});

test("nanosecond temporal and finality boundaries are exact", () => {
  const minusOne = createSyntheticOutcomeSourceAdmissionFixtureV1({
    mutate_source_payload: (payload) => {
      payload.instants.outcome_start_unix_ns = (
        BigInt(payload.instants.decision_unix_ns) - BigInt(1)
      ).toString();
    },
  });
  const exact = createSyntheticOutcomeSourceAdmissionFixtureV1({
    mutate_source_payload: (payload) => {
      payload.instants.outcome_start_unix_ns =
        payload.instants.decision_unix_ns;
    },
  });
  const plusOne = createSyntheticOutcomeSourceAdmissionFixtureV1();
  for (const fixture of [minusOne, exact]) {
    const result = admitMarketContextDiagnosticOutcomeSourceV1(
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    );
    expect(result.taxonomy).toBe("not_point_in_time_safe");
    expect(result.reason_codes).toContain(
      "outcome_temporal_finality_order_invalid",
    );
  }
  expect(
    admitMarketContextDiagnosticOutcomeSourceV1(plusOne.request, {
      enabled: true,
      kill_switch: false,
      authority: plusOne.authority,
    }).taxonomy,
  ).toBe("ready");

  const finalizationAfterCapture =
    createSyntheticOutcomeSourceAdmissionFixtureV1({
      mutate_source_payload: (payload) => {
        payload.instants.outcome_finalization_unix_ns = (
          BigInt(payload.instants.capture_unix_ns) + BigInt(1)
        ).toString();
      },
    });
  expect(
    admitMarketContextDiagnosticOutcomeSourceV1(
      finalizationAfterCapture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: finalizationAfterCapture.authority,
      },
    ).taxonomy,
  ).toBe("not_point_in_time_safe");
});

test("unfinalized outcome cannot be labeled ready", () => {
  const fixture = createSyntheticOutcomeSourceAdmissionFixtureV1({
    mutate_source_payload: (payload) => {
      payload.finality.status = "pending";
    },
  });
  const result = admitMarketContextDiagnosticOutcomeSourceV1(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(result.taxonomy).toBe("incomplete");
  expect(result.reason_codes).toEqual(["outcome_not_final"]);
  expect(result.ready_handoff).toBeNull();
});

test("duplicate admission and outcome identities fail closed", () => {
  const fixture = createSyntheticOutcomeSourceAdmissionFixtureV1();
  const results = admitMarketContextDiagnosticOutcomeSourceBatchV1(
    [fixture.request, fixture.request],
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(results).toHaveLength(2);
  expect(results.every((entry) => entry.taxonomy === "conflicting")).toBe(
    true,
  );
  expect(
    results.every((entry) =>
      entry.reason_codes.includes("duplicate_admission_identity"),
    ),
  ).toBe(true);
  expect(results.every((entry) => entry.ready_handoff === null)).toBe(true);
});

test("different rejected source payloads cannot collide in forensic identity", () => {
  const rejected = ["a", "b"].map((suffix) => {
    const fixture = createSyntheticOutcomeSourceAdmissionFixtureV1({
      mutate_material: (material) => {
        material.observed_source_payload.source_identity =
          `synthetic-rejected-source-${suffix}`;
      },
    });
    return admitMarketContextDiagnosticOutcomeSourceV1(fixture.request, {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    });
  });
  expect(rejected[0]?.taxonomy).toBe("conflicting");
  expect(rejected[0]?.reason_codes).toEqual(rejected[1]?.reason_codes);
  expect(rejected[0]?.failure_identity_digest).not.toBe(
    rejected[1]?.failure_identity_digest,
  );
  expect(rejected[0]?.result_digest).not.toBe(rejected[1]?.result_digest);
  expect(
    rejected[0]?.observed_input_provenance.sections.find(
      (entry) => entry.namespace === "source_payload",
    )?.observed_digest,
  ).not.toBe(
    rejected[1]?.observed_input_provenance.sections.find(
      (entry) => entry.namespace === "source_payload",
    )?.observed_digest,
  );
});

test("caller cannot inject authority roots, readiness, or observed digests", () => {
  const fixture = createSyntheticOutcomeSourceAdmissionFixtureV1();
  const injected = {
    ...structuredClone(fixture.request),
    expected_registry_anchor:
      fixture.authority.expected_registry_anchor,
    point_in_time_safe: true,
    observed_digest: "0".repeat(64),
  };
  const result = admitMarketContextDiagnosticOutcomeSourceV1(injected, {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
  });
  expect(result.taxonomy).toBe("conflicting");
  expect(result.reason_codes).toContain(
    "closed_schema_violation:$request",
  );
  expect(fixture.authority_read_count()).toBe(0);
});

test("ready handoff interoperates directly with P.2A and O.2A", () => {
  const interop = buildSyntheticOutcomeSourceP2AO2AInteropV1();
  expect(interop.admission.taxonomy).toBe("ready");
  expect(interop.capture.taxonomy).toBe("captured");
  expect(interop.joined.taxonomy).toBe("joined");
  expect(interop.joined.predictor_projection?.predictor_digest).toMatch(
    /^[a-f0-9]{64}$/,
  );
  expect(interop.joined.label_projection?.label_digest).toMatch(
    /^[a-f0-9]{64}$/,
  );
  expect(interop.joined.predictor_projection?.predictor_digest).not.toBe(
    interop.joined.label_projection?.label_digest,
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_COMPATIBILITY_V1).toEqual(
    expect.objectContaining({
      special_case_adapter_required: false,
      real_outcome_source_accessed: false,
      real_outcome_capture_performed: false,
      real_outcome_join_performed: false,
      canonical_binding_ready: false,
      automatic_model_input_allowed: false,
      live_ranking_effect: false,
    }),
  );
});

test("retries, reverse input order, verification, and deep freezing are deterministic", () => {
  const first = createSyntheticOutcomeSourceAdmissionFixtureV1();
  const second = createSyntheticOutcomeSourceAdmissionFixtureV1();
  const firstResult = admitMarketContextDiagnosticOutcomeSourceV1(
    first.request,
    {
      enabled: true,
      kill_switch: false,
      authority: first.authority,
    },
  );
  const secondResult = admitMarketContextDiagnosticOutcomeSourceV1(
    second.request,
    {
      enabled: true,
      kill_switch: false,
      authority: second.authority,
    },
  );
  expect(
    stableMarketContextDiagnosticContextJsonV1(firstResult),
  ).toBe(stableMarketContextDiagnosticContextJsonV1(secondResult));
  expect(
    verifyMarketContextDiagnosticOutcomeSourceAdmissionV1(
      firstResult,
      second.request,
      {
        enabled: true,
        kill_switch: false,
        authority: second.authority,
      },
    ),
  ).toBe(true);
  expect(
    buildSyntheticOutcomeSourceAdmissionGoldenMatrixV1({
      reverse_input_order: true,
    }),
  ).toEqual(buildSyntheticOutcomeSourceAdmissionGoldenMatrixV1());
  expect(recursivelyFrozen(firstResult)).toBe(true);
});

test("synthetic golden evidence is canonical and contains no real access", () => {
  const matrix = buildSyntheticOutcomeSourceAdmissionGoldenMatrixV1();
  const evidence = JSON.parse(
    readFileSync(
      "docs/evidence/action-667q1-diagnostic-outcome-source-admission-synthetic-golden.json",
      "utf8",
    ),
  );
  const taxonomyCounts = Object.fromEntries(
    MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_SOURCE_TAXONOMY_V1.map(
      (taxonomy) => [
        taxonomy,
        matrix.cases.filter((entry) => entry.taxonomy === taxonomy)
          .length,
      ],
    ),
  );
  expect(evidence.golden_matrix_digest).toBe(matrix.matrix_digest);
  expect(evidence.case_count).toBe(matrix.case_count);
  expect(evidence.taxonomy_counts).toEqual(taxonomyCounts);
  expect(evidence.interop).toEqual(matrix.interop);
  expect(evidence.duplicate_identity_taxonomies).toEqual(
    matrix.duplicate_identity_taxonomies,
  );
  expect(evidence.duplicate_identity_reason_codes).toEqual(
    matrix.duplicate_identity_reason_codes,
  );
  expect(evidence.synthetic_only).toBe(true);
  expect(evidence.real_outcome_source_accessed).toBe(false);
  expect(evidence.real_outcome_capture_performed).toBe(false);
  expect(evidence.real_outcome_join_performed).toBe(false);
});

test("fixed Q.1 cross-process digest", () => {
  const matrix = buildSyntheticOutcomeSourceAdmissionGoldenMatrixV1({
    reverse_input_order:
      process.env.ACTION_667Q1_INPUT_ORDER === "reverse",
  });
  console.log(`ACTION_667Q1_TZ_DIGEST=${matrix.matrix_digest}`);
  if (process.env.ACTION_667Q1_DUMP_MATRIX === "true") {
    console.log(
      `ACTION_667Q1_MATRIX_BASE64=${Buffer.from(
        JSON.stringify(matrix),
      ).toString("base64")}`,
    );
  }
  expect(matrix.case_count).toBe(12);
});

test("UTC A/B, Stockholm reverse, and New York are byte-identical", () => {
  test.setTimeout(180_000);
  const runs = [
    ["UTC", "canonical"],
    ["UTC", "canonical"],
    ["Europe/Stockholm", "reverse"],
    ["America/New_York", "canonical"],
  ] as const;
  const digests = runs.map(([timezone, order], index) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667q1-diagnostic-outcome-source-admission.spec.ts",
        "--grep",
        "fixed Q.1 cross-process digest",
        "--reporter=line",
        "--output",
        `/private/tmp/action-667q1-${index}-${timezone.replaceAll("/", "-")}`,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          ACTION_667Q1_INPUT_ORDER: order,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
        timeout: 120_000,
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(/ACTION_667Q1_TZ_DIGEST=([a-f0-9]{64})/)?.[1];
  });
  expect(digests.every((digest) => digest?.length === 64)).toBe(true);
  expect(new Set(digests).size).toBe(1);
});

test("Q.1 scope has no provider, DB, writer, persistence, live, dependency, or 665/666 import", () => {
  const paths = [
    "lib/market-context-intelligence-lab/diagnostic-outcome-source-admission-v1.ts",
    "lib/market-context-intelligence-lab/diagnostic-outcome-source-admission-fixtures-v1.ts",
  ];
  const source = paths.map((path) => readFileSync(path, "utf8")).join("\n");
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:@databento|supabase|database|writer|persistence|scanner|recommendation|publication|action-665|action-666)[^"']*["']/i,
  );
  expect(source).not.toContain("DATABENTO_API_KEY");
  expect(source).not.toMatch(/\bfetch\s*\(/);
  expect(source).not.toMatch(/\bprocess\.env\b/);
  expect(source).not.toMatch(
    /\b(writeFile|appendFile|createWriteStream|createClient|connect)\s*\(/,
  );
});
