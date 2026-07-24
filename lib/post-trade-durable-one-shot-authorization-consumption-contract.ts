import {
  POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
  POST_TRADE_FINAL_GATE_IDENTITY,
  POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
  buildPostTradeStagingExecutionAuthorizationArtifactFingerprint,
  evaluatePostTradeStagingExecutionAuthorizationArtifact,
  type PostTradeStagingExecutionAuthorizationArtifact,
} from "@/lib/post-trade-staging-execution-authorization-artifact-core";
import {
  POST_TRADE_FINAL_EXECUTION_SCOPE,
  POST_TRADE_FINAL_STAGING_PROJECT_REF,
  POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
} from "@/lib/post-trade-final-staging-execution-gate-core";

export const POST_TRADE_DURABLE_CONSUMPTION_CONTRACT_VERSION =
  "post_trade_durable_one_shot_authorization_consumption_contract_v1" as const;
export const POST_TRADE_DURABLE_CONSUMPTION_PERSISTENCE_OPERATION =
  "compare_and_set_authorization_unused_to_consumed" as const;
export const POST_TRADE_DURABLE_CONSUMPTION_READ_BACK_OPERATION =
  "read_back_authorization_consumption_by_immutable_identity" as const;

export type PostTradeDurableAuthorizationState =
  | "unused"
  | "consumption_pending"
  | "consumed"
  | "invalid"
  | "expired"
  | "ambiguous";

export type PostTradeDurableConsumptionDecisionStatus =
  | "valid"
  | "blocked"
  | "ambiguous";

export type PostTradeDurableConsumptionBlockedReason =
  | "artifact:invalid"
  | "artifact:expired"
  | "artifact:not_unused"
  | "artifact:fingerprint_mismatch"
  | "artifact:id_mismatch"
  | "artifact:version_mismatch"
  | "artifact:attempt_id_mismatch"
  | "artifact:plan_id_mismatch"
  | "artifact:function_identity_mismatch"
  | "artifact:gate_identity_mismatch"
  | "target:staging_required"
  | "target:production_reference_blocked"
  | "operationId:required"
  | "operationId:stable_original_required"
  | "request:unknown_or_missing_fields"
  | "request:invalid_state_transition"
  | "request:one_shot_required"
  | "request:no_retry_required"
  | "request:mock_only_required"
  | "request:operation_count_mismatch"
  | "request:row_count_mismatch"
  | "request:table_order_mismatch"
  | "request:audit_dependency_mismatch"
  | "request:sensitive_or_raw_field_present"
  | "request:capability_blocked"
  | "persistence:zero_matching_rows"
  | "persistence:multiple_matching_rows"
  | "persistence:zero_rows_updated"
  | "persistence:multiple_rows_updated"
  | "persistence:affected_row_count_unknown"
  | "persistence:missing_durable_record_id"
  | "persistence:malformed_response"
  | "persistence:generic_success_without_evidence"
  | "persistence:http_success_without_evidence"
  | "evidence:artifact_id_mismatch"
  | "evidence:fingerprint_mismatch"
  | "evidence:attempt_id_mismatch"
  | "evidence:plan_id_mismatch"
  | "evidence:operation_id_mismatch"
  | "evidence:target_project_mismatch"
  | "evidence:previous_state_not_unused"
  | "evidence:new_state_not_consumed"
  | "evidence:consumed_at_required"
  | "evidence:persistence_operation_mismatch"
  | "evidence:result_classification_mismatch"
  | "evidence:affected_row_count_mismatch"
  | "evidence:incomplete"
  | "outcome:network_timeout_after_submission"
  | "outcome:connection_lost_after_submission"
  | "outcome:ambiguous_requires_read_back"
  | "replay:already_consumed_by_same_operation"
  | "replay:already_consumed_by_different_operation"
  | "replay:still_unused"
  | "replay:ambiguous_blocks_execution"
  | "readBack:missing"
  | "readBack:consumed_by_another_operation"
  | "readBack:still_unused"
  | "readBack:invalid"
  | "readBack:expired"
  | "readBack:inconsistent"
  | "readBack:ambiguous";

