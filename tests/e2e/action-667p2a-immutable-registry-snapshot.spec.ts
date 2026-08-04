import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";
import {
  buildSyntheticCaptureToO2AInteropV2,
  buildSyntheticDiagnosticCaptureGoldenMatrixV2,
  createSyntheticDiagnosticCaptureFixtureV2,
} from "../../lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-fixtures-v2";
import {
  DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V2,
  DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_TAXONOMY_V2,
  DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2,
  DIAGNOSTIC_OUTCOME_REGISTRY_SNAPSHOT_V1,
  DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
  canonicalizeDiagnosticOutcomeAuthorityPlainDataV2,
  captureDiagnosticDecisionOutcomeHandoffBatchV2,
  captureDiagnosticDecisionOutcomeHandoffV2,
  snapshotDiagnosticOutcomeAuthorityMaterialV2,
  verifyDiagnosticDecisionOutcomeCaptureResultV2,
} from "../../lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-v2";
import {
  createSyntheticDiagnosticCaptureFixtureV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-fixtures-v1";
import {
  captureDiagnosticDecisionOutcomeHandoffV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-v1";

const repositoryRoot = resolve(__dirname, "../..");
const sha = (value: unknown) =>
  marketContextDiagnosticContextSha256V1(value);

function recursivelyFrozen(value: unknown): boolean {
  if (value === null || typeof value !== "object") return true;
  return (
    Object.isFrozen(value) &&
    Object.values(value).every((child) => recursivelyFrozen(child))
  );
}

test("P.2A versions a closed taxonomy, immutable snapshot, and diagnostic boundary", () => {
  expect(DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2).toBe(
    "diagnostic_decision_outcome_handoff_capture_v2",
  );
  expect(DIAGNOSTIC_OUTCOME_REGISTRY_SNAPSHOT_V1).toBe(
    "diagnostic_outcome_registry_snapshot_v1",
  );
  expect(DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_TAXONOMY_V2).toEqual([
    "captured",
    "incomplete",
    "conflicting",
    "not_point_in_time_safe",
    "unmappable",
  ]);
  expect(DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V2).toEqual({
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

test("one authority callback yields one deeply frozen canonical snapshot", () => {
  const fixture = createSyntheticDiagnosticCaptureFixtureV2();
  const snapshotted = snapshotDiagnosticOutcomeAuthorityMaterialV2(
    fixture.material,
    fixture.authority.expected_registry_anchor,
  );
  expect(snapshotted.ok).toBe(true);
  if (!snapshotted.ok) return;
  expect(recursivelyFrozen(snapshotted.snapshot)).toBe(true);
  expect(snapshotted.snapshot).not.toBe(fixture.material);
  expect(snapshotted.snapshot.registry).not.toBe(fixture.material.registry);
  expect(snapshotted.binding.disposition).toBe("verified");
  expect(snapshotted.binding.registry_snapshot_digest).toBe(
    sha(snapshotted.snapshot.registry),
  );
  expect(snapshotted.binding.authority_material_digest).toBe(
    sha(snapshotted.snapshot),
  );

  const result = captureDiagnosticDecisionOutcomeHandoffV2(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(result.taxonomy).toBe("captured");
  expect(fixture.authority_read_count()).toBe(1);
  expect(result.bundle?.source_registry.registry_snapshot_digest).toBe(
    result.registry_snapshot_binding.registry_snapshot_digest,
  );
  expect(result.bundle?.source_registry.authority_material_digest).toBe(
    result.registry_snapshot_binding.authority_material_digest,
  );
});

test("P2-001 predecessor collision is reproduced while V2 closes it", () => {
  const predecessor = createSyntheticDiagnosticCaptureFixtureV1();
  const registry = structuredClone(predecessor.registry);
  const payloads = structuredClone(predecessor.payloads);
  let mutated = false;
  const vulnerableAuthority = {
    ...predecessor.authority,
    read_registry: () => registry,
    read_source: (
      namespace: keyof typeof payloads,
      identity: string,
    ) => {
      if (!mutated) {
        mutated = true;
        payloads.decision_source.instrument_id = "QQQ";
        payloads.evaluator_outcome_source.instrument_id = "QQQ";
        registry.sources.decision_source.payload_digest =
          sha(payloads.decision_source);
        registry.sources.evaluator_outcome_source.payload_digest =
          sha(payloads.evaluator_outcome_source);
      }
      return identity === payloads[namespace].source_identity
        ? {
            status: "resolved" as const,
            payload: payloads[namespace],
          }
        : { status: "not_found" as const };
    },
  };
  const vulnerable = captureDiagnosticDecisionOutcomeHandoffV1(
    predecessor.request,
    {
      enabled: true,
      kill_switch: false,
      authority: vulnerableAuthority,
    },
  );
  expect(vulnerable.taxonomy).toBe("captured");
  expect(vulnerable.bundle?.outcome_handoff.decision_identity.instrument_id).toBe(
    "QQQ",
  );

  const successor = createSyntheticDiagnosticCaptureFixtureV2({
    mutate_material: (material) => {
      const decision = material.source_payloads
        .decision_source as Record<string, unknown>;
      const evaluator = material.source_payloads
        .evaluator_outcome_source as Record<string, unknown>;
      decision.instrument_id = "QQQ";
      evaluator.instrument_id = "QQQ";
      material.registry.sources.decision_source.payload_digest = sha(decision);
      material.registry.sources.evaluator_outcome_source.payload_digest =
        sha(evaluator);
    },
  });
  const closed = captureDiagnosticDecisionOutcomeHandoffV2(
    successor.request,
    {
      enabled: true,
      kill_switch: false,
      authority: successor.authority,
    },
  );
  expect(closed.taxonomy).toBe("conflicting");
  expect(closed.reason_codes).toEqual(["source_registry_anchor_mismatch"]);
  expect(closed.bundle).toBeNull();
});

test("top-level, nested, array, and source-digest mutation fail or remain isolated", () => {
  const original = createSyntheticDiagnosticCaptureFixtureV2();
  const first = captureDiagnosticDecisionOutcomeHandoffV2(
    original.request,
    {
      enabled: true,
      kill_switch: false,
      authority: original.authority,
    },
  );
  original.material.registry.registry_identity = "mutated-after-capture";
  const opportunity = original.material.source_payloads
    .opportunity_set_source as {
      membership: Array<{ instrument_id: string; ordinal: number }>;
    };
  opportunity.membership.reverse();
  expect(first.taxonomy).toBe("captured");
  expect(first.registry_snapshot_binding.snapshot_identity).toBe(
    "synthetic-outcome-source-registry-v2-001",
  );
  expect(first.bundle?.outcome_handoff.opportunity_set.membership[0]).toEqual({
    instrument_id: "QQQ",
    ordinal: 0,
  });

  const nested = createSyntheticDiagnosticCaptureFixtureV2({
    mutate_material: (material) => {
      const evaluator = material.source_payloads
        .evaluator_outcome_source as Record<string, unknown>;
      (evaluator.definitions as Record<string, unknown>).target = "changed";
    },
  });
  expect(
    captureDiagnosticDecisionOutcomeHandoffV2(nested.request, {
      enabled: true,
      kill_switch: false,
      authority: nested.authority,
    }).reason_codes,
  ).toContain("source_payload_digest_mismatch:evaluator_outcome_source");

  const reordered = createSyntheticDiagnosticCaptureFixtureV2({
    mutate_material: (material) => {
      const source = material.source_payloads
        .opportunity_set_source as {
          membership: Array<{ instrument_id: string; ordinal: number }>;
        };
      source.membership.reverse();
    },
  });
  expect(
    captureDiagnosticDecisionOutcomeHandoffV2(reordered.request, {
      enabled: true,
      kill_switch: false,
      authority: reordered.authority,
    }).reason_codes,
  ).toContain("source_payload_digest_mismatch:opportunity_set_source");

  for (const operation of ["insert", "remove"] as const) {
    const changedArray = createSyntheticDiagnosticCaptureFixtureV2({
      mutate_material: (material) => {
        const source = material.source_payloads
          .opportunity_set_source as {
            membership: Array<{ instrument_id: string; ordinal: number }>;
          };
        if (operation === "insert") {
          source.membership.push({ instrument_id: "XLF", ordinal: 3 });
        } else {
          source.membership.pop();
        }
      },
    });
    expect(
      captureDiagnosticDecisionOutcomeHandoffV2(changedArray.request, {
        enabled: true,
        kill_switch: false,
        authority: changedArray.authority,
      }).reason_codes,
    ).toContain("source_payload_digest_mismatch:opportunity_set_source");
  }
});

test("replacement after callback and attempted mutation of frozen snapshot cannot alter output", () => {
  const fixture = createSyntheticDiagnosticCaptureFixtureV2();
  let returned = fixture.material;
  const result = captureDiagnosticDecisionOutcomeHandoffV2(fixture.request, {
    enabled: true,
    kill_switch: false,
    authority: {
      ...fixture.authority,
      read_capture_material: () => returned,
    },
  });
  const before = stableMarketContextDiagnosticContextJsonV1(result);
  const replacement = createSyntheticDiagnosticCaptureFixtureV2().material;
  replacement.registry.registry_identity = "replacement";
  const original = returned;
  returned = replacement;
  original.registry.registry_identity = "mutated-later";
  expect(stableMarketContextDiagnosticContextJsonV1(result)).toBe(before);

  const snapshotted = snapshotDiagnosticOutcomeAuthorityMaterialV2(
    fixture.material,
    fixture.authority.expected_registry_anchor,
  );
  expect(snapshotted.ok).toBe(false);

  const fresh = createSyntheticDiagnosticCaptureFixtureV2();
  const frozen = snapshotDiagnosticOutcomeAuthorityMaterialV2(
    fresh.material,
    fresh.authority.expected_registry_anchor,
  );
  expect(frozen.ok).toBe(true);
  if (!frozen.ok) return;
  expect(() => {
    (
      frozen.snapshot.registry as { registry_identity: string }
    ).registry_identity = "attempted-write";
  }).toThrow();
  expect(frozen.snapshot.registry.registry_identity).toBe(
    "synthetic-outcome-source-registry-v2-001",
  );
});

test("getters, prototypes, functions, symbols, cycles, and unsupported values fail closed", () => {
  let getterReads = 0;
  const getterMaterial: Record<string, unknown> = {};
  Object.defineProperty(getterMaterial, "material_version", {
    enumerable: true,
    get() {
      getterReads += 1;
      return "must-not-read";
    },
  });
  const getter = createSyntheticDiagnosticCaptureFixtureV2({
    material_override: getterMaterial,
  });
  const getterResult = captureDiagnosticDecisionOutcomeHandoffV2(
    getter.request,
    {
      enabled: true,
      kill_switch: false,
      authority: getter.authority,
    },
  );
  expect(getterReads).toBe(0);
  expect(getterResult.taxonomy).toBe("conflicting");
  expect(getterResult.reason_codes).toContain("$.material_version:accessor_not_allowed");

  const values: unknown[] = [
    new Date(),
    () => "function",
    Symbol("value"),
    BigInt(1),
    Number.NaN,
  ];
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  values.push(cyclic);
  values.push(Promise.resolve("unsupported-async-authority"));
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  values.push(revoked.proxy);
  for (const value of values) {
    expect(canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(value).ok).toBe(
      false,
    );
  }
});

test("no callback follows snapshot creation and each evaluation reads authority exactly once", () => {
  const fixture = createSyntheticDiagnosticCaptureFixtureV2();
  let forbiddenLaterCallbackCount = 0;
  const authority = {
    ...fixture.authority,
    read_source: () => {
      forbiddenLaterCallbackCount += 1;
      throw new Error("must_not_be_called");
    },
    verify_source: () => {
      forbiddenLaterCallbackCount += 1;
      throw new Error("must_not_be_called");
    },
  };
  const result = captureDiagnosticDecisionOutcomeHandoffV2(fixture.request, {
    enabled: true,
    kill_switch: false,
    authority,
  });
  expect(result.taxonomy).toBe("captured");
  expect(fixture.authority_read_count()).toBe(1);
  expect(forbiddenLaterCallbackCount).toBe(0);
});

test("root, identity, payload, and verifier self-consistent substitutions fail closed", () => {
  const root = createSyntheticDiagnosticCaptureFixtureV2({
    anchor_override: { registry_snapshot_digest: "a".repeat(64) },
  });
  expect(
    captureDiagnosticDecisionOutcomeHandoffV2(root.request, {
      enabled: true,
      kill_switch: false,
      authority: root.authority,
    }).reason_codes,
  ).toEqual(["source_registry_anchor_mismatch"]);

  const verifier = createSyntheticDiagnosticCaptureFixtureV2({
    mutate_material: (material) => {
      material.registry.sources.decision_source.verifier_version =
        "substituted-verifier";
    },
  });
  expect(
    captureDiagnosticDecisionOutcomeHandoffV2(verifier.request, {
      enabled: true,
      kill_switch: false,
      authority: verifier.authority,
    }).reason_codes,
  ).toEqual(["source_registry_anchor_mismatch"]);

  const sourceIdentity = createSyntheticDiagnosticCaptureFixtureV2({
    mutate_material: (material) => {
      const payload = material.source_payloads
        .decision_source as Record<string, unknown>;
      payload.source_identity = "self-consistent-other-identity";
      material.registry.sources.decision_source.payload_identity =
        "self-consistent-other-identity";
      material.registry.sources.decision_source.payload_digest = sha(payload);
    },
  });
  expect(
    captureDiagnosticDecisionOutcomeHandoffV2(sourceIdentity.request, {
      enabled: true,
      kill_switch: false,
      authority: sourceIdentity.authority,
    }).taxonomy,
  ).toBe("conflicting");

  const callbackMutation = createSyntheticDiagnosticCaptureFixtureV2();
  const mutatedMaterial = structuredClone(callbackMutation.material);
  (
    mutatedMaterial.source_payloads.decision_source as Record<
      string,
      unknown
    >
  ).instrument_id = "QQQ";
  mutatedMaterial.registry.sources.decision_source.payload_digest = sha(
    mutatedMaterial.source_payloads.decision_source,
  );
  const mutableAnchor = structuredClone(
    callbackMutation.authority.expected_registry_anchor,
  );
  const callbackResult = captureDiagnosticDecisionOutcomeHandoffV2(
    callbackMutation.request,
    {
      enabled: true,
      kill_switch: false,
      authority: {
        ...callbackMutation.authority,
        expected_registry_anchor: mutableAnchor,
        read_capture_material: () => {
          mutableAnchor.registry_snapshot_digest = sha(
            mutatedMaterial.registry,
          );
          return mutatedMaterial;
        },
      },
    },
  );
  expect(callbackResult.taxonomy).toBe("conflicting");
  expect(callbackResult.reason_codes).toEqual([
    "source_registry_anchor_mismatch",
  ]);

  for (const namespace of [
    "decision_source",
    "evaluator_outcome_source",
    "provider_context_source",
  ] as const) {
    const digestMutation = createSyntheticDiagnosticCaptureFixtureV2({
      mutate_material: (material) => {
        material.registry.sources[namespace].payload_digest = "e".repeat(64);
      },
    });
    expect(
      captureDiagnosticDecisionOutcomeHandoffV2(digestMutation.request, {
        enabled: true,
        kill_switch: false,
        authority: digestMutation.authority,
      }).reason_codes,
    ).toEqual(["source_registry_anchor_mismatch"]);
  }
});

test("default-off and kill switch perform zero request and authority work", () => {
  let callbackCount = 0;
  const unreadable = new Proxy(
    {},
    {
      ownKeys: () => {
        throw new Error("request_read");
      },
      get: () => {
        throw new Error("request_read");
      },
    },
  );
  const authority = {
    authority_version: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
    expected_registry_anchor: {
      registry_identity: "not-read",
      registry_version: "diagnostic_outcome_source_registry_v2" as const,
      registry_snapshot_digest: "a".repeat(64),
    },
    read_capture_material: () => {
      callbackCount += 1;
      throw new Error("authority_read");
    },
  };
  const disabled = captureDiagnosticDecisionOutcomeHandoffV2(unreadable, {
    enabled: false,
    kill_switch: false,
    authority,
  });
  const killed = captureDiagnosticDecisionOutcomeHandoffV2(unreadable, {
    enabled: true,
    kill_switch: true,
    authority,
  });
  expect(callbackCount).toBe(0);
  expect(disabled.reason_codes).toEqual(["capture_default_off"]);
  expect(killed.reason_codes).toEqual(["capture_kill_switch_active"]);
  expect(recursivelyFrozen(disabled)).toBe(true);
  expect(recursivelyFrozen(killed)).toBe(true);
});

test("valid capture remains O.2A joinable while rejected capture is non-joinable", () => {
  const interop = buildSyntheticCaptureToO2AInteropV2();
  expect(interop.capture_result.taxonomy).toBe("captured");
  expect(interop.o2a_result.taxonomy).toBe("joined");
  expect(interop.o2a_result.predictor_projection?.predictor_digest).not.toBe(
    interop.o2a_result.label_projection?.label_digest,
  );

  const rejected = createSyntheticDiagnosticCaptureFixtureV2({
    anchor_override: { registry_snapshot_digest: "b".repeat(64) },
  });
  const result = captureDiagnosticDecisionOutcomeHandoffV2(
    rejected.request,
    {
      enabled: true,
      kill_switch: false,
      authority: rejected.authority,
    },
  );
  expect(result.bundle).toBeNull();
});

test("duplicate and collision handling remains deterministic", () => {
  const fixture = createSyntheticDiagnosticCaptureFixtureV2();
  const duplicate = captureDiagnosticDecisionOutcomeHandoffBatchV2(
    [fixture.request, structuredClone(fixture.request)],
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(
    duplicate.every((result) =>
      result.reason_codes.includes("duplicate_capture_identity"),
    ),
  ).toBe(true);
  const changed = structuredClone(fixture.request);
  changed.cohort = "other-cohort";
  const collision = captureDiagnosticDecisionOutcomeHandoffBatchV2(
    [fixture.request, changed],
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  const reverse = captureDiagnosticDecisionOutcomeHandoffBatchV2(
    [changed, fixture.request],
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  expect(
    stableMarketContextDiagnosticContextJsonV1(reverse),
  ).toBe(stableMarketContextDiagnosticContextJsonV1(collision));
});

test("independent result rebuild detects terminal and snapshot tampering", () => {
  const fixture = createSyntheticDiagnosticCaptureFixtureV2();
  const result = captureDiagnosticDecisionOutcomeHandoffV2(
    fixture.request,
    {
      enabled: true,
      kill_switch: false,
      authority: fixture.authority,
    },
  );
  const fresh = createSyntheticDiagnosticCaptureFixtureV2();
  expect(
    verifyDiagnosticDecisionOutcomeCaptureResultV2(result, fresh.request, {
      enabled: true,
      kill_switch: false,
      authority: fresh.authority,
    }),
  ).toBe(true);
  const tampered = structuredClone(result);
  tampered.registry_snapshot_binding.registry_snapshot_digest =
    "f".repeat(64);
  const another = createSyntheticDiagnosticCaptureFixtureV2();
  expect(
    verifyDiagnosticDecisionOutcomeCaptureResultV2(
      tampered,
      another.request,
      {
        enabled: true,
        kill_switch: false,
        authority: another.authority,
      },
    ),
  ).toBe(false);
});

test("golden evidence is synthetic, canonical, and reverse-order stable", () => {
  const matrix = buildSyntheticDiagnosticCaptureGoldenMatrixV2();
  const reverse = buildSyntheticDiagnosticCaptureGoldenMatrixV2({
    reverse_input_order: true,
  });
  expect(reverse).toEqual(matrix);
  const evidence = JSON.parse(
    readFileSync(
      "docs/evidence/action-667p2a-immutable-registry-snapshot-synthetic-golden.json",
      "utf8",
    ),
  );
  expect(evidence.golden_matrix).toEqual(matrix);
  expect(evidence.real_outcome_capture_performed).toBe(false);
});

test("fixed P.2A cross-process digest", () => {
  const matrix = buildSyntheticDiagnosticCaptureGoldenMatrixV2({
    reverse_input_order:
      process.env.ACTION_667P2A_INPUT_ORDER === "reverse",
  });
  console.log(`ACTION_667P2A_TZ_DIGEST=${matrix.matrix_digest}`);
  if (process.env.ACTION_667P2A_DUMP_MATRIX === "true") {
    console.log(
      `ACTION_667P2A_MATRIX_BASE64=${Buffer.from(
        JSON.stringify(matrix),
      ).toString("base64")}`,
    );
  }
  expect(matrix.case_count).toBe(5);
});

test("UTC A/B, Stockholm reverse, and New York remain byte-identical", () => {
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
        "tests/e2e/action-667p2a-immutable-registry-snapshot.spec.ts",
        "--grep",
        "fixed P.2A cross-process digest",
        "--reporter=line",
        "--output",
        `/private/tmp/action-667p2a-${index}-${timezone.replaceAll("/", "-")}`,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          ACTION_667P2A_INPUT_ORDER: order,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
        timeout: 120_000,
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(/ACTION_667P2A_TZ_DIGEST=([a-f0-9]{64})/)?.[1];
  });
  expect(digests.every((digest) => digest?.length === 64)).toBe(true);
  expect(new Set(digests).size).toBe(1);
});

test("P.2A scope has no provider, DB, persistence, live, dependency, or 665/666 import", () => {
  const paths = [
    "lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-v2.ts",
    "lib/market-context-intelligence-lab/diagnostic-decision-outcome-handoff-capture-fixtures-v2.ts",
  ];
  const source = paths.map((path) => readFileSync(path, "utf8")).join("\n");
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:@databento|supabase|database|scanner|recommendation|publication|action-665|action-666)[^"']*["']/i,
  );
  expect(source).not.toContain("DATABENTO_API_KEY");
  expect(source).not.toMatch(/\bfetch\s*\(/);
  expect(source).not.toMatch(/\bprocess\.env\b/);
});
