import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  avanzaDevVisiblePreviewSurfaceFixtures,
} from "../../lib/avanza-dev-visible-preview-surface-fixtures";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function source() {
  return readRepoFile(
    "components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurface.tsx",
  );
}

function gallerySource() {
  return readRepoFile(
    "components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery.tsx",
  );
}

function fixtureById(id: string) {
  const fixture = avanzaDevVisiblePreviewSurfaceFixtures.find(
    (item) => item.id === id,
  );

  if (!fixture) {
    throw new Error(`Missing visible preview surface fixture ${id}`);
  }

  return fixture;
}

test.describe("Avanza dev-only visible selectedRecommendation preview surface", () => {
  test("hidden fixture renders hidden state and does not render preview panel by default", () => {
    const componentSource = source();
    const hiddenFixture = fixtureById("hidden");

    expect(hiddenFixture.guard.status).toBe("hidden");
    expect(hiddenFixture.expectedRenderState).toBe("hidden_explanation");
    expect(hiddenFixture.previewState).toBeNull();
    expect(hiddenFixture.guard.canRenderVisiblePreviewSurface).toBe(false);
    expect(componentSource).toContain(
      "SelectedRecommendation preview surface is not visible",
    );
    expect(componentSource).toContain("Default Trade UI behavior remains static fixture");
    expect(componentSource).toContain("guard.status === \"visible_dev_only_allowed\"");
  });

  test("blocked fixture renders blocked state and does not allow preview panel", () => {
    const blockedFixture = fixtureById("blocked");

    expect(blockedFixture.guard.status).toBe("blocked");
    expect(blockedFixture.expectedRenderState).toBe("blocked_explanation");
    expect(blockedFixture.previewState).toBeNull();
    expect(blockedFixture.guard.canRenderVisiblePreviewSurface).toBe(false);
    expect(source()).toContain("blocked");
  });

  test("visible fixture renders passive selectedRecommendation preview panel", () => {
    const visibleFixture = fixtureById("visible_dev_only_allowed");
    const previewState = visibleFixture.previewState;
    const componentSource = source();

    expect(visibleFixture.guard.status).toBe("visible_dev_only_allowed");
    expect(visibleFixture.expectedRenderState).toBe("passive_preview");
    expect(visibleFixture.guard.canRenderVisiblePreviewSurface).toBe(true);
    expect(previewState?.displayState).toBe("preview_ready_locked");
    expect(previewState?.packagePreview?.ticker).toBe("GME");
    expect(previewState?.sourceMode.activeMode).toBe(
      "selected_recommendation_preview_only",
    );
    expect(previewState?.preActivationGate.gateStatus).toBe("locked");
    expect(componentSource).toContain(
      "AvanzaSelectedRecommendationPreviewStatePanel",
    );
    expect(componentSource).toContain("previewState={previewState}");
  });

  test("surface copy keeps controls disabled, gate locked, and no execution", () => {
    const componentSource = source();

    expect(componentSource).toContain("Dev-only visible preview");
    expect(componentSource).toContain("Preview only");
    expect(componentSource).toContain("No bridge calls");
    expect(componentSource).toContain("No localhost fetch");
    expect(componentSource).toContain("No execution");
    expect(componentSource).toContain("Controls disabled");
    expect(componentSource).toContain("Gate locked");
    expect(componentSource).not.toContain("<button");
    expect(componentSource).not.toMatch(/onClick\s*=/);
  });

  test("surface source has no live endpoints, trigger phrase, bridge, or storage behavior", () => {
    const componentSource = source();
    const galleryComponentSource = gallerySource();
    const fixtureSource = readRepoFile(
      "lib/avanza-dev-visible-preview-surface-fixtures.ts",
    );

    expect(componentSource).not.toMatch(/fetch\s*\(/);
    expect(componentSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(componentSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(componentSource).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(componentSource).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(componentSource).not.toMatch(/method:\s*["']POST["']/);
    expect(componentSource).not.toMatch(/localStorage|sessionStorage/);
    expect(componentSource).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(componentSource).not.toMatch(/supabase|execution[_-]?record/i);
    expect(fixtureSource).not.toMatch(/fetch\s*\(/);
    expect(fixtureSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(fixtureSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(fixtureSource).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(fixtureSource).not.toMatch(/method:\s*["']POST["']/);
    expect(fixtureSource).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(galleryComponentSource).not.toMatch(/fetch\s*\(/);
    expect(galleryComponentSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(galleryComponentSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(galleryComponentSource).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(galleryComponentSource).not.toMatch(/method:\s*["']POST["']/);
    expect(galleryComponentSource).not.toMatch(/onClick\s*=/);
    expect(galleryComponentSource).not.toContain("<button");
  });

  test("fixture-only gallery renders all visible preview surface scenarios", () => {
    const galleryComponentSource = gallerySource();

    expect(galleryComponentSource).toContain(
      "Fixture-only visible preview surface scenarios",
    );
    expect(galleryComponentSource).toContain(
      "Not rendered in production Trade UI",
    );
    expect(galleryComponentSource).toContain("No bridge calls");
    expect(galleryComponentSource).toContain("No localhost fetch");
    expect(galleryComponentSource).toContain("No execution");
    expect(galleryComponentSource).toContain(
      "AvanzaDevVisibleSelectedRecommendationPreviewSurface",
    );

    for (const fixture of avanzaDevVisiblePreviewSurfaceFixtures) {
      expect(fixture.label.length).toBeGreaterThan(0);
      expect(galleryComponentSource).toContain("fixture.label");
      expect(galleryComponentSource).toContain("fixture.expectedRenderState");
      expect(galleryComponentSource).toContain("fixture.guard.status");
    }
  });

  test("fixture-only gallery data covers hidden, blocked, and visible states", () => {
    const hiddenFixture = fixtureById("hidden");
    const blockedFixture = fixtureById("blocked");
    const visibleFixture = fixtureById("visible_dev_only_allowed");

    expect(hiddenFixture.expectedRenderState).toBe("hidden_explanation");
    expect(hiddenFixture.guard.status).toBe("hidden");
    expect(blockedFixture.expectedRenderState).toBe("blocked_explanation");
    expect(blockedFixture.guard.status).toBe("blocked");
    expect(visibleFixture.expectedRenderState).toBe("passive_preview");
    expect(visibleFixture.guard.status).toBe("visible_dev_only_allowed");
    expect(visibleFixture.previewState?.displayState).toBe(
      "preview_ready_locked",
    );
    expect(visibleFixture.previewState?.preActivationGate.gateStatus).toBe(
      "locked",
    );
  });
});
