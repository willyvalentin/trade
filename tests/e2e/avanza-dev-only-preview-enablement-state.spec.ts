import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaDevOnlyPreviewEnablementCandidateState,
  avanzaDevOnlyPreviewEnablementDefaultState,
  avanzaDevOnlyPreviewEnablementProductionForbiddenState,
  buildAvanzaDevOnlyPreviewEnablementState,
} from "../../lib/avanza-dev-only-preview-enablement-state";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function rowStatus(
  state: ReturnType<typeof buildAvanzaDevOnlyPreviewEnablementState>,
  id: string,
) {
  const row = state.enablementChecklist.rows.find((item) => item.id === id);

  if (!row) {
    throw new Error(`Missing enablement row ${id}`);
  }

  return row.status;
}

test.describe("Avanza dev-only preview enablement state builder", () => {
  test("default state is disabled", () => {
    expect(avanzaDevOnlyPreviewEnablementDefaultState.overallStatus).toBe(
      "disabled",
    );
    expect(avanzaDevOnlyPreviewEnablementDefaultState.label).toContain(
      "disabled",
    );
  });

  test("default state includes explicitPreviewOnlyFlag false", () => {
    expect(
      avanzaDevOnlyPreviewEnablementDefaultState.previewFlagConfig
        .explicitPreviewOnlyFlag,
    ).toBe(false);
    expect(
      avanzaDevOnlyPreviewEnablementDefaultState.previewFlagConfig.source,
    ).toBe("default_disabled");
  });

  test("default state cannot render selectedRecommendation preview", () => {
    expect(
      avanzaDevOnlyPreviewEnablementDefaultState.canRenderSelectedRecommendationPreview,
    ).toBe(false);
    expect(
      avanzaDevOnlyPreviewEnablementDefaultState.integrationGuard.status,
    ).toBe("disabled");
    expect(
      avanzaDevOnlyPreviewEnablementDefaultState.preWiringChecklist.summary
        .status,
    ).toBe("not_ready_for_wiring");
  });

  test("dev/test fixture can produce candidate_for_dev_preview", () => {
    expect(avanzaDevOnlyPreviewEnablementCandidateState.overallStatus).toBe(
      "candidate_for_dev_preview",
    );
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.previewFlagConfig
        .explicitPreviewOnlyFlag,
    ).toBe(true);
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.integrationGuard.status,
    ).toBe("preview_only_allowed");
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.enablementChecklist.status,
    ).toBe("candidate_for_dev_preview");
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.canRenderSelectedRecommendationPreview,
    ).toBe(true);
  });

  test("candidate still forbids bridge, local fetch, and execution", () => {
    expect(avanzaDevOnlyPreviewEnablementCandidateState.canCallBridge).toBe(
      false,
    );
    expect(avanzaDevOnlyPreviewEnablementCandidateState.canFetchLocalhost).toBe(
      false,
    );
    expect(avanzaDevOnlyPreviewEnablementCandidateState.canExecute).toBe(false);
    expect(rowStatus(avanzaDevOnlyPreviewEnablementCandidateState, "no_bridge_calls")).toBe(
      "enforced",
    );
    expect(rowStatus(avanzaDevOnlyPreviewEnablementCandidateState, "no_localhost_fetch")).toBe(
      "enforced",
    );
    expect(
      rowStatus(
        avanzaDevOnlyPreviewEnablementCandidateState,
        "no_click_review_final_submit_order",
      ),
    ).toBe("enforced");
  });

  test("production-forbidden input returns blocked", () => {
    expect(
      avanzaDevOnlyPreviewEnablementProductionForbiddenState.overallStatus,
    ).toBe("blocked");
    expect(
      avanzaDevOnlyPreviewEnablementProductionForbiddenState.reason,
    ).toMatch(/Production scope forbids/i);
    expect(
      avanzaDevOnlyPreviewEnablementProductionForbiddenState.canRenderSelectedRecommendationPreview,
    ).toBe(false);
  });

  test("gate remains locked and controls remain disabled", () => {
    expect(
      rowStatus(
        avanzaDevOnlyPreviewEnablementCandidateState,
        "pre_activation_gate_must_remain_locked",
      ),
    ).toBe("enforced");
    expect(
      rowStatus(
        avanzaDevOnlyPreviewEnablementCandidateState,
        "controls_must_remain_disabled",
      ),
    ).toBe("enforced");
  });

  test("total-read remains advisory through checklist", () => {
    expect(
      rowStatus(avanzaDevOnlyPreviewEnablementCandidateState, "total_read_advisory"),
    ).toBe("advisory");
    expect(
      avanzaDevOnlyPreviewEnablementCandidateState.enablementChecklist.advisories,
    ).toContain("Total-read advisory");
  });

  test("no execution-ready or production-ready copy appears", () => {
    const serialized = JSON.stringify([
      avanzaDevOnlyPreviewEnablementDefaultState,
      avanzaDevOnlyPreviewEnablementCandidateState,
      avanzaDevOnlyPreviewEnablementProductionForbiddenState,
    ]);

    expect(serialized).not.toMatch(/execution-ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("helper is pure and contains no live endpoint strings or exact trigger phrase", () => {
    const source = readRepoFile(
      "lib/avanza-dev-only-preview-enablement-state.ts",
    );

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|useState|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
  });
});
