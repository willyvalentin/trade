import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

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
import refreeze from "../../docs/action-652c-non-forgeable-risk-authority-refreeze-manifest.json";

const enabled = { enabled: true, kill_switch_active: false } as const;

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function permissiveAuthorityInput(
  authority: Action652aExternalRiskAuthority,
) {
  const { digest: ignoredPolicyDigest, ...existingPolicy } = authority.policy;
  void ignoredPolicyDigest;
  const policy = {
    ...existingPolicy,
    maximum_quantity_units: "999999",
  };
  const { digest: ignoredSnapshotDigest, ...existingSnapshot } =
    authority.snapshot;
  void ignoredSnapshotDigest;
  return {
    policy,
    snapshot: {
      ...existingSnapshot,
      policy_digest: rebuildAction652aExternalRiskPolicyDigest(policy),
    },
    market_authority: authority.market_authority,
  };
}

test("independently rebuilds the refreeze and preserves every predecessor byte", () => {
  const lines = [...refreeze.normative_artifacts]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((artifact) => {
      const actual = sha256(artifact.path);
      expect(actual).toBe(artifact.sha256);
      return `${actual}  ${artifact.path}\n`;
    });
  expect(createHash("sha256").update(lines.join("")).digest("hex")).toBe(
    refreeze.combined_digest.value,
  );
  expect(refreeze.predecessor_bindings).toEqual({
    action_652a_normative_digest:
      "0b227fe371b5ce9059635ed05df5b345f8da6121eac95313323ba36a3a085d6f",
    action_652b_freeze_manifest_sha256:
      "2106fe67b04cec14ba0d2bfb39169949b1b5c717aad75e8a2a07bb34a5c685a4",
    action_652b_independent_review_sha256:
      "85481bdcf5f89151146b413bcf98e56635ddb5c85db0db4246e54dff24cc07d9",
    action_652b_adversarial_suite_sha256:
      "77af29659ea22f78b8b0174a9989fc60b247b688a05bc4e3efe8b0ea52066416",
  });
});

test("keeps issuance, runtime provenance, and authority handles private", () => {
  const source = readFileSync(
    "lib/action-652c-non-forgeable-risk-authority.ts",
    "utf8",
  );
  expect(source).toContain("const privateRuntimeProvenance = new WeakSet");
  expect(source).toContain("new WeakMap<object, PrivateAuthorityRecord>");
  expect(source).toContain("function createPrivateRegistryRuntime()");
  expect(source).toContain("function issuePrivateAuthorityCapability(");
  expect(source).not.toMatch(
    /export\s+(?:function|const|class)\s+(?:create|issue).*Authority/i,
  );
  expect(source).not.toMatch(
    /export\s+(?:function|class)\s+.*(?:RegistryRuntime|Capability)/,
  );
});

test("binds owner, policy, membership, identities, snapshots, limits, and terminal evidence", () => {
  const result = runAction652cExecutionIntentAdmission(
    enabled,
    buildAction652cFixtureScenario().request,
  );
  expect(result.admission_status).toBe("admitted");
  expect(result.authority_binding).toMatchObject({
    external_registry_owner_identity:
      "action-652c-external-risk-registry-owner",
    risk_policy_identity: "action-652c-policy-stockholm-read-only",
    risk_policy_version: "2026-07-29.2",
    execution_identity: "action-651a-execution",
    session_identity: "action-651a-confirmation-session",
    cash_snapshot_identity: "action-652c-cash-snapshot",
    exposure_snapshot_identity: "action-652c-exposure-snapshot",
    open_intent_snapshot_identity: "action-652c-open-intent-snapshot",
    membership_set: {
      instruments: ["AAPL"],
      sides: ["BUY", "SELL"],
    },
    exact_limits: {
      maximum_quantity_units: "5",
      maximum_notional_micros: "895000000",
      reference_price_micros: "179000000",
      maximum_price_deviation_ppm: "0",
      maximum_daily_orders: "10",
      maximum_daily_notional_micros: "10000000000",
      maximum_cash_use_micros: "1000000000",
      maximum_exposure_micros: "5000000000",
      maximum_open_intents: "4",
      maximum_open_intent_notional_micros: "2000000000",
      maximum_snapshot_age_nanoseconds: "1499999999",
    },
  });
  expect(result.authority_binding?.authority_snapshot_digest).toMatch(
    /^action_652a_risk_snapshot_[a-f0-9]{64}$/,
  );
  const { terminal_digest: terminalDigest, ...withoutTerminal } = result;
  expect(terminalDigest).toBe(
    rebuildAction652cAdmissionTerminalDigest(withoutTerminal),
  );
});

