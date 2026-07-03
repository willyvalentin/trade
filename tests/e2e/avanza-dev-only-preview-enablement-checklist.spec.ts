import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaDevPreviewFlagExplicitTestFixtureConfig,
  avanzaDevPreviewFlagProductionForbiddenConfig,
} from "../../lib/avanza-dev-preview-flag-config";
import {
  avanzaHandoffPreviewSourceModes,
} from "../../lib/avanza-handoff-preview-source-mode";
import {
  buildAvanzaDevOnlyPreviewEnablementChecklist,
} from "../../lib/avanza-dev-only-preview-enablement-checklist";
import {
  avanzaGameStopHandoffPreActivationGateFixture,
} from "../../lib/avanza-handoff-package-preview-fixtures";
import {
  avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
} from "../../lib/avanza-selected-recommendation-pre-wiring-checklist";
import {
  buildAvanzaSelectedRecommendationPreviewIntegrationGuard,
} from "../../lib/avanza-selected-recommendation-preview-integration-guard";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rowById(
  checklist: ReturnType<typeof buildAvanzaDevOnlyPreviewEnablementChecklist>,
  id: string,
) {
  const row = checklist.rows.find((item) => item.id === id);

  if (!row) {
    throw new Error(`Missing checklist row ${id}`);
  }

  return row;
}

