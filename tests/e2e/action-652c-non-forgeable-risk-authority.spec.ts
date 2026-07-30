import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

import {
  createAction650sRuntimeIdentityContext,
} from "../../lib/action-650s-execution-identity";
import {
  prepareAction650sExecution,
  type Action650sPreparedExecution,
} from "../../lib/action-650s-execution-preparation";
import {
  createAction652aExternalRiskAuthority,
  rebuildAction652aExternalRiskPolicyDigest,
  runAction652aExecutionIntentAdmission,
  type Action652aExternalRiskAuthority,
} from "../../lib/action-652a-execution-risk-envelope-admission";
import {
  canAction652cProceedToManualConfirmation,
  rebuildAction652cAdmissionTerminalDigest,
  runAction652cExecutionIntentAdmission,
} from "../../lib/action-652c-non-forgeable-risk-authority";
import { runAction651cExecutionQualityAuditV2 } from "../../lib/action-651c-execution-quality-audit-v2";
import { buildAction652aFixtureScenario } from "../fixtures/action-652a-execution-risk-envelope-admission-fixtures";
import {
  action652cGoldenMatrixCases,
  buildAction652cFixtureScenario,
} from "../fixtures/action-652c-non-forgeable-risk-authority-fixtures";
import golden from "../../docs/action-652c-non-forgeable-risk-authority-golden-report.json";

const enabled = { enabled: true, kill_switch_active: false } as const;

function clonedAuthorityInput(
  authority: Action652aExternalRiskAuthority,
  maximumQuantity: string,
) {
  const { digest: policyDigest, ...existingPolicy } = authority.policy;
  void policyDigest;
  const policy = {
    ...existingPolicy,
    maximum_quantity_units: maximumQuantity,
  };
  const { digest: snapshotDigest, ...existingSnapshot } = authority.snapshot;
  void snapshotDigest;
  return {
    policy,
    snapshot: {
      ...existingSnapshot,
      policy_digest: rebuildAction652aExternalRiskPolicyDigest(policy),
    },
    market_authority: authority.market_authority,
  };
}

function preparedWithQuantity(quantity: number): Action650sPreparedExecution {
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity: "action-651a-execution",
    runtime_instance_identity: "action-652c-quantity-runtime",
    runtime_session_identity: "action-652c-quantity-session",
    created_at: "2026-07-29T09:55:00.000000000Z",
  });
  if (!runtime) throw new Error("Quantity runtime creation failed.");
  const prepared = prepareAction650sExecution({
    runtime,
    observed_at: "2026-07-29T10:00:00.000000000Z",
    candidates: [
      {
        candidate_identity: "action-652c-quantity-candidate",
        trigger: "stop_loss_reached",
        ticker: "AAPL",
        side: "SELL",
        quantity,
        order_type: "STOP_LIMIT",
        limit_price: 179,
        stop_price: 180,
        created_at: "2026-07-29T09:50:00.000000000Z",
        expires_at: null,
      },
    ],
  });
  if (prepared.current_state !== "waiting_for_manual_confirmation") {
    throw new Error("Quantity preparation failed.");
  }
  return prepared;
}

test("default-off and kill-switch do zero caller or private-authority work", () => {
  let reads = 0;
  const hostile = new Proxy(
    {},
    {
      ownKeys() {
        reads += 1;
        throw new Error("request traversed");
      },
      get() {
        reads += 1;
        throw new Error("request read");
      },
    },
  );
  const disabled = runAction652cExecutionIntentAdmission(
    { enabled: false, kill_switch_active: false },
    hostile,
  );
  const killed = runAction652cExecutionIntentAdmission(
    { enabled: true, kill_switch_active: true },
    hostile,
  );
  expect(reads).toBe(0);
  for (const result of [disabled, killed]) {
    expect(result.terminal_digest).toBeNull();
    expect(result.effects).toMatchObject({
      request_reads: 0,
      private_registry_reads: 0,
      authority_capabilities_issued: 0,
      authority_capabilities_exposed: 0,
      digest_operations: 0,
    });
  }
});

test("privately issues and consumes a fully bound non-exported capability", () => {
  const result = runAction652cExecutionIntentAdmission(
    enabled,
    buildAction652cFixtureScenario().request,
  );
  expect(result.admission_status).toBe("admitted");
  expect(result.authority_binding).toMatchObject({
    capability_version: "action_652c_private_risk_authority_capability_v1",
    external_registry_owner_identity:
      "action-652c-external-risk-registry-owner",
    execution_identity: "action-651a-execution",
    session_identity: "action-651a-confirmation-session",
    cash_snapshot_identity: "action-652c-cash-snapshot",
    exposure_snapshot_identity: "action-652c-exposure-snapshot",
    open_intent_snapshot_identity: "action-652c-open-intent-snapshot",
    exact_limits: {
      maximum_quantity_units: "5",
      maximum_notional_micros: "895000000",
      maximum_price_deviation_ppm: "0",
    },
  });
  expect(result.effects.authority_capabilities_exposed).toBe(0);
  expect("authority" in result).toBe(false);
  expect("capability" in result).toBe(false);
  expect(canAction652cProceedToManualConfirmation(result)).toBe(true);
  const { terminal_digest: terminalDigest, ...withoutTerminal } = result;
  expect(terminalDigest).toBe(
    rebuildAction652cAdmissionTerminalDigest(withoutTerminal),
  );
});

