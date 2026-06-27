"use client";

import { useMemo, useState } from "react";

import { buildTureExecutionRecord } from "@/lib/broker-execution-capture";
import {
  buildDevMockCaptureDuplicateKey,
  convertDevMockBrokerResultToBrokerExecutionResult,
  findLocalExecutionRecordsForDevMockCapture,
  isDevMockCaptureDuplicateKeyCertain,
} from "@/lib/dev-mock-to-broker-execution-result";
import {
  type DevMockBrokerResultStoreReadResult,
  type StoredDevMockBrokerExecutionResult,
} from "@/lib/dev-mock-broker-result-store";
import {
  DEFAULT_EXECUTION_MODE,
  getExecutionAuthorityForMode,
  getExecutionTriggerPriority,
  type ExecutionAction,
  type ExecutionIntent,
  type ExecutionTriggerType,
} from "@/lib/execution";
import {
  appendExecutionAuditEvent,
  createExecutionAuditEvent,
} from "@/lib/execution-event-log";
import {
  buildExecutionServerCaptureRequest,
  validateExecutionServerCaptureRequest,
} from "@/lib/execution-server-capture-contract";
import { postExecutionServerCaptureRequest } from "@/lib/execution-server-capture-client";
import {
  appendExecutionRecord,
  type StoredExecutionRecord,
} from "@/lib/execution-record-store";

export type DevMockBrokerResultsPanelProps = {
  readResult: DevMockBrokerResultStoreReadResult;
  visibleResults: StoredDevMockBrokerExecutionResult[];
  latestTimestamp: string | null;
  executionRecords: StoredExecutionRecord[];
  message: string;
  onRefresh: () => void;
  onClear: () => void;
  onCaptureComplete: () => void;
};

type DevMockCaptureUiResult = {
  ok: boolean;
  message: string;
  recordId?: string;
  captureStatus?: string;
  brokerStatus?: string | null;
  errors: string[];
  warnings: string[];
};

type DevMockServerCaptureStubUiResult = {
  ok: boolean;
  message: string;
  statusCode: number | null;
  responseStatus?: string;
  idempotencyKey?: string | null;
  completedAt: string;
  errors: string[];
  warnings: string[];
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatExecutionRecordNumber(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 4,
  }).format(value);
}