test.describe("Avanza dev-only selectedRecommendation preview enablement checklist", () => {
  test("default checklist returns not_allowed", () => {
    const checklist = buildAvanzaDevOnlyPreviewEnablementChecklist();

    expect(checklist.status).toBe("not_allowed");
    expect(checklist.reason).toContain("Default static_fixture remains active");
    expect(checklist.reason).toContain("explicitPreviewOnlyFlag is false");
    expect(checklist.reason).toContain("preview flag source is default_disabled");
    expect(checklist.reason).toContain("integration guard is disabled");
  });

  test("default checklist includes default static_fixture, flag false, and disabled guard", () => {
    const checklist = buildAvanzaDevOnlyPreviewEnablementChecklist();

    expect(rowById(checklist, "default_static_fixture_remains_active")).toEqual(
      expect.objectContaining({
        label: "Default static_fixture remains active",
        status: "enforced",
      }),
    );
    expect(rowById(checklist, "explicit_preview_only_flag_default_false")).toEqual(
      expect.objectContaining({
        label: "explicitPreviewOnlyFlag default false",
        status: "enforced",
      }),
    );
    expect(
      rowById(checklist, "selected_recommendation_preview_disabled_by_default"),
    ).toEqual(
      expect.objectContaining({
        label: "selectedRecommendation preview disabled by default",
        status: "enforced",
      }),
    );
    expect(
      rowById(checklist, "integration_guard_must_allow_preview_only").status,
    ).toBe("blocked");
  });

  test("default checklist reflects default preview flag config", () => {
    const checklist = buildAvanzaDevOnlyPreviewEnablementChecklist();

    expect(rowById(checklist, "preview_flag_config_source")).toEqual(
      expect.objectContaining({
        label: "Preview flag config source",
        status: "enforced",
      }),
    );
    expect(rowById(checklist, "preview_flag_explicit_value")).toEqual(
      expect.objectContaining({
        label: "explicitPreviewOnlyFlag value",
        status: "enforced",
      }),
    );
    expect(rowById(checklist, "preview_flag_environment_scope")).toEqual(
      expect.objectContaining({
        label: "Environment scope",
        status: "enforced",
      }),
    );
    expect(
      rowById(
        checklist,
        "preview_flag_can_enable_selected_recommendation_preview",
      ),
    ).toEqual(
      expect.objectContaining({
        label: "canEnableSelectedRecommendationPreview",
        status: "blocked",
      }),
    );
  });

  test("candidate fixture can return candidate_for_dev_preview", () => {
    const checklist = buildAvanzaDevOnlyPreviewEnablementChecklist({
      integrationGuard: buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
        explicitPreviewOnlyFlag: true,
      }),
      preActivationGate: avanzaGameStopHandoffPreActivationGateFixture,
      previewFlagConfig: avanzaDevPreviewFlagExplicitTestFixtureConfig,
      preWiringChecklist:
        avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
      proposedSourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });

    expect(checklist.status).toBe("candidate_for_dev_preview");
    expect(rowById(checklist, "integration_guard_must_allow_preview_only").status).toBe(
      "ready",
    );
    expect(rowById(checklist, "pre_wiring_candidate_required").status).toBe(
      "ready",
    );
    expect(
      rowById(
        checklist,
        "selected_recommendation_preview_only_required_dev_test",
      ).status,
    ).toBe("ready");
    expect(
      rowById(
        checklist,
        "preview_flag_can_enable_selected_recommendation_preview",
      ).status,
    ).toBe("ready");
    expect(rowById(checklist, "preview_flag_environment_scope").status).toBe(
      "ready",
    );
  });

  test("production forbidden config blocks candidate", () => {
    const checklist = buildAvanzaDevOnlyPreviewEnablementChecklist({
      integrationGuard: buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
        explicitPreviewOnlyFlag: true,
      }),
      preActivationGate: avanzaGameStopHandoffPreActivationGateFixture,
      previewFlagConfig: avanzaDevPreviewFlagProductionForbiddenConfig,
      preWiringChecklist:
        avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
      proposedSourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });

    expect(checklist.status).toBe("not_allowed");
    expect(rowById(checklist, "preview_flag_environment_scope").status).toBe(
      "blocked",
    );
    expect(rowById(checklist, "preview_flag_production_forbidden").status).toBe(
      "blocked",
    );
    expect(
      rowById(
        checklist,
        "preview_flag_can_enable_selected_recommendation_preview",
      ).status,
    ).toBe("blocked");
  });

  test("candidate still forbids bridge, local fetch, execution, and runner/fill", () => {
    const checklist = buildAvanzaDevOnlyPreviewEnablementChecklist({
      integrationGuard: buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
        explicitPreviewOnlyFlag: true,
      }),
      preActivationGate: avanzaGameStopHandoffPreActivationGateFixture,
      previewFlagConfig: avanzaDevPreviewFlagExplicitTestFixtureConfig,
      preWiringChecklist:
        avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
      proposedSourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });

    expect(rowById(checklist, "no_bridge_calls").status).toBe("enforced");
    expect(rowById(checklist, "no_localhost_fetch").status).toBe("enforced");
    expect(rowById(checklist, "no_click_review_final_submit_order").status).toBe(
      "enforced",
    );
    expect(rowById(checklist, "no_runner_fill_invocation").status).toBe(
      "enforced",
    );
    expect(
      rowById(checklist, "preview_flag_forbids_bridge_local_fetch_execution")
        .status,
    ).toBe("enforced");
  });

  test("candidate still requires disabled controls and locked gate", () => {
    const checklist = buildAvanzaDevOnlyPreviewEnablementChecklist({
      integrationGuard: buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
        explicitPreviewOnlyFlag: true,
      }),
      preActivationGate: avanzaGameStopHandoffPreActivationGateFixture,
      previewFlagConfig: avanzaDevPreviewFlagExplicitTestFixtureConfig,
      preWiringChecklist:
        avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
      proposedSourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });

    expect(rowById(checklist, "controls_must_remain_disabled").status).toBe(
      "enforced",
    );
    expect(rowById(checklist, "pre_activation_gate_must_remain_locked").status).toBe(
      "enforced",
    );
  });

  test("total-read remains advisory and no execution or production-ready copy appears", () => {
    const checklist = buildAvanzaDevOnlyPreviewEnablementChecklist({
      integrationGuard: buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
        explicitPreviewOnlyFlag: true,
      }),
      preActivationGate: avanzaGameStopHandoffPreActivationGateFixture,
      previewFlagConfig: avanzaDevPreviewFlagExplicitTestFixtureConfig,
      preWiringChecklist:
        avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
      proposedSourceMode:
        avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
    });
    const serialized = JSON.stringify(checklist);

    expect(rowById(checklist, "total_read_advisory").status).toBe("advisory");
    expect(serialized).toMatch(/Total-read advisory/);
    expect(serialized).not.toMatch(/execution-ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("helper is pure and contains no app state, bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile(
      "lib/avanza-dev-only-preview-enablement-checklist.ts",
    );

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|useState|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).toContain("No localhost fetch");
    expect(source).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
  });
});
