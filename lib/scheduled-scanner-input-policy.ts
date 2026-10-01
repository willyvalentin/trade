import { COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION } from "@/lib/scanner-decision-input-snapshot";
import { resolveScheduledScanProviderCreditBudget, type ScheduledScanProviderCreditBudget } from "@/lib/scheduled-scan-ticker-cap";
import type { ScheduledScanInvocationReceipt } from "@/lib/scheduled-scan-invocation-receipt";

export const SCANNER_INPUT_POLICY_ENV = "TURE_SCANNER_INPUT_POLICY_VERSION" as const;

export function hasCompletedInputBudget(budget: ScheduledScanProviderCreditBudget | null) {
  const expected = resolveScheduledScanProviderCreditBudget({ planMode: "free" });
  return budget !== null && Object.entries(expected).every(([key, value]) =>
    budget[key as keyof ScheduledScanProviderCreditBudget] === value);
}

/** Input selection is not authority to run a scan. Existing scheduler/session,
 * reservation and publication gates remain authoritative. Missing configuration
 * preserves legacy behavior; a selected policy may never silently downgrade. */
export function scheduledScannerInputPolicy(input: {
  configuredVersion: string | undefined;
  requestSource: string | null;
  force: boolean;
  receipt: ScheduledScanInvocationReceipt | null;
  budget: ScheduledScanProviderCreditBudget | null;
  allocationExperimentEnabled: boolean;
  marketWideDiscoveryEnabled: boolean;
}): typeof COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION | undefined {
  const configured = input.configuredVersion?.trim() || null;
  const durable = input.receipt?.durable_invocation_payload.scanner_input_policy_version ?? null;
  if (configured === null && durable === null) return undefined;
  if (configured !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION || durable !== configured ||
      input.requestSource !== "netlify_scheduled_function" || input.force || !input.receipt ||
      !hasCompletedInputBudget(input.budget) || input.allocationExperimentEnabled || input.marketWideDiscoveryEnabled) {
    throw new Error("scheduled_scanner_input_policy_unavailable");
  }
  return COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION;
}