function shortExecutionAuditId(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

function executionAuditValue(
  value: string | number | boolean | null | undefined,
) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function sanitizeDevMockCaptureIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function createDevMockCaptureIntentId(
  result: StoredDevMockBrokerExecutionResult,
) {
  return [
    "dev_mock_capture_intent",
    sanitizeDevMockCaptureIdPart(result.requestId),
    sanitizeDevMockCaptureIdPart(result.orderId),
    sanitizeDevMockCaptureIdPart(result.createdAt),
  ].join("_");
}

function buildDevMockCaptureIntent(
  result: StoredDevMockBrokerExecutionResult,
  createdAt: string,
): ExecutionIntent | null {
  const action = result.action === "buy" || result.action === "sell"
    ? (result.action as ExecutionAction)
    : null;
  const quantity =
    typeof result.quantity === "number" && Number.isFinite(result.quantity)
      ? result.quantity
      : null;

  if (!action || !result.ticker.trim() || quantity === null || quantity <= 0) {
    return null;
  }

  const mode = DEFAULT_EXECUTION_MODE;
  const triggerType: ExecutionTriggerType =
    action === "sell" ? "manual_exit_requested" : "manual_entry_requested";
  const intendedPrice = result.requestedPrice ?? result.executedPrice ?? null;

  return {
    intent_version: "1.0",
    intent_id: result.intentId ?? createDevMockCaptureIntentId(result),
    created_at: createdAt,
    mode,
    authority: getExecutionAuthorityForMode(mode),
    action,
    trigger_type: triggerType,
    trigger_priority: getExecutionTriggerPriority(triggerType),
    broker_hint: "AVANZA",
    source: "manual",
    trading_package: {
      package_version: "1.0",
      recommendation_id: result.recommendationId ?? null,
      live_position_id: result.positionId ?? null,
      ticker: result.ticker,
      market: "US",
      quantity,
      order_type: "market",
      limit_price: intendedPrice,
      stop_loss: null,
      target_price: null,
      expires_at: null,
      payload_id: result.requestId ?? null,
      payload_fingerprint: null,
    },
    safety_warnings: [
      "DEV MOCK CAPTURE - local diagnostics only. Not a real Avanza execution.",
      "Does not update trades, Supabase, History, or Statistics.",
    ],
    broker_result: null,
  };
}

export function DevMockBrokerResultsPanel({
  readResult,
  visibleResults,
  latestTimestamp,
  executionRecords,
  message,
  onRefresh,
  onClear,
  onCaptureComplete,
}: DevMockBrokerResultsPanelProps) {
  const hasResults = readResult.results.length > 0;

  return (
    <section className="mt-6 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">
            Dev Mock Broker Results
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Local mock results parsed from mock confirmation pages. Not real
            BrokerExecutionResult. Not broker confirmations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-cyan-300/30 hover:text-cyan-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!readResult.storageAvailable}
            className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            Clear dev mock results
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Total Results
          </div>
          <div className="mt-1 text-zinc-200">{readResult.results.length}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Latest Result
          </div>
          <div className="mt-1 text-zinc-200">
            {formatDateTime(latestTimestamp)}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Storage
          </div>
          <div className="mt-1 text-zinc-200">
            {readResult.storageAvailable ? "Local browser" : "Unavailable"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Refresh reads only the dev mock broker result key; clear removes only
        that mock diagnostics key and does not affect execution records.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Dev mock broker results could not be parsed safely: {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed dev mock broker result
          {readResult.discardedCount === 1 ? "" : "s"}.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {!hasResults ? (
          <div className="rounded-md border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
            No local dev mock broker results are stored in this browser yet.
          </div>
        ) : (
          visibleResults.map((result) => (
            <DevMockBrokerResultRow
              key={`${result.createdAt}_${result.requestId ?? result.orderId ?? result.ticker}`}
              result={result}
              executionRecords={executionRecords}
              onCaptureComplete={onCaptureComplete}
            />
          ))
        )}
      </div>
    </section>
  );
}

function DevMockBrokerResultRow({
  result,
  executionRecords,
  onCaptureComplete,
}: {
  result: StoredDevMockBrokerExecutionResult;
  executionRecords: StoredExecutionRecord[];
  onCaptureComplete: () => void;
}) {
  const [captureResult, setCaptureResult] =
    useState<DevMockCaptureUiResult | null>(null);
  const [serverCaptureStubResult, setServerCaptureStubResult] =
    useState<DevMockServerCaptureStubUiResult | null>(null);
  const [serverCaptureStubPending, setServerCaptureStubPending] =
    useState(false);
  const brokerResultPreview =
    convertDevMockBrokerResultToBrokerExecutionResult(result);
  const duplicateKey = buildDevMockCaptureDuplicateKey(result);
  const duplicateKeyCertain = isDevMockCaptureDuplicateKeyCertain(result);
  const existingCaptureRecords = useMemo(
    () =>
      findLocalExecutionRecordsForDevMockCapture(result, executionRecords),
    [executionRecords, result],
  );
  const hasExistingCertainCapture =
    duplicateKeyCertain && existingCaptureRecords.length > 0;
  const captureBlocked = hasExistingCertainCapture || captureResult?.ok === true;

  function captureMockResultLocally() {
    if (hasExistingCertainCapture) {
      setCaptureResult({
        ok: false,
        message: "This mock result already has a local capture record.",
        recordId: existingCaptureRecords[0]?.recordId,
        captureStatus: existingCaptureRecords[0]?.captureStatus,
        brokerStatus: existingCaptureRecords[0]?.brokerStatus,
        errors: [],
        warnings: [
          "Duplicate guard checks localStorage only. No Supabase upsert or broker order dedupe was performed.",
        ],
      });
      return;
    }

    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Capture this dev mock result as another local diagnostic execution record? This does not update trades, Supabase, History, or Statistics.",
      );

    if (!confirmed) {
      return;
    }

    const createdAt = new Date().toISOString();
    const conversion = convertDevMockBrokerResultToBrokerExecutionResult(
      result,
      {
        convertedAt: createdAt,
        mode: DEFAULT_EXECUTION_MODE,
      },
    );
    const intent = buildDevMockCaptureIntent(result, createdAt);
    const warnings = [...conversion.warnings];
    const errors = [...conversion.errors];

    if (!conversion.ok || !conversion.brokerResult) {
      setCaptureResult({
        ok: false,
        message: "Dev mock capture was not created because conversion failed.",
        errors,
        warnings,
      });
      return;
    }

    if (!intent) {
      setCaptureResult({
        ok: false,
        message: "Dev mock capture was not created because intent data is incomplete.",
        errors: [
          ...errors,
          "Dev mock capture intent requires buy/sell action, ticker, and positive quantity.",
        ],
        warnings,
      });
      return;
    }

    const capture = buildTureExecutionRecord(
      intent,
      conversion.brokerResult,
      {
        createdAt,
        recordId: [
          "dev_mock_capture",
          sanitizeDevMockCaptureIdPart(result.requestId),
          sanitizeDevMockCaptureIdPart(result.orderId),
          sanitizeDevMockCaptureIdPart(createdAt),
        ].join("_"),
      },
    );
    const captureErrors = [
      ...capture.intentErrors,
      ...capture.resultErrors,
      ...capture.mismatchReasons,
    ];
    const saved = appendExecutionRecord({
      ...capture.record,
      reason: `DEV MOCK CAPTURE - local diagnostics only. Not a real Avanza execution. ${capture.reason}`,
    });
    const auditSaved = appendExecutionAuditEvent(
      createExecutionAuditEvent({
        type: "dev_mock_broker_capture_stub",
        createdAt,
        intentId: capture.record.intentId,
        recommendationId: capture.record.recommendationId,
        positionId: capture.record.positionId,
        ticker: capture.record.ticker,
        action: capture.record.action,
        mode: capture.record.mode,
        triggerType: intent.trigger_type,
        broker: "avanza",
        brokerStatus: capture.record.brokerStatus,
        message:
          "DEV MOCK CAPTURE - local TureExecutionRecord created from mock result. Not real broker execution. No Supabase/trade update.",
        metadata: {
          local_diagnostics_only: true,
          not_real_broker_execution: true,
          no_supabase_write: true,
          no_trade_mutation: true,
          no_history_statistics_update: true,
          mock_result_source: result.source,
          mock_result_status: result.status,
          mock_order_id: result.orderId ?? null,
          mock_request_id: result.requestId ?? null,
          duplicate_key: duplicateKey,
          capture_status: capture.captureStatus,
          record_id: capture.record.recordId,
          append_record_ok: saved,
        },
      }),
    );

    setCaptureResult({
      ok: saved,
      message: saved
        ? "DEV MOCK CAPTURE - local execution record created. Not real broker execution."
        : "Dev mock capture record could not be stored locally.",
      recordId: capture.record.recordId,
      captureStatus: capture.captureStatus,
      brokerStatus: capture.record.brokerStatus,
      errors: saved ? captureErrors : [...captureErrors, "Local record append failed."],
      warnings: [
        ...warnings,
        auditSaved
          ? "Local audit event appended."
          : "Local audit event could not be appended.",
        "This may create another local diagnostic record if clicked again.",
      ],
    });
    onCaptureComplete();
  }

  async function testServerCaptureStub() {
    const createdAt = new Date().toISOString();
    const conversion = convertDevMockBrokerResultToBrokerExecutionResult(
      result,
      {
        convertedAt: createdAt,
        mode: DEFAULT_EXECUTION_MODE,
      },
    );
    const intent = buildDevMockCaptureIntent(result, createdAt);
    const errors = [...conversion.errors];
    const warnings = [...conversion.warnings];

    if (!conversion.ok || !conversion.brokerResult) {
      setServerCaptureStubResult({
        ok: false,
        message:
          "Server capture stub test was not sent because conversion failed.",
        statusCode: null,
        completedAt: createdAt,
        errors,
        warnings,
      });
      return;
    }

    if (!intent) {
      setServerCaptureStubResult({
        ok: false,
        message:
          "Server capture stub test was not sent because intent data is incomplete.",
        statusCode: null,
        completedAt: createdAt,
        errors: [
          ...errors,
          "Server capture stub test requires buy/sell action, ticker, and positive quantity.",
        ],
        warnings,
      });
      return;
    }

    const captureRequest = buildExecutionServerCaptureRequest({
      environment: "local_dev",
      source: "mock",
      isMock: true,
      isDev: true,
      submittedAt: createdAt,
      intent,
      brokerResult: conversion.brokerResult,
      authoritySnapshot: intent.authority,
      safetyChecks: intent.authority.required_safety_checks,
      metadata: {
        path: "settings_dev_mock_broker_result_server_capture_stub",
        local_diagnostics_only: true,
        no_supabase_write_expected: true,
        no_trade_mutation_expected: true,
        no_execution_record_expected: true,
        mock_result_source: result.source,
        mock_result_status: result.status,
        mock_order_id: result.orderId ?? null,
        mock_request_id: result.requestId ?? null,
        duplicate_key: duplicateKey,
      },
    });
    const localValidation =
      validateExecutionServerCaptureRequest(captureRequest);

    if (!localValidation.ok) {
      setServerCaptureStubResult({
        ok: false,
        message:
          "Server capture stub test was not sent because local validation failed.",
        statusCode: null,
        idempotencyKey: localValidation.idempotencyKey,
        completedAt: createdAt,
        errors: localValidation.errors,
        warnings: [...warnings, ...localValidation.warnings],
      });
      return;
    }

    setServerCaptureStubPending(true);

    try {
      const postResult = await postExecutionServerCaptureRequest(captureRequest);

      setServerCaptureStubResult({
        ok: postResult.ok,
        message:
          postResult.response?.message ??
          (postResult.ok
            ? "Server capture stub accepted the request."
            : "Server capture stub request failed."),
        statusCode: postResult.statusCode,
        responseStatus: postResult.response?.status,
        idempotencyKey:
          postResult.response?.idempotencyKey ?? captureRequest.idempotencyKey,
        completedAt: postResult.completedAt,
        errors: postResult.errors,
        warnings: postResult.warnings,
      });
    } finally {
      setServerCaptureStubPending(false);
    }
  }

  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              {result.status}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {result.isMock ? "Mock result" : "Not mock"}
            </span>
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              Not BrokerExecutionResult
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {result.message ??
              "Dev mock broker result stored without real broker confirmation."}
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(result.createdAt)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail label="Status" value={result.status} />
        <AuditDetail label="Ticker" value={result.ticker} />
        <AuditDetail label="Action" value={result.action} />
        <AuditDetail
          label="Quantity"
          value={formatExecutionRecordNumber(result.quantity)}
        />
        <AuditDetail
          label="Requested"
          value={formatExecutionRecordNumber(result.requestedPrice)}
        />
        <AuditDetail
          label="Executed"
          value={formatExecutionRecordNumber(result.executedPrice)}
        />
        <AuditDetail label="Order" value={result.orderId} />
        <AuditDetail
          label="Request"
          value={shortExecutionAuditId(result.requestId)}
        />
        <AuditDetail label="Intent" value={shortExecutionAuditId(result.intentId)} />
        <AuditDetail
          label="Position"
          value={shortExecutionAuditId(result.positionId)}
        />
        <AuditDetail
          label="Recommendation"
          value={shortExecutionAuditId(result.recommendationId)}
        />
        <AuditDetail label="Source" value={result.source} />
        <AuditDetail label="isMock" value={result.isMock} />
        <AuditDetail label="Errors" value={result.errors.length} />
        <AuditDetail label="Warnings" value={result.warnings.length} />
      </div>

      <div className="mt-3 rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">
              Server capture route stub
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Dev-only route validation. No Supabase write. No trade update. No
              local execution record is created by this test.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void testServerCaptureStub()}
            disabled={!brokerResultPreview.ok || serverCaptureStubPending}
            className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            {serverCaptureStubPending
              ? "Testing capture stub"
              : "Test server capture stub"}
          </button>
        </div>
        {serverCaptureStubResult && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-300">
            <p className="font-semibold text-zinc-100">
              {serverCaptureStubResult.message}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <AuditDetail
                label="Stub OK"
                value={serverCaptureStubResult.ok}
              />
              <AuditDetail
                label="HTTP"
                value={serverCaptureStubResult.statusCode ?? "—"}
              />
              <AuditDetail
                label="Response"
                value={serverCaptureStubResult.responseStatus ?? "—"}
              />
              <AuditDetail
                label="Completed"
                value={formatDateTime(serverCaptureStubResult.completedAt)}
              />
            </div>
            <AuditDetail
              label="Idempotency"
              value={serverCaptureStubResult.idempotencyKey ?? "—"}
            />
            {serverCaptureStubResult.errors.length > 0 && (
              <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.08] p-3 text-rose-100">
                {serverCaptureStubResult.errors.join(" ")}
              </p>
            )}
            {serverCaptureStubResult.warnings.length > 0 && (
              <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-amber-100">
                {serverCaptureStubResult.warnings.join(" ")}
              </p>
            )}
            <p className="mt-3 text-zinc-500">
              Route stub validation only. No Supabase write, execution record,
              trade update, History update, or Statistics update was created.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
              Local capture test
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Creates a local TureExecutionRecord from dev mock data only. Does
              not update trades or Supabase. Duplicate guard checks localStorage
              only and is not broker order dedupe.
            </p>
          </div>
          <button
            type="button"
            onClick={captureMockResultLocally}
            disabled={!brokerResultPreview.ok || captureBlocked}
            className="w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            {captureBlocked ? "Captured locally" : "Capture mock result locally"}
          </button>
        </div>
        {hasExistingCertainCapture && (
          <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.08] p-3 text-xs leading-5 text-amber-100">
            This mock result already has a local capture record. Duplicate guard
            checks localStorage only and does not write Supabase or dedupe real
            broker orders.
          </p>
        )}
        {!duplicateKeyCertain && (
          <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
            Duplicate detection has limited identity for this mock result because
            order, request, and intent ids are missing. Capture remains manual.
          </p>
        )}
        {captureResult && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-300">
            <p className="font-semibold text-zinc-100">{captureResult.message}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <AuditDetail label="Captured" value={captureResult.ok} />
              <AuditDetail label="Record" value={captureResult.recordId} />
              <AuditDetail
                label="Capture Status"
                value={captureResult.captureStatus}
              />
              <AuditDetail label="Broker Status" value={captureResult.brokerStatus} />
            </div>
            {captureResult.errors.length > 0 && (
              <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.08] p-3 text-rose-100">
                {captureResult.errors.join(" ")}
              </p>
            )}
            {captureResult.warnings.length > 0 && (
              <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-amber-100">
                {captureResult.warnings.join(" ")}
              </p>
            )}
            <p className="mt-3 text-zinc-500">
              View in Execution Records diagnostics. No real broker
              confirmation, Supabase write, trade update, History update, or
              Statistics update was created.
            </p>
          </div>
        )}
      </div>

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Dev mock result details
        </summary>
        <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2">
          <AuditDetail
            label="Warnings"
            value={
              result.warnings.length > 0 ? result.warnings.join("; ") : "—"
            }
          />
          <AuditDetail
            label="Errors"
            value={result.errors.length > 0 ? result.errors.join("; ") : "—"}
          />
        </div>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
          {JSON.stringify(
            {
              rawPayload: result.rawPayload,
              result,
            },
            null,
            2,
          )}
        </pre>
      </details>

      <details className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.04] p-3">
        <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
          BrokerExecutionResult preview
        </summary>
        <p className="mt-3 text-xs leading-5 text-amber-100">
          Preview only - not saved, not real, not TureExecutionRecord.
        </p>
        <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
          <AuditDetail label="Preview OK" value={brokerResultPreview.ok} />
          <AuditDetail label="Source" value={brokerResultPreview.source} />
          <AuditDetail
            label="Mock Conversion"
            value={brokerResultPreview.isMockConversion}
          />
          <AuditDetail
            label="Converted"
            value={formatDateTime(brokerResultPreview.convertedAt)}
          />
          <AuditDetail
            label="Broker"
            value={brokerResultPreview.brokerResult?.broker ?? "—"}
          />
          <AuditDetail
            label="Status"
            value={brokerResultPreview.brokerResult?.status ?? "—"}
          />
          <AuditDetail
            label="Ticker"
            value={brokerResultPreview.brokerResult?.ticker ?? "—"}
          />
          <AuditDetail
            label="Quantity"
            value={formatExecutionRecordNumber(
              brokerResultPreview.brokerResult?.quantity,
            )}
          />
          <AuditDetail
            label="Order"
            value={brokerResultPreview.brokerResult?.broker_order_id ?? "—"}
          />
          <AuditDetail
            label="Raw Summary"
            value={brokerResultPreview.brokerResult?.rawBrokerSummary ?? "—"}
          />
        </div>
        {brokerResultPreview.warnings.length > 0 && (
          <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
            {brokerResultPreview.warnings.join(" ")}
          </p>
        )}
        {brokerResultPreview.errors.length > 0 && (
          <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.08] p-3 text-xs leading-5 text-rose-100">
            {brokerResultPreview.errors.join(" ")}
          </p>
        )}
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
          {JSON.stringify(brokerResultPreview, null, 2)}
        </pre>
      </details>
    </article>
  );
}

function AuditDetail({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </div>
      <div className="mt-1 break-words text-zinc-300">
        {executionAuditValue(value)}
      </div>
    </div>
  );
}
