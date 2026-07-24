import {
  POST_TRADE_FINAL_EXECUTION_SCOPE,
  POST_TRADE_FINAL_STAGING_EXECUTION_GATE_VERSION,
  POST_TRADE_FINAL_STAGING_PROJECT_REF,
  POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
  POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
  buildPostTradeFinalStagingExecutionGateApprovalFingerprint,
  type PostTradeFinalStagingExecutionGateApproval,
  type PostTradeFinalStagingExecutionGateApprovalCore,
} from "@/lib/post-trade-final-staging-execution-gate-core";

export const POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_ID =
  "post_trade_staging_mock_execution_authorization_001" as const;
export const POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_VERSION =
  "post_trade_staging_execution_authorization_artifact_v1" as const;
export const POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_TYPE =
  "single_use_source_controlled_staging_mock_execution" as const;
export const POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_SOURCE_ACTION =
  "Action 493 - Add Single-Use Source-Controlled Staging Execution Authorization Artifact" as const;
export const POST_TRADE_STAGING_EXECUTION_ATTEMPT_ID =
  "post_trade_staging_mock_execution_attempt_001" as const;
export const POST_TRADE_STAGING_EXECUTION_PLAN_ID =
  "post_trade_two_row_execution_records_with_dependent_audit_v1" as const;

export const POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY = {
  modulePath: "lib/post-trade-staging-execution-function.ts",
  exportName: "buildPostTradeStagingExecutionFunction",
  contractVersion: "post_trade_staging_execution_function_v1",
  implementationDecision:
    "post_trade_source_controlled_staging_execution_function_implementation_ready_no_execution",
  staticReviewDecision:
    "post_trade_source_controlled_staging_execution_function_static_security_review_ready_for_final_execution_gate",
} as const;

export const POST_TRADE_FINAL_GATE_IDENTITY = {
  modulePath: "lib/post-trade-final-staging-execution-gate.ts",
  coreModulePath: "lib/post-trade-final-staging-execution-gate-core.ts",
  exportName: "evaluatePostTradeFinalStagingExecutionGate",
  contractVersion: POST_TRADE_FINAL_STAGING_EXECUTION_GATE_VERSION,
  implementationDecision:
    "post_trade_final_source_controlled_staging_execution_gate_added_no_execution",
  staticReviewDecision:
    "post_trade_final_source_controlled_staging_execution_gate_static_security_review_ready_for_execution_authorization_artifact",
} as const;

export type PostTradeStagingExecutionAuthorizationState =
  | "unused"
  | "consumed"
  | "invalid"
  | "expired";

export type PostTradeStagingExecutionAuthorizationFunctionIdentity =
  typeof POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY;

export type PostTradeStagingExecutionAuthorizationGateIdentity =
  typeof POST_TRADE_FINAL_GATE_IDENTITY;

export type PostTradeStagingExecutionAuthorizationPlan = {
  operationCount: 2;
  expectedRows: 2;
  orderedTargetTables: readonly ["execution_records", "execution_record_audit_events"];
  firstOperation: "insert_mock_execution_record_returning_id";
  secondOperation: "insert_dependent_audit_event_with_execution_record_id";
  auditDependency: "execution_record_audit_events.execution_record_id_from_execution_records.id";
  createNoOtherRows: true;
  mutateNoOtherTables: true;
};

export type PostTradeStagingExecutionAuthorizationCapabilities = {
  productionAccess: false;
  apiRouteInvocation: false;
  tradeUiInvocation: false;
  clientInvocation: false;
  browserAutomation: false;
  brokerInteraction: false;
  avanzaInteraction: false;
  buyBehavior: false;
  sellBehavior: false;
  credentialHandling: false;
  cookieHandling: false;
  sessionHandling: false;
  bankIdHandling: false;
  brokerStateHandling: false;
  migrationExecution: false;
  schemaMutation: false;
  rpcExecution: false;
  storageExecution: false;
  tradeMutation: false;
  positionMutation: false;
  orderMutation: false;
  settlementRetrieval: false;
  liveMarketMutation: false;
  retry: false;
  multipleExecutionAttempts: false;
  rawBrokerBrowserPayload: false;
  arbitraryJsonBlob: false;
};

