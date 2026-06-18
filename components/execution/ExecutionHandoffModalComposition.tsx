import type { ComponentProps } from "react";

import {
  AgentProgressStubPanel,
} from "@/components/execution/AgentProgressStubPanel";
import { AvanzaDryRunReadinessPanel } from "@/components/execution/AvanzaDryRunReadinessPanel";
import { AvanzaDryRunRequestPreview } from "@/components/execution/AvanzaDryRunRequestPreview";
import { BridgeRequestEnvelopePreview } from "@/components/execution/BridgeRequestEnvelopePreview";
import { ExecutionBrokerCaptureStubPanel } from "@/components/execution/ExecutionBrokerCaptureStubPanel";
import { ExecutionRecordCreationPreview } from "@/components/execution/ExecutionRecordCreationPreview";
import { ExecutionRecordCandidateBuilderIntegrationPreview } from "@/components/execution/ExecutionRecordCandidateBuilderIntegrationPreview";
import { ExecutionHandoffStatusReadbacks } from "@/components/execution/ExecutionHandoffStatusReadbacks";
import { ExecutionLifecycleStatusPanel } from "@/components/execution/ExecutionLifecycleStatusPanel";
import { ExecutionRecordInsertDryRunPreview } from "@/components/execution/ExecutionRecordInsertDryRunPreview";
import { FinalizationActionPreview } from "@/components/execution/FinalizationActionPreview";
import { FinalizationCandidatePreview } from "@/components/execution/FinalizationCandidatePreview";
import { FinalizationExecutionRecordBridgePreview } from "@/components/execution/FinalizationExecutionRecordBridgePreview";
import { FinalSettlementNoteMatchPreview } from "@/components/execution/FinalSettlementNoteMatchPreview";
import { ExecutionSandboxQaPanel } from "@/components/execution/ExecutionSandboxQaPanel";
import { FutureAgentRequestPreview } from "@/components/execution/FutureAgentRequestPreview";
import { HandoffCoreSummary } from "@/components/execution/HandoffCoreSummary";
import { LocalhostBridgeControls } from "@/components/execution/LocalhostBridgeControls";
import { MappedBrokerExecutionResultCandidatePreview } from "@/components/execution/MappedBrokerExecutionResultCandidatePreview";
import { AdvancedFormFillPreview } from "@/components/execution/stub-previews/AdvancedFormFillPreview";
import { BrokerConfirmationCapturePreview } from "@/components/execution/stub-previews/BrokerConfirmationCapturePreview";
import { BrokerExecutionResultEligibilityPreview } from "@/components/execution/stub-previews/BrokerExecutionResultEligibilityPreview";
import { BrokerExecutionResultPreview } from "@/components/execution/stub-previews/BrokerExecutionResultPreview";
import { ExecutionRecordEligibilityPreview } from "@/components/execution/stub-previews/ExecutionRecordEligibilityPreview";
import { InstrumentPagePreview } from "@/components/execution/stub-previews/InstrumentPagePreview";
import { InstrumentVerificationPreview } from "@/components/execution/stub-previews/InstrumentVerificationPreview";
import { OrderPageOpenPreview } from "@/components/execution/stub-previews/OrderPageOpenPreview";
import { ReviewClickPreview } from "@/components/execution/stub-previews/ReviewClickPreview";
import { SearchOnlyPreview } from "@/components/execution/stub-previews/SearchOnlyPreview";
import { SessionDetectionPreview } from "@/components/execution/stub-previews/SessionDetectionPreview";

