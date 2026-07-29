import {
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
import {
  action650uTemporalConfirmationPolicyVersion,
  canonicalizeAction650uNanosecondInstant,
  compareAction650uInstants,
  evaluateAction650uTemporalConfirmationPolicy,
  type Action650uTemporalConfirmationReason,
} from "@/lib/action-650u-temporal-confirmation-policy";

export const action650uManualConfirmationContractVersion =
  "action_650u_manual_confirmation_capability_v1" as const;
export const action650uManualConfirmationAuthorityScope =
  "simulated_broker_progress_and_terminal_result" as const;

export type Action650uConfirmingActorClass = "human_operator";

type Action650uPreparedBinding = Readonly<{
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
}>;

export type Action650uConfirmationRequestProjection =
  Action650uPreparedBinding &
    Readonly<{
      temporal_policy_version: typeof action650uTemporalConfirmationPolicyVersion;
      confirmed_lifecycle_state: "waiting_for_manual_confirmation";
      confirmed_at: string;
      waiting_for_manual_confirmation_at: string;
      session_started_at: string;
      session_expires_at: string;
      confirming_actor_class: Action650uConfirmingActorClass;
      session_identity: string;
    }>;

export type Action650uManualConfirmationCapability =
  Action650uConfirmationRequestProjection &
    Readonly<{
      contract_version: typeof action650uManualConfirmationContractVersion;
      confirmation_request_digest: string;
      consumption_state: "unconsumed";
      authority_scope: typeof action650uManualConfirmationAuthorityScope;
      capability_digest: string;
    }>;

export type Action650uManualConfirmationConsumptionReceipt = Readonly<{
  contract_version: "action_650u_manual_confirmation_consumption_receipt_v1";
  temporal_policy_version: typeof action650uTemporalConfirmationPolicyVersion;
  confirmation_request_digest: string;
  capability_digest: string;
  execution_identity: string;
  lifecycle_identity: string;
  handoff_digest: string;
  confirmed_at: string;
  waiting_for_manual_confirmation_at: string;
  session_started_at: string;
  session_expires_at: string;
  consumed_at: string;
  consumption_state: "consumed";
  authority_scope: typeof action650uManualConfirmationAuthorityScope;
  consumption_projection_digest: string;
  receipt_digest: string;
}>;

type Action650uConfirmationRejectionReason =
  | "preparation_provenance_unproven"
  | "runtime_identity_mismatch"
  | "confirmation_actor_invalid"
  | "confirmation_request_shape_invalid"
  | "session_mismatch"
  | "confirmation_already_issued"
  | "restricted_material_rejected"
  | Action650uTemporalConfirmationReason;

export type Action650uManualConfirmationBoundary = Readonly<{
  boundary_identity: string;
  temporal_policy_version: typeof action650uTemporalConfirmationPolicyVersion;
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
        capability: Action650uManualConfirmationCapability;
      }>
    | Readonly<{
        ok: false;
        reason: Action650uConfirmationRejectionReason;
      }>;
}>;

export type Action650uManualConfirmationConsumption =
  | Readonly<{
      ok: true;
      receipt: Action650uManualConfirmationConsumptionReceipt;
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
  boundary: Action650uManualConfirmationBoundary;
  prepared: Action650sPreparedExecution;
  consumed: boolean;
};

const boundaryRuntimeStates =
  new WeakMap<Action650uManualConfirmationBoundary, BoundaryRuntimeState>();
const capabilityRuntimeStates =
  new WeakMap<Action650uManualConfirmationCapability, CapabilityRuntimeState>();

function requiredIdentity(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function bindingFromPrepared(
  prepared: Action650sPreparedExecution,
): Action650uPreparedBinding {
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
  };
}

function waitingAtFromPrepared(prepared: Action650sPreparedExecution) {
  const waitingEvents = prepared.lifecycle_events.filter(
    (event) => event.event_type === "waiting_for_manual_confirmation",
  );

  return waitingEvents.length === 1 ? waitingEvents[0].occurred_at : null;
}

function rejection(reason: Action650uConfirmationRejectionReason) {
  return deepFreezeAction650s({ ok: false as const, reason });
}

const confirmationRequestKeys = [
  "confirmed_at",
  "confirming_actor_class",
  "session_identity",
] as const;

function hasExactConfirmationRequestShape(value: object) {
  const keys = Object.keys(value).sort();
  return (
    keys.length === confirmationRequestKeys.length &&
    confirmationRequestKeys.every((key, index) => key === keys[index])
  );
}