export type PostTradeAuthorizationConsumptionRequest = {
  contractVersion: typeof POST_TRADE_DURABLE_CONSUMPTION_CONTRACT_VERSION;
  authorizationArtifactId: string;
  authorizationArtifactVersion: string;
  authorizationFingerprint: string;
  executionAttemptId: string;
  executionPlanId: string;
  executionScope: typeof POST_TRADE_FINAL_EXECUTION_SCOPE;
  targetStagingProjectRef: typeof POST_TRADE_FINAL_STAGING_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF;
  executionFunction: typeof POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY;
  finalGate: typeof POST_TRADE_FINAL_GATE_IDENTITY;
  expectedCurrentState: "unused";
  requestedNewState: "consumed";
  requestedConsumptionAtIso: string;
  consumptionOperationId: string;
  noRetry: true;
  oneShot: true;
  mockOnly: true;
  expectedOperationCount: 2;
  expectedRowCount: 2;
  orderedTargetTables: readonly ["execution_records", "execution_record_audit_events"];
  auditDependency: "execution_record_audit_events.execution_record_id_from_execution_records.id";
};

export type PostTradeAuthorizationConsumptionRequestDecision = {
  status: PostTradeDurableConsumptionDecisionStatus;
  valid: boolean;
  request: PostTradeAuthorizationConsumptionRequest | null;
  blockingReasons: PostTradeDurableConsumptionBlockedReason[];
  executionAllowed: false;
  persistencePerformed: false;
  rowsCreated: 0;
  safetyFlags: {
    sideEffectFree: true;
    noDatabaseWrite: true;
    noSupabaseCall: true;
    noExecutionFunctionInvocation: true;
    noFinalGateExecution: true;
    noArtifactConsumption: true;
    noMutableProcessLocalState: true;
    noAutomaticRetry: true;
  };
};

export type PostTradeAuthorizationConsumptionPersistencePlan = {
  contractVersion: typeof POST_TRADE_DURABLE_CONSUMPTION_CONTRACT_VERSION;
  operation: typeof POST_TRADE_DURABLE_CONSUMPTION_PERSISTENCE_OPERATION;
  target: "staging";
  targetProjectRef: typeof POST_TRADE_FINAL_STAGING_PROJECT_REF;
  compareAndSet: {
    locateByAuthorizationArtifactId: string;
    requireCurrentState: "unused";
    updateToState: "consumed";
    requireFingerprint: string;
    requireAttemptId: string;
    requirePlanId: string;
    requireExecutionScope: typeof POST_TRADE_FINAL_EXECUTION_SCOPE;
    requireArtifactVersion: string;
    requireNotExpiredAtIso: string;
    requireConsumptionOperationId: string;
    requireExecutionFunction: typeof POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY;
    requireFinalGate: typeof POST_TRADE_FINAL_GATE_IDENTITY;
    requireOneShot: true;
    requireNoRetry: true;
    requireMockOnly: true;
    requireOperationCount: 2;
    requireExpectedRowCount: 2;
    requireOrderedTargetTables: readonly ["execution_records", "execution_record_audit_events"];
    requireAuditDependency: "execution_record_audit_events.execution_record_id_from_execution_records.id";
    affectedRowsMustEqual: 1;
  };
  expectedEvidence: readonly [
    "durableConsumptionRecordId",
    "authorizationArtifactId",
    "previousState",
    "newState",
    "consumedAtIso",
    "authorizationFingerprint",
    "executionAttemptId",
    "executionPlanId",
    "consumptionOperationId",
    "targetProjectRef",
    "affectedRows",
    "persistenceOperation",
    "resultClassification",
  ];
  executionAllowed: false;
  persistencePerformed: false;
};

export type PostTradeAuthorizationConsumptionEvidence = {
  durableConsumptionRecordId: string | null;
  authorizationArtifactId: string;
  previousState: PostTradeDurableAuthorizationState;
  newState: PostTradeDurableAuthorizationState;
  consumedAtIso: string | null;
  authorizationFingerprint: string;
  executionAttemptId: string;
  executionPlanId: string;
  consumptionOperationId: string;
  targetProjectRef: string;
  affectedRows: number | null;
  persistenceOperation: typeof POST_TRADE_DURABLE_CONSUMPTION_PERSISTENCE_OPERATION;
  resultClassification:
    | "transitioned_unused_to_consumed"
    | "blocked"
    | "ambiguous";
};

