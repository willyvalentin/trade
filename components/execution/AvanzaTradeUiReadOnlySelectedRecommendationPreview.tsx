import type {
  AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel,
} from "@/lib/avanza-trade-ui-read-only-selected-recommendation-preview-model";

type AvanzaTradeUiReadOnlySelectedRecommendationPreviewProps = {
  label?: string;
  modelResult: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel;
  title?: string;
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function canRenderReadyPreview(
  modelResult: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel,
) {
  return (
    modelResult.status === "read_only_preview_ready" &&
    modelResult.canRenderReadOnlyPreview &&
    Boolean(modelResult.previewState)
  );
}

function SafetyMetadata({
  modelResult,
}: {
  modelResult: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel;
}) {
  return (
    <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
      {[
        ["canProceedToHandoff", formatBoolean(modelResult.canProceedToHandoff)],
        ["canCallBridge", formatBoolean(modelResult.canCallBridge)],
        ["canFetchLocalhost", formatBoolean(modelResult.canFetchLocalhost)],
        ["canPoll", formatBoolean(modelResult.canPoll)],
        ["canExecute", formatBoolean(modelResult.canExecute)],
        ["controlsEnabled", formatBoolean(modelResult.controlsEnabled)],
        ["gateLocked", formatBoolean(modelResult.gateLocked)],
        ["sourceMode", modelResult.sourceMode],
      ].map(([term, description]) => (
        <div
          className="rounded-md border border-white/10 bg-black/20 p-2"
          key={term}
        >
          <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
            {term}
          </dt>
          <dd className="mt-1 font-semibold text-zinc-200">{description}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AvanzaTradeUiReadOnlySelectedRecommendationPreview({
  label,
  modelResult,
  title = "Trade UI read-only selectedRecommendation preview",
}: AvanzaTradeUiReadOnlySelectedRecommendationPreviewProps) {
  const readyPreview = canRenderReadyPreview(modelResult)
    ? modelResult.previewState
    : null;
  const totalReadBoundary = readyPreview?.safetyBoundarySummary.boundaries.find(
    (boundary) => boundary.id === "total_read_unresolved_advisory",
  );

  if (!readyPreview) {
    return (
      <section className="rounded-md border border-white/10 bg-black/20 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-100">{title}</p>
            {label ? (
              <p className="mt-1 text-xs font-semibold text-zinc-300">
                {label}
              </p>
            ) : null}
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {modelResult.reason}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
            {modelResult.status}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Passive read-only",
            "Not active",
            "No handoff",
            "No bridge calls",
            "No localhost fetch",
            "No polling",
            "No execution",
            "Controls disabled",
            "Gate locked",
          ].map((copy) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={copy}
            >
              {copy}
            </span>
          ))}
        </div>

        <div className="mt-3">
          <SafetyMetadata modelResult={modelResult} />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            {[
              "Passive read-only preview",
              "Not active",
              "No handoff",
              "No execution",
              "Controls disabled",
              "Gate locked",
            ].map((copy) => (
              <span
                className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
                key={copy}
              >
                {copy}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold text-zinc-100">{title}</p>
          {label ? (
            <p className="mt-1 text-xs font-semibold text-zinc-300">{label}</p>
          ) : null}
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            {modelResult.reason}
          </p>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">
          {modelResult.status}
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["displayState", readyPreview.displayState],
          ["sourceLabel", modelResult.sourceLabel],
          ["sourceStatus", readyPreview.sourceMode.status],
          ["gateStatus", readyPreview.preActivationGate.gateStatus],
          ["eligibility", readyPreview.eligibilitySummary.status],
          [
            "packagePreview",
            readyPreview.packagePreview ? "previewState present" : "not present",
          ],
          [
            "totalRead",
            totalReadBoundary?.status ?? "advisory",
          ],
          ["rendering", "passive only"],
        ].map(([term, description]) => (
          <div
            className="rounded-md border border-white/10 bg-white/[0.025] p-2"
            key={term}
          >
            <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              {term}
            </dt>
            <dd className="mt-1 font-semibold text-zinc-200">
              {formatStatus(description)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3">
        <SafetyMetadata modelResult={modelResult} />
      </div>
    </section>
  );
}