function requestProjectionFromCapability(
  capability: Action650uManualConfirmationCapability,
): Action650uConfirmationRequestProjection {
  return {
    ...bindingFieldsFromCapability(capability),
    temporal_policy_version: capability.temporal_policy_version,
    confirmed_lifecycle_state: capability.confirmed_lifecycle_state,
    confirmed_at: capability.confirmed_at,
    waiting_for_manual_confirmation_at:
      capability.waiting_for_manual_confirmation_at,
    session_started_at: capability.session_started_at,
    session_expires_at: capability.session_expires_at,
    confirming_actor_class: capability.confirming_actor_class,
    session_identity: capability.session_identity,
  };
}

function bindingFieldsFromCapability(
  capability: Action650uManualConfirmationCapability,
): Action650uPreparedBinding {
  return {
    execution_identity: capability.execution_identity,
    lifecycle_identity: capability.lifecycle_identity,
    runtime_identity_context_digest:
      capability.runtime_identity_context_digest,
    handoff_identity: capability.handoff_identity,
    handoff_digest: capability.handoff_digest,
    canonical_order_payload_digest:
      capability.canonical_order_payload_digest,
    broker_request_identity: capability.broker_request_identity,
    idempotency_identity: capability.idempotency_identity,
    correlation_identity: capability.correlation_identity,
    ticker: capability.ticker,
    side: capability.side,
    quantity: capability.quantity,
    order_type: capability.order_type,
    limit_price: capability.limit_price,
    stop_price: capability.stop_price,
    execution_mode: capability.execution_mode,
  };
}

export function rebuildAction650uConfirmationRequestDigest(
  capability: Action650uManualConfirmationCapability,
) {
  return `action_650u_confirmation_request_${hashAction650sCanonicalValue(
    requestProjectionFromCapability(capability),
  )}`;
}

export function rebuildAction650uManualConfirmationCapabilityDigest(
  capability: Action650uManualConfirmationCapability,
) {
  const { capability_digest: _claimedDigest, ...unsignedCapability } =
    capability;
  void _claimedDigest;
  return `action_650u_manual_confirmation_${hashAction650sCanonicalValue(
    unsignedCapability,
  )}`;
}

export function verifyAction650uManualConfirmationCapability(
  capability: Action650uManualConfirmationCapability,
) {
  const temporal = evaluateAction650uTemporalConfirmationPolicy({
    current_lifecycle_state: capability.confirmed_lifecycle_state,
    waiting_for_manual_confirmation_at:
      capability.waiting_for_manual_confirmation_at,
    confirmed_at: capability.confirmed_at,
    session_started_at: capability.session_started_at,
    session_expires_at: capability.session_expires_at,
  });

  return (
    temporal.accepted &&
    capability.contract_version ===
      action650uManualConfirmationContractVersion &&
    capability.temporal_policy_version ===
      action650uTemporalConfirmationPolicyVersion &&
    capability.authority_scope === action650uManualConfirmationAuthorityScope &&
    capability.execution_mode === "semi_automatic" &&
    capability.consumption_state === "unconsumed" &&
    capability.confirmation_request_digest ===
      rebuildAction650uConfirmationRequestDigest(capability) &&
    capability.capability_digest ===
      rebuildAction650uManualConfirmationCapabilityDigest(capability)
  );
}

