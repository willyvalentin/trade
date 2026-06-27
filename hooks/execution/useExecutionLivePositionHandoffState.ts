"use client";

import { useMemo } from "react";

import type { ExecutionMode } from "@/lib/execution";
import {
  runExecutionOrchestrator,
  type ExecutionOrchestratorResult,
} from "@/lib/execution-orchestrator";
import {
  buildExecutionUiStatusFromOrchestratorResult,
  type ExecutionUiStatus,
} from "@/lib/execution-ui-status";
import {
  useExecutionModalState,
  type ExecutionModalStateContainer,
} from "@/hooks/execution/useExecutionModalState";

export type ExecutionLivePositionHandoffInput = {
  positionId: string;
  recommendationId: string | null;
  ticker: string;
  instrumentName: string;
  direction: "Long" | "Short";
  isDemo: boolean;
  isMock: boolean;
  currentPrice: number | null;
  quantity: number | null;
  targetPrice: number | null;
  stopLossPrice: number | null;
  mode: ExecutionMode;
  createdAt?: string | null;
};

export type ExecutionLivePositionHandoffState = {
  canOpenPreview: boolean;
  closeExecutionPreviewModal: () => void;
  executionPreviewModal: ExecutionModalStateContainer;
  liveExecutionOrchestratorResult: ExecutionOrchestratorResult | null;
  liveExecutionStatus: ExecutionUiStatus | null;
  openExecutionPreviewModal: () => void;
};

function buildLivePositionOrchestratorResult({
  createdAt,
  currentPrice,
  direction,
  instrumentName,
  isDemo,
  isMock,
  mode,
  positionId,
  quantity,
  recommendationId,
  stopLossPrice,
  targetPrice,
  ticker,
}: ExecutionLivePositionHandoffInput) {
  if (
    direction !== "Long" ||
    isDemo ||
    isMock ||
    currentPrice === null ||
    quantity === null ||
    (targetPrice === null && stopLossPrice === null)
  ) {
    return null;
  }

  return runExecutionOrchestrator({
    livePositions: [
      {
        positionId,
        recommendationId,
        ticker,
        instrumentName,
        quantity,
        currentPrice,
        targetPrice,
        stopLossPrice,
        mode,
        createdAt: createdAt ?? undefined,
      },
    ],
    mode,
    createdAt: createdAt ?? undefined,
  });
}

export function useExecutionLivePositionHandoffState(
  input: ExecutionLivePositionHandoffInput,
): ExecutionLivePositionHandoffState {
  const {
    createdAt,
    currentPrice,
    direction,
    instrumentName,
    isDemo,
    isMock,
    mode,
    positionId,
    quantity,
    recommendationId,
    stopLossPrice,
    targetPrice,
    ticker,
  } = input;
  const executionPreviewModal = useExecutionModalState();
  const liveExecutionOrchestratorResult = useMemo(
    () =>
      buildLivePositionOrchestratorResult({
        createdAt,
        currentPrice,
        direction,
        instrumentName,
        isDemo,
        isMock,
        mode,
        positionId,
        quantity,
        recommendationId,
        stopLossPrice,
        targetPrice,
        ticker,
      }),
    [
      createdAt,
      currentPrice,
      direction,
      instrumentName,
      isDemo,
      isMock,
      mode,
      positionId,
      quantity,
      recommendationId,
      stopLossPrice,
      targetPrice,
      ticker,
    ],
  );
  const liveExecutionStatus = useMemo(
    () =>
      liveExecutionOrchestratorResult
        ? buildExecutionUiStatusFromOrchestratorResult(
            liveExecutionOrchestratorResult,
          )
        : null,
    [liveExecutionOrchestratorResult],
  );

  function openExecutionPreviewModal() {
    if (!liveExecutionOrchestratorResult) {
      return;
    }

    executionPreviewModal.openFromLivePosition(liveExecutionOrchestratorResult);
  }

  return {
    canOpenPreview: Boolean(liveExecutionOrchestratorResult),
    closeExecutionPreviewModal: executionPreviewModal.close,
    executionPreviewModal,
    liveExecutionOrchestratorResult,
    liveExecutionStatus,
    openExecutionPreviewModal,
  };
}
