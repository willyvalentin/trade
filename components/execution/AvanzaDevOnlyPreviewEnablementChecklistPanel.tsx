import type {
  AvanzaDevOnlyPreviewEnablementChecklist,
  AvanzaDevOnlyPreviewEnablementChecklistRowStatus,
} from "@/lib/avanza-dev-only-preview-enablement-checklist";

type AvanzaDevOnlyPreviewEnablementChecklistPanelProps = {
  checklist: AvanzaDevOnlyPreviewEnablementChecklist;
};

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function statusClass(
  status:
    | AvanzaDevOnlyPreviewEnablementChecklistRowStatus
    | AvanzaDevOnlyPreviewEnablementChecklist["status"],
) {
  if (status === "ready" || status === "candidate_for_dev_preview") {
    return "text-emerald-200";
  }

  if (status === "blocked" || status === "not_allowed") {
    return "text-red-200";
  }

  if (status === "advisory") {
    return "text-amber-200";
  }

  return "text-zinc-300";
}

export function AvanzaDevOnlyPreviewEnablementChecklistPanel({
  checklist,
}: AvanzaDevOnlyPreviewEnablementChecklistPanelProps) {
  const safetyCopy = [
    "Dev-only preview enablement is not active",
    "Default remains static fixture",
    "selectedRecommendation preview disabled by default",
    "No bridge calls",
    "No localhost fetch",
    "No execution",
    "Controls must remain disabled",
    "Gate must remain locked",
  ];

  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Dev-only preview checklist
            </span>
            <span
              className={`rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${statusClass(
                checklist.status,
              )}`}
            >
              {formatStatus(checklist.status)}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {checklist.label}
          </p>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-400">
            {checklist.reason}
          </p>
        </div>

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

      {(checklist.blockers.length > 0 || checklist.advisories.length > 0) && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              Blockers
            </p>
            <ul className="mt-2 grid gap-1 text-xs text-zinc-300">
              {checklist.blockers.length > 0 ? (
                checklist.blockers.map((blocker) => (
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
              {checklist.advisories.length > 0 ? (
                checklist.advisories.map((advisory) => (
                  <li key={advisory}>{advisory}</li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-3 grid gap-2">
        {checklist.rows.map((row) => (
          <article
            className="rounded-md border border-white/10 bg-white/[0.025] p-2"
            key={row.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  {row.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {row.detail}
                </p>
              </div>
              <span
                className={`font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${statusClass(
                  row.status,
                )}`}
              >
                {row.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