export function createAction650uManualConfirmationBoundary(input: {
  runtime: Action650sRuntimeIdentityContext;
  session_identity: unknown;
  session_started_at: unknown;
  session_expires_at: unknown;
}): Action650uManualConfirmationBoundary | null {
  if (
    !hasAction650sRuntimeIdentityProvenance(input.runtime) ||
    containsAction650sRestrictedMaterial(input)
  ) {
    return null;
  }

  const sessionIdentity = requiredIdentity(input.session_identity);
  const sessionStartedAt = canonicalizeAction650uNanosecondInstant(
    input.session_started_at,
  );
  const sessionExpiresAt = canonicalizeAction650uNanosecondInstant(
    input.session_expires_at,
  );

  if (
    !sessionIdentity ||
    !sessionStartedAt ||
    !sessionExpiresAt ||
    compareAction650uInstants(sessionStartedAt, sessionExpiresAt) >= 0
  ) {
    return null;
  }

  const boundaryProjection = {
    temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    runtime_identity_context_digest: input.runtime.context_digest,
    session_identity: sessionIdentity,
    session_started_at: sessionStartedAt.canonical_instant,
    session_expires_at: sessionExpiresAt.canonical_instant,
  };
  const boundaryIdentity = `action_650u_confirmation_boundary_${hashAction650sCanonicalValue(
    boundaryProjection,
  ).slice(0, 24)}`;

  const confirm: Action650uManualConfirmationBoundary["confirm"] = (
    preparedValue,
    confirmation,
  ) => {
    const state = boundaryRuntimeStates.get(boundary);

    if (
      preparedValue &&
      typeof preparedValue === "object" &&
      "current_state" in preparedValue &&
      preparedValue.current_state !== "waiting_for_manual_confirmation"
    ) {
      return rejection("manual_confirmation_lifecycle_state_mismatch");
    }

    if (!state || !hasAction650sPreparedExecutionProvenance(preparedValue)) {
      return rejection("preparation_provenance_unproven");
    }

    const prepared = preparedValue;
    if (
      prepared.runtime_identity_context !== state.runtime ||
      prepared.runtime_identity_context_digest !== state.runtime.context_digest
    ) {
      return rejection("runtime_identity_mismatch");
    }

    if (!hasExactConfirmationRequestShape(confirmation)) {
      return rejection("confirmation_request_shape_invalid");
    }

    if (containsAction650sRestrictedMaterial(confirmation)) {
      return rejection("restricted_material_rejected");
    }

    if (confirmation.confirming_actor_class !== "human_operator") {
      return rejection("confirmation_actor_invalid");
    }

    const session = requiredIdentity(confirmation.session_identity);
    if (session !== state.session_identity) {
      return rejection("session_mismatch");
    }

    const temporal = evaluateAction650uTemporalConfirmationPolicy({
      current_lifecycle_state: prepared.current_state,
      waiting_for_manual_confirmation_at: waitingAtFromPrepared(prepared),
      confirmed_at: confirmation.confirmed_at,
      session_started_at: state.session_started_at,
      session_expires_at: state.session_expires_at,
    });
    if (!temporal.accepted) return rejection(temporal.reason);

    const handoffDigest = prepared.handoff.identity.handoff_digest;
    if (state.issued_handoffs.has(handoffDigest)) {
      return rejection("confirmation_already_issued");
    }

    const requestProjection: Action650uConfirmationRequestProjection = {
      ...bindingFromPrepared(prepared),
      temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
      confirmed_lifecycle_state: "waiting_for_manual_confirmation",
      confirmed_at: temporal.confirmed_at,
      waiting_for_manual_confirmation_at:
        temporal.waiting_for_manual_confirmation_at,
      session_started_at: state.session_started_at,
      session_expires_at: temporal.session_expires_at,
      confirming_actor_class: "human_operator",
      session_identity: state.session_identity,
    };
    const confirmationRequestDigest =
      `action_650u_confirmation_request_${hashAction650sCanonicalValue(
        requestProjection,
      )}`;
    const unsignedCapability = {
      contract_version: action650uManualConfirmationContractVersion,
      ...requestProjection,
      confirmation_request_digest: confirmationRequestDigest,
      consumption_state: "unconsumed" as const,
      authority_scope: action650uManualConfirmationAuthorityScope,
    };
    const capability = deepFreezeAction650s({
      ...unsignedCapability,
      capability_digest: `action_650u_manual_confirmation_${hashAction650sCanonicalValue(
        unsignedCapability,
      )}`,
    }) as Action650uManualConfirmationCapability;

    state.issued_handoffs.add(handoffDigest);
    capabilityRuntimeStates.set(capability, {
      boundary,
      prepared,
      consumed: false,
    });

    return deepFreezeAction650s({ ok: true as const, capability });
  };

  const boundary: Action650uManualConfirmationBoundary = Object.freeze({
    boundary_identity: boundaryIdentity,
    temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    confirm,
  });
  boundaryRuntimeStates.set(boundary, {
    runtime: input.runtime,
    session_identity: sessionIdentity,
    session_started_at: sessionStartedAt.canonical_instant,
    session_expires_at: sessionExpiresAt.canonical_instant,
    issued_handoffs: new Set<string>(),
  });

  return boundary;
}

