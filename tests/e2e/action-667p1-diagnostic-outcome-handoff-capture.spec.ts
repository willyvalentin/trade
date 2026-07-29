import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import {
  stableMarketContextDiagnosticContextJsonV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";
import {
  createMarketContextDiagnosticContextOutcomeJoinV2,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-outcome-join-v2";
import {
  buildSyntheticCaptureToO2AInteropV1,
  buildSyntheticDiagnosticCaptureGoldenMatrixV1,
  createSyntheticDiagnosticCaptureFixtureV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-fixtures-v1";
import {
  DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V1,
  DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_TAXONOMY_V1,
  DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V1,
  DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1,
  DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V1,
  DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
  DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
  captureDiagnosticDecisionOutcomeHandoffBatchV1,
  captureDiagnosticDecisionOutcomeHandoffV1,
  verifyDiagnosticDecisionOutcomeCaptureResultV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-v1";

const repositoryRoot = resolve(__dirname, "../..");

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

test("P.1 exposes the exact closed taxonomy and diagnostic-only boundary", () => {
  expect(DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_TAXONOMY_V1).toEqual([
    "captured",
    "incomplete",
    "conflicting",
    "not_point_in_time_safe",
    "unmappable",
  ]);
  expect(DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V1).toEqual({
    diagnostic_only: true,
    shadow_only: true,
    canonical_performance_eligible: false,
    automatic_model_input_allowed: false,
    automatic_training_allowed: false,
    automatic_promotion_allowed: false,
    causal_claimed: false,
    live_ranking_effect: false,
  });
});

test("valid external sources create one lossless O.2A-compatible capture", () => {
  const fixture = createSyntheticDiagnosticCaptureFixtureV1();
  const result = captureDiagnosticDecisionOutcomeHandoffV1(
    deepFreeze(structuredClone(fixture.request)),
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(result.taxonomy).toBe("captured");
  expect(result.bundle?.bundle_version).toBe(
    DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V1,
  );
  expect(result.bundle?.capture_identity).toBe(
    fixture.request.capture_identity,
  );
  expect(result.bundle?.outcome_handoff.decision_identity).toMatchObject({
    external_decision_id: "synthetic-decision-001",
    instrument_id: "SPY",
  });
  expect(result.bundle?.outcome_handoff.opportunity_set.membership).toEqual([
    { instrument_id: "QQQ", ordinal: 0 },
    { instrument_id: "SPY", ordinal: 1 },
    { instrument_id: "XLK", ordinal: 2 },
  ]);
  expect(
    result.observed_source_provenance.sections.every(
      (section) => section.disposition === "verified",
    ),
  ).toBe(true);
  expect(result.failure_identity_digest).toBeNull();
  expect(
    verifyDiagnosticDecisionOutcomeCaptureResultV1(
      result,
      fixture.request,
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    ),
  ).toBe(true);
});

test("external registry roots cannot be supplied or replaced by the request", () => {
  const fixture = createSyntheticDiagnosticCaptureFixtureV1();
  const callerRoot = {
    ...fixture.request,
    expected_trust_root_digest: "a".repeat(64),
  };
  const rejected = captureDiagnosticDecisionOutcomeHandoffV1(callerRoot, {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
  });
  expect(rejected.taxonomy).toBe("conflicting");
  expect(rejected.reason_codes).toContain(
    "$:unknown_field:expected_trust_root_digest",
  );

  const substituted = createSyntheticDiagnosticCaptureFixtureV1({
    anchor_override: {
      registry_digest: "b".repeat(64),
    },
  });
  const mismatch = captureDiagnosticDecisionOutcomeHandoffV1(
    substituted.request,
    {
      enabled: true,
      kill_switch: false,
      authority: substituted.authority,
    },
  );
  expect(mismatch.taxonomy).toBe("conflicting");
  expect(mismatch.reason_codes).toContain(
    "source_registry_anchor_mismatch",
  );
});

test("temporal ordering and finalized predictor boundaries are nanosecond exact", () => {
  const valid = createSyntheticDiagnosticCaptureFixtureV1();
  expect(
    captureDiagnosticDecisionOutcomeHandoffV1(valid.request, {
      enabled: true,
      kill_switch: false,
      authority: valid.authority,
    }).taxonomy,
  ).toBe("captured");

  const equalDecision = createSyntheticDiagnosticCaptureFixtureV1({
    mutate_payloads: (payloads) => {
      payloads.evaluator_outcome_source.outcome_window.start_timestamp =
        "2026-01-05T15:30:00.000000000Z";
    },
  });
  const equalResult = captureDiagnosticDecisionOutcomeHandoffV1(
    equalDecision.request,
    {
      enabled: true,
      kill_switch: false,
      authority: equalDecision.authority,
    },
  );
  expect(equalResult.taxonomy).toBe("not_point_in_time_safe");
  expect(equalResult.reason_codes).toContain(
    "capture_temporal_order_invalid",
  );

  const futureFinalized = createSyntheticDiagnosticCaptureFixtureV1({
    mutate_payloads: (payloads) => {
      const decisionNs = BigInt(
        Date.parse("2026-01-05T15:30:00.000Z"),
      ) * BigInt(1_000_000);
      payloads.decision_source.latest_finalized_bucket_unix_ns =
        (decisionNs + BigInt(1)).toString();
    },
  });
  const futureResult = captureDiagnosticDecisionOutcomeHandoffV1(
    futureFinalized.request,
    {
      enabled: true,
      kill_switch: false,
      authority: futureFinalized.authority,
    },
  );
  expect(futureResult.taxonomy).toBe("not_point_in_time_safe");
  expect(futureResult.reason_codes).toContain(
    "capture_source_or_finalization_after_boundary",
  );
});

test("incomplete membership and missing completion remain incomplete", () => {
  const membership = createSyntheticDiagnosticCaptureFixtureV1({
    mutate_payloads: (payloads) => {
      payloads.opportunity_set_source.completeness = "partial";
    },
  });
  expect(
    captureDiagnosticDecisionOutcomeHandoffV1(membership.request, {
      enabled: true,
      kill_switch: false,
      authority: membership.authority,
    }).taxonomy,
  ).toBe("incomplete");

  const completion = createSyntheticDiagnosticCaptureFixtureV1({
    mutate_payloads: (payloads) => {
      payloads.evaluator_outcome_source.completion = {
        ...payloads.evaluator_outcome_source.completion,
        status: "pending",
        completion_timestamp: null as unknown as string,
      };
    },
  });
  const completionResult =
    captureDiagnosticDecisionOutcomeHandoffV1(completion.request, {
      enabled: true,
      kill_switch: false,
      authority: completion.authority,
    });
  expect(completionResult.taxonomy).toBe("incomplete");
  expect(completionResult.reason_codes).toContain(
    "outcome_completion_missing",
  );
});

test("evaluator mismatch, missing sources, and identity drift fail closed", () => {
  const evaluator = createSyntheticDiagnosticCaptureFixtureV1({
    mutate_payloads: (payloads) => {
      payloads.evaluator_outcome_source.evaluator_identity =
        "unexpected-evaluator";
    },
  });
  expect(
    captureDiagnosticDecisionOutcomeHandoffV1(evaluator.request, {
      enabled: true,
      kill_switch: false,
      authority: evaluator.authority,
    }).reason_codes,
  ).toContain("evaluator_identity_or_version_mismatch");

  const missing = createSyntheticDiagnosticCaptureFixtureV1({
    missing_sources: ["evaluator_outcome_source"],
  });
  expect(
    captureDiagnosticDecisionOutcomeHandoffV1(missing.request, {
      enabled: true,
      kill_switch: false,
      authority: missing.authority,
    }).taxonomy,
  ).toBe("incomplete");

  const unmappable = createSyntheticDiagnosticCaptureFixtureV1({
    mutate_request: (request) => {
      request.source_references.opportunity_set_source_identity =
        "unknown-opportunity-source";
    },
  });
  expect(
    captureDiagnosticDecisionOutcomeHandoffV1(unmappable.request, {
      enabled: true,
      kill_switch: false,
      authority: unmappable.authority,
    }).taxonomy,
  ).toBe("unmappable");
});

test("different rejected observed inputs cannot collapse to one failure identity", () => {
  const alpha = createSyntheticDiagnosticCaptureFixtureV1({
    observed_payload_overrides: {
      decision_source: { invalid: "alpha" },
    },
  });
  const beta = createSyntheticDiagnosticCaptureFixtureV1({
    observed_payload_overrides: {
      decision_source: { invalid: "beta" },
    },
  });
  const first = captureDiagnosticDecisionOutcomeHandoffV1(alpha.request, {
    enabled: true,
    kill_switch: false,
    authority: alpha.authority,
  });
  const second = captureDiagnosticDecisionOutcomeHandoffV1(beta.request, {
    enabled: true,
    kill_switch: false,
    authority: beta.authority,
  });
  expect(first.taxonomy).toBe(second.taxonomy);
  expect(first.reason_codes).toEqual(second.reason_codes);
  expect(first.failure_identity_digest).not.toBe(
    second.failure_identity_digest,
  );
  expect(first.terminal_capture_digest).not.toBe(
    second.terminal_capture_digest,
  );
  expect(
    stableMarketContextDiagnosticContextJsonV1(first),
  ).not.toContain("alpha");
  expect(
    stableMarketContextDiagnosticContextJsonV1(second),
  ).not.toContain("beta");
});

test("duplicate identities and conflicting bytes fail closed deterministically", () => {
  const fixture = createSyntheticDiagnosticCaptureFixtureV1();
  const duplicate =
    captureDiagnosticDecisionOutcomeHandoffBatchV1(
      [fixture.request, structuredClone(fixture.request)],
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    );
  expect(duplicate).toHaveLength(2);
  expect(
    duplicate.every(
      (result) =>
        result.taxonomy === "conflicting" &&
        result.reason_codes.includes("duplicate_capture_identity"),
    ),
  ).toBe(true);

  const changed = structuredClone(fixture.request);
  changed.cohort = "synthetic-cohort-b";
  const collision =
    captureDiagnosticDecisionOutcomeHandoffBatchV1(
      [fixture.request, changed],
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    );
  expect(
    collision.every(
      (result) =>
        result.taxonomy === "conflicting" &&
        result.reason_codes.includes(
          "capture_identity_conflicting_bytes",
        ),
    ),
  ).toBe(true);
  expect(
    stableMarketContextDiagnosticContextJsonV1(
      captureDiagnosticDecisionOutcomeHandoffBatchV1(
        [changed, fixture.request],
        {
          enabled: true,
          kill_switch: false,
          authority: fixture.authority,
        },
      ),
    ),
  ).toBe(stableMarketContextDiagnosticContextJsonV1(collision));

  const secondCapture = structuredClone(fixture.request);
  secondCapture.capture_identity = "synthetic-capture-002";
  const duplicateDecision =
    captureDiagnosticDecisionOutcomeHandoffBatchV1(
      [fixture.request, secondCapture],
      {
        enabled: true,
        kill_switch: false,
        authority: fixture.authority,
      },
    );
  expect(
    duplicateDecision.every(
      (result) =>
        result.taxonomy === "conflicting" &&
        result.reason_codes.includes("duplicate_decision_identity"),
    ),
  ).toBe(true);
});

test("default-off and kill switch perform zero reads and return frozen sentinels", () => {
  const counters = {
    registry: 0,
    source: 0,
  };
  const authority = {
    authority_version: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
    expected_registry_anchor: {
      registry_identity: "must-not-read",
      registry_version: DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
      registry_digest: "a".repeat(64),
    },
    read_registry: () => {
      counters.registry += 1;
      throw new Error("must_not_read");
    },
    read_source: () => {
      counters.source += 1;
      throw new Error("must_not_read");
    },
  };
  const unreadable = new Proxy(
    {},
    {
      ownKeys: () => {
        throw new Error("request_must_not_be_read");
      },
      get: () => {
        throw new Error("request_must_not_be_read");
      },
    },
  );
  const disabled = captureDiagnosticDecisionOutcomeHandoffV1(unreadable, {
    enabled: false,
    kill_switch: false,
    authority,
  });
  const killed = captureDiagnosticDecisionOutcomeHandoffV1(unreadable, {
    enabled: true,
    kill_switch: true,
    authority,
  });
  expect(counters).toEqual({ registry: 0, source: 0 });
  expect(disabled.reason_codes).toEqual(["capture_default_off"]);
  expect(killed.reason_codes).toEqual(["capture_kill_switch_active"]);
  expect(Object.isFrozen(disabled)).toBe(true);
  expect(Object.isFrozen(killed)).toBe(true);
});

test("captured handoff passes O.2A with no bypass flag", () => {
  const interop = buildSyntheticCaptureToO2AInteropV1();
  expect(interop.capture_result.taxonomy).toBe("captured");
  expect(interop.o2a_result.taxonomy).toBe("joined");
  expect(interop.o2a_result.predictor_projection?.predictor_digest).not.toBe(
    interop.o2a_result.label_projection?.label_digest,
  );
  expect(interop.o2a_request).not.toHaveProperty("capture_verified");
  expect(interop.o2a_request).not.toHaveProperty("bypass");
});

test("non-captured results cannot become O.2A joined", () => {
  const incomplete = createSyntheticDiagnosticCaptureFixtureV1({
    missing_sources: ["evaluator_outcome_source"],
  });
  const captureResult = captureDiagnosticDecisionOutcomeHandoffV1(
    incomplete.request,
    {
      enabled: true,
      kill_switch: false,
      authority: incomplete.authority,
    },
  );
  expect(captureResult.bundle).toBeNull();
  const interop = buildSyntheticCaptureToO2AInteropV1();
  const invalid = {
    ...interop.o2a_request,
    outcome_identity: "not-captured-outcome",
  };
  const joined = createMarketContextDiagnosticContextOutcomeJoinV2(
    invalid,
    {
      enabled: true,
      kill_switch: false,
      authority: interop.o2a_authority,
    },
  );
  expect(joined.taxonomy).not.toBe("joined");
});

test("retries, reverse order, and deep-frozen inputs are byte-deterministic", () => {
  const fixture = createSyntheticDiagnosticCaptureFixtureV1();
  const request = deepFreeze(structuredClone(fixture.request));
  const dependencies = {
    enabled: true,
    kill_switch: false,
    authority: fixture.authority,
  };
  const first = captureDiagnosticDecisionOutcomeHandoffV1(
    request,
    dependencies,
  );
  const second = captureDiagnosticDecisionOutcomeHandoffV1(
    request,
    dependencies,
  );
  expect(stableMarketContextDiagnosticContextJsonV1(second)).toBe(
    stableMarketContextDiagnosticContextJsonV1(first),
  );
  expect(stableMarketContextDiagnosticContextJsonV1(request)).toBe(
    stableMarketContextDiagnosticContextJsonV1(fixture.request),
  );
});

test("synthetic golden evidence is canonical and parity-bound", () => {
  const matrix = buildSyntheticDiagnosticCaptureGoldenMatrixV1();
  const evidence = JSON.parse(
    readFileSync(
      "docs/evidence/action-667p1-diagnostic-outcome-handoff-capture-synthetic-golden.json",
      "utf8",
    ),
  );
  expect(evidence.golden_matrix).toEqual(matrix);
  expect(evidence.boundaries).toEqual({
    real_outcome_capture_performed: false,
    provider_calls: 0,
    database_calls: 0,
    persistence_writes: 0,
    canonical_binding_ready: false,
    automatic_model_input_allowed: false,
    live_ranking_effect: false,
  });
});

test("fixed P.1 cross-process digest", () => {
  const matrix = buildSyntheticDiagnosticCaptureGoldenMatrixV1({
    reverse_input_order:
      process.env.ACTION_667P1_INPUT_ORDER === "reverse",
  });
  console.log(`ACTION_667P1_TZ_DIGEST=${matrix.matrix_digest}`);
  expect(matrix.case_count).toBeGreaterThanOrEqual(14);
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
        "tests/e2e/action-667p1-diagnostic-outcome-handoff-capture.spec.ts",
        "--grep",
        "fixed P.1 cross-process digest",
        "--reporter=line",
        "--output",
        `/private/tmp/action-667p1-${index}-${timezone.replaceAll("/", "-")}`,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          ACTION_667P1_INPUT_ORDER: order,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
        timeout: 120_000,
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(/ACTION_667P1_TZ_DIGEST=([a-f0-9]{64})/)?.[1];
  });
  expect(digests.every((digest) => digest?.length === 64)).toBe(true);
  expect(new Set(digests).size).toBe(1);
});

test("P.1 scope has no provider, DB, persistence, live, dependency, or 665/666 import", () => {
  const paths = [
    "lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-v1.ts",
    "lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-fixtures-v1.ts",
  ];
  const source = paths.map((path) => readFileSync(path, "utf8")).join("\n");
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:@databento|supabase|database|scanner|recommendation|publication|action-665|action-666)[^"']*["']/i,
  );
  expect(source).not.toContain("DATABENTO_API_KEY");
  expect(source).not.toMatch(/\bfetch\s*\(/);
  expect(source).not.toMatch(/\bprocess\.env\b/);
});

test("versions and evidence provenance are explicit", () => {
  expect(DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1).toBe(
    "diagnostic_decision_outcome_handoff_capture_v1",
  );
  expect(DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V1).toBe(
    "diagnostic_decision_outcome_handoff_bundle_v1",
  );
  expect(DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1).toBe(
    "diagnostic_outcome_source_registry_v1",
  );
  expect(DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V1).toBe(
    "diagnostic_outcome_capture_failure_provenance_v1",
  );
});
