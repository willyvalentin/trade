import type {
  AvanzaPassiveDisabledPrepareShellComponentModel,
} from "@/lib/avanza-passive-disabled-prepare-shell-fixtures";

type AvanzaPassiveDisabledPrepareShellProps = {
  label?: string;
  modelResult: AvanzaPassiveDisabledPrepareShellComponentModel;
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

function safetyFlags(modelResult: AvanzaPassiveDisabledPrepareShellComponentModel) {
  return [
    ["componentEnabled", formatBoolean(modelResult.componentEnabled)],
    ["canRenderComponent", formatBoolean(modelResult.canRenderComponent)],
    ["canClickPrepare", formatBoolean(modelResult.canClickPrepare)],
    ["canCallApiRoute", formatBoolean(modelResult.canCallApiRoute)],
    ["canCallBridge", formatBoolean(modelResult.canCallBridge)],
    ["canFetchLocalhost", formatBoolean(modelResult.canFetchLocalhost)],
    ["canControlBrowser", formatBoolean(modelResult.canControlBrowser)],
    ["canFillForm", formatBoolean(modelResult.canFillForm)],
    ["canClickReview", formatBoolean(modelResult.canClickReview)],
    ["canClickConfirm", formatBoolean(modelResult.canClickConfirm)],
    ["canSubmitOrder", formatBoolean(modelResult.canSubmitOrder)],
    ["canHandleCredentials", formatBoolean(modelResult.canHandleCredentials)],
    ["canReadCookies", formatBoolean(modelResult.canReadCookies)],
    ["canReadBankId", formatBoolean(modelResult.canReadBankId)],
    [
      "canWriteSupabaseExecution",
      formatBoolean(modelResult.canWriteSupabaseExecution),
    ],
    ["userMustConfirm", formatBoolean(modelResult.userMustConfirm)],
    [
      "finalHumanClickRequired",
      formatBoolean(modelResult.finalHumanClickRequired),
    ],
    ["controlsEnabled", formatBoolean(modelResult.controlsEnabled)],
    ["gateLocked", formatBoolean(modelResult.gateLocked)],
  ];
}

export function AvanzaPassiveDisabledPrepareShell({
  label,
  modelResult,
  title = "Passive disabled prepare shell",
}: AvanzaPassiveDisabledPrepareShellProps) {
  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            {[
              "Internal preview",
              "Disabled",
              "No broker action",
              "No order submission",
              "Final human confirmation required",
              "No active prepare button",
              "No active handoff",
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
          ["shell status", modelResult.status],
          ["source shell status", formatOptional(modelResult.sourceShellStatus)],
          ["label", modelResult.label],
          ["reason", modelResult.reason],
          ["side", formatOptional(modelResult.side)],
          ["ticker", formatOptional(modelResult.ticker)],
          ["symbol", formatOptional(modelResult.symbol)],
          ["quantity", formatOptional(modelResult.quantity)],
          ["orderType", formatOptional(modelResult.orderType)],
          ["limitPrice", formatOptional(modelResult.limitPrice)],
          ["accountLabel", formatOptional(modelResult.accountLabel)],
          ["warnings", formatList(modelResult.warnings)],
          ["blockedReasons", formatList(modelResult.blockedReasons)],
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
