import { expect, test } from "@playwright/test";

import {
  canAction652aProceedToManualConfirmation,
  createAction652aExternalRiskAuthority,
  rebuildAction652aExternalRiskPolicyDigest,
  runAction652aExecutionIntentAdmission,
  type Action652aAdmissionRequest,
  type Action652aExecutionIntent,
  type Action652aExternalRiskAuthority,
} from "../../lib/action-652a-execution-risk-envelope-admission";
import { runAction651cExecutionQualityAuditV2 } from "../../lib/action-651c-execution-quality-audit-v2";
import { buildAction652aFixtureScenario } from "../fixtures/action-652a-execution-risk-envelope-admission-fixtures";

const enabled = { enabled: true, kill_switch_active: false } as const;

function cloneAuthorityInput(
  authority: Action652aExternalRiskAuthority,
  options: Readonly<{
    maximum_quantity_units?: string;
    market_digest?: string;
    calendar_digest?: string;
  }> = {},
) {
  const { digest: ignoredPolicyDigest, ...existingPolicy } = authority.policy;
  void ignoredPolicyDigest;
  const policy = {
    ...existingPolicy,
    maximum_quantity_units:
      options.maximum_quantity_units ?? existingPolicy.maximum_quantity_units,
  };
  const policyDigest = rebuildAction652aExternalRiskPolicyDigest(policy);
  const { digest: ignoredSnapshotDigest, ...existingSnapshot } =
    authority.snapshot;
  void ignoredSnapshotDigest;
  const snapshot = {
    ...existingSnapshot,
    policy_digest: policyDigest,
  };
  return {
    policy,
    snapshot,
    market_authority: {
      ...authority.market_authority,
      digest: options.market_digest ?? authority.market_authority.digest,
      calendar_digest:
        options.calendar_digest ?? authority.market_authority.calendar_digest,
    },
  };
}

test("652B-M1 reproduces caller self-issuance of a permissive provenance-valid authority", () => {
  const scenario = buildAction652aFixtureScenario("utc_a", {
    policy: { maximum_quantity_units: "4" },
  });
  const externallyRejected = runAction652aExecutionIntentAdmission(
    enabled,
    scenario.request,
  );
  expect(externallyRejected.admission_reason).toBe("quantity_limit_exceeded");
  expect(canAction652aProceedToManualConfirmation(externallyRejected)).toBe(
    false,
  );

  const callerMinted = createAction652aExternalRiskAuthority(
    cloneAuthorityInput(scenario.authority, {
      maximum_quantity_units: "999999",
    }),
  );
  expect(callerMinted).not.toBeNull();

  const bypass = runAction652aExecutionIntentAdmission(enabled, {
    ...scenario.request,
    external_risk_authority: callerMinted,
  });
  expect(bypass.admission_status).toBe("admitted");
  expect(canAction652aProceedToManualConfirmation(bypass)).toBe(true);
});

test("652B-M1 accepts caller-selected market and calendar digest trust fields", () => {
  const scenario = buildAction652aFixtureScenario();
  const callerMinted = createAction652aExternalRiskAuthority(
    cloneAuthorityInput(scenario.authority, {
      market_digest: "caller-selected-market-digest",
      calendar_digest: "caller-selected-calendar-digest",
    }),
  );
  expect(callerMinted).not.toBeNull();

  const result = runAction652aExecutionIntentAdmission(enabled, {
    ...scenario.request,
    external_risk_authority: callerMinted,
  });
  expect(result.admission_status).toBe("admitted");
  expect(result.risk_authority_projection).toMatchObject({
    market_authority_digest: "caller-selected-market-digest",
    calendar_digest: "caller-selected-calendar-digest",
  });
});

