import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT,
  resolveScannerProviderCreditAllocationLiveExperiment,
} from "@/lib/scanner-provider-credit-allocation-live-experiment";
import {
  SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
  SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
} from "@/lib/scanner-provider-credit-allocation-shadow";

const revision = "a".repeat(40);

function resolveExperiment(
  overrides: Partial<
    Parameters<typeof resolveScannerProviderCreditAllocationLiveExperiment>[0]
  > = {},
) {
  return resolveScannerProviderCreditAllocationLiveExperiment({
    enabled: true,
    experimentId:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.experiment_id,
    scheduledSlotUtc: "2026-10-01T13:45:00.000Z",
    now: new Date("2026-10-01T13:45:30.000Z"),
    expectedRevision: revision,
    deployedRevision: revision,
    ...overrides,
  });
}

test("freezes a balanced prospective switchback under the existing provider cap", () => {
  const contract =
    SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT;
  expect(contract).toMatchObject({
    evidence_mode: "prospective_live_data_fitness_switchback",
    trading_date: "2026-10-01",
    scanner_provider_credit_cap: 6,
    total_provider_credit_cap_per_attempt: 8,
    max_attempts: 6,
    max_total_provider_credits: 48,
    baseline_policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    challenger_policy_version: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
    rollback_policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    population: {
      selection_mode: "scheduled_rotating",
      expected_candidates_per_attempt: 8,
      exact_population_fingerprint_required: true,
      non_terminal_attempts_retained_in_denominator: true,
    },
  });
  expect(contract.slots.filter((slot) => slot.arm === "baseline")).toHaveLength(3);
  expect(contract.slots.filter((slot) => slot.arm === "challenger")).toHaveLength(3);
  expect(contract.slots.map((slot) => `${slot.pair}:${slot.arm}`)).toEqual([
    "1:baseline",
    "1:challenger",
    "2:challenger",
    "2:baseline",
    "3:baseline",
    "3:challenger",
  ]);
});

test("is default-off and retains baseline rollback without provider authority", () => {
  const result = resolveExperiment({ enabled: false });
  expect(result).toMatchObject({
    status: "disabled",
    selected_policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    authority: {
      can_select_allocation_policy: false,
      can_call_provider: false,
      can_change_ranking_or_publication: false,
      can_lower_threshold: false,
      can_publish_candidate: false,
      can_execute_broker_action: false,
    },
  });
});

test("admits only the exact revision-bound slot assignment", () => {
  expect(resolveExperiment()).toMatchObject({
    status: "admitted",
    slot: { arm: "baseline", pair: 1 },
    selected_policy_version: SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    expected_revision: revision,
    authority: { can_select_allocation_policy: true, can_call_provider: false },
  });
  expect(
    resolveExperiment({
      scheduledSlotUtc: "2026-10-01T14:00:00.000Z",
      now: new Date("2026-10-01T14:02:00.000Z"),
    }),
  ).toMatchObject({
    status: "admitted",
    slot: { arm: "challenger", pair: 1 },
    selected_policy_version: SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
  });
});

test("fails closed on undeclared time, expiry, identity or revision drift", () => {
  const cases = [
    resolveExperiment({
      scheduledSlotUtc: "2026-10-01T14:15:00.000Z",
      now: new Date("2026-10-01T14:15:30.000Z"),
    }),
    resolveExperiment({ now: new Date("2026-10-01T14:00:00.000Z") }),
    resolveExperiment({ experimentId: "different" }),
    resolveExperiment({ deployedRevision: "b".repeat(40) }),
    resolveExperiment({ expectedRevision: null }),
    resolveExperiment({
      scheduledSlotUtc: "2026-10-01T17:15:00.000Z",
      now: new Date("2026-10-01T17:30:00.000Z"),
    }),
  ];
  expect(cases.every((result) => result.status === "blocked")).toBe(true);
  expect(
    cases.every(
      (result) => result.authority.can_select_allocation_policy === false,
    ),
  ).toBe(true);
  expect(
    cases.every(
      (result) =>
        result.selected_policy_version ===
        SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
    ),
  ).toBe(true);
});

test("the contract module is provider-free and has no environment or I/O authority", () => {
  const source = readFileSync(
    resolve(
      process.cwd(),
      "lib/scanner-provider-credit-allocation-live-experiment.ts",
    ),
    "utf8",
  );
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("getServerSupabaseClient");
  expect(source).not.toContain("getDailyCandles");
});
