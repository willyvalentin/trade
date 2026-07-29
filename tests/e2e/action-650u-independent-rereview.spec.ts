import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildAction650uSimulatedBrokerEventBinding,
  replayAction650uConfirmedExecution,
  type Action650uSimulatedBrokerTerminalEvent,
} from "../../lib/action-650u-confirmed-execution-replay";
import { createAction650sRuntimeIdentityContext } from "../../lib/action-650s-execution-identity";
import {
  prepareAction650sExecution,
  type Action650sExecutionCandidate,
  type Action650sPreparedExecution,
} from "../../lib/action-650s-execution-preparation";
import {
  consumeAction650uManualConfirmation,
  createAction650uManualConfirmationBoundary,
  rebuildAction650uConfirmationRequestDigest,
  rebuildAction650uConsumptionProjectionDigest,
  rebuildAction650uConsumptionReceiptDigest,
  rebuildAction650uManualConfirmationCapabilityDigest,
  verifyAction650uManualConfirmationCapability,
  type Action650uManualConfirmationBoundary,
  type Action650uManualConfirmationCapability,
} from "../../lib/action-650u-manual-confirmation";
import {
  action650uTemporalConfirmationPolicyVersion,
  evaluateAction650uTemporalConfirmationPolicy,
} from "../../lib/action-650u-temporal-confirmation-policy";

const root = resolve(__dirname, "../..");
const waitingAt = "2026-07-29T10:00:00.000000000Z";
const expiryAt = "2026-07-29T10:10:00.000000000Z";

function candidate(): Action650sExecutionCandidate {
  return {
    candidate_identity: "650u-rereview-candidate",
    trigger: "stop_loss_reached",
    ticker: "AAPL",
    side: "SELL",
    quantity: 5,
    order_type: "STOP_LIMIT",
    limit_price: 179,
    stop_price: 180,
    created_at: "2026-07-29T09:50:00.000Z",
    expires_at: null,
  };
}

function scenario(execution: string, sessionStart = "2026-07-29T09:59:00Z") {
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity: execution,
    runtime_instance_identity: "650u-rereview-runtime",
    runtime_session_identity: "650u-rereview-runtime-session",
    created_at: "2026-07-29T09:55:00Z",
  });
  if (!runtime) throw new Error("Expected runtime.");

  const prepared = prepareAction650sExecution({
    runtime,
    candidates: [candidate()],
    observed_at: waitingAt,
  });
  if (prepared.current_state !== "waiting_for_manual_confirmation") {
    throw new Error("Expected preparation.");
  }

  const boundary = createAction650uManualConfirmationBoundary({
    runtime,
    session_identity: "650u-rereview-session",
    session_started_at: sessionStart,
    session_expires_at: expiryAt,
  });
  if (!boundary) throw new Error("Expected boundary.");

  return { runtime, prepared, boundary };
}

function issue(
  boundary: Action650uManualConfirmationBoundary,
  prepared: Action650sPreparedExecution,
  confirmedAt: string,
) {
  return boundary.confirm(prepared, {
    confirmed_at: confirmedAt,
    confirming_actor_class: "human_operator",
    session_identity: "650u-rereview-session",
  });
}

function confirmed(execution: string, confirmedAt = "2026-07-29T10:01:00Z") {
  const value = scenario(execution);
  const result = issue(value.boundary, value.prepared, confirmedAt);
  if (!result.ok) throw new Error(result.reason);
  return { ...value, capability: result.capability };
}

function terminal(
  prepared: Action650sPreparedExecution,
  overrides: Partial<Action650uSimulatedBrokerTerminalEvent> = {},
): Action650uSimulatedBrokerTerminalEvent {
  return {
    ...buildAction650uSimulatedBrokerEventBinding(prepared),
    event_type: "terminal",
    terminal_status: "completed",
    simulated_broker_order_identity: "650u-rereview-simulated-order",
    observed_at: "2026-07-29T10:03:00Z",
    ...overrides,
  };
}

