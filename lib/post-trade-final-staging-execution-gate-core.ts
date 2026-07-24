export const POST_TRADE_FINAL_STAGING_EXECUTION_GATE_VERSION =
  "post_trade_final_staging_execution_gate_v1" as const;
export const POST_TRADE_FINAL_STAGING_PROJECT_REF =
  "pdvzyuhykomwfqyyztru" as const;
export const POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF =
  "ekdyopdrrkphlrsilyoo" as const;
export const POST_TRADE_FINAL_EXECUTION_SCOPE =
  "post_trade_one_staging_mock_write" as const;

export const POST_TRADE_REVIEWED_EXECUTION_FUNCTION = {
  modulePath: "lib/post-trade-staging-execution-function.ts",
  exportName: "buildPostTradeStagingExecutionFunction",
  contractVersion: "post_trade_staging_execution_function_v1",
  implementationDecision:
    "post_trade_source_controlled_staging_execution_function_implementation_ready_no_execution",
  staticReviewDecision:
    "post_trade_source_controlled_staging_execution_function_static_security_review_ready_for_final_execution_gate",
} as const;

export type PostTradeFinalStagingExecutionGateApprovalState =
  | "unused"
  | "consumed"
  | "invalid"
  | "expired";

export type PostTradeReviewedExecutionFunctionIdentity =
  typeof POST_TRADE_REVIEWED_EXECUTION_FUNCTION;

export type PostTradeFinalStagingExecutionGateApprovalCore = {
  approvalId: string;
  approvalState: PostTradeFinalStagingExecutionGateApprovalState;
  issuedAtIso: string;
  expiresAtIso: string;
  reviewedFunction: PostTradeReviewedExecutionFunctionIdentity;
  executionScope: typeof POST_TRADE_FINAL_EXECUTION_SCOPE;
  targetProjectRef: typeof POST_TRADE_FINAL_STAGING_PROJECT_REF;
  rejectedProductionProjectRef: typeof POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF;
  executionMode: "no_execution_without_final_gate";
  operationCount: 2;
  expectedRows: 2;
  targetTables: readonly ["execution_records", "execution_record_audit_events"];
  auditDependsOnReturnedExecutionRecordId: true;
  retryAllowed: false;
  oneShot: true;
  serverOnly: true;
  stagingOnly: true;
  apiRouteInvocation: false;
  uiClientInvocation: false;
  brokerAction: false;
  avanzaInteraction: false;
  browserAutomation: false;
  credentialSessionCookieBankIdMaterial: false;
  productionAccess: false;
  migrationOrSchemaMutation: false;
  tradeOrPositionMutation: false;
  mockPayloadOnly: true;
  rawBrokerBrowserPayload: false;
  arbitraryJsonBlob: false;
};

export type PostTradeFinalStagingExecutionGateApproval =
  PostTradeFinalStagingExecutionGateApprovalCore & {
    approvalFingerprint: string;
  };

export type PostTradeFinalStagingExecutionGateDecision = {
  gateVersion: typeof POST_TRADE_FINAL_STAGING_EXECUTION_GATE_VERSION;
  approved: boolean;
  approvalStatus: "approved" | "blocked";
  executionEnabled: false;
  executionStatus: "not_executed";
  executionMode: "no_execution_without_final_gate";
  remoteExecution: false;
  rowsCreated: 0;
  executionScope: typeof POST_TRADE_FINAL_EXECUTION_SCOPE;
  expectedOperationCount: 2;
  expectedRowCount: 2;
  expectedTargetProjectRef: typeof POST_TRADE_FINAL_STAGING_PROJECT_REF;
  expectedTargetTables: readonly ["execution_records", "execution_record_audit_events"];
  oneShotStatus: PostTradeFinalStagingExecutionGateApprovalState | "missing";
  approvalId: string | null;
  approvalFingerprint: string | null;
  reviewedFunction: PostTradeReviewedExecutionFunctionIdentity;
  blockingReasons: string[];
  safetyFlags: {
    sideEffectFree: true;
    noDatabaseWrite: true;
    noRowsCreated: true;
    noSupabaseWriteCall: true;
    noApiRouteInvocation: true;
    noUiClientInvocation: true;
    noAvanzaOrBrowserAutomation: true;
    noCredentialSessionCookieBankIdMaterial: true;
    noProductionAccess: true;
    noMigrationOrSchemaMutation: true;
    noTradeOrPositionMutation: true;
    noMutableProcessLocalConsumptionState: true;
  };
};

export type PostTradeFinalStagingExecutionGateInput = {
  approval?: unknown;
  evaluatedAtIso?: string;
};

