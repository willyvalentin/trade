"use client";

import { useMemo, useState } from "react";
import { appendDevMockBrokerResult } from "@/lib/dev-mock-broker-result-store";
import {
  buildDevMockBrokerExecutionResultFromConfirmationPayload,
  validateDevMockBrokerExecutionResult,
} from "@/lib/mock-broker-execution-result";
import type { MockOrderConfirmationPayload } from "@/lib/mock-order-confirmation-contract";

type SaveDevMockResultButtonProps = {
  payload: MockOrderConfirmationPayload;
};

export function SaveDevMockResultButton({
  payload,
}: SaveDevMockResultButtonProps) {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const previewResult = useMemo(
    () =>
      buildDevMockBrokerExecutionResultFromConfirmationPayload(payload, {
        requireQuantity: true,
        requireTicker: true,
      }),
    [payload],
  );
  const previewValidation = useMemo(
    () =>
      validateDevMockBrokerExecutionResult(previewResult, {
        requireQuantity: true,
        requireTicker: true,
      }),
    [previewResult],
  );

  function saveDevMockResult() {
    const result = buildDevMockBrokerExecutionResultFromConfirmationPayload(
      payload,
      {
        requireQuantity: true,
        requireTicker: true,
      },
    );
    const validation = validateDevMockBrokerExecutionResult(result, {
      requireQuantity: true,
      requireTicker: true,
    });

    if (!validation.ok) {
      setErrors(validation.errors);
      setMessage("Dev mock result was not saved because validation failed.");
      return;
    }

    const saved = appendDevMockBrokerResult(result);

    setErrors([]);
    setMessage(
      saved
        ? "Dev mock result saved locally."
        : "Dev mock result could not be saved locally.",
    );
  }

  return (
    <section className="rounded-lg border border-cyan-400/30 bg-cyan-950/20 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
        Dev mock result only
      </p>
      <p className="mt-3 text-sm leading-6 text-cyan-100/90">
        Saves a local DevMockBrokerExecutionResult for diagnostics. Not a real
        broker result. Does not create TureExecutionRecord.
      </p>
      <button
        type="button"
        onClick={saveDevMockResult}
        className="mt-4 inline-flex rounded-md border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/70 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500"
        disabled={!previewValidation.ok}
      >
        Save dev mock result
      </button>
      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/80 p-3">
        <p className="text-sm font-semibold text-slate-100">
          {previewValidation.ok
            ? "Dev mock result mapping valid"
            : "Dev mock result mapping invalid"}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Status {previewResult.status}; source {previewResult.source}; isMock{" "}
          {previewResult.isMock ? "true" : "false"}.
        </p>
        {previewValidation.warnings.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">
            {previewValidation.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
        {(previewValidation.errors.length > 0 || errors.length > 0) && (
          <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100">
            {[...previewValidation.errors, ...errors].map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-cyan-100">
          {message}
        </p>
      )}
    </section>
  );
}