test("reproduces 652B-M1 against V1 and rejects the same caller issuer in V2", () => {
  const scenario = buildAction652aFixtureScenario("utc_a", {
    policy: { maximum_quantity_units: "4" },
  });
  const forgedAuthority = createAction652aExternalRiskAuthority(
    permissiveAuthorityInput(scenario.authority),
  );
  expect(forgedAuthority).not.toBeNull();
  expect(
    runAction652aExecutionIntentAdmission(enabled, {
      ...scenario.request,
      external_risk_authority: forgedAuthority,
    }).admission_status,
  ).toBe("admitted");
  const v2 = runAction652cExecutionIntentAdmission(enabled, {
    prepared: scenario.request.prepared,
    intent: scenario.request.intent,
    admission_at: scenario.request.admission_at,
    issuer: () => forgedAuthority,
  });
  expect(v2.admission_reason).toBe("private_authority_snapshot_rejected");
  expect(canAction652cProceedToManualConfirmation(v2)).toBe(false);
});

test("rejects copied handles and self-consistent provenance or digest forgeries", () => {
  const request = buildAction652cFixtureScenario().request;
  const admitted = runAction652cExecutionIntentAdmission(enabled, request);
  expect(canAction652cProceedToManualConfirmation(structuredClone(admitted))).toBe(
    false,
  );
  for (const forged of [
    { authority_handle: structuredClone(admitted.authority_binding) },
    { capability_digest: admitted.authority_binding?.capability_digest },
    { external_registry_owner_digest: "caller-recomputed-owner" },
    { policy: { digest: "caller-recomputed-policy" } },
    { maximum_quantity_units: "999999" },
    { trust_root: "caller-root" },
    { snapshot: { digest: "caller-recomputed-snapshot" } },
  ]) {
    const result = runAction652cExecutionIntentAdmission(enabled, {
      ...request,
      ...forged,
    });
    expect(result.admission_reason).toBe(
      "caller_authority_surface_rejected",
    );
    expect(canAction652cProceedToManualConfirmation(result)).toBe(false);
  }
});

test("rejects cross-session, cross-execution, and strict-expiry boundary forgeries", () => {
  const request = buildAction652cFixtureScenario().request;
  const crossSession = runAction652cExecutionIntentAdmission(enabled, {
    ...request,
    intent: { ...request.intent, session_identity: "cross-session" },
  });
  const crossExecutionScenario = buildAction652aFixtureScenario("utc_a", {
    execution_identity: "cross-execution",
  });
  const crossExecution = runAction652cExecutionIntentAdmission(enabled, {
    prepared: crossExecutionScenario.request.prepared,
    intent: crossExecutionScenario.request.intent,
    admission_at: crossExecutionScenario.request.admission_at,
  });
  expect(crossSession.admission_reason).toBe(
    "private_authority_membership_mismatch",
  );
  expect(crossExecution.admission_reason).toBe(
    "private_authority_membership_mismatch",
  );
  for (const [instant, expected] of [
    ["2026-07-29T10:00:00.999999999Z", "admitted"],
    [
      "2026-07-29T10:00:01.000000000Z",
      "private_authority_capability_expired",
    ],
    [
      "2026-07-29T10:00:01.000000001Z",
      "private_authority_capability_expired",
    ],
  ] as const) {
    const result = runAction652cExecutionIntentAdmission(
      enabled,
      buildAction652cFixtureScenario("utc_a", {
        admission_at: instant,
      }).request,
    );
    expect(
      result.admission_status === "admitted"
        ? result.admission_status
        : result.admission_reason,
    ).toBe(expected);
  }
});

