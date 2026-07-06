import {
  AvanzaPassiveExecutionReadinessPreview,
} from "@/components/execution/AvanzaPassiveExecutionReadinessPreview";
import {
  buildAvanzaPassiveExecutionReadinessPreview,
  type AvanzaPassiveExecutionReadinessPreviewModel,
} from "@/lib/avanza-passive-execution-readiness-preview";

type AvanzaSettingsPassiveExecutionReadinessPanelProps = {
  model?: AvanzaPassiveExecutionReadinessPreviewModel;
  title?: string;
};

const settingsBadges = [
  "Avanza Settings passive execution readiness panel",
  "Passive Settings UI only",
  "Passive preview only",
  "Not connected to Avanza",
  "Local-dev smoke tests are separate",
  "No active handoff",
  "No prepare action",
  "No buy/sell CTA",
  "No browser automation",
  "No API route call",
  "No fetch/polling",
  "No smoke test from UI",
  "No credential access",
  "No cookies/session",
  "No BankID automation",
  "No order submission",
  "No final KÖP/SÄLJ click",
  "Not production ready",
] as const;

const defaultSettingsReadinessModel = buildAvanzaPassiveExecutionReadinessPreview({
  localDevOnly: true,
  loginReady: true,
  orderPrepReady: true,
  profileReady: true,
  reason:
    "Settings can display Avanza execution readiness as passive visibility only.",
  settlementReady: true,
  source: "manual_review",
});

export function AvanzaSettingsPassiveExecutionReadinessPanel({
  model = defaultSettingsReadinessModel,
  title = "Avanza Execution Readiness",
}: AvanzaSettingsPassiveExecutionReadinessPanelProps) {
  return (
    <section className="rounded-lg border border-emerald-300/15 bg-emerald-300/[0.035] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
            Passive Settings UI only
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Read-only readiness visibility beside the Avanza execution profile.
            It does not start handoff, prepare orders, call APIs, fetch, poll,
            run smoke tests, access credentials, read cookies/session, control
            a browser, submit orders, click final KÖP/SÄLJ, or write Supabase.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-black/25 px-3 py-1.5 font-mono text-xs font-bold uppercase text-zinc-200">
          {model.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {settingsBadges.map((badge) => (
          <span
            className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
            key={badge}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <AvanzaPassiveExecutionReadinessPreview
          mode="passive_trade_ui"
          model={model}
        />
      </div>
    </section>
  );
}
