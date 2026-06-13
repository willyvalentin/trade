type ReadinessStatus = "pass" | "warn" | "fail" | "pending";

export type AvanzaDryRunReadinessItem = {
  label: string;
  status: ReadinessStatus;
  message: string;
};

type ReadinessLabelsSection = {
  labels?: string[];
  summary: string;
};

type SessionDetectionReadinessSection = ReadinessLabelsSection & {
  readyForSearchOnly: boolean;
};

type SearchOnlyReadinessSection = ReadinessLabelsSection & {
  ambiguous: boolean;
  exactMatch: boolean;
};

type InstrumentVerificationReadinessSection = ReadinessLabelsSection & {
  ambiguous: boolean;
  rejected: boolean;
  verified: boolean;
};

type InstrumentPageReadinessSection = ReadinessLabelsSection & {
  blocked: boolean;
  blockerMessage: string;
  identified: boolean;
  mismatch: boolean;
  prohibitedControlsVisible: boolean;
};

type OrderPageReadinessSection = ReadinessLabelsSection & {
  blocked: boolean;
  blockerMessage: string;
  mismatch: boolean;
  opened: boolean;
  wrongAction: boolean;
};

type AdvancedFormReadinessSection = ReadinessLabelsSection & {
  blocked: boolean;
  blockerMessage: string;
  fieldMismatch: boolean;
  filled: boolean;
  validationError: boolean;
};

type ReviewClickReadinessSection = ReadinessLabelsSection & {
  blocked: boolean;
  blockerMessage: string;
  confirmationMismatch: boolean;
  confirmationReady: boolean;
  finalConfirmBlocked: boolean;
  validationError: boolean;
};

type BrokerConfirmationReadinessSection = ReadinessLabelsSection & {
  blocked: boolean;
  blockerMessage: string;
  captured: boolean;
  mismatch: boolean;
  partial: boolean;
  rejectedOrCancelled: boolean;
};

export type AvanzaDryRunReadinessPanelProps = {
  allowedSafetyLevel: string;
  defaultGateBlocked: boolean;
  items: AvanzaDryRunReadinessItem[];
  localhostRunnerSelfCheckLabels: string[];
  localhostRunnerSelfCheckSummary: string;
  overall: string;
  sessionDetection: SessionDetectionReadinessSection;
  searchOnly: SearchOnlyReadinessSection;
  instrumentVerification: InstrumentVerificationReadinessSection;
  instrumentPage: InstrumentPageReadinessSection;
  orderPage: OrderPageReadinessSection;
  advancedForm: AdvancedFormReadinessSection;
  reviewClick: ReviewClickReadinessSection;
  brokerConfirmation: BrokerConfirmationReadinessSection;
};

function readinessTone(status: ReadinessStatus) {
  if (status === "pass") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warn") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  if (status === "fail") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function commandLabel(value: string) {
  return value.replaceAll("_", " ").toUpperCase();
}