test("rejects every caller-declared issuer, handle, policy, limit, trust-root, or snapshot field", () => {
  const request = buildAction652cFixtureScenario().request;
  for (const [injected, expectedReason] of [
    [{ issuer: () => null }, "private_authority_snapshot_rejected"],
    [{ authority_handle: {} }, "caller_authority_surface_rejected"],
    [{ policy: {} }, "caller_authority_surface_rejected"],
    [
      { maximum_quantity_units: "999999" },
      "caller_authority_surface_rejected",
    ],
    [{ trust_root: "caller-root" }, "caller_authority_surface_rejected"],
    [{ snapshot: {} }, "caller_authority_surface_rejected"],
  ] as const) {
    const result = runAction652cExecutionIntentAdmission(enabled, {
      ...request,
      ...injected,
    });
    expect(result.admission_reason).toBe(expectedReason);
    expect(canAction652cProceedToManualConfirmation(result)).toBe(false);
  }
});

test("reproduces M1 on V1 while V2 rejects the caller-created permissive issuer", () => {
  const scenario = buildAction652aFixtureScenario("utc_a", {
    policy: { maximum_quantity_units: "4" },
  });
  const v1Rejected = runAction652aExecutionIntentAdmission(
    enabled,
    scenario.request,
  );
  expect(v1Rejected.admission_reason).toBe("quantity_limit_exceeded");
  const permissive = createAction652aExternalRiskAuthority(
    clonedAuthorityInput(scenario.authority, "999999"),
  );
  expect(permissive).not.toBeNull();
  const v1Bypass = runAction652aExecutionIntentAdmission(enabled, {
    ...scenario.request,
    external_risk_authority: permissive,
  });
  expect(v1Bypass.admission_status).toBe("admitted");

  const v2 = runAction652cExecutionIntentAdmission(enabled, {
    prepared: scenario.request.prepared,
    intent: scenario.request.intent,
    admission_at: scenario.request.admission_at,
    external_risk_authority: permissive,
  });
  expect(v2.admission_reason).toBe("caller_authority_surface_rejected");
  expect(canAction652cProceedToManualConfirmation(v2)).toBe(false);
});

test("rejects copied handles plus forged provenance and digest surfaces", () => {
  const request = buildAction652cFixtureScenario().request;
  const original = runAction652cExecutionIntentAdmission(enabled, request);
  const copiedResult = structuredClone(original);
  expect(canAction652cProceedToManualConfirmation(copiedResult)).toBe(false);

  for (const forged of [
    { capability: copiedResult.authority_binding },
    { authority_binding: copiedResult.authority_binding },
    { capability_digest: copiedResult.authority_binding?.capability_digest },
    { external_registry_owner_digest: "forged" },
  ]) {
    const result = runAction652cExecutionIntentAdmission(enabled, {
      ...request,
      ...forged,
    });
    expect(result.admission_reason).toBe(
      "caller_authority_surface_rejected",
    );
  }
});

test("rejects cross-session and cross-execution authority membership", () => {
  const sessionScenario = buildAction652cFixtureScenario();
  const crossSession = runAction652cExecutionIntentAdmission(enabled, {
    ...sessionScenario.request,
    intent: {
      ...sessionScenario.request.intent,
      session_identity: "cross-session",
    },
  });
  const executionScenario = buildAction652aFixtureScenario("utc_a", {
    execution_identity: "cross-execution",
  });
  const crossExecution = runAction652cExecutionIntentAdmission(enabled, {
    prepared: executionScenario.request.prepared,
    intent: executionScenario.request.intent,
    admission_at: executionScenario.request.admission_at,
  });
  expect(crossSession.admission_reason).toBe(
    "private_authority_membership_mismatch",
  );
  expect(crossExecution.admission_reason).toBe(
    "private_authority_membership_mismatch",
  );
  expect(canAction652cProceedToManualConfirmation(crossSession)).toBe(false);
  expect(canAction652cProceedToManualConfirmation(crossExecution)).toBe(false);
});

test("uses a strict private capability expiry at minus-one, boundary, and plus-one nanosecond", () => {
  const before = runAction652cExecutionIntentAdmission(
    enabled,
    buildAction652cFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:00.999999999Z",
    }).request,
  );
  const exact = runAction652cExecutionIntentAdmission(
    enabled,
    buildAction652cFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:01.000000000Z",
    }).request,
  );
  const after = runAction652cExecutionIntentAdmission(
    enabled,
    buildAction652cFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:01.000000001Z",
    }).request,
  );
  expect(before.admission_status).toBe("admitted");
  expect(exact.admission_reason).toBe(
    "private_authority_capability_expired",
  );
  expect(after.admission_reason).toBe(
    "private_authority_capability_expired",
  );
});