test("independently verifies minus-one, boundary, and plus-one quantity/notional/price decisions", () => {
  const quantity = ["6", "5", "4"].map((maximum) =>
    runAction652aExecutionIntentAdmission(
      enabled,
      buildAction652aFixtureScenario("utc_a", {
        policy: { maximum_quantity_units: maximum },
      }).request,
    ),
  );
  const notional = ["895000001", "895000000", "894999999"].map((maximum) =>
    runAction652aExecutionIntentAdmission(
      enabled,
      buildAction652aFixtureScenario("utc_a", {
        policy: { maximum_notional_micros: maximum },
      }).request,
    ),
  );
  const price = ["178999999", "179000000", "179000001"].map((reference) =>
    runAction652aExecutionIntentAdmission(
      enabled,
      buildAction652aFixtureScenario("utc_a", {
        policy: {
          reference_price_micros: reference,
          maximum_price_deviation_ppm: "0",
        },
      }).request,
    ),
  );

  expect(quantity.map((result) => result.admission_status)).toEqual([
    "admitted",
    "admitted",
    "rejected",
  ]);
  expect(notional.map((result) => result.admission_status)).toEqual([
    "admitted",
    "admitted",
    "rejected",
  ]);
  expect(price.map((result) => result.admission_status)).toEqual([
    "rejected",
    "admitted",
    "rejected",
  ]);
});

test("all non-admitted taxonomy members remain blocked before confirmation", () => {
  const scenario = buildAction652aFixtureScenario();
  const rejected = runAction652aExecutionIntentAdmission(
    enabled,
    buildAction652aFixtureScenario("utc_a", {
      policy: { maximum_quantity_units: "4" },
    }).request,
  );
  const incomplete = runAction652aExecutionIntentAdmission(enabled, null);
  const conflicting = runAction652aExecutionIntentAdmission(enabled, {
    ...scenario.request,
    intent: {
      ...scenario.request.intent,
      execution_identity: "conflicting-execution",
    },
  });
  const notPointInTimeSafe = runAction652aExecutionIntentAdmission(enabled, {
    ...scenario.request,
    admission_at: scenario.request.intent.intent_expires_at,
  });

  expect(
    [rejected, incomplete, conflicting, notPointInTimeSafe].map(
      (result) => result.admission_status,
    ),
  ).toEqual([
    "rejected",
    "incomplete",
    "conflicting",
    "not_point_in_time_safe",
  ]);
  for (const result of [
    rejected,
    incomplete,
    conflicting,
    notPointInTimeSafe,
  ]) {
    expect(result.manual_confirmation_admission).toBe(false);
    expect(canAction652aProceedToManualConfirmation(result)).toBe(false);
  }
});

test("different rejected intents in one lineage produce distinct failure identities", () => {
  const scenario = buildAction652aFixtureScenario();
  const firstIntent = {
    ...scenario.request.intent,
    notional: {
      ...scenario.request.intent.notional,
      value: "895000001",
    },
  } as Action652aExecutionIntent;
  const secondIntent = {
    ...scenario.request.intent,
    notional: {
      ...scenario.request.intent.notional,
      value: "895000002",
    },
  } as Action652aExecutionIntent;
  const first = runAction652aExecutionIntentAdmission(enabled, {
    ...scenario.request,
    intent: firstIntent,
  });
  const second = runAction652aExecutionIntentAdmission(enabled, {
    ...scenario.request,
    intent: secondIntent,
  });

  expect(first.admission_reason).toBe("intent_notional_conflicting");
  expect(second.admission_reason).toBe("intent_notional_conflicting");
  expect(first.lineage).toEqual(second.lineage);
  expect(first.observed_input_digests.intent_digest).not.toBe(
    second.observed_input_digests.intent_digest,
  );
  expect(first.failure_provenance?.failure_digest).not.toBe(
    second.failure_provenance?.failure_digest,
  );
});

test("immutable snapshot isolates mutation and preserves full 651C synthetic interop", () => {
  const scenario = buildAction652aFixtureScenario();
  const mutableRequest = structuredClone(
    scenario.request,
  ) as unknown as Action652aAdmissionRequest;
  const provenanceRequest = {
    ...mutableRequest,
    prepared: scenario.request.prepared,
    external_risk_authority: scenario.request.external_risk_authority,
  };
  const admitted = runAction652aExecutionIntentAdmission(
    enabled,
    provenanceRequest,
  );
  (provenanceRequest.intent as { instrument: string }).instrument = "MSFT";

  expect(admitted.intent_projection?.instrument).toBe("AAPL");
  expect(canAction652aProceedToManualConfirmation(admitted)).toBe(true);
  const audit = runAction651cExecutionQualityAuditV2(
    scenario.predecessor.input,
  );
  expect(audit.audit_status).toBe("audited");
});
