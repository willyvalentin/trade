import {
  canonicalizeAction650sTimestamp,
  containsAction650sRestrictedMaterial,
  deepFreezeAction650s,
  hasAction650sRuntimeIdentityProvenance,
  hashAction650sCanonicalValue,
  type Action650sRuntimeIdentityContext,
} from "@/lib/action-650s-execution-identity";
import {
  hasAction650sPreparedExecutionProvenance,
  type Action650sPreparedExecution,
} from "@/lib/action-650s-execution-preparation";

export const action650sManualConfirmationContractVersion =
  "action_650s_manual_confirmation_capability_v1" as const;
export const action650sManualConfirmationAuthorityScope =
  "simulated_broker_progress_and_terminal_result" as const;

export type Action650sConfirmingActorClass = "human_operator";

export type Action650sManualConfirmationCapability = Readonly<{
  contract_version: typeof action650sManualConfirmationContractVersion;
  execution_identity: string;
  lifecycle_identity: string;
  runtime_identity_context_digest: string;
  handoff_identity: string;
  handoff_digest: string;
  canonical_order_payload_digest: string;
  broker_request_identity: string;
  idempotency_identity: string;
  correlation_identity: string;
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  order_type: "LIMIT" | "MARKET" | "STOP_LIMIT";
  limit_price: number | null;
  stop_price: number | null;
  execution_mode: "semi_automatic";
  confirmed_at: string;
  confirming_actor_class: Action650sConfirmingActorClass;
  session_identity: string;
  expires_at: string;
  consumption_state: "unconsumed";
  authority_scope: typeof action650sManualConfirmationAuthorityScope;
  capability_digest: string;
}>;

export type Action650sManualConfirmationConsumptionReceipt = Readonly<{
  capability_digest: string;
  execution_identity: string;
  handoff_digest: string;
  consumed_at: string;
  consumption_state: "consumed";
  authority_scope: typeof action650sManualConfirmationAuthorityScope;
  receipt_digest: string;
}>;

export type Action650sManualConfirmationBoundary = Readonly<{
  boundary_identity: string;
  confirm: (
    prepared: unknown,
    confirmation: {
      confirmed_at: unknown;
      confirming_actor_class: unknown;
      session_identity: unknown;
    },
  ) =>
    | Readonly<{
        ok: true;
        capability: Action650sManualConfirmationCapability;
      }>
    | Readonly<{
        ok: false;
        reason:
          | "preparation_provenance_unproven"
          | "runtime_identity_mismatch"
          | "confirmation_not_waiting"
          | "confirmation_invalid"
          | "session_mismatch"
          | "confirmation_expired"
          | "confirmation_already_issued"
          | "restricted_material_rejected";
      }>;
}>;

export type Action650sManualConfirmationConsumption =
  | Readonly<{
      ok: true;
      receipt: Action650sManualConfirmationConsumptionReceipt;
    }>
  | Readonly<{
      ok: false;
      reason:
        | "boundary_provenance_unproven"
        | "preparation_provenance_unproven"
        | "capability_provenance_unproven"
        | "capability_binding_mismatch"
        | "capability_expired"
        | "capability_already_consumed"
        | "timestamp_invalid";
    }>;

type BoundaryRuntimeState = {
  runtime: Action650sRuntimeIdentityContext;
  session_identity: string;
  session_started_at: string;
  session_expires_at: string;
  issued_handoffs: Set<string>;
};

type CapabilityRuntimeState = {
  boundary: Action650sManualConfirmationBoundary;
  prepared: Action650sPreparedExecution;
  consumed: boolean;
};

const boundaryRuntimeStates =
  new WeakMap<Action650sManualConfirmationBoundary, BoundaryRuntimeState>();
const capabilityRuntimeStates =
  new WeakMap<Action650sManualConfirmationCapability, CapabilityRuntimeState>();