export type PostTradeHypotheticalPersistenceResult = {
  kind:
    | "transition_result"
    | "generic_success_without_evidence"
    | "http_success_without_evidence"
    | "network_timeout_after_submission"
    | "connection_lost_after_submission"
    | "malformed_response";
  affectedRows?: number | null;
  evidence?: Partial<PostTradeAuthorizationConsumptionEvidence> | null;
};

export type PostTradeAuthorizationConsumptionResultDecision = {
  status: PostTradeDurableConsumptionDecisionStatus;
  resultClassification:
    | "authoritatively_consumed_by_this_operation"
    | "blocked"
    | "ambiguous";
  evidence: PostTradeAuthorizationConsumptionEvidence | null;
  blockingReasons: PostTradeDurableConsumptionBlockedReason[];
  mayContinueToExecution: boolean;
  automaticRetryAllowed: false;
};

export type PostTradeAuthorizationConsumptionReplayDecision = {
  status: "first_valid_consumption_possible" | "replay_detected" | "blocked" | "ambiguous";
  blockingReasons: PostTradeDurableConsumptionBlockedReason[];
  mayContinueToExecution: boolean;
  automaticRetryAllowed: false;
};

export type PostTradeAuthorizationConsumptionReadBackRequest = {
  operation: typeof POST_TRADE_DURABLE_CONSUMPTION_READ_BACK_OPERATION;
  authorizationArtifactId: string;
  authorizationFingerprint: string;
  executionAttemptId: string;
  executionPlanId: string;
  consumptionOperationId: string;
  targetProjectRef: typeof POST_TRADE_FINAL_STAGING_PROJECT_REF;
};

export type PostTradeAuthorizationConsumptionReadBackResult = {
  kind:
    | "consumed"
    | "unused"
    | "missing"
    | "invalid"
    | "expired"
    | "inconsistent"
    | "ambiguous";
  evidence?: Partial<PostTradeAuthorizationConsumptionEvidence> | null;
};

export type PostTradeAuthorizationConsumptionReadBackDecision = {
  classification:
    | "authoritatively_consumed_by_this_operation"
    | "consumed_by_another_operation"
    | "still_unused"
    | "missing"
    | "invalid"
    | "expired"
    | "inconsistent"
    | "ambiguous";
  blockingReasons: PostTradeDurableConsumptionBlockedReason[];
  mayContinueToExecution: boolean;
  automaticRetryAllowed: false;
};

const REQUEST_KEYS = [
  "contractVersion",
  "authorizationArtifactId",
  "authorizationArtifactVersion",
  "authorizationFingerprint",
  "executionAttemptId",
  "executionPlanId",
  "executionScope",
  "targetStagingProjectRef",
  "rejectedProductionProjectRef",
  "executionFunction",
  "finalGate",
  "expectedCurrentState",
  "requestedNewState",
  "requestedConsumptionAtIso",
  "consumptionOperationId",
  "noRetry",
  "oneShot",
  "mockOnly",
  "expectedOperationCount",
  "expectedRowCount",
  "orderedTargetTables",
  "auditDependency",
] as const;

const forbiddenConsumptionKeys = [
  "credentials",
  "credential",
  "password",
  "secret",
  "token",
  "BankID",
  "bankId",
  "cookie",
  "cookies",
  "session",
  "serviceRoleKey",
  "rawBrokerPayload",
  "rawBrowserState",
  "rawAvanzaState",
  "arbitraryJson",
  "jsonBlob",
  "payloadBlob",
  "browserAutomation",
  "brokerInteraction",
  "avanzaInteraction",
  "apiRouteInvocation",
  "tradeUiInvocation",
  "clientInvocation",
  "migrationExecution",
  "schemaMutation",
  "tradeMutation",
  "positionMutation",
  "orderMutation",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...expected].sort();
  return (
    actualKeys.length === expectedKeys.length &&
    actualKeys.every((key, index) => key === expectedKeys[index])
  );
}

function containsForbiddenKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenKey);
  if (!isRecord(value)) return false;
  for (const [key, nested] of Object.entries(value)) {
    if ((forbiddenConsumptionKeys as readonly string[]).includes(key)) {
      return true;
    }
    if (containsForbiddenKey(nested)) return true;
  }
  return false;
}

function containsUnexpectedProductionReference(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsUnexpectedProductionReference);
  if (typeof value === "string") {
    return value.includes(POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF);
  }
  if (!isRecord(value)) return false;
  for (const [key, nested] of Object.entries(value)) {
    if (key === "rejectedProductionProjectRef") continue;
    if (containsUnexpectedProductionReference(nested)) return true;
  }
  return false;
}

function dateMillis(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function baseRequestDecision(input: {
  request: PostTradeAuthorizationConsumptionRequest | null;
  blockingReasons: PostTradeDurableConsumptionBlockedReason[];
}): PostTradeAuthorizationConsumptionRequestDecision {
  return {
    status: input.blockingReasons.length === 0 ? "valid" : "blocked",
    valid: input.blockingReasons.length === 0,
    request: input.blockingReasons.length === 0 ? input.request : null,
    blockingReasons: input.blockingReasons,
    executionAllowed: false,
    persistencePerformed: false,
    rowsCreated: 0,
    safetyFlags: {
      sideEffectFree: true,
      noDatabaseWrite: true,
      noSupabaseCall: true,
      noExecutionFunctionInvocation: true,
      noFinalGateExecution: true,
      noArtifactConsumption: true,
      noMutableProcessLocalState: true,
      noAutomaticRetry: true,
    },
  };
}

export function buildPostTradeAuthorizationConsumptionRequest(input: {
  artifact?: unknown;
  consumptionOperationId?: string;
  requestedConsumptionAtIso?: string;
  evaluatedAtIso?: string;
}): PostTradeAuthorizationConsumptionRequestDecision {
  const artifactEvaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
    artifact: input.artifact,
    evaluatedAtIso: input.evaluatedAtIso ?? input.requestedConsumptionAtIso,
  });
  const blockingReasons: PostTradeDurableConsumptionBlockedReason[] = [];

  if (!artifactEvaluation.valid) {
    blockingReasons.push(
      artifactEvaluation.status === "expired" ? "artifact:expired" : "artifact:invalid",
    );
  }

  if (
    !input.consumptionOperationId ||
    input.consumptionOperationId.trim().length === 0
  ) {
    blockingReasons.push("operationId:required");
  }

  if (!isRecord(input.artifact)) {
    return baseRequestDecision({ request: null, blockingReasons });
  }

  const artifact = input.artifact as PostTradeStagingExecutionAuthorizationArtifact;
  const artifactCore = Object.fromEntries(
    Object.entries(artifact).filter(([key]) => key !== "artifactFingerprint"),
  ) as PostTradeStagingExecutionAuthorizationArtifact;
  const expectedFingerprint =
    buildPostTradeStagingExecutionAuthorizationArtifactFingerprint(artifactCore);

  if (artifact.artifactFingerprint !== expectedFingerprint) {
    blockingReasons.push("artifact:fingerprint_mismatch");
  }

  const request: PostTradeAuthorizationConsumptionRequest = {
    contractVersion: POST_TRADE_DURABLE_CONSUMPTION_CONTRACT_VERSION,
    authorizationArtifactId: String(artifact.artifactId),
    authorizationArtifactVersion: String(artifact.artifactVersion),
    authorizationFingerprint: String(artifact.artifactFingerprint),
    executionAttemptId: String(artifact.executionAttemptId),
    executionPlanId: String(artifact.executionPlanId),
    executionScope: POST_TRADE_FINAL_EXECUTION_SCOPE,
    targetStagingProjectRef: POST_TRADE_FINAL_STAGING_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
    executionFunction: POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
    finalGate: POST_TRADE_FINAL_GATE_IDENTITY,
    expectedCurrentState: "unused",
    requestedNewState: "consumed",
    requestedConsumptionAtIso:
      input.requestedConsumptionAtIso ?? new Date(0).toISOString(),
    consumptionOperationId: input.consumptionOperationId ?? "",
    noRetry: true,
    oneShot: true,
    mockOnly: true,
    expectedOperationCount: 2,
    expectedRowCount: 2,
    orderedTargetTables: ["execution_records", "execution_record_audit_events"],
    auditDependency:
      "execution_record_audit_events.execution_record_id_from_execution_records.id",
  };

  return validatePostTradeAuthorizationConsumptionRequest(request, blockingReasons);
}

