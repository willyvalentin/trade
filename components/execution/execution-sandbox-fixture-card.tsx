"use client";

import { type ReactNode } from "react";
import {
  runExecutionOrchestrator,
  type ExecutionOrchestratorResult,
} from "@/lib/execution-orchestrator";
import type { ExecutionMode } from "@/lib/execution";
import {
  buildExecutionUiStatusFromOrchestratorResult,
  type ExecutionUiStatus,
} from "@/lib/execution-ui-status";
import { buildExecutionLifecycleUiState } from "@/lib/execution-lifecycle-ui-state-adapter";
import { LiveExecutionStatusSurface } from "@/components/live-day-trades/LiveExecutionStatusSurface";
import { Detail } from "@/components/execution/handoff-modal-shared";
import { useExecutionModalState } from "@/hooks/execution/useExecutionModalState";

export type ExecutionSandboxFixturePosition = {
  id: string;
  recommendationId: string;
  ticker: string;
  instrumentName: string;
  quantity: number;
  currentPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  createdAt: string;
  label: string;
  title: string;
  description: string;
  tone: "danger" | "success";
};

export type ExecutionSandboxFixtureCardProps = {
  executionMode: ExecutionMode;
  fixture: ExecutionSandboxFixturePosition;
  renderHandoffPreviewModal: (props: {
    onClose: () => void;
    result: ExecutionOrchestratorResult;
    status: ExecutionUiStatus;
  }) => ReactNode;
};

function formatFixtureCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatFixtureShares(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function ExecutionSandboxFixtureCard({
  fixture,
  executionMode,
  renderHandoffPreviewModal,
}: ExecutionSandboxFixtureCardProps) {
  const executionPreviewModal = useExecutionModalState();
  const orchestratorResult = runExecutionOrchestrator({
    livePositions: [
      {
        positionId: fixture.id,
        recommendationId: fixture.recommendationId,
        ticker: fixture.ticker,
        instrumentName: fixture.instrumentName,
        quantity: fixture.quantity,
        currentPrice: fixture.currentPrice,
        targetPrice: fixture.targetPrice,
        stopLossPrice: fixture.stopLossPrice,
        mode: executionMode,
        createdAt: fixture.createdAt,
      },
    ],
    mode: executionMode,
    createdAt: fixture.createdAt,
  });
  const uiStatus =
    buildExecutionUiStatusFromOrchestratorResult(orchestratorResult);
  const uiState = buildExecutionLifecycleUiState({
    source: "orchestrator",
    result: orchestratorResult,
  });
  const closeExecutionPreviewModal = executionPreviewModal.close;
  const openExecutionPreviewModal = () => {
    executionPreviewModal.openFromSandbox(orchestratorResult);
  };
  const toneClassName =
    fixture.tone === "danger"
      ? "border-rose-300/25 bg-rose-300/[0.045]"
      : "border-emerald-300/25 bg-emerald-300/[0.045]";

  return (
    <article className={`rounded-md border p-4 ${toneClassName}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              DEV FIXTURE
            </span>
            <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Not a real trade
            </span>
          </div>
          <h3 className="mt-3 text-base font-semibold text-zinc-100">
            {fixture.title}
          </h3>
          <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
            {fixture.ticker} · {fixture.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {fixture.description}
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-black/25 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
          Local only
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-4">
        <Detail
          label="Current"
          value={formatFixtureCurrency(fixture.currentPrice)}
        />
        <Detail
          label="Target"
          value={formatFixtureCurrency(fixture.targetPrice)}
        />
        <Detail
          label="Stop"
          value={formatFixtureCurrency(fixture.stopLossPrice)}
        />
        <Detail
          label="Quantity"
          value={formatFixtureShares(fixture.quantity)}
        />
      </div>

      <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-400">
        This fixture uses the live-position exit monitor, execution
        orchestrator, UI status adapter, and handoff preview modal. It is not
        inserted into active positions and cannot be closed or saved as a trade.
      </p>

      {uiStatus.visible && (
        <LiveExecutionStatusSurface
          status={uiState.statusSurface}
          onViewHandoff={openExecutionPreviewModal}
        />
      )}

      {executionPreviewModal.isOpen &&
        uiStatus.visible &&
        executionPreviewModal.selectedResult?.selectedIntent &&
        renderHandoffPreviewModal({
          result: executionPreviewModal.selectedResult,
          status: uiStatus,
          onClose: closeExecutionPreviewModal,
        })}
    </article>
  );
}
