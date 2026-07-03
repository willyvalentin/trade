import { Detail } from "@/components/execution/handoff-modal-shared";
import type {
  AvanzaLocalBridgeStatusSummary,
  AvanzaLocalBridgeUiStatus,
} from "@/lib/avanza-local-bridge-status";

export type AvanzaBridgeStatusEvidence = {
  accountVerified?: boolean | string | null;
  instrumentVerified?: boolean | string | null;
  orderFormVisible?: boolean | null;
  totalReadStatus?: "unresolved_advisory" | "verified" | "not_checked" | null;
};

export type AvanzaBridgeStatusPanelProps = {
  evidence?: AvanzaBridgeStatusEvidence | null;
  status: AvanzaLocalBridgeStatusSummary;
};

const statusLabels: Record<AvanzaLocalBridgeUiStatus, string> = {
  not_configured: "Not configured",
  unavailable: "Unavailable",
  available: "Available",
  self_check_unavailable: "Self-check unavailable",
  preflight_ready: "Preflight ready",
  preflight_blocked: "Preflight blocked",
  unknown_error: "Unknown error",
};

function statusTone(status: AvanzaLocalBridgeUiStatus) {
  if (status === "preflight_ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "available") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  if (status === "preflight_blocked" || status === "self_check_unavailable") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function displayValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value).replaceAll("_", " ");
}

function totalReadLabel(
  value: AvanzaBridgeStatusEvidence["totalReadStatus"] | undefined,
) {
  if (value === "verified") {
    return "Verified";
  }

  if (value === "not_checked") {
    return "Not checked";
  }

  return "Unresolved/advisory";
}

export function AvanzaBridgeStatusPanel({
  evidence,
  status,
}: AvanzaBridgeStatusPanelProps) {
  const safeCopy = [
    "No order can be placed from this panel",
    "Ture will not click Granska köp",
    "Ture will not submit an order",
  ];

  return (
    <section className="rounded-md border border-sky-300/15 bg-sky-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
              Read-only status
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
              Avanza bridge
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {status.safeMessage}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${statusTone(
            status.status,
          )}`}
        >
          {statusLabels[status.status]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {safeCopy.map((copy) => (
          <span
            className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-semibold text-zinc-300"
            key={copy}
          >
            {copy}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Bridge available" value={displayValue(status.bridgeAvailable)} />
        <Detail label="Preflight ready" value={displayValue(status.preflightReady)} />
        <Detail
          label="Manual observation"
          value={displayValue(status.manualObservationReady)}
        />
        <Detail label="Account verified" value={displayValue(evidence?.accountVerified)} />
        <Detail
          label="Instrument verified"
          value={displayValue(evidence?.instrumentVerified)}
        />
        <Detail
          label="Order form visible"
          value={displayValue(evidence?.orderFormVisible)}
        />
        <Detail
          label="Total-read"
          value={totalReadLabel(evidence?.totalReadStatus)}
        />
      </div>

      {(status.blockers.length > 0 || status.warnings.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {status.blockers.length > 0 && (
            <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                Blockers
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                {status.blockers.map((blocker) => (
                  <li key={blocker}>{displayValue(blocker)}</li>
                ))}
              </ul>
            </div>
          )}

          {status.warnings.length > 0 && (
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                Warnings
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                {status.warnings.map((warning) => (
                  <li key={warning}>{displayValue(warning)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
