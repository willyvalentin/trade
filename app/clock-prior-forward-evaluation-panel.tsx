import type {
  ScannerClockPriorShadowForwardEvaluationReadback,
} from "@/lib/scanner-clock-prior-shadow-forward-evaluation-readback";

function percent(value: number | null) {
  return value === null ? "unavailable" : `${(value * 100).toFixed(1)}%`;
}

function signedPercent(value: number | null) {
  if (value === null) return "unavailable";
  const percentage = value * 100;
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)} pp`;
}

function signedR(value: number | null) {
  if (value === null) return "unavailable";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)} R`;
}

function statusTone(
  readback: ScannerClockPriorShadowForwardEvaluationReadback | null,
) {
  if (!readback) return "border-white/15 bg-white/5 text-zinc-400";
  if (readback.status === "conflicting" || readback.status === "invalid") {
    return "border-red-400/30 bg-red-400/10 text-red-200";
  }
  if (readback.status !== "available") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
  if (readback.evaluation?.status === "decision_ready") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }
  return "border-amber-300/30 bg-amber-300/10 text-amber-100";
}

function statusLabel(
  readback: ScannerClockPriorShadowForwardEvaluationReadback | null,
) {
  if (!readback) return "loading";
  if (readback.status !== "available") return readback.status.replaceAll("_", " ");
  return readback.evaluation?.status.replaceAll("_", " ") ?? "invalid";
}

export function ClockPriorForwardEvaluationPanel({
  readback,
}: {
  readback: ScannerClockPriorShadowForwardEvaluationReadback | null;
}) {
  const evaluation = readback?.status === "available"
    ? readback.evaluation
    : null;
  const diagnostic = readback?.status === "available"
    ? readback.context_diagnostic
    : null;
  const priority = diagnostic?.priority_context ?? null;

  return (
    <section
      className="rounded-lg border border-white/10 bg-black/20 p-4"
      data-testid="clock-prior-forward-evaluation-readback"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Recommendation intelligence · IF-4
          </p>
          <h3 className="mt-2 font-mono text-lg font-semibold tracking-normal text-white">
            Clock-neutral policy decision
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Owner-bound readback of the frozen baseline/challenger evaluation
            and its predeclared context triage. A terminal result can guide the
            next human-reviewed hypothesis; it cannot change the live engine.
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] ${statusTone(readback)}`}
        >
          {statusLabel(readback)}
        </span>
      </div>

      {!readback ? (
        <p className="mt-4 rounded-md border border-white/10 bg-white/[0.025] p-3 text-sm leading-6 text-zinc-500">
          Loading the exact owner-bound evaluation readback…
        </p>
      ) : readback.status !== "available" || !evaluation ? (
        <div className="mt-4 rounded-md border border-white/10 bg-white/[0.025] p-3">
          <p className="text-sm leading-6 text-zinc-300">
            No trustworthy forward-policy result can be shown in this state.
          </p>
          <p className="mt-2 break-all font-mono text-xs leading-5 text-zinc-500">
            {readback.blocker ?? "clock_prior_forward_evaluation_unavailable"}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Decision</p>
              <p className="mt-2 font-mono text-lg font-semibold uppercase text-white">{evaluation.decision}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Durable result</p>
              <p className="mt-2 font-mono text-lg font-semibold text-white">{readback.durable_result ? "Recorded" : "Not recorded"}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Partitions</p>
              <p className="mt-2 font-mono text-lg font-semibold text-white">{evaluation.partitions.length}/2</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Context triage</p>
              <p className="mt-2 font-mono text-sm font-semibold uppercase text-white">{diagnostic?.status.replaceAll("_", " ") ?? "not terminal"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {evaluation.partitions.map((partition) => (
              <div key={partition.partition} className="rounded-md border border-white/10 bg-white/[0.025] p-3">
                <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{partition.partition.replaceAll("_", " ")}</h4>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs leading-5">
                  <dt className="text-zinc-500">Baseline precision</dt>
                  <dd className="text-right font-mono text-zinc-200">{percent(partition.baseline_precision)}</dd>
                  <dt className="text-zinc-500">Challenger precision</dt>
                  <dd className="text-right font-mono text-zinc-200">{percent(partition.candidate_precision)}</dd>
                  <dt className="text-zinc-500">Observed delta</dt>
                  <dd className="text-right font-mono text-zinc-200">{signedPercent(partition.precision_delta)}</dd>
                  <dt className="text-zinc-500">Conservative interval</dt>
                  <dd className="text-right font-mono text-zinc-200">{signedPercent(partition.conservative_precision_delta_lower)} to {signedPercent(partition.conservative_precision_delta_upper)}</dd>
                  <dt className="text-zinc-500">Opportunity sets</dt>
                  <dd className="text-right font-mono text-zinc-200">{partition.opportunity_set_count} ({partition.no_trade_opportunity_set_count} no-trade)</dd>
                  <dt className="text-zinc-500">Ranked / trading days</dt>
                  <dd className="text-right font-mono text-zinc-200">{partition.ranked_candidate_count} / {partition.trading_day_count}</dd>
                </dl>
                <p className="mt-3 text-xs leading-5 text-zinc-500">Evidence {partition.evidence_complete ? "complete" : "incomplete"} for this partition.</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-md border border-white/10 bg-white/[0.025] p-3">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">Deterministic context triage</h4>
            {!diagnostic ? (
              <p className="mt-3 text-sm leading-6 text-zinc-400">Context triage remains unavailable until an exact terminal decision has been durably recorded.</p>
            ) : priority ? (
              <>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  Priority context: <span className="font-mono text-white">{priority.dimension} / {priority.key}</span>. The challenger is conservatively worse under the frozen Wilson rule.
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  Baseline {percent(priority.baseline_precision)} across {priority.baseline_resolved_outcomes} resolved outcomes; challenger {percent(priority.candidate_precision)} across {priority.candidate_resolved_outcomes}. Observed delta {signedPercent(priority.precision_delta)}, conservative gap {signedPercent(priority.conservative_regression_gap)}, expectancy delta {signedR(priority.expectancy_delta_r)}.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {diagnostic.status === "insufficient_evidence"
                  ? "No context has both arms, both partitions and the minimum resolved sample yet."
                  : "No eligible context shows a Wilson-separated conservative regression. Ture will not mine weaker slices after seeing the result."}
              </p>
            )}
            {diagnostic ? (
              <p className="mt-2 text-xs leading-5 text-zinc-500">Eligible pairs {diagnostic.pair_counts.eligible}/{diagnostic.pair_counts.total}; conservative regressions {diagnostic.pair_counts.conservative_regression}; minimum-sample gaps {diagnostic.pair_counts.minimum_resolved_not_met}.</p>
            ) : null}
          </div>

          <div className="mt-4 rounded-md border border-white/10 bg-white/[0.025] p-3 text-xs leading-5 text-zinc-500">
            <p className="break-all">Plan {readback.plan?.plan_fingerprint}</p>
            <p className="mt-1 break-all">Result {readback.durable_result?.result_fingerprint ?? "not durably recorded"}</p>
            {diagnostic ? <p className="mt-1 break-all">Diagnostic {diagnostic.diagnostic_fingerprint}</p> : null}
            <p className="mt-3 text-zinc-400">
              Shadow readback only. It cannot request data, reserve credits,
              change ranking or publication, promote a policy, create a paper
              position, publish a candidate, or execute a broker action.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
