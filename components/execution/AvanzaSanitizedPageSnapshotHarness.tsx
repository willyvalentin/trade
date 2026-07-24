import {
  avanzaSanitizedPageSnapshotFixtures,
  type AvanzaSanitizedPageSnapshotFixture,
} from "@/lib/avanza-sanitized-page-snapshot-fixtures";

type AvanzaSanitizedPageSnapshotHarnessProps = {
  fixtures?: readonly AvanzaSanitizedPageSnapshotFixture[];
};

function formatBoolean(value: boolean) {
  return value ? "true" : "false";
}

function formatList(values: readonly string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function AvanzaSanitizedPageSnapshotHarness({
  fixtures = avanzaSanitizedPageSnapshotFixtures,
}: AvanzaSanitizedPageSnapshotHarnessProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Avanza sanitized page snapshot intake",
            "Fixture only",
            "Manual/sanitized signals only",
            "No credentials",
            "No cookies/session",
            "No BankID QR",
            "No account numbers",
            "No route path exposure",
            "No Avanza navigation",
            "No login",
            "No form fill",
            "No click",
            "No order submission",
            "Safe for selector/state planning only",
            "Final human confirmation required",
            "Not production ready",
          ].map((copy) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={copy}
            >
              {copy}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-100">
          Sanitized Avanza page snapshot fixtures
        </h3>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Static fixture results only. This harness renders manually sanitized
          screenshot or DOM notes for selector and state planning. It does not
          navigate to Avanza, log in, handle credentials, read cookies, export
          sessions, fill forms, click, submit orders, automate BankID, expose
          route paths, or write execution records.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => {
          const snapshot = fixture.snapshot;

          return (
            <article
              className="rounded-md border border-white/10 bg-white/[0.02] p-3"
              key={fixture.fixtureId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {fixture.fixtureId}: {fixture.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {snapshot.canUseAsFixture
                      ? "Sanitized snapshot is fixture-safe."
                      : "Snapshot contains redacted sensitive material and is blocked for fixture reuse."}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {snapshot.kind}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Fixture id", fixture.fixtureId],
                  ["Expected kind", fixture.expectedKind],
                  ["kind", snapshot.kind],
                  ["source", snapshot.source],
                  ["snapshotId", snapshot.snapshotId],
                  ["createdAt", snapshot.createdAt],
                  ["observedUrlKind", snapshot.observedUrlKind],
                  ["titleText", snapshot.titleText ?? "none"],
                  ["visibleTextSignals", formatList(snapshot.visibleTextSignals)],
                  ["formLabels", formatList(snapshot.formLabels)],
                  ["inputPlaceholders", formatList(snapshot.inputPlaceholders)],
                  ["buttonTexts", formatList(snapshot.buttonTexts)],
                  [
                    "detectedSensitiveTokens",
                    formatList(snapshot.detectedSensitiveTokens),
                  ],
                  ["redactionNotes", formatList(snapshot.redactionNotes)],
                  ["warnings", formatList(snapshot.warnings)],
                  ["blockedReasons", formatList(snapshot.blockedReasons)],
                  ["sanitized", formatBoolean(snapshot.sanitized)],
                  [
                    "containsCredentials",
                    formatBoolean(snapshot.containsCredentials),
                  ],
                  ["containsPassword", formatBoolean(snapshot.containsPassword)],
                  [
                    "containsPersonalIdentityNumber",
                    formatBoolean(snapshot.containsPersonalIdentityNumber),
                  ],
                  [
                    "containsAccountNumber",
                    formatBoolean(snapshot.containsAccountNumber),
                  ],
                  ["containsCookie", formatBoolean(snapshot.containsCookie)],
                  [
                    "containsSessionToken",
                    formatBoolean(snapshot.containsSessionToken),
                  ],
                  ["containsBankIdQr", formatBoolean(snapshot.containsBankIdQr)],
                  [
                    "containsBrokerSecret",
                    formatBoolean(snapshot.containsBrokerSecret),
                  ],
                  ["canStoreInDocs", formatBoolean(snapshot.canStoreInDocs)],
                  ["canUseAsFixture", formatBoolean(snapshot.canUseAsFixture)],
                  [
                    "canUseForSelectorPlanning",
                    formatBoolean(snapshot.canUseForSelectorPlanning),
                  ],
                  [
                    "canUseForLoginPlanning",
                    formatBoolean(snapshot.canUseForLoginPlanning),
                  ],
                  [
                    "canUseForOrderPlanning",
                    formatBoolean(snapshot.canUseForOrderPlanning),
                  ],
                  ["canBypassBankId", formatBoolean(snapshot.canBypassBankId)],
                  ["canSubmitOrder", formatBoolean(snapshot.canSubmitOrder)],
                  ["userMustConfirm", formatBoolean(snapshot.userMustConfirm)],
                  [
                    "finalHumanClickRequired",
                    formatBoolean(snapshot.finalHumanClickRequired),
                  ],
                ].map(([label, value]) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-2"
                    key={label}
                  >
                    <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                      {label}
                    </dt>
                    <dd className="mt-1 font-semibold text-zinc-200">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