function replay(input: {
  prepared: Action650sPreparedExecution;
  boundary: Action650uManualConfirmationBoundary;
  capability: Action650uManualConfirmationCapability;
  events?: readonly Action650uSimulatedBrokerTerminalEvent[];
}) {
  return replayAction650uConfirmedExecution({
    prepared: input.prepared,
    boundary: input.boundary,
    capability: input.capability,
    consumed_at: "2026-07-29T10:02:00Z",
    broker_events: input.events ?? [terminal(input.prepared)],
  });
}

test("Action 650U independent re-review rebuilds the exact refreeze digest", () => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(
        root,
        "docs/action-650u-temporal-boundary-successor-refreeze-manifest.json",
      ),
      "utf8",
    ),
  ) as {
    combined_successor_digest: string;
    successor_normative_paths: { path: string; sha256: string }[];
  };
  const lines = manifest.successor_normative_paths
    .map(({ path, sha256 }) => {
      const actual = createHash("sha256")
        .update(readFileSync(resolve(root, path)))
        .digest("hex");
      expect(actual, path).toBe(sha256);
      return `${actual}  ${path}`;
    })
    .sort();
  const combined = createHash("sha256")
    .update(`${lines.join("\n")}\n`)
    .digest("hex");

  expect(combined).toBe(
    "80623a9d0d5a11fdea67c89875b1fd2eb60e62e6259ecabb47c610f77c9f5935",
  );
  expect(combined).toBe(manifest.combined_successor_digest);
});

test("Action 650U independent re-review proves both nanosecond truth tables", () => {
  const common = {
    current_lifecycle_state: "waiting_for_manual_confirmation",
    waiting_for_manual_confirmation_at: waitingAt,
    session_started_at: "2026-07-29T09:59:00Z",
    session_expires_at: expiryAt,
  };

  expect(
    evaluateAction650uTemporalConfirmationPolicy({
      ...common,
      confirmed_at: "2026-07-29T10:09:59.999999999Z",
    }).accepted,
  ).toBe(true);
  for (const instant of [
    expiryAt,
    "2026-07-29T10:10:00.000000001Z",
  ]) {
    expect(
      evaluateAction650uTemporalConfirmationPolicy({
        ...common,
        confirmed_at: instant,
      }),
    ).toMatchObject({
      accepted: false,
      reason: "manual_confirmation_session_expired",
    });
  }

  expect(
    evaluateAction650uTemporalConfirmationPolicy({
      ...common,
      confirmed_at: "2026-07-29T09:59:59.999999999Z",
    }),
  ).toMatchObject({
    accepted: false,
    reason: "manual_confirmation_before_waiting_boundary",
  });
  for (const instant of [
    waitingAt,
    "2026-07-29T10:00:00.000000001Z",
  ]) {
    expect(
      evaluateAction650uTemporalConfirmationPolicy({
        ...common,
        confirmed_at: instant,
      }).accepted,
    ).toBe(true);
  }
});

test("Action 650U independent re-review closes lifecycle, session-start, and malformed boundaries", () => {
  expect(
    evaluateAction650uTemporalConfirmationPolicy({
      current_lifecycle_state: "simulated_completed",
      waiting_for_manual_confirmation_at: waitingAt,
      confirmed_at: waitingAt,
      session_started_at: "2026-07-29T09:59:00Z",
      session_expires_at: expiryAt,
    }),
  ).toMatchObject({
    accepted: false,
    reason: "manual_confirmation_lifecycle_state_mismatch",
  });

  const delayedSession = scenario(
    "650u-rereview-delayed-session",
    "2026-07-29T10:00:00.000000001Z",
  );
  expect(issue(delayedSession.boundary, delayedSession.prepared, waitingAt)).toEqual({
    ok: false,
    reason: "manual_confirmation_session_not_started",
  });

  for (const malformed of [
    "",
    "2026-07-29T10:00:00.0000000000Z",
    "2026-07-29T24:00:00Z",
    "2026-02-30T10:00:00Z",
    1,
    null,
  ]) {
    expect(
      evaluateAction650uTemporalConfirmationPolicy({
        current_lifecycle_state: "waiting_for_manual_confirmation",
        waiting_for_manual_confirmation_at: waitingAt,
        confirmed_at: malformed,
        session_started_at: "2026-07-29T09:59:00Z",
        session_expires_at: expiryAt,
      }),
    ).toMatchObject({
      accepted: false,
      reason: "manual_confirmation_timestamp_invalid",
    });
  }
});

