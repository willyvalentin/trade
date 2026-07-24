import type {
  AvanzaTradeUiHandoffPreviewModel,
} from "@/lib/avanza-trade-ui-handoff-preview-fixtures";

type AvanzaTradeUiHandoffPreviewProps = {
  label?: string;
  modelResult: AvanzaTradeUiHandoffPreviewModel;
  title?: string;
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatOptional(value: string | number | undefined) {
  return value === undefined ? "absent" : String(value);
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

function safetyFlags(modelResult: AvanzaTradeUiHandoffPreviewModel) {
  return [
    ["canProceedToHandoff", formatBoolean(modelResult.canProceedToHandoff)],
    ["canPrepareFill", formatBoolean(modelResult.canPrepareFill)],
    ["canCallBridge", formatBoolean(modelResult.canCallBridge)],
    ["canFetchLocalhost", formatBoolean(modelResult.canFetchLocalhost)],
    ["canPoll", formatBoolean(modelResult.canPoll)],
    ["canExecute", formatBoolean(modelResult.canExecute)],
    ["controlsEnabled", formatBoolean(modelResult.controlsEnabled)],
    ["gateLocked", formatBoolean(modelResult.gateLocked)],
  ];
}

export function AvanzaTradeUiHandoffPreview({
  label,
  modelResult,
  title = "Trade UI handoff preview",
}: AvanzaTradeUiHandoffPreviewProps) {
  const handoffPackage = modelResult.package;
  const packageFields = handoffPackage
    ? [
        ["ticker", handoffPackage.ticker],
        ["symbol", handoffPackage.symbol],
        ["side", handoffPackage.side],
        ["quantity", handoffPackage.quantity],
        ["orderType", handoffPackage.orderType],
        ["limitPrice", formatOptional(handoffPackage.limitPrice)],
        ["stopLoss", formatOptional(handoffPackage.stopLoss)],
        ["target", formatOptional(handoffPackage.target)],
        ["timeInForce", formatOptional(handoffPackage.timeInForce)],
        ["accountLabel", formatOptional(handoffPackage.accountLabel)],
        ["confidence", formatOptional(handoffPackage.confidence)],
        ["riskSummary", handoffPackage.riskSummary],
      ]
    : [];

  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            {[
              "Read-only handoff package preview",
              "No active CTA",
              "No prepare button",
              "No buy/sell CTA",
              "No bridge calls",
              "No Avanza/browser action",
              "No order behavior",
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
        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
          {modelResult.status}
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["package status", modelResult.status],
          ["package", handoffPackage ? "package present" : "package absent"],
          ["warnings", formatList(modelResult.warnings)],
          ["blockedReasons", formatList(modelResult.blockedReasons)],
          ...packageFields,
          ...safetyFlags(modelResult),
        ].map(([term, description]) => (
          <div
            className="rounded-md border border-white/10 bg-white/[0.025] p-2"
            key={term}
          >
            <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              {term}
            </dt>
            <dd className="mt-1 font-semibold text-zinc-200">
              {description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
