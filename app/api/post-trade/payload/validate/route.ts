import { NextResponse } from "next/server";

import {
  buildPostTradePersistenceDryRunPlan,
  type PostTradePersistenceDryRunSafetyFlags,
  type PostTradePersistenceTargetTable,
} from "@/lib/post-trade-persistence-service-plan";
import {
  validatePostTradePersistencePayload,
  type PostTradePayloadSafetyFlags,
  type PostTradePayloadValidationRejectedField,
} from "@/lib/post-trade-payload-validator";

const ROUTE_PATH = "/api/post-trade/payload/validate" as const;
const ROUTE_CONTRACT_VERSION =
  "post_trade_payload_validation_route_stub_v1" as const;

type PostTradePayloadValidationRouteResponse = {
  routeContractVersion: typeof ROUTE_CONTRACT_VERSION;
  routePath: typeof ROUTE_PATH;
  method: "POST";
  status: "validation_success" | "validation_failed";
  receivedAt: string;
  evaluatedAt: string;
  result: {
    valid: boolean;
    rejectedFields: PostTradePayloadValidationRejectedField[];
    reasons: string[];
    safetyFlags: PostTradePayloadSafetyFlags;
  };
  persistencePlan:
    | {
        status: "dry_run_only";
        mode: "no_write";
        ready: true;
        targetTables: PostTradePersistenceTargetTable[];
        plannedOperations: Array<{
          table: PostTradePersistenceTargetTable;
          operationType: "dry_run_planned_insert";
          mode: "no_write_plan_only";
        }>;
        idempotencyKey: string;
        duplicatePreventionKey: string | null;
        auditEventPlan: {
          table: "execution_record_audit_events";
          eventType: "post_trade_persistence_dry_run_plan_created";
          wouldWrite: false;
        };
        safetyFlags: PostTradePersistenceDryRunSafetyFlags;
      }
    | null;
  safety: {
    validationOnly: true;
    servicePlanDryRunOnly: true;
    acceptedPayloadPersisted: false;
    acceptedPayloadReturned: false;
    rawRejectedPayloadReturned: false;
    supabaseClientImported: false;
    supabaseWriteAllowed: false;
    productionWriteAllowed: false;
    stagingWriteAllowed: false;
    writeServiceCalled: false;
    runtimeWritePathActivated: false;
    tradeUiExecutionAllowed: false;
    browserAutomationAllowed: false;
    avanzaLoginAllowed: false;
    credentialSessionBankIdHandlingAllowed: false;
    orderActionAllowed: false;
    settlementRetrievalAllowed: false;
    liveTradeMutationAllowed: false;
    livePositionMutationAllowed: false;
  };
};

const DEFAULT_SAFETY_FLAGS: PostTradePayloadSafetyFlags = {
  allowlistedPayloadOnly: false,
  noUnknownTopLevelFields: false,
  noRawBrokerPayload: false,
  noRawAvanzaOrBrowserState: false,
  noCredentialSessionOrBankIdMaterial: false,
  noUnredactedBrokerDocument: false,
  metadataOnlyBrokerConfirmation: false,
  noArbitraryJsonBlob: false,
  noSupabaseWriteAuthority: false,
  noProductionPersistence: false,
  noRuntimeActivation: false,
  noLiveTradeOrPositionMutation: false,
  redactedOrSafeSummaryOnly: false,
  idempotencyReady: false,
  intentResultAligned: false,
};

function nowIso(): string {
  return new Date().toISOString();
}

function safety(): PostTradePayloadValidationRouteResponse["safety"] {
  return {
    validationOnly: true,
    servicePlanDryRunOnly: true,
    acceptedPayloadPersisted: false,
    acceptedPayloadReturned: false,
    rawRejectedPayloadReturned: false,
    supabaseClientImported: false,
    supabaseWriteAllowed: false,
    productionWriteAllowed: false,
    stagingWriteAllowed: false,
    writeServiceCalled: false,
    runtimeWritePathActivated: false,
    tradeUiExecutionAllowed: false,
    browserAutomationAllowed: false,
    avanzaLoginAllowed: false,
    credentialSessionBankIdHandlingAllowed: false,
    orderActionAllowed: false,
    settlementRetrievalAllowed: false,
    liveTradeMutationAllowed: false,
    livePositionMutationAllowed: false,
  };
}

function jsonResponse(
  body: PostTradePayloadValidationRouteResponse,
  status: number,
) {
  return NextResponse.json(body, { status });
}

function response(input: {
  status: PostTradePayloadValidationRouteResponse["status"];
  receivedAt: string;
  rejectedFields: PostTradePayloadValidationRejectedField[];
  reasons: string[];
  safetyFlags: PostTradePayloadSafetyFlags;
  persistencePlan: PostTradePayloadValidationRouteResponse["persistencePlan"];
}): PostTradePayloadValidationRouteResponse {
  return {
    routeContractVersion: ROUTE_CONTRACT_VERSION,
    routePath: ROUTE_PATH,
    method: "POST",
    status: input.status,
    receivedAt: input.receivedAt,
    evaluatedAt: nowIso(),
    result: {
      valid: input.status === "validation_success",
      rejectedFields: input.rejectedFields,
      reasons: input.reasons,
      safetyFlags: input.safetyFlags,
    },
    persistencePlan: input.persistencePlan,
    safety: safety(),
  };
}

export async function POST(request: Request) {
  const receivedAt = nowIso();
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      response({
        status: "validation_failed",
        receivedAt,
        rejectedFields: [{ field: "payload", reason: "invalid_json" }],
        reasons: ["payload:invalid_json"],
        safetyFlags: DEFAULT_SAFETY_FLAGS,
        persistencePlan: null,
      }),
      400,
    );
  }

  const validation = validatePostTradePersistencePayload(body);
  const persistencePlan = validation.valid
    ? buildPostTradePersistenceDryRunPlan(validation)
    : null;
  const sanitizedPersistencePlan =
    persistencePlan?.ready === true
      ? {
          status: "dry_run_only" as const,
          mode: "no_write" as const,
          ready: true as const,
          targetTables: persistencePlan.targetTables,
          plannedOperations: persistencePlan.intendedOperations,
          idempotencyKey: persistencePlan.idempotencyKey,
          duplicatePreventionKey: persistencePlan.duplicatePreventionKey,
          auditEventPlan: {
            table: persistencePlan.auditEventPlan.table,
            eventType: persistencePlan.auditEventPlan.eventType,
            wouldWrite: persistencePlan.auditEventPlan.wouldWrite,
          },
          safetyFlags: persistencePlan.safetyFlags,
        }
      : null;

  return jsonResponse(
    response({
      status: validation.valid ? "validation_success" : "validation_failed",
      receivedAt,
      rejectedFields: validation.rejectedFields,
      reasons: validation.reasons,
      safetyFlags: validation.safetyFlags,
      persistencePlan: sanitizedPersistencePlan,
    }),
    validation.valid ? 200 : 400,
  );
}