const APPROVAL_CORE_KEYS = [
  "approvalId",
  "approvalState",
  "issuedAtIso",
  "expiresAtIso",
  "reviewedFunction",
  "executionScope",
  "targetProjectRef",
  "rejectedProductionProjectRef",
  "executionMode",
  "operationCount",
  "expectedRows",
  "targetTables",
  "auditDependsOnReturnedExecutionRecordId",
  "retryAllowed",
  "oneShot",
  "serverOnly",
  "stagingOnly",
  "apiRouteInvocation",
  "uiClientInvocation",
  "brokerAction",
  "avanzaInteraction",
  "browserAutomation",
  "credentialSessionCookieBankIdMaterial",
  "productionAccess",
  "migrationOrSchemaMutation",
  "tradeOrPositionMutation",
  "mockPayloadOnly",
  "rawBrokerBrowserPayload",
  "arbitraryJsonBlob",
] as const;

const APPROVAL_KEYS = [...APPROVAL_CORE_KEYS, "approvalFingerprint"] as const;

const REVIEWED_FUNCTION_KEYS = [
  "modulePath",
  "exportName",
  "contractVersion",
  "implementationDecision",
  "staticReviewDecision",
] as const;

const forbiddenApprovalKeys = [
  "credentials",
  "password",
  "BankID",
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
  "arbitraryJson",
  "jsonBlob",
  "payloadBlob",
] as const;

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

function containsForbiddenKey(value: unknown): boolean {
  if (!isRecord(value)) return false;

  for (const [key, nestedValue] of Object.entries(value)) {
    if ((forbiddenApprovalKeys as readonly string[]).includes(key)) {
      return true;
    }

    if (isRecord(nestedValue) && containsForbiddenKey(nestedValue)) {
      return true;
    }
  }

  return false;
}

function containsUnexpectedProductionProjectRef(value: unknown): boolean {
  if (!isRecord(value)) return false;

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === "rejectedProductionProjectRef") {
      continue;
    }

    if (nestedValue === POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF) {
      return true;
    }

    if (
      isRecord(nestedValue) &&
      containsUnexpectedProductionProjectRef(nestedValue)
    ) {
      return true;
    }
  }

  return false;
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

  return JSON.stringify(value);
}