test("Action 650U independent re-review binds and rebuilds request and capability digests", () => {
  const value = confirmed("650u-rereview-digest");

  expect(value.capability.temporal_policy_version).toBe(
    action650uTemporalConfirmationPolicyVersion,
  );
  expect(rebuildAction650uConfirmationRequestDigest(value.capability)).toBe(
    value.capability.confirmation_request_digest,
  );
  expect(
    rebuildAction650uManualConfirmationCapabilityDigest(value.capability),
  ).toBe(value.capability.capability_digest);
  expect(verifyAction650uManualConfirmationCapability(value.capability)).toBe(
    true,
  );
});

test("Action 650U independent re-review rejects self-consistent temporal tampering at runtime provenance", () => {
  const value = confirmed("650u-rereview-temporal-tamper");
  const tamperedRequest = {
    ...structuredClone(value.capability),
    confirmed_at: "2026-07-29T10:01:00.000000001Z",
  } as Action650uManualConfirmationCapability;
  const tamperedRequestDigest = {
    ...tamperedRequest,
    confirmation_request_digest:
      rebuildAction650uConfirmationRequestDigest(tamperedRequest),
  } as Action650uManualConfirmationCapability;
  const tampered = {
    ...tamperedRequestDigest,
    capability_digest:
      rebuildAction650uManualConfirmationCapabilityDigest(
        tamperedRequestDigest,
      ),
  } as Action650uManualConfirmationCapability;

  expect(tampered.confirmation_request_digest).not.toBe(
    value.capability.confirmation_request_digest,
  );
  expect(tampered.capability_digest).not.toBe(
    value.capability.capability_digest,
  );
  expect(replay({ ...value, capability: tampered })).toMatchObject({
    safety_decision: "blocked",
    blocked_reason: "manual_confirmation_unverified",
    broker_progress_events_accepted: 0,
    terminal_result: null,
  });
});