export function validatePostTradeAuthorizationConsumptionRequest(
  request: unknown,
  inheritedReasons: PostTradeDurableConsumptionBlockedReason[] = [],
): PostTradeAuthorizationConsumptionRequestDecision {
  const blockingReasons = [...inheritedReasons];
  if (!isRecord(request)) {
    return baseRequestDecision({
      request: null,
      blockingReasons: [...blockingReasons, "request:unknown_or_missing_fields"],
    });
  }

  if (!hasExactKeys(request, REQUEST_KEYS)) {
    blockingReasons.push("request:unknown_or_missing_fields");
  }

  if (containsForbiddenKey(request)) {
    blockingReasons.push("request:sensitive_or_raw_field_present");
  }

  if (containsUnexpectedProductionReference(request)) {
    blockingReasons.push("target:production_reference_blocked");
  }

  const expected = POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT;
  const typedRequest = request as PostTradeAuthorizationConsumptionRequest;

  if (typedRequest.targetStagingProjectRef !== POST_TRADE_FINAL_STAGING_PROJECT_REF) {
    blockingReasons.push("target:staging_required");
  }
  if (typedRequest.authorizationArtifactId !== expected.artifactId) {
    blockingReasons.push("artifact:id_mismatch");
  }
  if (typedRequest.authorizationArtifactVersion !== expected.artifactVersion) {
    blockingReasons.push("artifact:version_mismatch");
  }
  if (typedRequest.authorizationFingerprint !== expected.artifactFingerprint) {
    blockingReasons.push("artifact:fingerprint_mismatch");
  }
  if (typedRequest.executionAttemptId !== expected.executionAttemptId) {
    blockingReasons.push("artifact:attempt_id_mismatch");
  }
  if (typedRequest.executionPlanId !== expected.executionPlanId) {
    blockingReasons.push("artifact:plan_id_mismatch");
  }
  if (typedRequest.executionScope !== POST_TRADE_FINAL_EXECUTION_SCOPE) {
    blockingReasons.push("request:invalid_state_transition");
  }
  if (
    JSON.stringify(typedRequest.executionFunction) !==
    JSON.stringify(POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY)
  ) {
    blockingReasons.push("artifact:function_identity_mismatch");
  }
  if (JSON.stringify(typedRequest.finalGate) !== JSON.stringify(POST_TRADE_FINAL_GATE_IDENTITY)) {
    blockingReasons.push("artifact:gate_identity_mismatch");
  }
  if (
    typedRequest.expectedCurrentState !== "unused" ||
    typedRequest.requestedNewState !== "consumed"
  ) {
    blockingReasons.push("request:invalid_state_transition");
  }
  if (!typedRequest.consumptionOperationId) {
    blockingReasons.push("operationId:required");
  }
  if (dateMillis(typedRequest.requestedConsumptionAtIso) === null) {
    blockingReasons.push("request:invalid_state_transition");
  }
  if (typedRequest.noRetry !== true) blockingReasons.push("request:no_retry_required");
  if (typedRequest.oneShot !== true) blockingReasons.push("request:one_shot_required");
  if (typedRequest.mockOnly !== true) blockingReasons.push("request:mock_only_required");
  if (typedRequest.expectedOperationCount !== 2) {
    blockingReasons.push("request:operation_count_mismatch");
  }
  if (typedRequest.expectedRowCount !== 2) {
    blockingReasons.push("request:row_count_mismatch");
  }
  if (
    !Array.isArray(typedRequest.orderedTargetTables) ||
    typedRequest.orderedTargetTables[0] !== "execution_records" ||
    typedRequest.orderedTargetTables[1] !== "execution_record_audit_events" ||
    typedRequest.orderedTargetTables.length !== 2
  ) {
    blockingReasons.push("request:table_order_mismatch");
  }
  if (
    typedRequest.auditDependency !==
    "execution_record_audit_events.execution_record_id_from_execution_records.id"
  ) {
    blockingReasons.push("request:audit_dependency_mismatch");
  }

  return baseRequestDecision({
    request: typedRequest,
    blockingReasons,
  });
}

