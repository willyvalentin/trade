import Link from "next/link";

import { Detail } from "@/components/execution/handoff-modal-shared";
import type {
  LocalhostBridgeClientAvanzaDryRunStubResult,
  LocalhostBridgeClientCancelResult,
  LocalhostBridgeClientRunResult,
  LocalhostBridgeClientRunnerSelfCheckResult,
} from "@/lib/avanza-localhost-bridge-client";
import {
  classifyDiagnosticsCapability,
  summarizeBrowserRunnerCapabilityValidation,
  validateBrowserRunnerCapability,
} from "@/lib/browser-runner-capability-gate";

type LocalhostBridgeControlsProps = {
  canCancelLocalhostBridgeRun: boolean;
  canCheckLocalhostBridgeSelfCheck: boolean;
  canRunLocalhostBridgeDryRun: boolean;
  canRunLocalhostMockAgent: boolean;
  canTestLocalhostDryRunBridgeStub: boolean;
  dryRunRequestValid: boolean;
  isLocalhostBridgeCancelRunning: boolean;
  isLocalhostBridgeRunRunning: boolean;
  isLocalhostBridgeSelfCheckRunning: boolean;
  isLocalhostDryRunBridgeStubRunning: boolean;
  isLocalhostMockAgentRunRunning: boolean;
  localhostBridgeCancelMessage: string;
  localhostBridgeCancelResult: LocalhostBridgeClientCancelResult | null;
  localhostBridgeRunMessage: string;
  localhostBridgeRunResult: LocalhostBridgeClientRunResult | null;
  localhostBridgeSelfCheckMessage: string;
  localhostBridgeSelfCheckResult: LocalhostBridgeClientRunnerSelfCheckResult | null;
  localhostDryRunBridgeStubMessage: string;
  localhostDryRunBridgeStubResult: LocalhostBridgeClientAvanzaDryRunStubResult | null;
  localhostMockAgentRunMessage: string;
  localhostMockAgentRunResult: LocalhostBridgeClientRunResult | null;
  onCancelLocalhostBridgeEcho: () => void;
  onCheckLocalhostBridgeSelfCheck: () => void;
  onRunLocalhostBridgeEcho: () => void;
  onRunLocalhostMockAgent: () => void;
  onTestLocalhostDryRunBridgeStub: () => void;
  showDryRunBridgePreview: boolean;
  showLocalhostBridgeEchoControls: boolean;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Just now";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function agentCommandValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value).replaceAll("_", " ");
}

function shortPayloadId(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return value.length > 28 ? `${value.slice(0, 28)}...` : value;
}

function Message({ value }: { value: string }) {
  if (!value) {
    return null;
  }

  return (
    <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
      {value}
    </p>
  );
}

function LabelChips({
  className,
  labels,
}: {
  className: string;
  labels: string[];
}) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {labels.map((label) => (
        <span className={className} key={label}>
          {label}
        </span>
      ))}
    </div>
  );
}

