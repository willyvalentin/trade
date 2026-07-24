import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaScenarioGalleryDefaultAccessDecision,
  buildAvanzaScenarioGalleryAccessDecision,
} from "../../lib/avanza-scenario-gallery-access";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza scenario gallery access model", () => {
  test("default access is disabled", () => {
    expect(avanzaScenarioGalleryDefaultAccessDecision.accessStatus).toBe(
      "disabled",
    );
    expect(avanzaScenarioGalleryDefaultAccessDecision.canRenderGallery).toBe(
      false,
    );
    expect(buildAvanzaScenarioGalleryAccessDecision()).toEqual(
      avanzaScenarioGalleryDefaultAccessDecision,
    );
  });

  test("explicit dev flag allows fixture gallery render only", () => {
    const decision = buildAvanzaScenarioGalleryAccessDecision({
      devOnlyGalleryFlag: true,
    });

    expect(decision.accessStatus).toBe("dev_only_allowed");
    expect(decision.canRenderGallery).toBe(true);
    expect(decision.reason).toContain("isolated visual QA");
    expect(decision.reason).toContain("Static scenarios");
  });

  test("dev-only allowed still forbids live capabilities", () => {
    const decision = buildAvanzaScenarioGalleryAccessDecision({
      devOnlyGalleryFlag: true,
    });

    expect(decision.canUseRealSelectedRecommendationState).toBe(false);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canExecute).toBe(false);
  });

  test("blocked reason overrides dev-only access", () => {
    const decision = buildAvanzaScenarioGalleryAccessDecision({
      blockedReason: "Gallery visual QA is disabled for this build.",
      devOnlyGalleryFlag: true,
    });

    expect(decision.accessStatus).toBe("blocked");
    expect(decision.canRenderGallery).toBe(false);
    expect(decision.reason).toBe("Gallery visual QA is disabled for this build.");
  });

  test("helper is pure and contains no app state, bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile("lib/avanza-scenario-gallery-access.ts");

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|useState|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