export function buildPostTradeAuthorizationConsumptionPersistencePlan(
  request: unknown,
): PostTradeAuthorizationConsumptionRequestDecision & {
  plan: PostTradeAuthorizationConsumptionPersistencePlan | null;
} {
  const decision = validatePostTradeAuthorizationConsumptionRequest(request);
  if (!decision.valid || !decision.request) return { ...decision, plan: null };

  return {
    ...decision,
    plan: {
      contractVersion: POST_TRADE_DURABLE_CONSUMPTION_CONTRACT_VERSION,
      operation: POST_TRADE_DURABLE_CONSUMPTION_PERSISTENCE_OPERATION,
      target: "staging",
      targetProjectRef: POST_TRADE_FINAL_STAGING_PROJECT_REF,
      compareAndSet: {
        locateByAuthorizationArtifactId: decision.request.authorizationArtifactId,
        requireCurrentState: "unused",
        updateToState: "consumed",
        requireFingerprint: decision.request.authorizationFingerprint,
        requireAttemptId: decision.request.executionAttemptId,
        requirePlanId: decision.request.executionPlanId,
        requireExecutionScope: decision.request.executionScope,
        requireArtifactVersion: decision.request.authorizationArtifactVersion,
        requireNotExpiredAtIso: decision.request.requestedConsumptionAtIso,
        requireConsumptionOperationId: decision.request.consumptionOperationId,
        requireExecutionFunction: decision.request.executionFunction,
        requireFinalGate: decision.request.finalGate,
        requireOneShot: true,
        requireNoRetry: true,
        requireMockOnly: true,
        requireOperationCount: 2,
        requireExpectedRowCount: 2,
        requireOrderedTargetTables: decision.request.orderedTargetTables,
        requireAuditDependency: decision.request.auditDependency,
        affectedRowsMustEqual: 1,
      },
      expectedEvidence: [
        "durableConsumptionRecordId",
        "authorizationArtifactId",
        "previousState",
        "newState",
        "consumedAtIso",
        "authorizationFingerprint",
        "executionAttemptId",
        "executionPlanId",
        "consumptionOperationId",
        "targetProjectRef",
        "affectedRows",
        "persistenceOperation",
        "resultClassification",
      ],
      executionAllowed: false,
      persistencePerformed: false,
    },
  };
}