export type PostTradeStagingExecutionAuthorizationArtifactCore = {
  artifactId: typeof POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_ID;
  artifactVersion: typeof POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_VERSION;
  authorizationType: typeof POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_TYPE;
  sourceAction: typeof POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_SOURCE_ACTION;
  createdAtIso: string;
  expiresAtIso: string;
  targetStagingProjectRef: typeof POST_TRADE_FINAL_STAGING_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF;
  executionScope: typeof POST_TRADE_FINAL_EXECUTION_SCOPE;
  executionAttemptId: typeof POST_TRADE_STAGING_EXECUTION_ATTEMPT_ID;
  executionPlanId: typeof POST_TRADE_STAGING_EXECUTION_PLAN_ID;
  executionFunction: PostTradeStagingExecutionAuthorizationFunctionIdentity;
  finalGate: PostTradeStagingExecutionAuthorizationGateIdentity;
  plan: PostTradeStagingExecutionAuthorizationPlan;
  mockOnly: true;
  oneShot: true;
  retryAllowed: false;
  authorizationState: PostTradeStagingExecutionAuthorizationState;
  executionEnabled: false;
  executionStatus: "not_executed";
  remoteExecution: false;
  rowsCreated: 0;
  capabilities: PostTradeStagingExecutionAuthorizationCapabilities;
};

export type PostTradeStagingExecutionAuthorizationArtifact =
  PostTradeStagingExecutionAuthorizationArtifactCore & {
    artifactFingerprint: string;
  };

export type PostTradeStagingExecutionAuthorizationEvaluation = {
  artifactVersion: typeof POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_VERSION;
  status: "valid" | "invalid" | "expired" | "blocked";
  valid: boolean;
  structurallyEligibleForFutureGate: boolean;
  executionEnabled: false;
  executionStatus: "not_executed";
  remoteExecution: false;
  rowsCreated: 0;
  authorizationState: PostTradeStagingExecutionAuthorizationState | "missing";
  artifactId: string | null;
  artifactFingerprint: string | null;
  blockingReasons: string[];
  safetyFlags: {
    sideEffectFree: true;
    noDatabaseWrite: true;
    noRowsCreated: true;
    noSupabaseCall: true;
    noExecutionFunctionInvocation: true;
    noFinalGateExecutionFlow: true;
    noAuthorizationConsumption: true;
    noMutableProcessLocalState: true;
  };
};

export type PostTradeStagingExecutionAuthorizationGateCompatibility = {
  compatible: boolean;
  approval: PostTradeFinalStagingExecutionGateApproval | null;
  blockingReasons: string[];
  executionEnabled: false;
  executionStatus: "not_executed";
  remoteExecution: false;
  rowsCreated: 0;
};

const ARTIFACT_CORE_KEYS = [
  "artifactId",
  "artifactVersion",
  "authorizationType",
  "sourceAction",
  "createdAtIso",
  "expiresAtIso",
  "targetStagingProjectRef",
  "rejectedProductionProjectRef",
  "executionScope",
  "executionAttemptId",
  "executionPlanId",
  "executionFunction",
  "finalGate",
  "plan",
  "mockOnly",
  "oneShot",
  "retryAllowed",
  "authorizationState",
  "executionEnabled",
  "executionStatus",
  "remoteExecution",
  "rowsCreated",
  "capabilities",
] as const;

const ARTIFACT_KEYS = [...ARTIFACT_CORE_KEYS, "artifactFingerprint"] as const;

const FUNCTION_IDENTITY_KEYS = [
  "modulePath",
  "exportName",
  "contractVersion",
  "implementationDecision",
  "staticReviewDecision",
] as const;

const FINAL_GATE_IDENTITY_KEYS = [
  "modulePath",
  "coreModulePath",
  "exportName",
  "contractVersion",
  "implementationDecision",
  "staticReviewDecision",
] as const;

const PLAN_KEYS = [
  "operationCount",
  "expectedRows",
  "orderedTargetTables",
  "firstOperation",
  "secondOperation",
  "auditDependency",
  "createNoOtherRows",
  "mutateNoOtherTables",
] as const;

const CAPABILITY_KEYS = [
  "productionAccess",
  "apiRouteInvocation",
  "tradeUiInvocation",
  "clientInvocation",
  "browserAutomation",
  "brokerInteraction",
  "avanzaInteraction",
  "buyBehavior",
  "sellBehavior",
  "credentialHandling",
  "cookieHandling",
  "sessionHandling",
  "bankIdHandling",
  "brokerStateHandling",
  "migrationExecution",
  "schemaMutation",
  "rpcExecution",
  "storageExecution",
  "tradeMutation",
  "positionMutation",
  "orderMutation",
  "settlementRetrieval",
  "liveMarketMutation",
  "retry",
  "multipleExecutionAttempts",
  "rawBrokerBrowserPayload",
  "arbitraryJsonBlob",
] as const;