test("Action 650U independent re-review makes exact-expiry consumption strict and non-consuming", () => {
  const value = confirmed(
    "650u-rereview-consumption-expiry",
    "2026-07-29T10:09:59.999999999Z",
  );

  expect(
    consumeAction650uManualConfirmation({
      ...value,
      consumed_at: expiryAt,
    }),
  ).toEqual({ ok: false, reason: "capability_expired" });
  const accepted = consumeAction650uManualConfirmation({
    ...value,
    consumed_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(accepted.ok).toBe(true);
  if (!accepted.ok) throw new Error(accepted.reason);
  expect(rebuildAction650uConsumptionProjectionDigest(accepted.receipt)).toBe(
    accepted.receipt.consumption_projection_digest,
  );
  expect(rebuildAction650uConsumptionReceiptDigest(accepted.receipt)).toBe(
    accepted.receipt.receipt_digest,
  );
  expect(
    consumeAction650uManualConfirmation({
      ...value,
      consumed_at: "2026-07-29T10:09:59.999999999Z",
    }),
  ).toEqual({ ok: false, reason: "capability_already_consumed" });
});

test("Action 650U independent re-review preserves duplicate, conflict, and cross-execution handling", () => {
  const duplicate = confirmed("650u-rereview-duplicate");
  const event = terminal(duplicate.prepared);
  expect(
    replay({ ...duplicate, events: [event, structuredClone(event)] }),
  ).toMatchObject({
    safety_decision: "passed",
    terminal_result_reconciliation: "duplicate",
  });

  const conflict = confirmed("650u-rereview-conflict");
  expect(
    replay({
      ...conflict,
      events: [
        terminal(conflict.prepared),
        terminal(conflict.prepared, {
          terminal_status: "failed",
          observed_at: "2026-07-29T10:04:00Z",
        }),
      ],
    }),
  ).toMatchObject({
    safety_decision: "blocked",
    blocked_reason: "conflicting_terminal_result",
    terminal_result_reconciliation: "needs_review",
  });

  const crossed = confirmed("650u-rereview-crossed");
  expect(
    replay({
      ...crossed,
      events: [
        terminal(crossed.prepared, {
          execution_identity: "other-execution",
          idempotency_identity: "other-idempotency",
          correlation_identity: "other-correlation",
        }),
      ],
    }).blocked_reason,
  ).toBe("broker_event_binding_mismatch");
});

test("Action 650U independent re-review binds temporal evidence into replay and audit identities", () => {
  const first = confirmed(
    "650u-rereview-evidence",
    "2026-07-29T10:01:00.000000000Z",
  );
  const second = confirmed(
    "650u-rereview-evidence",
    "2026-07-29T10:01:00.000000001Z",
  );
  const firstResult = replay(first);
  const secondResult = replay(second);

  expect(firstResult.temporal_audit_evidence).not.toBeNull();
  expect(firstResult.temporal_audit_evidence?.evidence_digest).not.toBe(
    secondResult.temporal_audit_evidence?.evidence_digest,
  );
  expect(firstResult.audit_result_evidence_digest).not.toBe(
    secondResult.audit_result_evidence_digest,
  );
  expect(firstResult.trace_identity).not.toBe(secondResult.trace_identity);
});

test("Action 650U independent re-review rejects terminal and automatic confirmation subjects", () => {
  const value = confirmed("650u-rereview-terminal-subject");
  const result = replay(value);

  expect(
    value.boundary.confirm(result, {
      confirmed_at: "2026-07-29T10:04:00Z",
      confirming_actor_class: "human_operator",
      session_identity: "650u-rereview-session",
    }),
  ).toEqual({
    ok: false,
    reason: "manual_confirmation_lifecycle_state_mismatch",
  });

  const automatic = structuredClone(value.prepared) as Action650sPreparedExecution;
  Object.assign(automatic.handoff.payload, { execution_mode: "automatic" });
  const other = scenario("650u-rereview-automatic-subject");
  expect(issue(other.boundary, automatic, waitingAt)).toEqual({
    ok: false,
    reason: "preparation_provenance_unproven",
  });
});

test("Action 650U independent re-review finds no dynamic, transport, browser, process, credential, or write edge", () => {
  const modules = [
    "lib/action-650u-temporal-confirmation-policy.ts",
    "lib/action-650u-manual-confirmation.ts",
    "lib/action-650u-confirmed-execution-replay.ts",
  ];
  const allowed = new Set([
    "@/lib/action-650s-confirmed-execution-replay",
    "@/lib/action-650s-execution-identity",
    "@/lib/action-650s-execution-preparation",
    "@/lib/action-650u-manual-confirmation",
    "@/lib/action-650u-temporal-confirmation-policy",
  ]);
  const prohibited = [
    /\bimport\s*\(/,
    /\brequire\s*\(/,
    /\bfetch\s*\(/,
    /\bWebSocket\b/,
    /\bchild_process\b/,
    /\bprocess\.(?:env|argv|cwd)\b/,
    /\bsupabase\b/i,
    /\bcdp\b/i,
    /\bplaywright\b/i,
    /\bpuppeteer\b/i,
    /\bavanza\b/i,
    /\b(?:credential|cookie|bankid|password|secret)\b/i,
  ];

  for (const modulePath of modules) {
    const source = readFileSync(resolve(root, modulePath), "utf8");
    const imports = Array.from(
      source.matchAll(/from\s+["']([^"']+)["']/g),
      (match) => match[1],
    );

    for (const pattern of prohibited) {
      expect(source, `${modulePath}: ${pattern}`).not.toMatch(pattern);
    }
    for (const imported of imports) {
      expect(allowed.has(imported), `${modulePath}: ${imported}`).toBe(true);
    }
  }
});
