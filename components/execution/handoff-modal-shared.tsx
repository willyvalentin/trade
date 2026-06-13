export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-3">
      <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-2 break-words font-mono text-sm text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
      <h3 className="font-mono text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {message}
      </p>
    </div>
  );
}

export function formatAgentCommandValue(
  value: string | number | boolean | null | undefined,
) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value).replaceAll("_", " ");
}

export function formatAgentCommandLabel(value: string) {
  return value.replaceAll("_", " ").toUpperCase();
}

type Tone =
  | "emerald"
  | "fuchsia"
  | "lime"
  | "orange"
  | "pink"
  | "rose"
  | "violet";

const toneClassNames: Record<Tone, string> = {
  emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  fuchsia: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100",
  lime: "border-lime-300/20 bg-lime-300/10 text-lime-100",
  orange: "border-orange-300/20 bg-orange-300/10 text-orange-100",
  pink: "border-pink-300/20 bg-pink-300/10 text-pink-100",
  rose: "border-rose-300/20 bg-rose-300/10 text-rose-100",
  violet: "border-violet-300/20 bg-violet-300/10 text-violet-100",
};

const toneHeadingClassNames: Record<Tone, string> = {
  emerald: "text-emerald-100",
  fuchsia: "text-fuchsia-100",
  lime: "text-lime-100",
  orange: "text-orange-100",
  pink: "text-pink-100",
  rose: "text-rose-100",
  violet: "text-violet-100",
};

export function SafetyLabelList({
  labels,
  tone,
}: {
  labels: string[];
  tone: Tone;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${toneClassNames[tone]}`}
          key={label}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

type FieldCheck = {
  actual?: string;
  expected?: string;
  field: string;
  message?: string;
  required?: boolean;
  status: string;
};

export function FieldChecksList({
  checks,
  headingClassName,
  pillTone,
}: {
  checks: FieldCheck[];
  headingClassName?: string;
  pillTone: Tone;
}) {
  if (checks.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-md border border-white/10 bg-black/25 p-3">
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${
          headingClassName ?? toneHeadingClassNames[pillTone]
        }`}
      >
        Field checks
      </p>
      <div className="mt-3 grid gap-2">
        {checks.map((check) => (
          <div
            className="rounded-md border border-white/10 bg-black/25 p-3"
            key={`${check.field}-${check.status}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-zinc-100">
                {formatAgentCommandLabel(check.field)}
              </p>
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${toneClassNames[pillTone]}`}
              >
                {formatAgentCommandLabel(check.status)}
              </span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <Detail label="Expected" value={check.expected ?? "n/a"} />
              <Detail label="Actual" value={check.actual ?? "n/a"} />
              <Detail label="Required" value={check.required ? "Yes" : "No"} />
            </div>
            {check.message && (
              <p className="mt-2 text-xs leading-5 text-zinc-400">
                {check.message}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