test("rejects accessors, proxies, cycles, and bounded extrema without executing getters", () => {
  const scenario = buildAction652cFixtureScenario();
  let reads = 0;
  const accessor = {
    ...scenario.request,
    get intent() {
      reads += 1;
      return scenario.request.intent;
    },
  };
  const cycle = { ...scenario.request } as Record<string, unknown>;
  cycle.self = cycle;
  const extreme = {
    ...scenario.request,
    intent: {
      ...scenario.request.intent,
      instrument: "A".repeat(100_000),
    },
  };
  for (const hostile of [
    accessor,
    new Proxy(scenario.request, {}),
    cycle,
    extreme,
  ]) {
    const result = runAction652cExecutionIntentAdmission(enabled, hostile);
    expect(result.admission_reason).toBe(
      "private_authority_snapshot_rejected",
    );
    expect(canAction652cProceedToManualConfirmation(result)).toBe(false);
  }
  expect(reads).toBe(0);
});

test("deep-frozen authority and input snapshots isolate post-verification mutation", () => {
  const scenario = buildAction652cFixtureScenario();
  const admitted = runAction652cExecutionIntentAdmission(
    enabled,
    scenario.request,
  );
  (scenario.request.intent as { instrument: string }).instrument = "MSFT";
  expect(admitted.predecessor_admission?.intent_projection?.instrument).toBe(
    "AAPL",
  );
  expect(Object.isFrozen(admitted)).toBe(true);
  expect(Object.isFrozen(admitted.authority_binding)).toBe(true);
  expect(() => {
    (
      admitted.authority_binding?.exact_limits as {
        maximum_quantity_units: string;
      }
    ).maximum_quantity_units = "999999";
  }).toThrow();
  expect(canAction652cProceedToManualConfirmation(admitted)).toBe(true);
});

test("keeps every non-admitted status before manual confirmation", () => {
  const scenario = buildAction652cFixtureScenario();
  const incomplete = runAction652cExecutionIntentAdmission(enabled, null);
  const conflicting = runAction652cExecutionIntentAdmission(enabled, {
    ...scenario.request,
    trust_root: "caller",
  });
  const expired = runAction652cExecutionIntentAdmission(enabled, {
    ...scenario.request,
    admission_at: "2026-07-29T10:00:01.000000000Z",
  });
  const prepared = preparedWithQuantity(6);
  const rejected = runAction652cExecutionIntentAdmission(enabled, {
    prepared,
    intent: {
      ...scenario.request.intent,
      preparation_trace_identity: prepared.trace_identity,
      handoff_identity: prepared.handoff.identity.handoff_identity,
      quantity: { value: "6", scale: 0, unit: "units" },
      notional: {
        value: "1074000000",
        scale: 6,
        unit: "SEK_micros",
      },
    },
    admission_at: scenario.request.admission_at,
  });
  expect(
    [incomplete, conflicting, expired, rejected].map(
      (result) => result.admission_status,
    ),
  ).toEqual([
    "incomplete",
    "conflicting",
    "not_point_in_time_safe",
    "rejected",
  ]);
  for (const result of [incomplete, conflicting, expired, rejected]) {
    expect(result.manual_confirmation_admission).toBe(false);
    expect(canAction652cProceedToManualConfirmation(result)).toBe(false);
  }
});

test("is deterministic across timezone forms and reversed predecessor input order", () => {
  const results = action652cGoldenMatrixCases.map((entry) =>
    runAction652cExecutionIntentAdmission(
      enabled,
      buildAction652cFixtureScenario(entry.clock, {
        reverse_allowlist: entry.reverse_allowlist,
      }).request,
    ),
  );
  expect(results.map((result) => result.admission_status)).toEqual(
    Array(5).fill("admitted"),
  );
  expect(new Set(results.map((result) => result.terminal_digest)).size).toBe(1);
  expect(
    new Set(
      results.map((result) => result.authority_binding?.capability_digest),
    ).size,
  ).toBe(1);
  expect(results[0].terminal_digest).toBe(
    golden.matrix.common_terminal_digest,
  );
  expect(results[0].authority_binding?.capability_digest).toBe(
    golden.matrix.common_capability_digest,
  );
});

test("preserves admitted → confirmation → synthetic replay → 651C audit with no live surface", () => {
  const scenario = buildAction652cFixtureScenario();
  const admitted = runAction652cExecutionIntentAdmission(
    enabled,
    scenario.request,
  );
  expect(canAction652cProceedToManualConfirmation(admitted)).toBe(true);
  const audit = runAction651cExecutionQualityAuditV2(
    scenario.predecessor.predecessor.input,
  );
  expect(audit.audit_status).toBe("audited");

  const source = readFileSync(
    "lib/action-652c-non-forgeable-risk-authority.ts",
    "utf8",
  );
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:avanza|browser|playwright|puppeteer|supabase|database|broker|child_process)[^"']*["']/i,
  );
  expect(source).not.toMatch(/\b(?:fetch|spawn|exec|fork|insert|update|upsert)\s*\(/);
  expect(source).not.toMatch(
    /export\s+(?:function|const|class)\s+(?:create|issue).*Authority/i,
  );
  expect(admitted.safety).toMatchObject({
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
});