function LabelChips({
  labels,
  tone,
}: {
  labels?: string[];
  tone: "amber" | "cyan" | "fuchsia" | "indigo" | "lime" | "orange" | "pink" | "rose" | "teal";
}) {
  if (!labels?.length) {
    return null;
  }

  const toneClassName = {
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    fuchsia: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100",
    indigo: "border-indigo-300/20 bg-indigo-300/10 text-indigo-100",
    lime: "border-lime-300/20 bg-lime-300/10 text-lime-100",
    orange: "border-orange-300/20 bg-orange-300/10 text-orange-100",
    pink: "border-pink-300/20 bg-pink-300/10 text-pink-100",
    rose: "border-rose-300/20 bg-rose-300/10 text-rose-100",
    teal: "border-teal-300/20 bg-teal-300/10 text-teal-100",
  }[tone];

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${toneClassName}`}
          key={label}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function AvanzaDryRunReadinessPanel({
  advancedForm,
  allowedSafetyLevel,
  brokerConfirmation,
  defaultGateBlocked,
  instrumentPage,
  instrumentVerification,
  items,
  localhostRunnerSelfCheckLabels,
  localhostRunnerSelfCheckSummary,
  orderPage,
  overall,
  reviewClick,
  searchOnly,
  sessionDetection,
}: AvanzaDryRunReadinessPanelProps) {
  return (
    <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
              Avanza dry-run readiness
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only readiness checklist. Localhost self-check is
            informational only and does not start a runner.
          </p>
        </div>
        <span className="w-fit rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
          {overall}
        </span>
      </div>

      <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
        {overall === "Not ready to run"
          ? "Not ready to run because the Avanza runner implementation is intentionally missing. This panel only shows readiness gates."
          : overall}
      </p>

      <div className="mt-3 rounded-md border border-amber-300/15 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
          Localhost self-check integration
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-300">
          {localhostRunnerSelfCheckSummary}
        </p>
        <LabelChips labels={localhostRunnerSelfCheckLabels} tone="amber" />
      </div>

      <div className="mt-3 rounded-md border border-teal-300/15 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-teal-100">
          Session-detection integration
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-300">
          {sessionDetection.summary}
        </p>
        {sessionDetection.readyForSearchOnly && (
          <p className="mt-2 text-xs leading-5 text-teal-100">
            Ready for future search-only phase. This remains informational and
            does not enable search or dry-run execution.
          </p>
        )}
        <LabelChips labels={sessionDetection.labels} tone="teal" />
      </div>

      <div className="mt-3 rounded-md border border-cyan-300/15 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
          Search-only integration
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-300">
          {searchOnly.summary}
        </p>
        {searchOnly.exactMatch && (
          <p className="mt-2 text-xs leading-5 text-cyan-100">
            Ready for future instrument-verification phase. This remains
            informational and does not enable browser control, search, order
            preparation, or broker submission.
          </p>
        )}
        {searchOnly.ambiguous && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Manual review required before any future instrument-verification
            phase.
          </p>
        )}
        <LabelChips labels={searchOnly.labels} tone="cyan" />
      </div>

      <div className="mt-3 rounded-md border border-indigo-300/15 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-100">
          Instrument-verification integration
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-300">
          {instrumentVerification.summary}
        </p>
        {instrumentVerification.verified && (
          <p className="mt-2 text-xs leading-5 text-indigo-100">
            Ready for future instrument-page phase. This remains informational
            and does not enable browser control, instrument-page opening, order
            preparation, or broker submission.
          </p>
        )}
        {instrumentVerification.rejected && (
          <p className="mt-2 text-xs leading-5 text-rose-100">
            Rejected: manual review required before any future instrument-page
            phase.
          </p>
        )}
        {instrumentVerification.ambiguous && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Ambiguous: manual review required before any future instrument-page
            phase.
          </p>
        )}
        <LabelChips labels={instrumentVerification.labels} tone="indigo" />
      </div>

      <div className="mt-3 rounded-md border border-fuchsia-300/15 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100">
          Instrument-page integration
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-300">
          {instrumentPage.summary}
        </p>
        {instrumentPage.identified && (
          <p className="mt-2 text-xs leading-5 text-fuchsia-100">
            Ready for future order-page-open design. This remains informational
            and does not enable browser control, order pages, buy/sell clicks,
            form fills, or broker submission.
          </p>
        )}
        {instrumentPage.mismatch && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Page mismatch: manual review required.
          </p>
        )}
        {instrumentPage.prohibitedControlsVisible && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Buy/sell controls visible - no click allowed.
          </p>
        )}
        {instrumentPage.blocked && (
          <p className="mt-2 text-xs leading-5 text-rose-100">
            Blocked: {instrumentPage.blockerMessage}
          </p>
        )}
        <LabelChips labels={instrumentPage.labels} tone="fuchsia" />
      </div>

      <div className="mt-3 rounded-md border border-orange-300/15 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-orange-100">
          Order-page-open integration
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-300">
          {orderPage.summary}
        </p>
        {orderPage.opened && (
          <p className="mt-2 text-xs leading-5 text-orange-100">
            Ready for future form-fill design. This remains informational and
            does not enable browser control, form fill, Granska, Bekrafta, or
            broker submission.
          </p>
        )}
        {orderPage.wrongAction && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Wrong action opened: manual review required.
          </p>
        )}
        {orderPage.mismatch && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Order page mismatch: manual review required.
          </p>
        )}
        {orderPage.blocked && (
          <p className="mt-2 text-xs leading-5 text-rose-100">
            Blocked: {orderPage.blockerMessage}
          </p>
        )}
        <LabelChips labels={orderPage.labels} tone="orange" />
      </div>

      <div className="mt-3 rounded-md border border-lime-300/15 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-lime-100">
          Advanced form-fill integration
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-300">
          {advancedForm.summary}
        </p>
        {advancedForm.filled && (
          <p className="mt-2 text-xs leading-5 text-lime-100">
            Ready for future review-click design. This remains informational and
            does not enable browser control, real form fill, Granska, Bekrafta,
            or broker submission.
          </p>
        )}
        {advancedForm.fieldMismatch && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Field mismatch: manual review required.
          </p>
        )}
        {advancedForm.validationError && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Validation error: manual review required.
          </p>
        )}
        {advancedForm.blocked && (
          <p className="mt-2 text-xs leading-5 text-rose-100">
            Blocked: {advancedForm.blockerMessage}
          </p>
        )}
        <LabelChips labels={advancedForm.labels} tone="lime" />
      </div>

      <div className="mt-3 rounded-md border border-rose-300/15 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
          Review-click integration
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-300">
          {reviewClick.summary}
        </p>
        {reviewClick.confirmationReady && (
          <p className="mt-2 text-xs leading-5 text-rose-100">
            Ready for future manual-confirmation wait design. This remains
            informational and does not enable browser control, real Granska,
            Bekrafta, broker result, or trade mutation.
          </p>
        )}
        {reviewClick.confirmationMismatch && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Confirmation mismatch: manual review required.
          </p>
        )}
        {reviewClick.validationError && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Validation error: manual review required.
          </p>
        )}
        {reviewClick.finalConfirmBlocked && (
          <p className="mt-2 text-xs leading-5 text-rose-100">
            Final-confirm attempt blocked.
          </p>
        )}
        {reviewClick.blocked && (
          <p className="mt-2 text-xs leading-5 text-rose-100">
            Blocked: {reviewClick.blockerMessage}
          </p>
        )}
        <LabelChips labels={reviewClick.labels} tone="rose" />
      </div>

      <div className="mt-3 rounded-md border border-pink-300/15 bg-black/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pink-100">
          Broker-confirmation-capture integration
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-300">
          {brokerConfirmation.summary}
        </p>
        {brokerConfirmation.captured && (
          <p className="mt-2 text-xs leading-5 text-pink-100">
            Ready for future BrokerExecutionResult conversion design. This
            remains informational and does not create a BrokerExecutionResult,
            execution record, Supabase write, or trade mutation.
          </p>
        )}
        {brokerConfirmation.partial && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Partial confirmation: manual review required.
          </p>
        )}
        {brokerConfirmation.mismatch && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Confirmation mismatch: manual review required.
          </p>
        )}
        {brokerConfirmation.rejectedOrCancelled && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            Rejected/cancelled: no execution result.
          </p>
        )}
        {brokerConfirmation.blocked && (
          <p className="mt-2 text-xs leading-5 text-rose-100">
            Blocked: {brokerConfirmation.blockerMessage}
          </p>
        )}
        <LabelChips labels={brokerConfirmation.labels} tone="pink" />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            className="rounded-md border border-white/10 bg-black/25 p-3"
            key={item.label}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                {item.label}
              </p>
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${readinessTone(
                  item.status,
                )}`}
              >
                {commandLabel(item.status)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-300">
              {item.message}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
        Default gate:{" "}
        {defaultGateBlocked ? "blocked" : "unexpectedly allowed"}. Dry-run
        classification: {allowedSafetyLevel} when explicitly allowed. This
        panel has no run button, no Avanza navigation, no broker submission,
        and no trade mutation.
      </p>
    </div>
  );
}