export function buildPostTradeFinalStagingExecutionGateApprovalFingerprint(
  approvalCore: PostTradeFinalStagingExecutionGateApprovalCore,
): string {
  let hash = 0x811c9dc5;
  const input = stableStringify(approvalCore);

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function baseDecision(input: {
  approved: boolean;
  approval?: Partial<PostTradeFinalStagingExecutionGateApproval> | null;
  blockingReasons: string[];
}): PostTradeFinalStagingExecutionGateDecision {
  return {
    gateVersion: POST_TRADE_FINAL_STAGING_EXECUTION_GATE_VERSION,
    approved: input.approved,
    approvalStatus: input.approved ? "approved" : "blocked",
    executionEnabled: false,
    executionStatus: "not_executed",
    executionMode: "no_execution_without_final_gate",
    remoteExecution: false,
    rowsCreated: 0,
    executionScope: POST_TRADE_FINAL_EXECUTION_SCOPE,
    expectedOperationCount: 2,
    expectedRowCount: 2,
    expectedTargetProjectRef: POST_TRADE_FINAL_STAGING_PROJECT_REF,
    expectedTargetTables: ["execution_records", "execution_record_audit_events"],
    oneShotStatus: input.approval?.approvalState ?? "missing",
    approvalId:
      typeof input.approval?.approvalId === "string"
        ? input.approval.approvalId
        : null,
    approvalFingerprint:
      typeof input.approval?.approvalFingerprint === "string"
        ? input.approval.approvalFingerprint
        : null,
    reviewedFunction: POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
    blockingReasons: input.blockingReasons,
    safetyFlags: {
      sideEffectFree: true,
      noDatabaseWrite: true,
      noRowsCreated: true,
      noSupabaseWriteCall: true,
      noApiRouteInvocation: true,
      noUiClientInvocation: true,
      noAvanzaOrBrowserAutomation: true,
      noCredentialSessionCookieBankIdMaterial: true,
      noProductionAccess: true,
      noMigrationOrSchemaMutation: true,
      noTradeOrPositionMutation: true,
      noMutableProcessLocalConsumptionState: true,
    },
  };
}

function dateMillis(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function evaluatePostTradeFinalStagingExecutionGate(
  input: PostTradeFinalStagingExecutionGateInput = {},
): PostTradeFinalStagingExecutionGateDecision {
  if (!isRecord(input.approval)) {
    return baseDecision({
      approved: false,
      approval: null,
      blockingReasons: ["approval:required"],
    });
  }

  const approval = input.approval;
  const blockingReasons: string[] = [];

  if (!hasExactKeys(approval, APPROVAL_KEYS)) {
    blockingReasons.push("approval:unknown_or_missing_fields");
  }

  if (containsForbiddenKey(approval)) {
    blockingReasons.push("approval:sensitive_or_raw_payload_field_present");
  }

  if (typeof approval.approvalId !== "string" || approval.approvalId.length === 0) {
    blockingReasons.push("approvalId:required");
  }

  if (approval.approvalState !== "unused") {
    blockingReasons.push("approvalState:unused_required");
  }

  const evaluatedAtMillis = dateMillis(input.evaluatedAtIso);
  const issuedAtMillis = dateMillis(approval.issuedAtIso);
  const expiresAtMillis = dateMillis(approval.expiresAtIso);

  if (evaluatedAtMillis === null) {
    blockingReasons.push("evaluatedAtIso:required_valid_iso");
  }

  if (issuedAtMillis === null || expiresAtMillis === null) {
    blockingReasons.push("approval:freshness_timestamps_required");
  } else if (
    evaluatedAtMillis !== null &&
    (issuedAtMillis > evaluatedAtMillis || expiresAtMillis <= evaluatedAtMillis)
  ) {
    blockingReasons.push("approval:stale_or_expired");
  }

  if (!isRecord(approval.reviewedFunction)) {
    blockingReasons.push("reviewedFunction:required");
  } else {
    if (!hasExactKeys(approval.reviewedFunction, REVIEWED_FUNCTION_KEYS)) {
      blockingReasons.push("reviewedFunction:unknown_or_missing_fields");
    }

    for (const key of REVIEWED_FUNCTION_KEYS) {
      if (
        approval.reviewedFunction[key] !== POST_TRADE_REVIEWED_EXECUTION_FUNCTION[key]
      ) {
        blockingReasons.push("reviewedFunction:version_mismatch");
        break;
      }
    }
  }

  if (approval.executionScope !== POST_TRADE_FINAL_EXECUTION_SCOPE) {
    blockingReasons.push("executionScope:single_mock_staging_attempt_required");
  }

  if (approval.targetProjectRef !== POST_TRADE_FINAL_STAGING_PROJECT_REF) {
    blockingReasons.push("targetProjectRef:staging_project_required");
  }

  if (
    approval.targetProjectRef === POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF ||
    approval.rejectedProductionProjectRef !== POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF
  ) {
    blockingReasons.push("productionProjectRef:rejected");
  }

  if (containsUnexpectedProductionProjectRef(approval)) {
    blockingReasons.push("productionProjectRef:unexpected_reference");
  }

  if (approval.executionMode !== "no_execution_without_final_gate") {
    blockingReasons.push("executionMode:no_execution_without_final_gate_required");
  }

  if (approval.operationCount !== 2) {
    blockingReasons.push("operationCount:exactly_two_required");
  }

  if (approval.expectedRows !== 2) {
    blockingReasons.push("expectedRows:exactly_two_required");
  }

  if (
    !Array.isArray(approval.targetTables) ||
    approval.targetTables.length !== 2 ||
    approval.targetTables[0] !== "execution_records" ||
    approval.targetTables[1] !== "execution_record_audit_events"
  ) {
    blockingReasons.push("targetTables:exact_order_required");
  }

  if (approval.auditDependsOnReturnedExecutionRecordId !== true) {
    blockingReasons.push("auditDependency:execution_record_id_required");
  }

  const falseFlags = [
    ["retryAllowed", approval.retryAllowed],
    ["apiRouteInvocation", approval.apiRouteInvocation],
    ["uiClientInvocation", approval.uiClientInvocation],
    ["brokerAction", approval.brokerAction],
    ["avanzaInteraction", approval.avanzaInteraction],
    ["browserAutomation", approval.browserAutomation],
    [
      "credentialSessionCookieBankIdMaterial",
      approval.credentialSessionCookieBankIdMaterial,
    ],
    ["productionAccess", approval.productionAccess],
    ["migrationOrSchemaMutation", approval.migrationOrSchemaMutation],
    ["tradeOrPositionMutation", approval.tradeOrPositionMutation],
    ["rawBrokerBrowserPayload", approval.rawBrokerBrowserPayload],
    ["arbitraryJsonBlob", approval.arbitraryJsonBlob],
  ] as const;

  for (const [field, value] of falseFlags) {
    if (value !== false) {
      blockingReasons.push(`${field}:false_required`);
    }
  }

  const trueFlags = [
    ["oneShot", approval.oneShot],
    ["serverOnly", approval.serverOnly],
    ["stagingOnly", approval.stagingOnly],
    ["mockPayloadOnly", approval.mockPayloadOnly],
  ] as const;

  for (const [field, value] of trueFlags) {
    if (value !== true) {
      blockingReasons.push(`${field}:true_required`);
    }
  }

  const approvalCore = Object.fromEntries(
    Object.entries(approval).filter(([key]) => key !== "approvalFingerprint"),
  ) as PostTradeFinalStagingExecutionGateApprovalCore;
  const expectedFingerprint =
    buildPostTradeFinalStagingExecutionGateApprovalFingerprint(
      approvalCore,
    );

  if (approval.approvalFingerprint !== expectedFingerprint) {
    blockingReasons.push("approvalFingerprint:mismatch");
  }

  return baseDecision({
    approved: blockingReasons.length === 0,
    approval: approval as Partial<PostTradeFinalStagingExecutionGateApproval>,
    blockingReasons,
  });
}