test("takes a single immutable plain snapshot and fails closed on hostile objects", () => {
  const scenario = buildAction652cFixtureScenario();
  let getterReads = 0;
  const accessor = {
    ...scenario.request,
    get admission_at() {
      getterReads += 1;
      return scenario.request.admission_at;
    },
  };
  const cycle = { ...scenario.request } as Record<string, unknown>;
  cycle.cycle = cycle;
  for (const hostile of [accessor, new Proxy(scenario.request, {}), cycle]) {
    const result = runAction652cExecutionIntentAdmission(enabled, hostile);
    expect(result.admission_reason).toBe(
      "private_authority_snapshot_rejected",
    );
  }
  expect(getterReads).toBe(0);
  const admitted = runAction652cExecutionIntentAdmission(
    enabled,
    scenario.request,
  );
  (scenario.request.intent as { instrument: string }).instrument = "MSFT";
  expect(admitted.predecessor_admission?.intent_projection?.instrument).toBe(
    "AAPL",
  );
  expect(Object.isFrozen(admitted.authority_binding?.exact_limits)).toBe(true);
  expect(canAction652cProceedToManualConfirmation(admitted)).toBe(true);
});

test("returns before request, registry, capability, or digest work when gated off", () => {
  let reads = 0;
  const hostile = new Proxy(
    {},
    {
      ownKeys() {
        reads += 1;
        throw new Error("must not enumerate");
      },
      get() {
        reads += 1;
        throw new Error("must not read");
      },
    },
  );
  for (const gate of [
    { enabled: false, kill_switch_active: false },
    { enabled: true, kill_switch_active: true },
  ]) {
    const result = runAction652cExecutionIntentAdmission(gate, hostile);
    expect(result.effects).toMatchObject({
      request_reads: 0,
      private_registry_reads: 0,
      authority_capabilities_issued: 0,
      authority_capabilities_exposed: 0,
      digest_operations: 0,
    });
  }
  expect(reads).toBe(0);
});

test("rebuilds one golden result across timezones and reverse input order", () => {
  const results = action652cGoldenMatrixCases.map((entry) =>
    runAction652cExecutionIntentAdmission(
      enabled,
      buildAction652cFixtureScenario(entry.clock, {
        reverse_allowlist: entry.reverse_allowlist,
      }).request,
    ),
  );
  expect(new Set(results.map((result) => result.terminal_digest))).toEqual(
    new Set([golden.matrix.common_terminal_digest]),
  );
  expect(
    new Set(
      results.map((result) => result.authority_binding?.capability_digest),
    ),
  ).toEqual(new Set([golden.matrix.common_capability_digest]));
});

test("preserves synthetic confirmation/replay/audit interop and excludes live capabilities", () => {
  const scenario = buildAction652cFixtureScenario();
  const admitted = runAction652cExecutionIntentAdmission(
    enabled,
    scenario.request,
  );
  expect(canAction652cProceedToManualConfirmation(admitted)).toBe(true);
  expect(
    runAction651cExecutionQualityAuditV2(
      scenario.predecessor.predecessor.input,
    ).audit_status,
  ).toBe("audited");
  expect(admitted.effects).toMatchObject({
    broker_requests: 0,
    provider_calls: 0,
    credential_reads: 0,
    database_reads: 0,
    database_writes: 0,
    process_spawns: 0,
    trade_mutations: 0,
  });
  expect(admitted.safety).toEqual({
    synthetic_only: true,
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    browser_or_cdp_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
});