export function classifyPostTradeAuthorizationConsumptionPersistenceResult(input: {
  request: PostTradeAuthorizationConsumptionRequest;
  result: PostTradeHypotheticalPersistenceResult;
}): PostTradeAuthorizationConsumptionResultDecision {
  const blockingReasons: PostTradeDurableConsumptionBlockedReason[] = [];

  if (input.result.kind === "network_timeout_after_submission") {
    return ambiguousDecision(["outcome:network_timeout_after_submission"]);
  }
  if (input.result.kind === "connection_lost_after_submission") {
    return ambiguousDecision(["outcome:connection_lost_after_submission"]);
  }
  if (input.result.kind === "malformed_response") {
    return ambiguousDecision(["persistence:malformed_response"]);
  }
  if (input.result.kind === "generic_success_without_evidence") {
    return blockedResult(["persistence:generic_success_without_evidence"]);
  }
  if (input.result.kind === "http_success_without_evidence") {
    return blockedResult(["persistence:http_success_without_evidence"]);
  }

  if (input.result.affectedRows === null || input.result.affectedRows === undefined) {
    return ambiguousDecision(["persistence:affected_row_count_unknown"]);
  }
  if (input.result.affectedRows === 0) blockingReasons.push("persistence:zero_rows_updated");
  if (input.result.affectedRows > 1) blockingReasons.push("persistence:multiple_rows_updated");

  const evidence = input.result.evidence;
  if (!evidence) {
    return blockedResult([...blockingReasons, "evidence:incomplete"]);
  }

  if (!evidence.durableConsumptionRecordId) {
    blockingReasons.push("persistence:missing_durable_record_id");
  }
  if (evidence.affectedRows !== 1) {
    blockingReasons.push("evidence:affected_row_count_mismatch");
  }
  if (dateMillis(evidence.consumedAtIso) === null) {
    blockingReasons.push("evidence:consumed_at_required");
  }
  if (evidence.authorizationArtifactId !== input.request.authorizationArtifactId) {
    blockingReasons.push("evidence:artifact_id_mismatch");
  }
  if (evidence.authorizationFingerprint !== input.request.authorizationFingerprint) {
    blockingReasons.push("evidence:fingerprint_mismatch");
  }
  if (evidence.executionAttemptId !== input.request.executionAttemptId) {
    blockingReasons.push("evidence:attempt_id_mismatch");
  }
  if (evidence.executionPlanId !== input.request.executionPlanId) {
    blockingReasons.push("evidence:plan_id_mismatch");
  }
  if (evidence.consumptionOperationId !== input.request.consumptionOperationId) {
    blockingReasons.push("evidence:operation_id_mismatch");
  }
  if (evidence.targetProjectRef !== input.request.targetStagingProjectRef) {
    blockingReasons.push("evidence:target_project_mismatch");
  }
  if (evidence.previousState !== "unused") {
    blockingReasons.push("evidence:previous_state_not_unused");
  }
  if (evidence.newState !== "consumed") {
    blockingReasons.push("evidence:new_state_not_consumed");
  }
  if (
    evidence.persistenceOperation !==
    POST_TRADE_DURABLE_CONSUMPTION_PERSISTENCE_OPERATION
  ) {
    blockingReasons.push("evidence:persistence_operation_mismatch");
  }
  if (evidence.resultClassification !== "transitioned_unused_to_consumed") {
    blockingReasons.push("evidence:result_classification_mismatch");
  }

  if (blockingReasons.length > 0) {
    return blockedResult(blockingReasons);
  }

  return {
    status: "valid",
    resultClassification: "authoritatively_consumed_by_this_operation",
    evidence: evidence as PostTradeAuthorizationConsumptionEvidence,
    blockingReasons: [],
    mayContinueToExecution: true,
    automaticRetryAllowed: false,
  };
}

function ambiguousDecision(
  reasons: PostTradeDurableConsumptionBlockedReason[],
): PostTradeAuthorizationConsumptionResultDecision {
  return {
    status: "ambiguous",
    resultClassification: "ambiguous",
    evidence: null,
    blockingReasons: [...reasons, "outcome:ambiguous_requires_read_back"],
    mayContinueToExecution: false,
    automaticRetryAllowed: false,
  };
}

function blockedResult(
  reasons: PostTradeDurableConsumptionBlockedReason[],
): PostTradeAuthorizationConsumptionResultDecision {
  return {
    status: "blocked",
    resultClassification: "blocked",
    evidence: null,
    blockingReasons: reasons,
    mayContinueToExecution: false,
    automaticRetryAllowed: false,
  };
}

export function classifyPostTradeAuthorizationConsumptionReplay(input: {
  request: PostTradeAuthorizationConsumptionRequest;
  durableState: PostTradeDurableAuthorizationState;
  existingConsumptionOperationId?: string | null;
  existingExecutionAttemptId?: string | null;
}): PostTradeAuthorizationConsumptionReplayDecision {
  if (input.durableState === "unused") {
    return {
      status: "first_valid_consumption_possible",
      blockingReasons: ["replay:still_unused"],
      mayContinueToExecution: false,
      automaticRetryAllowed: false,
    };
  }
  if (input.durableState === "ambiguous" || input.durableState === "consumption_pending") {
    return {
      status: "ambiguous",
      blockingReasons: ["replay:ambiguous_blocks_execution"],
      mayContinueToExecution: false,
      automaticRetryAllowed: false,
    };
  }
  if (input.durableState === "consumed") {
    const sameOperation =
      input.existingConsumptionOperationId === input.request.consumptionOperationId &&
      input.existingExecutionAttemptId === input.request.executionAttemptId;
    return {
      status: "replay_detected",
      blockingReasons: [
        sameOperation
          ? "replay:already_consumed_by_same_operation"
          : "replay:already_consumed_by_different_operation",
      ],
      mayContinueToExecution: false,
      automaticRetryAllowed: false,
    };
  }
  return {
    status: "blocked",
    blockingReasons: [
      input.durableState === "expired" ? "artifact:expired" : "artifact:invalid",
    ],
    mayContinueToExecution: false,
    automaticRetryAllowed: false,
  };
}

