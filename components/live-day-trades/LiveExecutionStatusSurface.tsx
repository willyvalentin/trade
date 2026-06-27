import { LivePositionHandoffControls } from "@/components/execution/live-position-handoff-controls";
import {
  LivePositionExecutionStatusSurface,
} from "@/components/execution/live-position-execution-status-surface";
import type { ExecutionUiStatus } from "@/lib/execution-ui-status";

export type LiveExecutionStatusSurfaceProps = {
  onViewHandoff?: () => void;
  status: ExecutionUiStatus;
};

export function LiveExecutionStatusSurface({
  status,
  onViewHandoff,
}: LiveExecutionStatusSurfaceProps) {
  return (
    <LivePositionExecutionStatusSurface
      status={status}
      footerAction={
        onViewHandoff ? (
          <LivePositionHandoffControls onViewHandoff={onViewHandoff} />
        ) : null
      }
    />
  );
}