export type ExecutionHandoffModalCompositionProps = {
  advancedFormFillPreviewProps: ComponentProps<typeof AdvancedFormFillPreview>;
  agentProgressStubPanelProps:
    | ComponentProps<typeof AgentProgressStubPanel>
    | null;
  avanzaDryRunReadinessPanelProps: ComponentProps<
    typeof AvanzaDryRunReadinessPanel
  >;
  avanzaDryRunRequestPreviewProps:
    | ComponentProps<typeof AvanzaDryRunRequestPreview>
    | null;
  bridgeRequestEnvelopePreviewProps:
    | ComponentProps<typeof BridgeRequestEnvelopePreview>
    | null;
  brokerConfirmationCapturePreviewProps: ComponentProps<
    typeof BrokerConfirmationCapturePreview
  >;
  brokerExecutionResultEligibilityPreviewProps: ComponentProps<
    typeof BrokerExecutionResultEligibilityPreview
  >;
  brokerExecutionResultPreviewProps: ComponentProps<
    typeof BrokerExecutionResultPreview
  >;
  coreSummaryProps: ComponentProps<typeof HandoffCoreSummary>;
  executionBrokerCaptureStubPanelProps:
    | ComponentProps<typeof ExecutionBrokerCaptureStubPanel>
    | null;
  executionDevToolsEnabled: boolean;
  executionLifecycleStatusPanelProps: ComponentProps<
    typeof ExecutionLifecycleStatusPanel
  >;
  mappedBrokerExecutionResultCandidatePreviewProps: ComponentProps<
    typeof MappedBrokerExecutionResultCandidatePreview
  >;
  executionRecordCreationPreviewProps: ComponentProps<
    typeof ExecutionRecordCreationPreview
  >;
  executionRecordCandidateBuilderIntegrationPreviewProps: ComponentProps<
    typeof ExecutionRecordCandidateBuilderIntegrationPreview
  >;
  executionRecordInsertDryRunPreviewProps: ComponentProps<
    typeof ExecutionRecordInsertDryRunPreview
  >;
  finalSettlementNoteMatchPreviewProps: ComponentProps<
    typeof FinalSettlementNoteMatchPreview
  >;
  finalizationCandidatePreviewProps: ComponentProps<
    typeof FinalizationCandidatePreview
  >;
  finalizationActionPreviewProps: ComponentProps<
    typeof FinalizationActionPreview
  >;
  finalizationExecutionRecordBridgePreviewProps: ComponentProps<
    typeof FinalizationExecutionRecordBridgePreview
  >;
  executionRecordEligibilityPreviewProps: ComponentProps<
    typeof ExecutionRecordEligibilityPreview
  >;
  executionSandboxQaPanelProps: ComponentProps<typeof ExecutionSandboxQaPanel>;
  futureAgentRequestPreviewProps: ComponentProps<
    typeof FutureAgentRequestPreview
  >;
  instrumentPagePreviewProps: ComponentProps<typeof InstrumentPagePreview>;
  instrumentVerificationPreviewProps: ComponentProps<
    typeof InstrumentVerificationPreview
  >;
  orderPageOpenPreviewProps: ComponentProps<typeof OrderPageOpenPreview>;
  primaryLocalhostBridgeControlsProps: ComponentProps<
    typeof LocalhostBridgeControls
  >;
  reviewClickPreviewProps: ComponentProps<typeof ReviewClickPreview>;
  searchOnlyPreviewProps: ComponentProps<typeof SearchOnlyPreview>;
  secondaryLocalhostBridgeControlsProps: ComponentProps<
    typeof LocalhostBridgeControls
  >;
  sessionDetectionPreviewProps: ComponentProps<typeof SessionDetectionPreview>;
  statusReadbacksProps: ComponentProps<typeof ExecutionHandoffStatusReadbacks>;
};

