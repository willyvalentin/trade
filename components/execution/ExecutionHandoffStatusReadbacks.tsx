import { Detail } from "@/components/execution/handoff-modal-shared";

export type ExecutionHandoffStatusDetail = {
  label: string;
  value: string;
};

export type ExecutionHandoffSafetyCheckReadback = {
  id: string;
  message: string;
  status: string;
  toneClassName: string;
};

export type ExecutionHandoffStatusReadbacksProps = {
  blockedReason: string | null | undefined;
  details: ExecutionHandoffStatusDetail[];
  handoffStatusLabel: string;
  handoffStatusToneClassName: string;
  intentReason: string;
  onClose: () => void;
  safetyChecks: ExecutionHandoffSafetyCheckReadback[];
};

export function ExecutionHandoffStatusReadbacks({
  blockedReason,
  details,
  handoffStatusLabel,
  handoffStatusToneClassName,
  intentReason,
  onClose,
  safetyChecks,
}: ExecutionHandoffStatusReadbacksProps) {
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {details.map((detail) => (
          <Detail
            key={`${detail.label}-${detail.value}`}
            label={detail.label}
            value={detail.value}
          />
        ))}
      </div>

      {blockedReason && (
        <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
            Blocked reason
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {blockedReason}
          </p>
        </div>
      )}

      <div className="rounded-md border border-white/10 bg-black/20 p-4">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
          Intent reason
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">{intentReason}</p>
      </div>

      <div className="rounded-md border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
              Safety checks
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Read-only checks for the future Avanza execution handoff.
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${handoffStatusToneClassName}`}
          >
            {handoffStatusLabel}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {safetyChecks.map((check) => (
            <div
              key={check.id}
              className="rounded-md border border-white/10 bg-white/[0.025] p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-zinc-200">
                  {check.id}
                </p>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${check.toneClassName}`}
                >
                  {check.status}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {check.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="trade-add-modal__footer">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="trade-discard-modal__button trade-discard-modal__button--neutral"
        >
          Close
        </button>
      </div>
    </>
  );
}