export function buildPostTradeAuthorizationConsumptionReadBackRequest(
  request: PostTradeAuthorizationConsumptionRequest,
): PostTradeAuthorizationConsumptionReadBackRequest {
  return {
    operation: POST_TRADE_DURABLE_CONSUMPTION_READ_BACK_OPERATION,
    authorizationArtifactId: request.authorizationArtifactId,
    authorizationFingerprint: request.authorizationFingerprint,
    executionAttemptId: request.executionAttemptId,
    executionPlanId: request.executionPlanId,
    consumptionOperationId: request.consumptionOperationId,
    targetProjectRef: request.targetStagingProjectRef,
  };
}

export function evaluatePostTradeAuthorizationConsumptionReadBackResult(input: {
  request: PostTradeAuthorizationConsumptionReadBackRequest;
  result: PostTradeAuthorizationConsumptionReadBackResult;
}): PostTradeAuthorizationConsumptionReadBackDecision {
  if (input.result.kind === "missing") {
    return readBackDecision("missing", ["readBack:missing"], false);
  }
  if (input.result.kind === "unused") {
    return readBackDecision("still_unused", ["readBack:still_unused"], false);
  }
  if (input.result.kind === "invalid") {
    return readBackDecision("invalid", ["readBack:invalid"], false);
  }
  if (input.result.kind === "expired") {
    return readBackDecision("expired", ["readBack:expired"], false);
  }
  if (input.result.kind === "ambiguous") {
    return readBackDecision("ambiguous", ["readBack:ambiguous"], false);
  }

  const evidence = input.result.evidence;
  if (!evidence || input.result.kind === "inconsistent") {
    return readBackDecision("inconsistent", ["readBack:inconsistent"], false);
  }

  const sameOperation =
    evidence.authorizationArtifactId === input.request.authorizationArtifactId &&
    evidence.authorizationFingerprint === input.request.authorizationFingerprint &&
    evidence.executionAttemptId === input.request.executionAttemptId &&
    evidence.executionPlanId === input.request.executionPlanId &&
    evidence.consumptionOperationId === input.request.consumptionOperationId &&
    evidence.targetProjectRef === input.request.targetProjectRef &&
    evidence.previousState === "unused" &&
    evidence.newState === "consumed" &&
    Boolean(evidence.durableConsumptionRecordId) &&
    dateMillis(evidence.consumedAtIso) !== null &&
    evidence.affectedRows === 1 &&
    evidence.persistenceOperation ===
      POST_TRADE_DURABLE_CONSUMPTION_PERSISTENCE_OPERATION &&
    evidence.resultClassification === "transitioned_unused_to_consumed";

  if (sameOperation) {
    return readBackDecision("authoritatively_consumed_by_this_operation", [], true);
  }

  if (evidence.consumptionOperationId && evidence.consumptionOperationId !== input.request.consumptionOperationId) {
    return readBackDecision(
      "consumed_by_another_operation",
      ["readBack:consumed_by_another_operation"],
      false,
    );
  }

  return readBackDecision("inconsistent", ["readBack:inconsistent"], false);
}

function readBackDecision(
  classification: PostTradeAuthorizationConsumptionReadBackDecision["classification"],
  blockingReasons: PostTradeDurableConsumptionBlockedReason[],
  mayContinueToExecution: boolean,
): PostTradeAuthorizationConsumptionReadBackDecision {
  return {
    classification,
    blockingReasons,
    mayContinueToExecution,
    automaticRetryAllowed: false,
  };
}