function bindingMatches(
  capability: Action650uManualConfirmationCapability,
  prepared: Action650sPreparedExecution,
) {
  const expected = bindingFromPrepared(prepared);
  return Object.entries(expected).every(
    ([key, value]) =>
      capability[key as keyof Action650uManualConfirmationCapability] === value,
  );
}

function receiptProjection(
  capability: Action650uManualConfirmationCapability,
  consumedAt: string,
) {
  return {
    contract_version:
      "action_650u_manual_confirmation_consumption_receipt_v1" as const,
    temporal_policy_version: action650uTemporalConfirmationPolicyVersion,
    confirmation_request_digest: capability.confirmation_request_digest,
    capability_digest: capability.capability_digest,
    execution_identity: capability.execution_identity,
    lifecycle_identity: capability.lifecycle_identity,
    handoff_digest: capability.handoff_digest,
    confirmed_at: capability.confirmed_at,
    waiting_for_manual_confirmation_at:
      capability.waiting_for_manual_confirmation_at,
    session_started_at: capability.session_started_at,
    session_expires_at: capability.session_expires_at,
    consumed_at: consumedAt,
    consumption_state: "consumed" as const,
    authority_scope: action650uManualConfirmationAuthorityScope,
  };
}

export function rebuildAction650uConsumptionProjectionDigest(
  receipt: Action650uManualConfirmationConsumptionReceipt,
) {
  const {
    consumption_projection_digest: _projectionDigest,
    receipt_digest: _receiptDigest,
    ...projection
  } = receipt;
  void _projectionDigest;
  void _receiptDigest;
  return `action_650u_consumption_projection_${hashAction650sCanonicalValue(
    projection,
  )}`;
}

export function rebuildAction650uConsumptionReceiptDigest(
  receipt: Action650uManualConfirmationConsumptionReceipt,
) {
  const { receipt_digest: _receiptDigest, ...unsignedReceipt } = receipt;
  void _receiptDigest;
  return `action_650u_confirmation_receipt_${hashAction650sCanonicalValue(
    unsignedReceipt,
  )}`;
}

export function consumeAction650uManualConfirmation(input: {
  boundary: Action650uManualConfirmationBoundary;
  prepared: Action650sPreparedExecution;
  capability: Action650uManualConfirmationCapability;
  consumed_at: unknown;
}): Action650uManualConfirmationConsumption {
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

  const consumedAt = canonicalizeAction650uNanosecondInstant(input.consumed_at);
  const confirmedAt = canonicalizeAction650uNanosecondInstant(
    input.capability.confirmed_at,
  );
  const expiresAt = canonicalizeAction650uNanosecondInstant(
    input.capability.session_expires_at,
  );
  if (
    !consumedAt ||
    !confirmedAt ||
    !expiresAt ||
    compareAction650uInstants(consumedAt, confirmedAt) < 0
  ) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "timestamp_invalid" as const,
    });
  }

  if (compareAction650uInstants(consumedAt, expiresAt) >= 0) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "capability_expired" as const,
    });
  }

  if (
    input.capability.session_identity !== boundaryState.session_identity ||
    input.capability.session_started_at !==
      boundaryState.session_started_at ||
    input.capability.session_expires_at !==
      boundaryState.session_expires_at ||
    !verifyAction650uManualConfirmationCapability(input.capability) ||
    !bindingMatches(input.capability, input.prepared)
  ) {
    return deepFreezeAction650s({
      ok: false as const,
      reason: "capability_binding_mismatch" as const,
    });
  }

  capabilityState.consumed = true;
  const projection = receiptProjection(
    input.capability,
    consumedAt.canonical_instant,
  );
  const receiptWithoutDigest = {
    ...projection,
    consumption_projection_digest:
      `action_650u_consumption_projection_${hashAction650sCanonicalValue(
        projection,
      )}`,
  };
  const receipt = deepFreezeAction650s({
    ...receiptWithoutDigest,
    receipt_digest: `action_650u_confirmation_receipt_${hashAction650sCanonicalValue(
      receiptWithoutDigest,
    )}`,
  }) as Action650uManualConfirmationConsumptionReceipt;

  return deepFreezeAction650s({ ok: true as const, receipt });
}

export function getAction650uManualConfirmationConsumptionState(
  capability: unknown,
) {
  if (!capability || typeof capability !== "object") {
    return "unproven" as const;
  }

  const state = capabilityRuntimeStates.get(
    capability as Action650uManualConfirmationCapability,
  );
  return state ? (state.consumed ? "consumed" : "unconsumed") : "unproven";
}