export function ExecutionHandoffModalComposition({
  advancedFormFillPreviewProps,
  agentProgressStubPanelProps,
  avanzaDryRunReadinessPanelProps,
  avanzaDryRunRequestPreviewProps,
  bridgeRequestEnvelopePreviewProps,
  brokerConfirmationCapturePreviewProps,
  brokerExecutionResultEligibilityPreviewProps,
  brokerExecutionResultPreviewProps,
  coreSummaryProps,
  executionBrokerCaptureStubPanelProps,
  executionDevToolsEnabled,
  executionLifecycleStatusPanelProps,
  mappedBrokerExecutionResultCandidatePreviewProps,
  executionRecordCreationPreviewProps,
  executionRecordCandidateBuilderIntegrationPreviewProps,
  executionRecordInsertDryRunPreviewProps,
  finalSettlementNoteMatchPreviewProps,
  finalizationCandidatePreviewProps,
  finalizationActionPreviewProps,
  finalizationExecutionRecordBridgePreviewProps,
  executionRecordEligibilityPreviewProps,
  executionSandboxQaPanelProps,
  futureAgentRequestPreviewProps,
  instrumentPagePreviewProps,
  instrumentVerificationPreviewProps,
  orderPageOpenPreviewProps,
  primaryLocalhostBridgeControlsProps,
  reviewClickPreviewProps,
  searchOnlyPreviewProps,
  secondaryLocalhostBridgeControlsProps,
  sessionDetectionPreviewProps,
  statusReadbacksProps,
}: ExecutionHandoffModalCompositionProps) {
  return (
    <>
      <HandoffCoreSummary {...coreSummaryProps} />

      <FutureAgentRequestPreview {...futureAgentRequestPreviewProps} />

      {executionDevToolsEnabled && avanzaDryRunRequestPreviewProps && (
        <AvanzaDryRunRequestPreview {...avanzaDryRunRequestPreviewProps} />
      )}

      {executionDevToolsEnabled && (
        <>
          <SessionDetectionPreview {...sessionDetectionPreviewProps} />
          <SearchOnlyPreview {...searchOnlyPreviewProps} />
          <InstrumentVerificationPreview
            {...instrumentVerificationPreviewProps}
          />
        </>
      )}

      {executionDevToolsEnabled && (
        <>
          <InstrumentPagePreview {...instrumentPagePreviewProps} />
          <OrderPageOpenPreview {...orderPageOpenPreviewProps} />
          <AdvancedFormFillPreview {...advancedFormFillPreviewProps} />
          <ReviewClickPreview {...reviewClickPreviewProps} />
        </>
      )}

      {executionDevToolsEnabled && (
        <>
          <BrokerConfirmationCapturePreview
            {...brokerConfirmationCapturePreviewProps}
          />
          <BrokerExecutionResultEligibilityPreview
            {...brokerExecutionResultEligibilityPreviewProps}
          />
        </>
      )}

      {executionDevToolsEnabled && (
        <BrokerExecutionResultPreview {...brokerExecutionResultPreviewProps} />
      )}

      {executionDevToolsEnabled && (
        <ExecutionRecordEligibilityPreview
          {...executionRecordEligibilityPreviewProps}
        />
      )}

      {executionDevToolsEnabled && (
        <ExecutionRecordCreationPreview
          {...executionRecordCreationPreviewProps}
        />
      )}

      {executionDevToolsEnabled && (
        <ExecutionRecordInsertDryRunPreview
          {...executionRecordInsertDryRunPreviewProps}
        />
      )}

      {executionDevToolsEnabled && (
        <MappedBrokerExecutionResultCandidatePreview
          {...mappedBrokerExecutionResultCandidatePreviewProps}
        />
      )}

      {executionDevToolsEnabled && (
        <FinalSettlementNoteMatchPreview
          {...finalSettlementNoteMatchPreviewProps}
        />
      )}

      {executionDevToolsEnabled && (
        <FinalizationCandidatePreview
          {...finalizationCandidatePreviewProps}
        />
      )}

      {executionDevToolsEnabled && (
        <FinalizationActionPreview {...finalizationActionPreviewProps} />
      )}

      {executionDevToolsEnabled && (
        <FinalizationExecutionRecordBridgePreview
          {...finalizationExecutionRecordBridgePreviewProps}
        />
      )}

      {executionDevToolsEnabled && (
        <ExecutionRecordCandidateBuilderIntegrationPreview
          {...executionRecordCandidateBuilderIntegrationPreviewProps}
        />
      )}

      <LocalhostBridgeControls {...primaryLocalhostBridgeControlsProps} />

      {executionDevToolsEnabled && (
        <AvanzaDryRunReadinessPanel {...avanzaDryRunReadinessPanelProps} />
      )}

      {executionDevToolsEnabled && bridgeRequestEnvelopePreviewProps && (
        <BridgeRequestEnvelopePreview {...bridgeRequestEnvelopePreviewProps} />
      )}

      <LocalhostBridgeControls {...secondaryLocalhostBridgeControlsProps} />

      {executionDevToolsEnabled && (
        <ExecutionSandboxQaPanel {...executionSandboxQaPanelProps} />
      )}

      {executionDevToolsEnabled && agentProgressStubPanelProps && (
        <AgentProgressStubPanel {...agentProgressStubPanelProps} />
      )}

      <ExecutionLifecycleStatusPanel {...executionLifecycleStatusPanelProps} />

      {executionBrokerCaptureStubPanelProps && (
        <ExecutionBrokerCaptureStubPanel
          {...executionBrokerCaptureStubPanelProps}
        />
      )}

      <ExecutionHandoffStatusReadbacks {...statusReadbacksProps} />
    </>
  );
}
