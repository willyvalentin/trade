import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  AvanzaHandoffPreActivationSourceModeInput,
} from "../../lib/avanza-handoff-pre-activation-gate";
import {
  buildAvanzaHandoffPreActivationGate,
} from "../../lib/avanza-handoff-pre-activation-gate";
import {
  avanzaGameStopHandoffPreActivationGateFixture,
  avanzaGameStopHandoffPreviewSourceModeFixture,
  avanzaGameStopHandoffSafetyBoundarySummaryFixture,
  avanzaGameStopSelectedRecommendationHandoffContractFixture,
  avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture,
} from "../../lib/avanza-handoff-package-preview-fixtures";
import {
  avanzaTradeReadOnlyReadinessSummaryFixture,
} from "../../lib/avanza-read-only-readiness-fixtures";
import type {
  AvanzaSelectedRecommendationHandoffContract,
} from "../../lib/avanza-selected-recommendation-handoff-contract";

const repoRoot = process.cwd();

const devCandidateSourceMode: AvanzaHandoffPreActivationSourceModeInput = {
  activeMode: "future_dev_only_candidate",
  bridgeCallsAllowed: true,
  executionAllowed: true,
  label: "Future dev-only candidate",
  realSelectedRecommendationStateAllowed: true,
  reason: "Test-only candidate source mode.",
  selectedRecommendationWiring: "future_dev_only",
  status: "future",
  tradeUiLocalhostFetchAllowed: true,
};

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function devContract(
  overrides: Partial<AvanzaSelectedRecommendationHandoffContract> = {},
) {
  return {
    ...avanzaGameStopSelectedRecommendationHandoffContractFixture,
    previewOnly: false,
    ...overrides,
  } as unknown as AvanzaSelectedRecommendationHandoffContract;
}

test.describe("Avanza handoff pre-activation gate", () => {
  test("current static fixture gate is locked", () => {
    expect(avanzaGameStopHandoffPreActivationGateFixture.gateStatus).toBe(
      "locked",
    );
    expect(avanzaGameStopHandoffPreActivationGateFixture.label).toBe(
      "Pre-activation gate: Locked",
    );
    expect(avanzaGameStopHandoffPreActivationGateFixture.reasons).toContain(
      "Static fixture source",
    );
    expect(avanzaGameStopHandoffPreActivationGateFixture.reasons).toContain(
      "Selected recommendation wiring disabled",
    );
    expect(avanzaGameStopHandoffPreActivationGateFixture.reasons).toContain(
      "Preview-only contract",
    );
    expect(avanzaGameStopHandoffPreviewSourceModeFixture.activeMode).toBe(
      "static_fixture",
    );
  });

  test("blocked contract produces blocked when future dev-only source is modeled", () => {
    const contract = devContract({
      items: [
        {
          id: "ticker_present",
          label: "Ticker present",
          status: "blocked",
        },
      ],
    });
    const gate = buildAvanzaHandoffPreActivationGate({
      contract,
      eligibilitySummary: {
        ...avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture,
        blockedCount: 1,
        status: "blocked",
      },
      readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
      safetyBoundarySummary: avanzaGameStopHandoffSafetyBoundarySummaryFixture,
      sourceMode: devCandidateSourceMode,
    });

    expect(gate.gateStatus).toBe("blocked");
    expect(gate.severity).toBe("danger");
    expect(gate.blockers).toContain("Ticker present");
  });

  test("advisory-only total-read does not produce execution-ready status", () => {
    const contract = devContract({
      items: [
        {
          id: "total_read_unresolved_advisory",
          label: "Total-read unresolved/advisory",
          status: "advisory",
        },
      ],
    });
    const gate = buildAvanzaHandoffPreActivationGate({
      contract,
      eligibilitySummary:
        avanzaGameStopSelectedRecommendationHandoffEligibilitySummaryFixture,
      readinessSummary: avanzaTradeReadOnlyReadinessSummaryFixture,
      safetyBoundarySummary: avanzaGameStopHandoffSafetyBoundarySummaryFixture,
      sourceMode: devCandidateSourceMode,
    });

    expect(gate.gateStatus).toBe("advisory_only");
    expect(gate.severity).toBe("warning");
    expect(gate.advisories).toContain("Total-read unresolved/advisory");
    expect(gate.label).not.toMatch(/production ready/i);
  });

  test("no gate status says production ready", () => {
    const statuses = [
      avanzaGameStopHandoffPreActivationGateFixture.gateStatus,
      "locked",
      "blocked",
      "advisory_only",
      "candidate_for_dev_enablement",
    ];

    for (const status of statuses) {
      expect(status).not.toMatch(/production/i);
      expect(status).not.toMatch(/ready_for_execution/i);
    }
  });

  test("card renders locked gate summary from the static fixture", () => {
    const cardSource = readRepoFile(
      "components/execution/AvanzaHandoffPackagePreviewCard.tsx",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");
    const avanzaPreviewCallSite =
      tradeSource.match(
        /<AvanzaHandoffPackagePreviewCard[\s\S]*?\/>/,
      )?.[0] ?? "";

    expect(cardSource).toContain("preActivationGate.label");
    expect(cardSource).toContain("preActivationGate.gateStatus");
    expect(cardSource).toContain("No gate result is production readiness");
    expect(avanzaPreviewCallSite).toContain(
      "preActivationGate={avanzaGameStopHandoffPreActivationGateFixture}",
    );
  });

  test("helper is pure and contains no live bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile("lib/avanza-handoff-pre-activation-gate.ts");

    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
