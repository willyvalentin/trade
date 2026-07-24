import { Detail } from "@/components/execution/handoff-modal-shared";
import { AvanzaReadOnlyReadinessBadge } from "@/components/execution/AvanzaReadOnlyReadinessBadge";
import type {
  AvanzaLocalBridgeStatusSummary,
  AvanzaLocalBridgeUiStatus,
} from "@/lib/avanza-local-bridge-status";
import type {
  AvanzaBridgeReadinessChecklistItem,
  AvanzaBridgeReadinessChecklistStatus,
  AvanzaBridgeReadinessSummary,
} from "@/lib/avanza-bridge-readiness-checklist";

export type AvanzaBridgeStatusEvidence = {
  accountVerified?: boolean | string | null;
  instrumentVerified?: boolean | string | null;
  orderFormVisible?: boolean | null;
  totalReadStatus?: "unresolved_advisory" | "verified" | "not_checked" | null;
};

export type AvanzaBridgePocMilestoneSummary = {
  coreFillAndStopProven: boolean;
  evidenceCaptured: boolean;
  flow: "quantity_based";
  noFinalConfirmation: boolean;
  noOrderPlacement: boolean;
  noReviewModal: boolean;
  priceVerifiedVia: string;
  quantityVerifiedVia: string;
  stoppedBeforeReview: boolean;
  totalReadStatus: "unresolved_advisory";
};

export type AvanzaBridgeRefreshMetadata = {
  endpointSummary: {
    health: "available" | "unavailable" | "unknown";
    preflight: "ready" | "blocked" | "unknown";
    selfCheck: "available" | "unavailable" | "unknown";
  };
  errorMessage?: string | null;
  fetchDurationMs?: number | null;
  lastRefreshedAt?: string | null;
  source: "fixture_default" | "manual_readonly_refresh";
};

export type AvanzaBridgeStatusPanelProps = {
  canRefreshStatus?: boolean;
  evidence?: AvanzaBridgeStatusEvidence | null;
  isRefreshingStatus?: boolean;
  milestone?: AvanzaBridgePocMilestoneSummary | null;
  onRefreshStatus?: () => void;
  readinessChecklist?: AvanzaBridgeReadinessChecklistItem[] | null;
  readinessSummary?: AvanzaBridgeReadinessSummary | null;
  refreshMetadata?: AvanzaBridgeRefreshMetadata | null;
  refreshStatusMessage?: string | null;
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

function checklistStatusTone(status: AvanzaBridgeReadinessChecklistStatus) {
  if (status === "ready") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "advisory") {
    return "border-sky-300/25 bg-sky-300/10 text-sky-100";
  }

  if (status === "blocked") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

export function AvanzaBridgeStatusPanel({
  canRefreshStatus = false,
  evidence,
  isRefreshingStatus = false,
  milestone,
  onRefreshStatus,
  readinessChecklist,
  readinessSummary,
  refreshMetadata,
  refreshStatusMessage,
  status,
}: AvanzaBridgeStatusPanelProps) {
  const safeCopy = [
    "No order can be placed from this panel",
    "Ture will not click Granska köp",
    "Ture will not submit an order",
    "Manual review required in Avanza",
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
        <div className="flex flex-wrap items-center gap-2">
          {canRefreshStatus && onRefreshStatus && (
            <button
              className="inline-flex min-h-9 items-center justify-center rounded-md border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-sky-100 transition hover:border-sky-200 hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isRefreshingStatus}
              onClick={(event) => {
                event.stopPropagation();
                onRefreshStatus();
              }}
              type="button"
            >
              {isRefreshingStatus ? "Refreshing..." : "Refresh bridge status"}
            </button>
          )}
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${statusTone(
              status.status,
            )}`}
          >
            {statusLabels[status.status]}
          </span>
        </div>
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

      {refreshMetadata && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Last read-only refresh
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Source"
              value={displayValue(refreshMetadata.source)}
            />
            <Detail
              label="Last refreshed at"
              value={displayValue(refreshMetadata.lastRefreshedAt)}
            />
            <Detail
              label="Fetch duration"
              value={
                refreshMetadata.fetchDurationMs === null ||
                refreshMetadata.fetchDurationMs === undefined
                  ? "—"
                  : `${refreshMetadata.fetchDurationMs} ms`
              }
            />
            <Detail
              label="Health"
              value={displayValue(refreshMetadata.endpointSummary.health)}
            />
            <Detail
              label="Self-check"
              value={displayValue(refreshMetadata.endpointSummary.selfCheck)}
            />
            <Detail
              label="Preflight"
              value={displayValue(refreshMetadata.endpointSummary.preflight)}
            />
          </div>
          {refreshMetadata.errorMessage && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              {refreshMetadata.errorMessage}
            </p>
          )}
        </div>
      )}

      {readinessSummary && (
        <div className="mt-4">
          <AvanzaReadOnlyReadinessBadge summary={readinessSummary} />
        </div>
      )}

      {readinessChecklist && readinessChecklist.length > 0 && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Read-only readiness checklist
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {readinessChecklist.map((item) => (
              <div
                className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2"
                key={item.id}
              >
                <span className="text-sm leading-5 text-zinc-300">
                  {item.label}
                  {item.detail && (
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">
                      {item.detail}
                    </span>
                  )}
                </span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${checklistStatusTone(
                    item.status,
                  )}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {milestone && (
        <div className="mt-4 rounded-md border border-emerald-300/15 bg-emerald-300/[0.06] p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                Core fill-and-stop POC proven
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Quantity-based flow. Total-read remains unresolved/advisory.
              </p>
            </div>
            <span className="w-fit rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
              Proven milestone
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Flow" value={displayValue(milestone.flow)} />
            <Detail
              label="Quantity verified"
              value={milestone.quantityVerifiedVia}
            />
            <Detail label="Price verified" value={milestone.priceVerifiedVia} />
            <Detail
              label="Evidence captured"
              value={displayValue(milestone.evidenceCaptured)}
            />
            <Detail
              label="Stopped before Granska köp"
              value={displayValue(milestone.stoppedBeforeReview)}
            />
            <Detail
              label="No review modal"
              value={displayValue(milestone.noReviewModal)}
            />
            <Detail
              label="No final confirmation"
              value={displayValue(milestone.noFinalConfirmation)}
            />
            <Detail
              label="No order placement"
              value={displayValue(milestone.noOrderPlacement)}
            />
            <Detail
              label="Total-read"
              value={totalReadLabel(milestone.totalReadStatus)}
            />
          </div>
        </div>
      )}

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

      {refreshStatusMessage && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {refreshStatusMessage}
        </p>
      )}
    </section>
  );
}
