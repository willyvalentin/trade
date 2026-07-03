import type {
  AvanzaSelectedRecommendationPreWiringChecklist,
  AvanzaSelectedRecommendationPreWiringChecklistRowStatus,
} from "@/lib/avanza-selected-recommendation-pre-wiring-checklist";

type AvanzaSelectedRecommendationPreWiringChecklistPanelProps = {
  checklist: AvanzaSelectedRecommendationPreWiringChecklist;
};

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function statusClass(
  status:
    | AvanzaSelectedRecommendationPreWiringChecklistRowStatus
    | AvanzaSelectedRecommendationPreWiringChecklist["summary"]["status"],
) {
  if (status === "ready" || status === "candidate_for_preview_only_wiring") {
    return "text-emerald-200";
  }

  if (status === "blocked" || status === "not_ready_for_wiring") {
    return "text-red-200";
  }

  if (status === "advisory") {
    return "text-amber-200";
  }

  return "text-zinc-300";
}

export function AvanzaSelectedRecommendationPreWiringChecklistPanel({
  checklist,
}: AvanzaSelectedRecommendationPreWiringChecklistPanelProps) {
  const summaryRows = [
    ["Ready", checklist.summary.readyCount],
    ["Blocked", checklist.summary.blockedCount],
    ["Advisory", checklist.summary.advisoryCount],
    ["Enforced", checklist.summary.enforcedCount],
  ] as const;
  const safetyCopy = [
    "Preview-only wiring is not active",
    "No bridge calls",
    "No localhost fetch",
    "No execution",
    "Controls must remain disabled",
  ];

  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Pre-wiring checklist
            </span>
            <span
              className={`rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${statusClass(
                checklist.summary.status,
              )}`}
            >
              {formatStatus(checklist.summary.status)}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {checklist.summary.label}
          </p>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-400">
            {checklist.summary.reason}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs sm:min-w-56">
          {summaryRows.map(([label, value]) => (
            <div
              className="rounded-md border border-white/10 bg-white/[0.025] p-2"
              key={label}
            >
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                {label}
              </dt>
              <dd className="mt-1 font-semibold text-zinc-200">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {safetyCopy.map((copy) => (
          <span
            className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
            key={copy}
          >
            {copy}
          </span>
        ))}
      </div>

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