function ListCard({
  items,
  title,
  tone,
}: {
  items: string[];
  title: string;
  tone: "amber" | "cyan" | "emerald" | "rose" | "sky";
}) {
  if (items.length === 0) {
    return null;
  }

  const cardClassName =
    tone === "cyan"
      ? "rounded-md border border-cyan-300/15 bg-black/15 p-3"
      : tone === "emerald"
        ? "rounded-md border border-emerald-300/15 bg-black/15 p-3"
        : tone === "rose"
          ? "rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3"
          : tone === "sky"
            ? "rounded-md border border-sky-300/15 bg-black/15 p-3"
            : "rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3";
  const titleClassName =
    tone === "cyan"
      ? "font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100"
      : tone === "emerald"
        ? "font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100"
        : tone === "rose"
          ? "font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100"
          : tone === "sky"
            ? "font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100"
            : "font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100";

  return (
    <div className={cardClassName}>
      <p className={titleClassName}>{title}</p>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function DryRunBridgeResponsePreview({
  canTestLocalhostDryRunBridgeStub,
  dryRunRequestValid,
  isLocalhostDryRunBridgeStubRunning,
  localhostDryRunBridgeStubMessage,
  localhostDryRunBridgeStubResult,
  onTestLocalhostDryRunBridgeStub,
}: Pick<
  LocalhostBridgeControlsProps,
  | "canTestLocalhostDryRunBridgeStub"
  | "dryRunRequestValid"
  | "isLocalhostDryRunBridgeStubRunning"
  | "localhostDryRunBridgeStubMessage"
  | "localhostDryRunBridgeStubResult"
  | "onTestLocalhostDryRunBridgeStub"
>) {
  return (
    <div className="rounded-md border border-sky-300/15 bg-sky-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
              Dry-run bridge response preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. No browser actions. No broker submission.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-sky-100 transition hover:border-sky-200 hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canTestLocalhostDryRunBridgeStub}
          onClick={(event) => {
            event.stopPropagation();
            onTestLocalhostDryRunBridgeStub();
          }}
          type="button"
        >
          {isLocalhostDryRunBridgeStubRunning
            ? "Checking..."
            : "Test dry-run bridge stub"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "No browser actions were executed",
          "No broker submission",
          "No broker result",
          "No trade mutation",
          "Stub only",
        ].map((label) => (
          <span
            className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>

      {!dryRunRequestValid && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Unavailable: invalid dry-run request.
        </p>
      )}

      <Message value={localhostDryRunBridgeStubMessage} />

      {localhostDryRunBridgeStubResult && (
        <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
          <p className="text-sm leading-6 text-zinc-200">
            {localhostDryRunBridgeStubResult.summary}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Status"
              value={
                localhostDryRunBridgeStubResult.status
                  ? agentCommandValue(localhostDryRunBridgeStubResult.status)
                  : "unknown"
              }
            />
            <Detail
              label="Client OK"
              value={localhostDryRunBridgeStubResult.ok ? "Yes" : "No"}
            />
            <Detail
              label="HTTP"
              value={
                localhostDryRunBridgeStubResult.statusCode
                  ? String(localhostDryRunBridgeStubResult.statusCode)
                  : "n/a"
              }
            />
            <Detail
              label="Elapsed"
              value={`${localhostDryRunBridgeStubResult.elapsedMs}ms`}
            />
            <Detail
              label="Request Valid"
              value={
                localhostDryRunBridgeStubResult.response
                  ?.dryRunRequestValidation.ok
                  ? "Yes"
                  : "No"
              }
            />
            <Detail
              label="Safety Level"
              value={
                localhostDryRunBridgeStubResult.response?.capabilityValidation
                  .safetyLevel ?? "n/a"
              }
            />
            <Detail
              label="Capability Blocked"
              value={
                localhostDryRunBridgeStubResult.response?.capabilityValidation
                  .blocked
                  ? "Yes"
                  : "No"
              }
            />
            <Detail
              label="Diagnostics"
              value={
                localhostDryRunBridgeStubResult.response?.diagnostics
                  ? "Present"
                  : "None"
              }
            />
          </div>

          {localhostDryRunBridgeStubResult.response?.metadata && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <Detail
                label="No Browser Actions"
                value={
                  localhostDryRunBridgeStubResult.response.metadata
                    .no_browser_actions_executed === true
                    ? "Yes"
                    : "No"
                }
              />
              <Detail
                label="No Broker Submission"
                value={
                  localhostDryRunBridgeStubResult.response.metadata
                    .no_broker_submission === true
                    ? "Yes"
                    : "No"
                }
              />
              <Detail
                label="No Broker Result"
                value={
                  localhostDryRunBridgeStubResult.response.metadata
                    .no_broker_result_created === true
                    ? "Yes"
                    : "No"
                }
              />
            </div>
          )}

          {(localhostDryRunBridgeStubResult.errors.length > 0 ||
            localhostDryRunBridgeStubResult.warnings.length > 0 ||
            (localhostDryRunBridgeStubResult.response?.dryRunRequestValidation
              .errors.length ?? 0) > 0 ||
            (localhostDryRunBridgeStubResult.response?.capabilityValidation
              .errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ListCard
                items={[
                  ...localhostDryRunBridgeStubResult.errors,
                  ...(localhostDryRunBridgeStubResult.response
                    ?.dryRunRequestValidation.errors ?? []),
                  ...(localhostDryRunBridgeStubResult.response
                    ?.capabilityValidation.errors ?? []),
                ]}
                title="Stub errors"
                tone="rose"
              />
              <ListCard
                items={localhostDryRunBridgeStubResult.warnings}
                title="Stub warnings"
                tone="amber"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LocalhostBridgeEchoControls({
  canCancelLocalhostBridgeRun,
  canCheckLocalhostBridgeSelfCheck,
  canRunLocalhostBridgeDryRun,
  canRunLocalhostMockAgent,
  isLocalhostBridgeCancelRunning,
  isLocalhostBridgeRunRunning,
  isLocalhostBridgeSelfCheckRunning,
  isLocalhostMockAgentRunRunning,
  localhostBridgeCancelMessage,
  localhostBridgeCancelResult,
  localhostBridgeRunMessage,
  localhostBridgeRunResult,
  localhostBridgeSelfCheckMessage,
  localhostBridgeSelfCheckResult,
  localhostMockAgentRunMessage,
  localhostMockAgentRunResult,
  onCancelLocalhostBridgeEcho,
  onCheckLocalhostBridgeSelfCheck,
  onRunLocalhostBridgeEcho,
  onRunLocalhostMockAgent,
}: Omit<
  LocalhostBridgeControlsProps,
  | "canTestLocalhostDryRunBridgeStub"
  | "dryRunRequestValid"
  | "isLocalhostDryRunBridgeStubRunning"
  | "localhostDryRunBridgeStubMessage"
  | "localhostDryRunBridgeStubResult"
  | "onTestLocalhostDryRunBridgeStub"
  | "showDryRunBridgePreview"
  | "showLocalhostBridgeEchoControls"
>) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
              Localhost bridge echo
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Dev only. Calls local stub server. No Avanza/browser/broker. This
            sends the existing request envelope to localhost dry-run `/run` only
            when you click.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
            localhostBridgeRunResult?.ok
              ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
              : localhostBridgeRunResult
                ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                : "border-white/10 bg-white/[0.04] text-zinc-500"
          }`}
        >
          {localhostBridgeRunResult?.ok
            ? "Echo complete"
            : localhostBridgeRunResult
              ? "Needs attention"
              : "Not run"}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-zinc-500">
          Requires the local stub from{" "}
          <span className="font-mono text-zinc-300">
            npm run bridge:localhost
          </span>
          . It never creates a broker record or changes the trade.
        </p>
        <button
          type="button"
          disabled={!canRunLocalhostBridgeDryRun}
          onClick={(event) => {
            event.stopPropagation();
            onRunLocalhostBridgeEcho();
          }}
          className="min-h-10 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
        >
          {isLocalhostBridgeRunRunning
            ? "Running localhost echo"
            : "Run localhost bridge echo"}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-md border border-sky-300/15 bg-sky-300/[0.045] p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-zinc-300">
          Dev only. Calls local stub{" "}
          <span className="font-mono text-zinc-100">/self-check</span> for
          runner readiness metadata. No browser opens, no Avanza page is
          touched, and no dry-run starts.
        </p>
        <button
          type="button"
          disabled={!canCheckLocalhostBridgeSelfCheck}
          onClick={(event) => {
            event.stopPropagation();
            onCheckLocalhostBridgeSelfCheck();
          }}
          className="min-h-10 rounded-md border border-sky-300/25 bg-sky-300/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100 transition hover:border-sky-200/50 hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
        >
          {isLocalhostBridgeSelfCheckRunning
            ? "Checking runner self-check"
            : "Check localhost runner self-check"}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-zinc-300">
          Dev only. Opens/fills local mock broker page through localhost bridge.
          Not Avanza. No submit. No brokerResult.
        </p>
        <button
          type="button"
          disabled={!canRunLocalhostMockAgent}
          onClick={(event) => {
            event.stopPropagation();
            onRunLocalhostMockAgent();
          }}
          className="min-h-10 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/50 hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
        >
          {isLocalhostMockAgentRunRunning
            ? "Running mock agent"
            : "Run localhost mock agent"}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-md border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-zinc-500">
          Dev only. Calls local stub `/cancel`. Does not cancel a real broker
          action, Avanza session, order, or trade.
        </p>
        <button
          type="button"
          disabled={!canCancelLocalhostBridgeRun}
          onClick={(event) => {
            event.stopPropagation();
            onCancelLocalhostBridgeEcho();
          }}
          className="min-h-10 rounded-md border border-amber-300/25 bg-amber-300/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
        >
          {isLocalhostBridgeCancelRunning
            ? "Cancelling localhost stub"
            : "Cancel localhost bridge run"}
        </button>
      </div>

      <Message value={localhostBridgeRunMessage} />
      <Message value={localhostBridgeSelfCheckMessage} />
      <Message value={localhostMockAgentRunMessage} />
      <Message value={localhostBridgeCancelMessage} />

      {localhostBridgeSelfCheckResult && (
        <div className="mt-4 rounded-md border border-sky-300/15 bg-sky-300/[0.04] p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
                Localhost runner self-check
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {localhostBridgeSelfCheckResult.response?.message ??
                  "Localhost runner self-check finished safely. No browser action occurred."}
              </p>
            </div>
            <span className="w-fit rounded-full border border-sky-300/25 bg-sky-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
              {localhostBridgeSelfCheckResult.response?.selfCheck.status ??
                "unreachable"}
            </span>
          </div>

          <p className="mt-3 rounded-md border border-sky-300/15 bg-black/20 p-3 text-xs leading-5 text-sky-100">
            Self-check only. This does not open Avanza, does not control a
            browser, does not submit orders, and does not create broker results.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Reachable"
              value={localhostBridgeSelfCheckResult.reachable ? "Yes" : "No"}
            />
            <Detail
              label="HTTP OK"
              value={localhostBridgeSelfCheckResult.ok ? "Yes" : "No"}
            />
            <Detail
              label="Self-check OK"
              value={
                localhostBridgeSelfCheckResult.response?.selfCheck.ok
                  ? "Yes"
                  : "No"
              }
            />
            <Detail
              label="Status"
              value={
                localhostBridgeSelfCheckResult.response?.selfCheck.status ?? "—"
              }
            />
            <Detail
              label="Safety Level"
              value={
                localhostBridgeSelfCheckResult.response?.selfCheck
                  .capabilityValidation.safetyLevel ?? "—"
              }
            />
            <Detail
              label="Can run Avanza dry-run"
              value={
                localhostBridgeSelfCheckResult.response?.selfCheck
                  .capabilityValidation.canRunAvanzaDryRun
                  ? "Yes"
                  : "No"
              }
            />
            <Detail
              label="Can submit broker order"
              value={
                localhostBridgeSelfCheckResult.response?.selfCheck
                  .capabilityValidation.canSubmitBrokerOrder
                  ? "Unexpectedly yes"
                  : "No"
              }
            />
            <Detail
              label="Base URL"
              value={localhostBridgeSelfCheckResult.baseUrl}
            />
            <Detail
              label="Checked"
              value={formatDate(localhostBridgeSelfCheckResult.checkedAt)}
            />
          </div>

          <LabelChips
            className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100"
            labels={
              localhostBridgeSelfCheckResult.response?.selfCheck
                .readinessLabels ?? []
            }
          />

          <ListCard
            items={
              localhostBridgeSelfCheckResult.response?.selfCheck.blockers ?? []
            }
            title="Self-check blockers"
            tone="amber"
          />

          {(localhostBridgeSelfCheckResult.errors.length > 0 ||
            localhostBridgeSelfCheckResult.warnings.length > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ListCard
                items={localhostBridgeSelfCheckResult.errors}
                title="Self-check errors"
                tone="amber"
              />
              <ListCard
                items={localhostBridgeSelfCheckResult.warnings}
                title="Self-check warnings"
                tone="sky"
              />
            </div>
          )}
        </div>
      )}

      {localhostBridgeRunResult && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                Localhost bridge echo result
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {localhostBridgeRunResult.response?.message ??
                  "Localhost bridge echo finished safely. No broker action occurred."}
              </p>
            </div>
            <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              {localhostBridgeRunResult.ok ? "OK" : "Safe stop"}
            </span>
          </div>

          <p className="mt-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.06] p-3 text-xs leading-5 text-cyan-100">
            Localhost bridge stub only. Avanza was not opened, no browser
            automation ran, no order was prepared or submitted, and no broker
            result was created.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Reachable"
              value={localhostBridgeRunResult.reachable ? "Yes" : "No"}
            />
            <Detail
              label="OK"
              value={localhostBridgeRunResult.ok ? "Yes" : "No"}
            />
            <Detail
              label="Status Code"
              value={
                typeof localhostBridgeRunResult.statusCode === "number"
                  ? String(localhostBridgeRunResult.statusCode)
                  : "—"
              }
            />
            <Detail
              label="Accepted"
              value={
                typeof localhostBridgeRunResult.response?.accepted === "boolean"
                  ? localhostBridgeRunResult.response.accepted
                    ? "Yes"
                    : "No"
                  : "—"
              }
            />
            <Detail
              label="Result Status"
              value={
                localhostBridgeRunResult.result?.status
                  ? agentCommandValue(localhostBridgeRunResult.result.status)
                  : "—"
              }
            />
            <Detail
              label="Progress Events"
              value={
                localhostBridgeRunResult.result
                  ? String(
                      localhostBridgeRunResult.result.progressEvents.length,
                    )
                  : "0"
              }
            />
            <Detail
              label="Broker Result"
              value={
                localhostBridgeRunResult.result?.brokerResult
                  ? "Unexpected result present"
                  : "Absent"
              }
            />
            <Detail
              label="Mock Page"
              value={
                localhostBridgeRunResult.response?.mockOrderPageAvailable
                  ? "Available"
                  : "Not provided"
              }
            />
            <Detail
              label="Mock Fill Plan"
              value={
                typeof localhostBridgeRunResult.response
                  ?.mockOrderFillPlanValid === "boolean"
                  ? localhostBridgeRunResult.response.mockOrderFillPlanValid
                    ? "Valid"
                    : "Invalid"
                  : "Not provided"
              }
            />
            <Detail label="Base URL" value={localhostBridgeRunResult.baseUrl} />
            <Detail
              label="Completed"
              value={formatDate(localhostBridgeRunResult.completedAt)}
            />
          </div>

          {localhostBridgeRunResult.response?.mockOrderPageUrl && (
            <div className="mt-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                Mock order page fill plan
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-300">
                {localhostBridgeRunResult.response.mockOrderPageMessage ??
                  "Mock order fill plan generated for local testing only. No browser was opened."}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all font-mono text-xs text-zinc-400">
                  {localhostBridgeRunResult.response.mockOrderPageUrl}
                </span>
                <Link
                  className="inline-flex w-fit rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/15"
                  href={localhostBridgeRunResult.response.mockOrderPageUrl}
                >
                  Open mock order page
                </Link>
              </div>
            </div>
          )}

          <ListCard
            items={
              localhostBridgeRunResult.response?.mockOrderFillPlanErrors ?? []
            }
            title="Mock fill plan errors"
            tone="amber"
          />

          {localhostBridgeRunResult.response?.mockOrderFillPlan && (
            <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
              <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                Mock fill plan JSON - dry-run only
              </summary>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
                {JSON.stringify(
                  localhostBridgeRunResult.response.mockOrderFillPlan,
                  null,
                  2,
                )}
              </pre>
            </details>
          )}

          {(localhostBridgeRunResult.errors.length > 0 ||
            localhostBridgeRunResult.warnings.length > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ListCard
                items={localhostBridgeRunResult.errors}
                title="Localhost errors"
                tone="amber"
              />
              <ListCard
                items={localhostBridgeRunResult.warnings}
                title="Localhost warnings"
                tone="cyan"
              />
            </div>
          )}
        </div>
      )}

      {localhostMockAgentRunResult && (
        <div className="mt-4 rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                Localhost mock agent result
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {localhostMockAgentRunResult.response?.mockAgentRunMessage ??
                  localhostMockAgentRunResult.response?.message ??
                  "Localhost mock agent finished safely. No broker action occurred."}
              </p>
            </div>
            <span className="w-fit rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
              {localhostMockAgentRunResult.ok ? "OK" : "Safe stop"}
            </span>
          </div>

          <p className="mt-3 rounded-md border border-emerald-300/15 bg-black/20 p-3 text-xs leading-5 text-emerald-100">
            Localhost mock agent only. It targets the dev-only mock broker page,
            clicks only Review mock order, verifies disabled submit, and creates
            no broker result.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Reachable"
              value={localhostMockAgentRunResult.reachable ? "Yes" : "No"}
            />
            <Detail
              label="OK"
              value={localhostMockAgentRunResult.ok ? "Yes" : "No"}
            />
            <Detail
              label="Accepted"
              value={
                typeof localhostMockAgentRunResult.response?.accepted ===
                "boolean"
                  ? localhostMockAgentRunResult.response.accepted
                    ? "Yes"
                    : "No"
                  : "—"
              }
            />
            <Detail
              label="Result Status"
              value={
                localhostMockAgentRunResult.result?.status
                  ? agentCommandValue(localhostMockAgentRunResult.result.status)
                  : "—"
              }
            />
            <Detail
              label="Broker Result"
              value={
                localhostMockAgentRunResult.result?.brokerResult
                  ? "Unexpected result present"
                  : "Absent"
              }
            />
            <Detail
              label="Mock Agent Attempted"
              value={
                localhostMockAgentRunResult.response?.mockAgentRunAttempted
                  ? "Yes"
                  : "No"
              }
            />
            <Detail
              label="Mock Agent OK"
              value={
                typeof localhostMockAgentRunResult.response?.mockAgentRunOk ===
                "boolean"
                  ? localhostMockAgentRunResult.response.mockAgentRunOk
                    ? "Yes"
                    : "No"
                  : "—"
              }
            />
            <Detail
              label="Order Mode Verified"
              value={
                typeof localhostMockAgentRunResult.response
                  ?.mockAgentRunOrderModeVerified === "boolean"
                  ? localhostMockAgentRunResult.response
                      .mockAgentRunOrderModeVerified
                    ? "Yes"
                    : "No"
                  : "—"
              }
            />
            <Detail
              label="Review Visible"
              value={
                typeof localhostMockAgentRunResult.response
                  ?.mockAgentRunReviewVisible === "boolean"
                  ? localhostMockAgentRunResult.response.mockAgentRunReviewVisible
                    ? "Yes"
                    : "No"
                  : "—"
              }
            />
            <Detail
              label="Confirmation Link"
              value={
                typeof localhostMockAgentRunResult.response
                  ?.mockAgentRunConfirmationLinkAvailable === "boolean"
                  ? localhostMockAgentRunResult.response
                      .mockAgentRunConfirmationLinkAvailable
                    ? "Available"
                    : "Missing"
                  : "—"
              }
            />
            <Detail
              label="Submit Disabled"
              value={
                typeof localhostMockAgentRunResult.response
                  ?.mockAgentRunSubmitDisabled === "boolean"
                  ? localhostMockAgentRunResult.response.mockAgentRunSubmitDisabled
                    ? "Yes"
                    : "No"
                  : "—"
              }
            />
            <Detail
              label="Started"
              value={
                localhostMockAgentRunResult.response?.mockAgentRunStartedAt
                  ? formatDate(
                      localhostMockAgentRunResult.response
                        .mockAgentRunStartedAt,
                    )
                  : "—"
              }
            />
            <Detail
              label="Completed"
              value={
                localhostMockAgentRunResult.response?.mockAgentRunCompletedAt
                  ? formatDate(
                      localhostMockAgentRunResult.response
                        .mockAgentRunCompletedAt,
                    )
                  : formatDate(localhostMockAgentRunResult.completedAt)
              }
            />
            <Detail
              label="Safe Diagnostics"
              value={
                localhostMockAgentRunResult.response
                  ?.safeActionDiagnosticsAvailable
                  ? "Available"
                  : "Not provided"
              }
            />
          </div>

          {localhostMockAgentRunResult.response?.safeActionDiagnostics && (
            <div className="mt-3 rounded-md border border-teal-300/15 bg-teal-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-teal-100">
                Safe action diagnostics
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-300">
                {localhostMockAgentRunResult.response
                  .safeActionDiagnosticsMessage ??
                  "Safe action diagnostics generated for local mock-page testing only."}{" "}
                Safe action diagnostics saved locally.
              </p>
              {(() => {
                const capability = classifyDiagnosticsCapability(
                  localhostMockAgentRunResult.response.safeActionDiagnostics,
                );
                const allowAvanzaDryRun =
                  capability.targetEnvironment === "avanza_broker" &&
                  capability.metadata?.dryRunOnly === true;
                const validation = validateBrowserRunnerCapability(capability, {
                  allowAvanzaDryRun,
                });
                const isAvanzaDryRun =
                  validation.safetyLevel === "dry_run_only" &&
                  validation.ok &&
                  validation.canRunAvanzaDryRun;
                const capabilityLabel =
                  validation.safetyLevel === "safe_mock_only" && validation.ok
                    ? "Mock-only browser diagnostics"
                    : isAvanzaDryRun
                      ? "Avanza dry-run diagnostics"
                      : validation.safetyLevel;

                return (
                  <p
                    className={`mt-3 rounded-md border p-3 text-xs leading-5 ${
                      validation.ok
                        ? "border-teal-300/15 bg-teal-300/[0.06] text-teal-100"
                        : "border-amber-300/20 bg-amber-300/[0.06] text-amber-100"
                    }`}
                  >
                    {capabilityLabel}. No broker submission. Final confirm
                    disabled. Capability gate:{" "}
                    {summarizeBrowserRunnerCapabilityValidation(validation)}.
                  </p>
                );
              })()}
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Detail
                  label="Diagnostics OK"
                  value={
                    localhostMockAgentRunResult.response.safeActionDiagnostics
                      .ok
                      ? "Yes"
                      : "No"
                  }
                />
                <Detail
                  label="Runner"
                  value={
                    localhostMockAgentRunResult.response.safeActionDiagnostics
                      .runnerName
                  }
                />
                <Detail
                  label="Executed"
                  value={String(
                    localhostMockAgentRunResult.response.safeActionDiagnostics
                      .executedCount,
                  )}
                />
                <Detail
                  label="Blocked"
                  value={String(
                    localhostMockAgentRunResult.response.safeActionDiagnostics
                      .blockedCount,
                  )}
                />
                <Detail
                  label="Failed"
                  value={String(
                    localhostMockAgentRunResult.response.safeActionDiagnostics
                      .failedCount,
                  )}
                />
                <Detail
                  label="Final Confirm Blocked"
                  value={
                    localhostMockAgentRunResult.response.safeActionDiagnostics
                      .finalConfirmBlocked
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </div>
          )}

          <ListCard
            items={localhostMockAgentRunResult.response?.mockAgentRunErrors ?? []}
            title="Mock agent run errors"
            tone="amber"
          />
          <ListCard
            items={
              localhostMockAgentRunResult.response
                ?.mockAgentRunValidationErrors ?? []
            }
            title="Mock validation errors"
            tone="amber"
          />

          {(localhostMockAgentRunResult.errors.length > 0 ||
            localhostMockAgentRunResult.warnings.length > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ListCard
                items={localhostMockAgentRunResult.errors}
                title="Localhost mock-agent errors"
                tone="amber"
              />
              <ListCard
                items={localhostMockAgentRunResult.warnings}
                title="Localhost mock-agent warnings"
                tone="emerald"
              />
            </div>
          )}
        </div>
      )}

      {localhostBridgeCancelResult && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                Localhost bridge cancel result
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {localhostBridgeCancelResult.response?.message ??
                  "Localhost bridge cancel finished safely. No broker action was cancelled."}
              </p>
            </div>
            <span className="w-fit rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              {localhostBridgeCancelResult.ok ? "Acknowledged" : "Safe stop"}
            </span>
          </div>

          <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
            Localhost bridge cancel stub only. No Avanza session, browser
            automation, broker order, or trade state was cancelled.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Reachable"
              value={localhostBridgeCancelResult.reachable ? "Yes" : "No"}
            />
            <Detail
              label="OK"
              value={localhostBridgeCancelResult.ok ? "Yes" : "No"}
            />
            <Detail
              label="Status Code"
              value={
                typeof localhostBridgeCancelResult.statusCode === "number"
                  ? String(localhostBridgeCancelResult.statusCode)
                  : "—"
              }
            />
            <Detail
              label="Cancelled"
              value={
                typeof localhostBridgeCancelResult.cancelled === "boolean"
                  ? localhostBridgeCancelResult.cancelled
                    ? "Yes"
                    : "No"
                  : "—"
              }
            />
            <Detail
              label="Request"
              value={
                localhostBridgeCancelResult.response?.requestId
                  ? shortPayloadId(
                      localhostBridgeCancelResult.response.requestId,
                    )
                  : "—"
              }
            />
            <Detail
              label="Base URL"
              value={localhostBridgeCancelResult.baseUrl}
            />
          </div>

          <ListCard
            items={localhostBridgeCancelResult.errors}
            title="Localhost cancel errors"
            tone="amber"
          />
        </div>
      )}
    </div>
  );
}

export function LocalhostBridgeControls({
  showDryRunBridgePreview,
  showLocalhostBridgeEchoControls,
  ...props
}: LocalhostBridgeControlsProps) {
  return (
    <>
      {showDryRunBridgePreview && <DryRunBridgeResponsePreview {...props} />}
      {showLocalhostBridgeEchoControls && <LocalhostBridgeEchoControls {...props} />}
    </>
  );
}