function requiredIdentity(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function bindingFromPrepared(prepared: Action650sPreparedExecution) {
  return {
    execution_identity: prepared.runtime_identity_context.execution_identity,
    lifecycle_identity: prepared.runtime_identity_context.lifecycle_identity,
    runtime_identity_context_digest: prepared.runtime_identity_context_digest,
    handoff_identity: prepared.handoff.identity.handoff_identity,
    handoff_digest: prepared.handoff.identity.handoff_digest,
    canonical_order_payload_digest:
      prepared.handoff.identity.canonical_order_payload_digest,
    broker_request_identity:
      prepared.handoff.identity.broker_request_identity,
    idempotency_identity: prepared.handoff.identity.idempotency_identity,
    correlation_identity: prepared.handoff.identity.correlation_identity,
    ticker: prepared.handoff.payload.ticker,
    side: prepared.handoff.payload.side,
    quantity: prepared.handoff.payload.quantity,
    order_type: prepared.handoff.payload.order_type,
    limit_price: prepared.handoff.payload.limit_price,
    stop_price: prepared.handoff.payload.stop_price,
    execution_mode: prepared.handoff.payload.execution_mode,
  } as const;
}

function rejectConfirmation(
  reason: Extract<
    ReturnType<Action650sManualConfirmationBoundary["confirm"]>,
    { ok: false }
  >["reason"],
) {
  return deepFreezeAction650s({ ok: false as const, reason });
}

/**
 * Creates the only authority surface capable of issuing a confirmation
 * capability. Boundary and capability provenance remain private WeakMap state.
 */
export function createAction650sManualConfirmationBoundary(input: {
  runtime: Action650sRuntimeIdentityContext;
  session_identity: unknown;
  session_started_at: unknown;
  session_expires_at: unknown;
}): Action650sManualConfirmationBoundary | null {
  if (
    !hasAction650sRuntimeIdentityProvenance(input.runtime) ||
    containsAction650sRestrictedMaterial(input)
  ) {
    return null;
  }

  const sessionIdentity = requiredIdentity(input.session_identity);
  const sessionStartedAt = canonicalizeAction650sTimestamp(
    input.session_started_at,
  );
  const sessionExpiresAt = canonicalizeAction650sTimestamp(
    input.session_expires_at,
  );

  if (
    !sessionIdentity ||
    !sessionStartedAt ||
    !sessionExpiresAt ||
    Date.parse(sessionStartedAt) >= Date.parse(sessionExpiresAt)
  ) {
    return null;
  }

  const boundaryIdentity = `action_650s_confirmation_boundary_${hashAction650sCanonicalValue(
    {
      runtime_identity_context_digest: input.runtime.context_digest,
      session_identity: sessionIdentity,
      session_started_at: sessionStartedAt,
      session_expires_at: sessionExpiresAt,
    },
  ).slice(0, 24)}`;

  const confirm: Action650sManualConfirmationBoundary["confirm"] = (
    preparedValue,
    confirmation,
  ) => {
    const state = boundaryRuntimeStates.get(boundary);

    if (!state || !hasAction650sPreparedExecutionProvenance(preparedValue)) {
      return rejectConfirmation("preparation_provenance_unproven");
    }

    const prepared = preparedValue;

    if (
      prepared.runtime_identity_context !== state.runtime ||
      prepared.runtime_identity_context_digest !== state.runtime.context_digest
    ) {
      return rejectConfirmation("runtime_identity_mismatch");
    }

    if (prepared.current_state !== "waiting_for_manual_confirmation") {
      return rejectConfirmation("confirmation_not_waiting");
    }

    if (containsAction650sRestrictedMaterial(confirmation)) {
      return rejectConfirmation("restricted_material_rejected");
    }

    const confirmedAt = canonicalizeAction650sTimestamp(
      confirmation.confirmed_at,
    );
    const session = requiredIdentity(confirmation.session_identity);

    if (
      !confirmedAt ||
      confirmation.confirming_actor_class !== "human_operator"
    ) {
      return rejectConfirmation("confirmation_invalid");
    }

    if (session !== state.session_identity) {
      return rejectConfirmation("session_mismatch");
    }

    if (
      Date.parse(confirmedAt) < Date.parse(state.session_started_at) ||
      Date.parse(confirmedAt) > Date.parse(state.session_expires_at)
    ) {
      return rejectConfirmation("confirmation_expired");
    }

    const handoffDigest = prepared.handoff.identity.handoff_digest;

    if (state.issued_handoffs.has(handoffDigest)) {
      return rejectConfirmation("confirmation_already_issued");
    }

    const unsignedCapability = {
      contract_version: action650sManualConfirmationContractVersion,
      ...bindingFromPrepared(prepared),
      confirmed_at: confirmedAt,
      confirming_actor_class: "human_operator" as const,
      session_identity: state.session_identity,
      expires_at: state.session_expires_at,
      consumption_state: "unconsumed" as const,
      authority_scope: action650sManualConfirmationAuthorityScope,
    };
    const capability = deepFreezeAction650s({
      ...unsignedCapability,
      capability_digest: `action_650s_manual_confirmation_${hashAction650sCanonicalValue(
        unsignedCapability,
      )}`,
    }) as Action650sManualConfirmationCapability;

    state.issued_handoffs.add(handoffDigest);
    capabilityRuntimeStates.set(capability, {
      boundary,
      prepared,
      consumed: false,
    });

    return deepFreezeAction650s({ ok: true as const, capability });
  };

  const boundary: Action650sManualConfirmationBoundary = Object.freeze({
    boundary_identity: boundaryIdentity,
    confirm,
  });
  boundaryRuntimeStates.set(boundary, {
    runtime: input.runtime,
    session_identity: sessionIdentity,
    session_started_at: sessionStartedAt,
    session_expires_at: sessionExpiresAt,
    issued_handoffs: new Set<string>(),
  });

  return boundary;
}

function bindingMatches(
  capability: Action650sManualConfirmationCapability,
  prepared: Action650sPreparedExecution,
) {
  const expected = bindingFromPrepared(prepared);

  return Object.entries(expected).every(
    ([key, value]) =>
      capability[key as keyof Action650sManualConfirmationCapability] === value,
  );
}

export function consumeAction650sManualConfirmation(input: {
  boundary: Action650sManualConfirmationBoundary;
  prepared: Action650sPreparedExecution;
  capability: Action650sManualConfirmationCapability;
  consumed_at: unknown;
}): Action650sManualConfirmationConsumption {
  const boundaryState = boundaryRuntimeStates.get(input.boundary);

  if (!boundaryState) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "boundary_provenance_unproven" as const,
    });
  }

  if (!hasAction650sPreparedExecutionProvenance(input.prepared)) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "preparation_provenance_unproven" as const,
    });
  }

  const capabilityState = capabilityRuntimeStates.get(input.capability);

  if (
    !capabilityState ||
    capabilityState.boundary !== input.boundary ||
    capabilityState.prepared !== input.prepared
  ) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "capability_provenance_unproven" as const,
    });
  }

  if (capabilityState.consumed) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "capability_already_consumed" as const,
    });
  }

  const consumedAt = canonicalizeAction650sTimestamp(input.consumed_at);

  if (
    !consumedAt ||
    Date.parse(consumedAt) < Date.parse(input.capability.confirmed_at)
  ) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "timestamp_invalid" as const,
    });
  }

  if (Date.parse(consumedAt) > Date.parse(input.capability.expires_at)) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "capability_expired" as const,
    });
  }

  const { capability_digest: claimedDigest, ...unsignedCapability } =
    input.capability;
  const expectedDigest = `action_650s_manual_confirmation_${hashAction650sCanonicalValue(
    unsignedCapability,
  )}`;

  if (
    claimedDigest !== expectedDigest ||
    input.capability.session_identity !== boundaryState.session_identity ||
    input.capability.authority_scope !==
      action650sManualConfirmationAuthorityScope ||
    input.capability.consumption_state !== "unconsumed" ||
    !bindingMatches(input.capability, input.prepared)
  ) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "capability_binding_mismatch" as const,
    });
  }

  capabilityState.consumed = true;
  const receiptBase = {
    capability_digest: input.capability.capability_digest,
    execution_identity: input.capability.execution_identity,
    handoff_digest: input.capability.handoff_digest,
    consumed_at: consumedAt,
    consumption_state: "consumed" as const,
    authority_scope: action650sManualConfirmationAuthorityScope,
  };
  const receipt = deepFreezeAction650s({
    ...receiptBase,
    receipt_digest: `action_650s_confirmation_receipt_${hashAction650sCanonicalValue(
      receiptBase,
    )}`,
  }) as Action650sManualConfirmationConsumptionReceipt;

  return deepFreezeAction650s({ ok: true as const, receipt });
}

export function getAction650sManualConfirmationConsumptionState(
  capability: unknown,
) {
  if (!capability || typeof capability !== "object") {
    return "unproven" as const;
  }

  const state = capabilityRuntimeStates.get(
    capability as Action650sManualConfirmationCapability,
  );

  return state ? (state.consumed ? "consumed" : "unconsumed") : "unproven";
}
