"use client";

import { useState } from "react";

import {
  closeExecutionModalState,
  createClosedExecutionModalState,
  openExecutionModalState,
  type ExecutionModalSource,
  type ExecutionModalState,
} from "@/lib/execution-modal-state-helpers";
import type { ExecutionOrchestratorResult } from "@/lib/execution-orchestrator";

export type ExecutionModalStateContainer = {
  isOpen: boolean;
  modalState: ExecutionModalState;
  selectedResult: ExecutionOrchestratorResult | null;
  selectedIntent: ExecutionModalState["selectedIntent"];
  selectedHandoff: ExecutionModalState["selectedHandoff"];
  localLifecycle: ExecutionModalState["localLifecycle"];
  captureBaseLifecycle: ExecutionModalState["captureBaseLifecycle"];
  openFromSandbox: (result: ExecutionOrchestratorResult) => void;
  openFromLivePosition: (result: ExecutionOrchestratorResult) => void;
  close: () => void;
  reset: () => void;
};

type OpenInput = {
  result: ExecutionOrchestratorResult;
  source: ExecutionModalSource;
};

export function useExecutionModalState(): ExecutionModalStateContainer {
  const [modalState, setModalState] = useState<ExecutionModalState>(() =>
    createClosedExecutionModalState(),
  );
  const [selectedResult, setSelectedResult] =
    useState<ExecutionOrchestratorResult | null>(null);

  function open({ result, source }: OpenInput) {
    setModalState(openExecutionModalState({ result, source }));
    setSelectedResult(result);
  }

  function close() {
    setModalState(closeExecutionModalState());
    setSelectedResult(null);
  }

  return {
    isOpen: modalState.isOpen,
    modalState,
    selectedResult,
    selectedIntent: modalState.selectedIntent,
    selectedHandoff: modalState.selectedHandoff,
    localLifecycle: modalState.localLifecycle,
    captureBaseLifecycle: modalState.captureBaseLifecycle,
    openFromSandbox(result) {
      open({ result, source: "fixture" });
    },
    openFromLivePosition(result) {
      open({ result, source: "live_position" });
    },
    close,
    reset: close,
  };
}
