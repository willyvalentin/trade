import type {
  AvanzaDevOnlyPreviewEnablementChecklist,
} from "@/lib/avanza-dev-only-preview-enablement-checklist";
import type {
  AvanzaDevOnlyPreviewEnablementState,
} from "@/lib/avanza-dev-only-preview-enablement-state";
import type {
  AvanzaDevPreviewFlagConfig,
} from "@/lib/avanza-dev-preview-flag-config";

type AvanzaDevPreviewFlagStatusPanelProps = {
  checklist?: AvanzaDevOnlyPreviewEnablementChecklist;
  enablementState?: AvanzaDevOnlyPreviewEnablementState;
  previewFlagConfig?: AvanzaDevPreviewFlagConfig;
};

function formatValue(value: boolean | string) {
  return String(value).replaceAll("_", " ");
}

function statusClass(enabled: boolean) {
  return enabled ? "text-emerald-200" : "text-zinc-300";
}

export function AvanzaDevPreviewFlagStatusPanel({
  checklist,
  enablementState,
  previewFlagConfig,
}: AvanzaDevPreviewFlagStatusPanelProps) {
  const resolvedChecklist = enablementState?.enablementChecklist ?? checklist;
  const resolvedPreviewFlagConfig =
    enablementState?.previewFlagConfig ?? previewFlagConfig;

  if (!resolvedChecklist || !resolvedPreviewFlagConfig) {
    return null;
  }

  const configRows = [
    ["Overall status", enablementState?.overallStatus ?? resolvedChecklist.status],
    [
      "explicitPreviewOnlyFlag",
      resolvedPreviewFlagConfig.explicitPreviewOnlyFlag,
    ],
    ["Config source", resolvedPreviewFlagConfig.source],
    ["Environment scope", resolvedPreviewFlagConfig.environmentScope],
    [
      "Integration guard",
      enablementState?.integrationGuard.status ?? "not provided",
    ],
    [
      "Pre-wiring checklist",
      enablementState?.preWiringChecklist.summary.status ?? "not provided",
    ],
    ["Enablement checklist", resolvedChecklist.status],
    [
      "canEnableSelectedRecommendationPreview",
      resolvedPreviewFlagConfig.canEnableSelectedRecommendationPreview,
    ],
    [
      "canRenderSelectedRecommendationPreview",
      enablementState?.canRenderSelectedRecommendationPreview ?? false,
    ],
    ["canCallBridge", enablementState?.canCallBridge ?? false],
    ["canFetchLocalhost", enablementState?.canFetchLocalhost ?? false],
    ["canExecute", enablementState?.canExecute ?? false],
  ] as const;
  const safetyCopy = [
    "selectedRecommendation preview disabled by default",
    "Dev/test only",
    "No bridge calls",
    "No localhost fetch",
    "No execution",
    "Controls remain disabled",
    "Gate remains locked",
  ];

  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Dev/test preview flag
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {formatValue(
                enablementState?.overallStatus ??
                  resolvedPreviewFlagConfig.environmentScope,
              )}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {enablementState?.label ?? resolvedPreviewFlagConfig.label}
          </p>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-400">
            {enablementState?.reason ?? resolvedPreviewFlagConfig.reason}
          </p>
        </div>

        <dl className="grid gap-2 sm:grid-cols-2">
          {configRows.map(([label, value]) => (
            <div
              className="rounded-md border border-white/10 bg-white/[0.025] p-2"
              key={label}
            >
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                {label}
              </dt>
              <dd
                className={`mt-1 text-xs font-semibold ${
                  typeof value === "boolean" ? statusClass(value) : "text-zinc-200"
                }`}
              >
                {formatValue(value)}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-2">
          {safetyCopy.map((copy) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={copy}
            >
              {copy}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-zinc-200">
              {resolvedChecklist.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {resolvedChecklist.reason}
            </p>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
            {resolvedChecklist.status}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
            Blockers
          </p>
          <ul className="mt-2 grid gap-1 text-xs text-zinc-300">
            {resolvedChecklist.blockers.length > 0 ? (
              resolvedChecklist.blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))
            ) : (
              <li>None</li>
            )}
          </ul>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
            Advisories
          </p>
          <ul className="mt-2 grid gap-1 text-xs text-zinc-300">
            {resolvedChecklist.advisories.length > 0 ? (
              resolvedChecklist.advisories.map((advisory) => (
                <li key={advisory}>{advisory}</li>
              ))
            ) : (
              <li>None</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
