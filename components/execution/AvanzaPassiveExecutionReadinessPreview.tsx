import {
  buildAvanzaPassiveExecutionReadinessPreview,
  type AvanzaPassiveExecutionReadinessPreviewModel,
  type AvanzaPassiveExecutionReadinessPreviewSource,
  type AvanzaPassiveExecutionReadinessPreviewSide,
} from "@/lib/avanza-passive-execution-readiness-preview";

type AvanzaPassiveExecutionReadinessPreviewProps = {
  model?: AvanzaPassiveExecutionReadinessPreviewModel;
  profileReady?: boolean;
  loginReady?: boolean;
  orderPrepReady?: boolean;
  settlementReady?: boolean;
  selectedTicker?: string;
  selectedSide?: AvanzaPassiveExecutionReadinessPreviewSide;
  source?: AvanzaPassiveExecutionReadinessPreviewSource;
  mode?: "fixture" | "passive_trade_ui";
};

const readinessCopy = [
  "Avanza Execution Readiness",
  "Passive preview only",
  "Not connected to Avanza",
  "Local-dev smoke tests are separate",
  "Ture Settings profile readiness",
  "Login readiness: modeled/local-dev only",
  "Instrument search readiness: modeled/local-dev only",
  "Order ticket readiness: modeled/local-dev only",
  "Settlement reconciliation readiness: modeled/mock only",
  "Final KÖP/SÄLJ: human-only",
  "Order submission: unavailable",
  "BankID automation: forbidden",
  "Cookies/session: not used",
  "API route: disabled/not wired",
  "Browser automation from app: not wired",
  "Production readiness: not ready",
] as const;

const safetyFlagKeys = [
  "previewOnly",
  "canShowReadiness",
  "canStartHandoff",
  "canPrepareOrder",
  "canRunSmokeTestFromUi",
  "canCallApiRoute",
  "canFetch",
  "canPoll",
  "canUseBrowserAutomation",
  "canAccessCredentials",
  "canReadCookies",
  "canExportSession",
  "canAutomateBankId",
  "canSubmitOrder",
  "canClickFinalBuy",
  "canClickFinalSell",
  "canWriteSupabase",
  "canClaimProductionReady",
  "userMustConfirm",
  "finalHumanClickRequired",
  "controlsEnabled",
  "gateLocked",
] as const;

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "n/a";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "none";

  return String(value);
}

export function AvanzaPassiveExecutionReadinessPreview({
  model,
  profileReady,
  loginReady,
  orderPrepReady,
  settlementReady,
  selectedTicker,
  selectedSide,
  source,
  mode = "passive_trade_ui",
}: AvanzaPassiveExecutionReadinessPreviewProps) {
  const preview =
    model ??
    buildAvanzaPassiveExecutionReadinessPreview({
      loginReady,
      orderPrepReady,
      profileReady,
      selectedSide,
      selectedTicker,
      settlementReady,
      source,
    });

  return (
    <section className="grid gap-3 rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-wrap gap-2">
        {readinessCopy.map((copy) => (
          <span
            className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
            key={copy}
          >
            {copy}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-100">
            {preview.label}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            {preview.reason}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
          {preview.status}
        </span>
      </div>

      <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["mode", mode],
          ["source", preview.source],
          ["selectedTicker", formatValue(preview.selectedTicker)],
          ["selectedSide", formatValue(preview.selectedSide)],
          ["profileReady", formatValue(preview.profileReady)],
          ["loginModeled", formatValue(preview.loginModeled)],
          ["instrumentSearchModeled", formatValue(preview.instrumentSearchModeled)],
          ["orderPrepModeled", formatValue(preview.orderPrepModeled)],
          ["settlementModeled", formatValue(preview.settlementModeled)],
          ["localDevOnly", formatValue(preview.localDevOnly)],
          ["tradeUiExecutionWired", formatValue(preview.tradeUiExecutionWired)],
          ["apiRouteWired", formatValue(preview.apiRouteWired)],
          ["browserAutomationWired", formatValue(preview.browserAutomationWired)],
          ["smokeTestRunnableFromUi", formatValue(preview.smokeTestRunnableFromUi)],
          ["warnings", formatValue(preview.warnings)],
          ["blockedReasons", formatValue(preview.blockedReasons)],
        ].map(([label, value]) => (
          <div
            className="rounded-md border border-white/10 bg-white/[0.025] p-2"
            key={label}
          >
            <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              {label}
            </dt>
            <dd className="mt-1 font-semibold text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
        <h4 className="text-xs font-semibold text-zinc-200">Safety flags</h4>
        <dl className="grid gap-1 text-xs text-zinc-300 sm:grid-cols-2">
          {safetyFlagKeys.map((key) => (
            <div className="flex justify-between gap-3" key={key}>
              <dt className="text-zinc-500">{key}</dt>
              <dd>{formatValue(preview.safetyFlags[key])}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