const forbiddenArtifactKeys = [
  "credentials",
  "credential",
  "password",
  "secret",
  "token",
  "BankID",
  "bankId",
  "bankIdData",
  "cookie",
  "cookies",
  "session",
  "sessionToken",
  "authToken",
  "accessToken",
  "refreshToken",
  "apiToken",
  "serviceRoleKey",
  "rawBrokerPayload",
  "rawBrowserState",
  "rawAvanzaState",
  "brokerState",
  "browserState",
  "avanzaState",
  "arbitraryJson",
  "jsonBlob",
  "payloadBlob",
  "unvalidatedPayload",
] as const;

const MAX_ARTIFACT_VALIDITY_MILLIS = 7 * 24 * 60 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
) {
  const actualKeys = Object.keys(value).sort();
  const sortedExpected = [...expectedKeys].sort();

  return (
    actualKeys.length === sortedExpected.length &&
    actualKeys.every((key, index) => key === sortedExpected[index])
  );
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  if (value === undefined) {
    return '"<undefined>"';
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    return `"<non-finite:${String(value)}>"`;
  }

  return JSON.stringify(value);
}

function containsForbiddenKey(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsForbiddenKey);
  }

  if (!isRecord(value)) return false;

  for (const [key, nestedValue] of Object.entries(value)) {
    if ((forbiddenArtifactKeys as readonly string[]).includes(key)) {
      return true;
    }

    if (containsForbiddenKey(nestedValue)) {
      return true;
    }
  }

  return false;
}

function containsUnexpectedProductionProjectRef(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsUnexpectedProductionProjectRef);
  }

  if (typeof value === "string") {
    return value.includes(POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF);
  }

  if (!isRecord(value)) return false;

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === "rejectedProductionProjectRef") {
      continue;
    }

    if (nestedValue === POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF) {
      return true;
    }

    if (containsUnexpectedProductionProjectRef(nestedValue)) {
      return true;
    }
  }

  return false;
}

