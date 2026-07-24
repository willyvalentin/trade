import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaDevOnlyPreviewEnablementCandidateChecklist,
  avanzaDevOnlyPreviewEnablementDefaultChecklist,
  buildAvanzaDevOnlyPreviewEnablementChecklist,
} from "../../lib/avanza-dev-only-preview-enablement-checklist";
import {
  avanzaDevOnlyPreviewEnablementCandidateState,
  avanzaDevOnlyPreviewEnablementDefaultState,
  avanzaDevOnlyPreviewEnablementProductionForbiddenState,
} from "../../lib/avanza-dev-only-preview-enablement-state";
import {
  avanzaDevPreviewFlagExplicitTestFixtureConfig,
  avanzaDevPreviewFlagProductionForbiddenConfig,
} from "../../lib/avanza-dev-preview-flag-config";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza dev/test preview flag status panel", () => {
  test("panel renders composed default disabled state", () => {
    const source = readRepoFile(
      "components/execution/AvanzaDevPreviewFlagStatusPanel.tsx",
    );

    expect(avanzaDevOnlyPreviewEnablementDefaultState.overallStatus).toBe(
      "disabled",
    );
    expect(
      avanzaDevOnlyPreviewEnablementDefaultState.previewFlagConfig
        .explicitPreviewOnlyFlag,
    ).toBe(false);
    expect(source).toContain("explicitPreviewOnlyFlag");
    expect(source).toContain("enablementState?.overallStatus");
    expect(source).toContain("resolvedPreviewFlagConfig.explicitPreviewOnlyFlag");
  });

  test("default renders selectedRecommendation preview disabled by default", () => {
    const source = readRepoFile(
      "components/execution/AvanzaDevPreviewFlagStatusPanel.tsx",
    );

    expect(
      avanzaDevOnlyPreviewEnablementDefaultState
        .canRenderSelectedRecommendationPreview,
    ).toBe(false);
    expect(source).toContain(
      "selectedRecommendation preview disabled by default",
    );
  });

  test("default checklist status renders not_allowed", () => {
    const source = readRepoFile(
      "components/execution/AvanzaDevPreviewFlagStatusPanel.tsx",
    );

    expect(
      avanzaDevOnlyPreviewEnablementDefaultState.enablementChecklist.status,
    ).toBe("not_allowed");
    expect(avanzaDevOnlyPreviewEnablementDefaultChecklist.status).toBe(
      "not_allowed",
    );
    expect(source).toContain("resolvedChecklist.status");
    expect(source).toContain("resolvedChecklist.reason");
  });

  test("panel renders composed candidate_for_dev_preview state", () => {
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.overallStatus,
    ).toBe("candidate_for_dev_preview");
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.previewFlagConfig
        .explicitPreviewOnlyFlag,
    ).toBe(true);
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState
        .canRenderSelectedRecommendationPreview,
    ).toBe(true);
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.integrationGuard.status,
    ).toBe("preview_only_allowed");
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.preWiringChecklist.summary
        .status,
    ).toBe("candidate_for_preview_only_wiring");
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.enablementChecklist.status,
    ).toBe("candidate_for_dev_preview");
  });

  test("panel renders production-forbidden blocked state", () => {
    expect(
      avanzaDevOnlyPreviewEnablementProductionForbiddenState.overallStatus,
    ).toBe("blocked");
    expect(
      avanzaDevOnlyPreviewEnablementProductionForbiddenState.previewFlagConfig
        .environmentScope,
    ).toBe("production_forbidden");
    expect(
      avanzaDevOnlyPreviewEnablementProductionForbiddenState.reason,
    ).toMatch(/Production scope forbids/i);
    expect(
      avanzaDevOnlyPreviewEnablementProductionForbiddenState
        .canRenderSelectedRecommendationPreview,
    ).toBe(false);
  });

  test("backwards-compatible config and checklist props remain renderable", () => {
    expect(avanzaDevPreviewFlagExplicitTestFixtureConfig.explicitPreviewOnlyFlag).toBe(
      true,
    );
    expect(avanzaDevOnlyPreviewEnablementCandidateChecklist.status).toBe(
      "candidate_for_dev_preview",
    );
  });

  test("dev/test fixture still renders no bridge, local fetch, and execution", () => {
    const source = readRepoFile(
      "components/execution/AvanzaDevPreviewFlagStatusPanel.tsx",
    );

    expect(source).toContain("No bridge calls");
    expect(source).toContain("No localhost fetch");
    expect(source).toContain("No execution");
    expect(avanzaDevOnlyPreviewEnablementCandidateState.canCallBridge).toBe(
      false,
    );
    expect(avanzaDevOnlyPreviewEnablementCandidateState.canFetchLocalhost).toBe(
      false,
    );
    expect(avanzaDevOnlyPreviewEnablementCandidateState.canExecute).toBe(false);
  });

  test("legacy production-forbidden config renders blocked or forbidden state", () => {
    const checklist = buildAvanzaDevOnlyPreviewEnablementChecklist({
      previewFlagConfig: avanzaDevPreviewFlagProductionForbiddenConfig,
    });

    expect(avanzaDevPreviewFlagProductionForbiddenConfig.environmentScope).toBe(
      "production_forbidden",
    );
    expect(avanzaDevPreviewFlagProductionForbiddenConfig.label).toMatch(
      /forbidden/i,
    );
    expect(checklist.status).toBe("not_allowed");
    expect(checklist.blockers).toContain("Environment scope");
    expect(checklist.blockers).toContain("Production forbidden state");
  });

  test("panel is isolated from Trade UI and has no active controls", () => {
    const source = readRepoFile(
      "components/execution/AvanzaDevPreviewFlagStatusPanel.tsx",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");

    expect(tradeSource).not.toContain("AvanzaDevPreviewFlagStatusPanel");
    expect(source).not.toContain("<button");
    expect(source).not.toMatch(/onClick\s*=/);
    expect(source).not.toMatch(/href=/i);
  });

  test("panel source has no live endpoints, trigger phrase, bridge, or app-state behavior", () => {
    const source = readRepoFile(
      "components/execution/AvanzaDevPreviewFlagStatusPanel.tsx",
    );

    expect(source).not.toMatch(/app\/trade-app|useState|useMemo/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).toContain("No localhost fetch");
    expect(source).not.toMatch(/https?:\/\/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|document\.cookie/i);
  });
});
