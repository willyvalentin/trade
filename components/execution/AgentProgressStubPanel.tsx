import type {
  AvanzaAgentProgressEvent,
  AvanzaAgentProgressEventType,
} from "@/lib/avanza-agent-adapter";
import { Detail } from "@/components/execution/handoff-modal-shared";

export type AgentProgressStubTimelineItem = {
  progressEvent: AvanzaAgentProgressEvent;
  mappedLifecycleEventType:
    | AvanzaAgentProgressEvent["lifecycleEventType"]
    | null;
  lifecycleTransitionStatus: "not_mapped" | "applied" | "invalid";
  lifecycleNote: string;
};

export type AgentProgressStubPanelProps = {
  agentCommandValue: (
    value: string | number | boolean | null | undefined,
  ) => string;
  currentLifecycleLabel: string;
  currentLifecycleToneClassName: string;
  error: string;
  eventTypes: AvanzaAgentProgressEventType[];
  formatDate: (value: string) => string;
  getProgressDisplayLabel: (type: AvanzaAgentProgressEventType) => string;
  message: string;
  onAddProgressEvent: () => void;
  onProgressTypeChange: (type: AvanzaAgentProgressEventType) => void;
  requestId: string;
  selectedType: AvanzaAgentProgressEventType;
  shortPayloadId: (value: string | null) => string;
  timeline: AgentProgressStubTimelineItem[];
};

function lifecycleTone(
  status: AgentProgressStubTimelineItem["lifecycleTransitionStatus"],
) {
  if (status === "applied") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "invalid") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

export function AgentProgressStubPanel({
  agentCommandValue,
  currentLifecycleLabel,
  currentLifecycleToneClassName,
  error,
  eventTypes,
  formatDate,
  getProgressDisplayLabel,
  message,
  onAddProgressEvent,
  onProgressTypeChange,
  requestId,
  selectedType,
  shortPayloadId,
  timeline,
}: AgentProgressStubPanelProps) {
  return (
    <div className="rounded-md border border-sky-300/15 bg-sky-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
              Agent progress stub
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Test the future agent-progress pipeline locally. Events are
            audit-log stubs only; no Avanza browser agent is connected, no
            broker result is created, and no trade state changes.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${currentLifecycleToneClassName}`}
        >
          {currentLifecycleLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="block">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Progress event type
          </span>
          <select
            value={selectedType}
            onChange={(event) =>
              onProgressTypeChange(
                event.target.value as AvanzaAgentProgressEventType,
              )
            }
            className="mt-2 min-h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-sky-300"
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {getProgressDisplayLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAddProgressEvent();
          }}
          className="min-h-10 rounded-md border border-sky-300/25 bg-sky-300/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100 transition hover:border-sky-200/50 hover:bg-sky-300/15"
        >
          Add progress event
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Request {shortPayloadId(requestId)} · mapped lifecycle transitions are
        attempted only when the current modal state allows them.
      </p>

      {message && (
        <p className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] p-3 text-sm leading-6 text-cyan-100">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-md border border-rose-300/25 bg-rose-300/[0.08] p-3 text-sm leading-6 text-rose-100">
          {error}
        </p>
      )}

      {timeline.length > 0 && (
        <div className="mt-4 space-y-2">
          {timeline.map((item) => (
            <div
              key={item.progressEvent.eventId}
              className="rounded-md border border-white/10 bg-black/25 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">
                    {getProgressDisplayLabel(item.progressEvent.type)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {formatDate(item.progressEvent.createdAt)} · event{" "}
                    {shortPayloadId(item.progressEvent.eventId)}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${lifecycleTone(
                    item.lifecycleTransitionStatus,
                  )}`}
                >
                  {item.lifecycleTransitionStatus === "applied"
                    ? "Mapped"
                    : item.lifecycleTransitionStatus === "invalid"
                      ? "Invalid transition"
                      : "No mapping"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {item.progressEvent.message}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Detail
                  label="Lifecycle Event"
                  value={
                    item.mappedLifecycleEventType
                      ? agentCommandValue(item.mappedLifecycleEventType)
                      : "—"
                  }
                />
                <Detail label="Lifecycle Note" value={item.lifecycleNote} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