function dateMillis(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildPostTradeStagingExecutionAuthorizationArtifactFingerprint(
  artifactCore: PostTradeStagingExecutionAuthorizationArtifactCore,
): string {
  let hash = 0x811c9dc5;
  const input = stableStringify(artifactCore);

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

export const POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_CORE =
  {
    artifactId: POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_ID,
    artifactVersion: POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_VERSION,
    authorizationType: POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_TYPE,
    sourceAction: POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_SOURCE_ACTION,
    createdAtIso: "2026-07-11T12:30:00.000Z",
    expiresAtIso: "2026-07-18T12:30:00.000Z",
    targetStagingProjectRef: POST_TRADE_FINAL_STAGING_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
    executionScope: POST_TRADE_FINAL_EXECUTION_SCOPE,
    executionAttemptId: POST_TRADE_STAGING_EXECUTION_ATTEMPT_ID,
    executionPlanId: POST_TRADE_STAGING_EXECUTION_PLAN_ID,
    executionFunction: POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
    finalGate: POST_TRADE_FINAL_GATE_IDENTITY,
    plan: {
      operationCount: 2,
      expectedRows: 2,
      orderedTargetTables: ["execution_records", "execution_record_audit_events"],
      firstOperation: "insert_mock_execution_record_returning_id",
      secondOperation: "insert_dependent_audit_event_with_execution_record_id",
      auditDependency:
        "execution_record_audit_events.execution_record_id_from_execution_records.id",
      createNoOtherRows: true,
      mutateNoOtherTables: true,
    },
    mockOnly: true,
    oneShot: true,
    retryAllowed: false,
    authorizationState: "unused",
    executionEnabled: false,
    executionStatus: "not_executed",
    remoteExecution: false,
    rowsCreated: 0,
    capabilities: {
      productionAccess: false,
      apiRouteInvocation: false,
      tradeUiInvocation: false,
      clientInvocation: false,
      browserAutomation: false,
      brokerInteraction: false,
      avanzaInteraction: false,
      buyBehavior: false,
      sellBehavior: false,
      credentialHandling: false,
      cookieHandling: false,
      sessionHandling: false,
      bankIdHandling: false,
      brokerStateHandling: false,
      migrationExecution: false,
      schemaMutation: false,
      rpcExecution: false,
      storageExecution: false,
      tradeMutation: false,
      positionMutation: false,
      orderMutation: false,
      settlementRetrieval: false,
      liveMarketMutation: false,
      retry: false,
      multipleExecutionAttempts: false,
      rawBrokerBrowserPayload: false,
      arbitraryJsonBlob: false,
    },
  } as const satisfies PostTradeStagingExecutionAuthorizationArtifactCore;

export const POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT = {
  ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_CORE,
  artifactFingerprint:
    buildPostTradeStagingExecutionAuthorizationArtifactFingerprint(
      POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_CORE,
    ),
} as const satisfies PostTradeStagingExecutionAuthorizationArtifact;

function baseEvaluation(input: {
  artifact?: Partial<PostTradeStagingExecutionAuthorizationArtifact> | null;
  blockingReasons: string[];
}): PostTradeStagingExecutionAuthorizationEvaluation {
  const expired = input.blockingReasons.includes("artifact:expired");
  const valid = input.blockingReasons.length === 0;

  return {
    artifactVersion: POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_VERSION,
    status: valid ? "valid" : expired ? "expired" : "invalid",
    valid,
    structurallyEligibleForFutureGate: valid,
    executionEnabled: false,
    executionStatus: "not_executed",
    remoteExecution: false,
    rowsCreated: 0,
    authorizationState: input.artifact?.authorizationState ?? "missing",
    artifactId:
      typeof input.artifact?.artifactId === "string"
        ? input.artifact.artifactId
        : null,
    artifactFingerprint:
      typeof input.artifact?.artifactFingerprint === "string"
        ? input.artifact.artifactFingerprint
        : null,
    blockingReasons: input.blockingReasons,
    safetyFlags: {
      sideEffectFree: true,
      noDatabaseWrite: true,
      noRowsCreated: true,
      noSupabaseCall: true,
      noExecutionFunctionInvocation: true,
      noFinalGateExecutionFlow: true,
      noAuthorizationConsumption: true,
      noMutableProcessLocalState: true,
    },
  };
}

function validateIdentity(
  value: unknown,
  expected: Record<string, unknown>,
  keys: readonly string[],
  label: string,
  blockingReasons: string[],
) {
  if (!isRecord(value)) {
    blockingReasons.push(`${label}:required`);
    return;
  }

  if (!hasExactKeys(value, keys)) {
    blockingReasons.push(`${label}:unknown_or_missing_fields`);
  }

  for (const key of keys) {
    if (value[key] !== expected[key]) {
      blockingReasons.push(`${label}:identity_mismatch`);
      break;
    }
  }
}

export function evaluatePostTradeStagingExecutionAuthorizationArtifact(input: {
  artifact?: unknown;
  evaluatedAtIso?: string;
} = {}): PostTradeStagingExecutionAuthorizationEvaluation {
  if (!isRecord(input.artifact)) {
    return baseEvaluation({
      artifact: null,
      blockingReasons: ["artifact:required"],
    });
  }

  const artifact = input.artifact;
  const blockingReasons: string[] = [];

  if (!hasExactKeys(artifact, ARTIFACT_KEYS)) {
    blockingReasons.push("artifact:unknown_or_missing_fields");
  }

  if (containsForbiddenKey(artifact)) {
    blockingReasons.push("artifact:sensitive_or_raw_payload_field_present");
  }

  if (containsUnexpectedProductionProjectRef(artifact)) {
    blockingReasons.push("productionProjectRef:unexpected_reference");
  }

  const expectedScalarFields: Array<[keyof PostTradeStagingExecutionAuthorizationArtifactCore, unknown, string]> = [
    ["artifactId", POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_ID, "artifactId:mismatch"],
    ["artifactVersion", POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT_VERSION, "artifactVersion:mismatch"],
    ["authorizationType", POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_TYPE, "authorizationType:mismatch"],
    ["sourceAction", POST_TRADE_STAGING_EXECUTION_AUTHORIZATION_SOURCE_ACTION, "sourceAction:mismatch"],
    ["targetStagingProjectRef", POST_TRADE_FINAL_STAGING_PROJECT_REF, "targetStagingProjectRef:staging_project_required"],
    ["rejectedProductionProjectRef", POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF, "rejectedProductionProjectRef:production_marker_required"],
    ["executionScope", POST_TRADE_FINAL_EXECUTION_SCOPE, "executionScope:mismatch"],
    ["executionAttemptId", POST_TRADE_STAGING_EXECUTION_ATTEMPT_ID, "executionAttemptId:mismatch"],
    ["executionPlanId", POST_TRADE_STAGING_EXECUTION_PLAN_ID, "executionPlanId:mismatch"],
    ["mockOnly", true, "mockOnly:true_required"],
    ["oneShot", true, "oneShot:true_required"],
    ["retryAllowed", false, "retryAllowed:false_required"],
    ["authorizationState", "unused", "authorizationState:unused_required"],
    ["executionEnabled", false, "executionEnabled:false_required"],
    ["executionStatus", "not_executed", "executionStatus:not_executed_required"],
    ["remoteExecution", false, "remoteExecution:false_required"],
    ["rowsCreated", 0, "rowsCreated:zero_required"],
  ];

  for (const [field, expected, reason] of expectedScalarFields) {
    if (artifact[field] !== expected) {
      blockingReasons.push(reason);
    }
  }

  if (artifact.targetStagingProjectRef === POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF) {
    blockingReasons.push("targetStagingProjectRef:production_project_blocked");
  }

  const evaluatedAtMillis = dateMillis(input.evaluatedAtIso);
  const createdAtMillis = dateMillis(artifact.createdAtIso);
  const expiresAtMillis = dateMillis(artifact.expiresAtIso);

  if (evaluatedAtMillis === null) {
    blockingReasons.push("evaluatedAtIso:required_valid_iso");
  }

  if (createdAtMillis === null || expiresAtMillis === null) {
    blockingReasons.push("artifact:valid_timestamps_required");
  } else {
    if (expiresAtMillis <= createdAtMillis) {
      blockingReasons.push("artifact:expiry_after_issued_required");
    }

    if (expiresAtMillis - createdAtMillis > MAX_ARTIFACT_VALIDITY_MILLIS) {
      blockingReasons.push("artifact:validity_window_too_long");
    }

    if (
      evaluatedAtMillis !== null &&
      (createdAtMillis > evaluatedAtMillis + 300_000 ||
        expiresAtMillis <= evaluatedAtMillis)
    ) {
      blockingReasons.push("artifact:expired");
    }
  }

  validateIdentity(
    artifact.executionFunction,
    POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
    FUNCTION_IDENTITY_KEYS,
    "executionFunction",
    blockingReasons,
  );
  validateIdentity(
    artifact.finalGate,
    POST_TRADE_FINAL_GATE_IDENTITY,
    FINAL_GATE_IDENTITY_KEYS,
    "finalGate",
    blockingReasons,
  );

  if (!isRecord(artifact.plan)) {
    blockingReasons.push("plan:required");
  } else {
    if (!hasExactKeys(artifact.plan, PLAN_KEYS)) {
      blockingReasons.push("plan:unknown_or_missing_fields");
    }

    if (artifact.plan.operationCount !== 2) {
      blockingReasons.push("plan.operationCount:exactly_two_required");
    }

    if (artifact.plan.expectedRows !== 2) {
      blockingReasons.push("plan.expectedRows:exactly_two_required");
    }

    if (
      !Array.isArray(artifact.plan.orderedTargetTables) ||
      artifact.plan.orderedTargetTables.length !== 2 ||
      artifact.plan.orderedTargetTables[0] !== "execution_records" ||
      artifact.plan.orderedTargetTables[1] !== "execution_record_audit_events"
    ) {
      blockingReasons.push("plan.orderedTargetTables:exact_order_required");
    }

    if (
      artifact.plan.auditDependency !==
      "execution_record_audit_events.execution_record_id_from_execution_records.id"
    ) {
      blockingReasons.push("plan.auditDependency:execution_record_id_required");
    }

    if (
      artifact.plan.firstOperation !== "insert_mock_execution_record_returning_id" ||
      artifact.plan.secondOperation !==
        "insert_dependent_audit_event_with_execution_record_id" ||
      artifact.plan.createNoOtherRows !== true ||
      artifact.plan.mutateNoOtherTables !== true
    ) {
      blockingReasons.push("plan:exact_mock_two_row_plan_required");
    }
  }

  if (!isRecord(artifact.capabilities)) {
    blockingReasons.push("capabilities:required");
  } else {
    if (!hasExactKeys(artifact.capabilities, CAPABILITY_KEYS)) {
      blockingReasons.push("capabilities:unknown_or_missing_fields");
    }

    for (const key of CAPABILITY_KEYS) {
      if (artifact.capabilities[key] !== false) {
        blockingReasons.push(`capabilities.${key}:false_required`);
      }
    }
  }

  const artifactCore = Object.fromEntries(
    Object.entries(artifact).filter(([key]) => key !== "artifactFingerprint"),
  ) as PostTradeStagingExecutionAuthorizationArtifactCore;
  const expectedFingerprint =
    buildPostTradeStagingExecutionAuthorizationArtifactFingerprint(artifactCore);

  if (artifact.artifactFingerprint !== expectedFingerprint) {
    blockingReasons.push("artifactFingerprint:mismatch");
  }

  return baseEvaluation({
    artifact: artifact as Partial<PostTradeStagingExecutionAuthorizationArtifact>,
    blockingReasons,
  });
}

export function buildFinalGateApprovalFromStagingExecutionAuthorizationArtifact(
  artifact: unknown,
  evaluatedAtIso: string,
): PostTradeStagingExecutionAuthorizationGateCompatibility {
  const evaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
    artifact,
    evaluatedAtIso,
  });

  if (!evaluation.valid || !isRecord(artifact)) {
    return {
      compatible: false,
      approval: null,
      blockingReasons: evaluation.blockingReasons,
      executionEnabled: false,
      executionStatus: "not_executed",
      remoteExecution: false,
      rowsCreated: 0,
    };
  }

  const typedArtifact =
    artifact as PostTradeStagingExecutionAuthorizationArtifact;
  const approvalCore: PostTradeFinalStagingExecutionGateApprovalCore = {
    approvalId: typedArtifact.artifactId,
    approvalState: typedArtifact.authorizationState,
    issuedAtIso: typedArtifact.createdAtIso,
    expiresAtIso: typedArtifact.expiresAtIso,
    reviewedFunction: POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
    executionScope: typedArtifact.executionScope,
    targetProjectRef: typedArtifact.targetStagingProjectRef,
    rejectedProductionProjectRef: typedArtifact.rejectedProductionProjectRef,
    executionMode: "no_execution_without_final_gate",
    operationCount: typedArtifact.plan.operationCount,
    expectedRows: typedArtifact.plan.expectedRows,
    targetTables: typedArtifact.plan.orderedTargetTables,
    auditDependsOnReturnedExecutionRecordId: true,
    retryAllowed: typedArtifact.retryAllowed,
    oneShot: typedArtifact.oneShot,
    serverOnly: true,
    stagingOnly: true,
    apiRouteInvocation: typedArtifact.capabilities.apiRouteInvocation,
    uiClientInvocation:
      typedArtifact.capabilities.tradeUiInvocation ||
      typedArtifact.capabilities.clientInvocation,
    brokerAction: typedArtifact.capabilities.brokerInteraction,
    avanzaInteraction: typedArtifact.capabilities.avanzaInteraction,
    browserAutomation: typedArtifact.capabilities.browserAutomation,
    credentialSessionCookieBankIdMaterial:
      typedArtifact.capabilities.credentialHandling ||
      typedArtifact.capabilities.cookieHandling ||
      typedArtifact.capabilities.sessionHandling ||
      typedArtifact.capabilities.bankIdHandling,
    productionAccess: typedArtifact.capabilities.productionAccess,
    migrationOrSchemaMutation:
      typedArtifact.capabilities.migrationExecution ||
      typedArtifact.capabilities.schemaMutation,
    tradeOrPositionMutation:
      typedArtifact.capabilities.tradeMutation ||
      typedArtifact.capabilities.positionMutation,
    mockPayloadOnly: typedArtifact.mockOnly,
    rawBrokerBrowserPayload: typedArtifact.capabilities.rawBrokerBrowserPayload,
    arbitraryJsonBlob: typedArtifact.capabilities.arbitraryJsonBlob,
  };

  return {
    compatible: true,
    approval: {
      ...approvalCore,
      approvalFingerprint:
        buildPostTradeFinalStagingExecutionGateApprovalFingerprint(approvalCore),
    },
    blockingReasons: [],
    executionEnabled: false,
    executionStatus: "not_executed",
    remoteExecution: false,
    rowsCreated: 0,
  };
}
