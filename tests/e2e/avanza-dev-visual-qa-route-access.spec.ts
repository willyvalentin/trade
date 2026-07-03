import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  avanzaDevOnlyPreviewEnablementCandidateState,
  avanzaDevOnlyPreviewEnablementProductionForbiddenState,
} from "../../lib/avanza-dev-only-preview-enablement-state";
import { buildAvanzaDevVisiblePreviewSurfaceGuard } from "../../lib/avanza-dev-visible-preview-surface-guard";
import {
  avanzaDevVisualQaRouteAccessFixtures,
} from "../../lib/avanza-dev-visual-qa-route-access-fixtures";
import {
  avanzaDevVisualQaRouteAccessDefaultDecision,
  buildAvanzaDevVisualQaRouteAccess,
} from "../../lib/avanza-dev-visual-qa-route-access";
import {
  avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
  buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard,
} from "../../lib/avanza-read-only-selected-recommendation-dev-preview-guard";
import {
  avanzaReadOnlySelectedRecommendationDevPreviewFixtures,
} from "../../lib/avanza-read-only-selected-recommendation-dev-preview-fixtures";
import {
  buildAvanzaReadOnlySelectedRecommendationDerivationDecision,
} from "../../lib/avanza-read-only-selected-recommendation-derivation-decision";
import {
  avanzaReadOnlySelectedRecommendationDerivationDecisionFixtures,
} from "../../lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function fixtureById(id: string) {
  const fixture = avanzaDevVisualQaRouteAccessFixtures.find(
    (item) => item.id === id,
  );

  if (!fixture) {
    throw new Error(`Missing route access fixture ${id}`);
  }

  return fixture;
}

function readOnlyPreviewFixtureById(id: string) {
  const fixture = avanzaReadOnlySelectedRecommendationDevPreviewFixtures.find(
    (item) => item.id === id,
  );

  if (!fixture) {
    throw new Error(`Missing read-only selectedRecommendation fixture ${id}`);
  }

  return fixture;
}

function readOnlyDerivationDecisionFixtureById(id: string) {
  const fixture =
    avanzaReadOnlySelectedRecommendationDerivationDecisionFixtures.find(
      (item) => item.id === id,
    );

  if (!fixture) {
    throw new Error(
      `Missing read-only selectedRecommendation derivation fixture ${id}`,
    );
  }

  return fixture;
}

const navigationSourceFiles = [
  "app/page.tsx",
  "app/settings/page.tsx",
  "app/trade-app.tsx",
] as const;

test.describe("Avanza dev-only visual QA route access guard", () => {
  test("isolated route file exists and renders fixture-only visual QA shell", () => {
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(routeSource).toContain("Dev-only visual QA");
    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain("Not linked from main navigation");
    expect(routeSource).toContain("No real selectedRecommendation state");
    expect(routeSource).toContain("No bridge calls");
    expect(routeSource).toContain("No localhost fetch");
    expect(routeSource).toContain("No execution");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");
    expect(routeSource).toContain("total-read remains advisory");
    expect(routeSource).toContain("AvanzaDevVisualQaRouteStatusPanel");
    expect(routeSource).toContain("AvanzaDevVisualQaRouteAccessHarness");
    expect(routeSource).toContain(
      "AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery",
    );
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness",
    );
  });

  test("isolated route content renders the expected fixture-only sections and copy", () => {
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(routeSource).toContain("Route access fixtures");
    expect(routeSource).toContain("Visible preview surface fixtures");
    expect(routeSource).toContain(
      "Read-only selectedRecommendation dev preview guard",
    );
    expect(routeSource).toContain("Static route-access decisions only");
    expect(routeSource).toContain(
      "Static selectedRecommendation preview fixtures only",
    );
    expect(routeSource).toContain("Fixture/model only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("does not read Trade UI state");
    expect(routeSource).toContain("does not use");
    expect(routeSource).toContain("real selectedRecommendation state");
    expect(routeSource).toContain("does not fetch");
    expect(routeSource).toContain("does not call");
    expect(routeSource).toContain("the bridge");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("does not enable execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("pre-activation gate remains locked");
    expect(routeSource).toContain("gate locked");
  });

  test("final route checkpoint doc exists and records the fixture-only safety state", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-isolated-dev-visual-qa-route-final-checkpoint.md",
    );

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_isolated_dev_visual_qa_route_final_checkpoint_added",
    );
    expect(checkpoint).toContain("app/dev/avanza-visual-qa/page.tsx");
    expect(checkpoint).toContain("route-local status panel");
    expect(checkpoint).toContain("route access harness");
    expect(checkpoint).toContain("visible preview surface gallery");
    expect(checkpoint).toContain("fixture-only");
    expect(checkpoint).toContain("not linked from main navigation");
    expect(checkpoint).toContain("not imported by `app/trade-app.tsx`");
    expect(checkpoint).toContain("selectedRecommendation preview disabled by default");
    expect(checkpoint).toContain("explicitPreviewOnlyFlag` false by default");
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain("no Supabase execution write");
  });

  test("phase completion checkpoint doc exists and records the route as safe to pause", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-isolated-dev-visual-qa-route-phase-completion-checkpoint.md",
    );

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_isolated_dev_visual_qa_route_phase_completion_checkpoint_added",
    );
    expect(checkpoint).toContain("phase is complete and safe to pause");
    expect(checkpoint).toContain("app/dev/avanza-visual-qa/page.tsx");
    expect(checkpoint).toContain("fixture-only");
    expect(checkpoint).toContain("route-local fixture-only status panel");
    expect(checkpoint).toContain("route access harness");
    expect(checkpoint).toContain("visible preview surface gallery");
    expect(checkpoint).toContain("not linked from main navigation");
    expect(checkpoint).toContain("not imported by `app/trade-app.tsx`");
    expect(checkpoint).toContain("selectedRecommendation preview disabled by default");
    expect(checkpoint).toContain("explicitPreviewOnlyFlag` false by default");
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain("no Supabase execution write");
  });

  test("isolated route remains fixture-only and does not read app state or active paths", () => {
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(routeSource).not.toMatch(/app\/trade-app|TradeApp/);
    expect(routeSource).not.toMatch(/useState|useEffect|useMemo|from ["']react["']/);
    expect(routeSource).not.toMatch(/selectedRecommendation\s*[).,\]]/);
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toMatch(/method:\s*["']POST["']/);
    expect(routeSource).not.toMatch(/localStorage|sessionStorage/);
    expect(routeSource).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(routeSource).not.toMatch(/supabase|execution[_-]?record/i);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/production-ready|production ready/i);
  });

  test("main Trade UI does not link to or import the dev visual QA route shell", () => {
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(tradeAppSource).not.toContain("/dev/avanza-visual-qa");
    expect(tradeAppSource).not.toContain(
      "AvanzaDevVisualQaRouteAccessHarness",
    );
    expect(tradeAppSource).not.toContain("AvanzaDevVisualQaRouteStatusPanel");
    expect(tradeAppSource).not.toContain("AvanzaDevVisualQaPage");
    expect(tradeAppSource).not.toContain(
      "AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery",
    );
  });

  test("route status panel renders fixture-only isolation copy", () => {
    const panelSource = readRepoFile(
      "components/execution/AvanzaDevVisualQaRouteStatusPanel.tsx",
    );

    expect(panelSource).toContain("Dev-only visual QA route");
    expect(panelSource).toContain("Fixture-only");
    expect(panelSource).toContain("Not linked from main navigation");
    expect(panelSource).toContain("No real selectedRecommendation state");
    expect(panelSource).toContain("No Trade UI state");
    expect(panelSource).toContain("No bridge calls");
    expect(panelSource).toContain("No localhost fetch");
    expect(panelSource).toContain("No polling");
    expect(panelSource).toContain("No execution");
    expect(panelSource).toContain("Controls disabled");
    expect(panelSource).toContain("Gate locked");
    expect(panelSource).toContain("Total-read advisory");
    expect(panelSource).not.toContain("<button");
    expect(panelSource).not.toMatch(/onClick\s*=/);
  });

  test("route status panel contains no live endpoints, trigger phrase, app state, or active behavior", () => {
    const panelSource = readRepoFile(
      "components/execution/AvanzaDevVisualQaRouteStatusPanel.tsx",
    );

    expect(panelSource).not.toMatch(/process\.env/);
    expect(panelSource).not.toMatch(/app\/trade-app|TradeApp/);
    expect(panelSource).not.toMatch(/useState|useEffect|useMemo|from ["']react["']/);
    expect(panelSource).not.toMatch(/fetch\s*\(/);
    expect(panelSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(panelSource).not.toMatch(/setInterval|setTimeout/);
    expect(panelSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(panelSource).not.toMatch(/method:\s*["']POST["']/);
    expect(panelSource).not.toMatch(/localStorage|sessionStorage/);
    expect(panelSource).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(panelSource).not.toMatch(/supabase|execution[_-]?record/i);
    expect(panelSource).not.toContain("<button");
    expect(panelSource).not.toMatch(/onClick\s*=/);
    expect(panelSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(panelSource).not.toMatch(/production-ready|production ready/i);
  });

  test("main navigation source files do not link to the dev visual QA route", () => {
    for (const file of navigationSourceFiles) {
      const source = readRepoFile(file);

      expect(source, `${file} must not link the dev QA route`).not.toContain(
        "/dev/avanza-visual-qa",
      );
    }
  });

  test("default guard is hidden", () => {
    expect(avanzaDevVisualQaRouteAccessDefaultDecision.status).toBe("hidden");
    expect(avanzaDevVisualQaRouteAccessDefaultDecision.canExposeRoute).toBe(
      false,
    );
    expect(
      avanzaDevVisualQaRouteAccessDefaultDecision.canLinkFromMainNavigation,
    ).toBe(false);
    expect(
      avanzaDevVisualQaRouteAccessDefaultDecision.canRenderFixtureGallery,
    ).toBe(false);
  });

  test("read-only selectedRecommendation dev preview guard is hidden by default", () => {
    expect(avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.status).toBe(
      "hidden",
    );
    expect(
      avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.canReadRealSelectedRecommendation,
    ).toBe(false);
    expect(
      avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.canDerivePreviewState,
    ).toBe(false);
    expect(
      avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.canRenderReadOnlyPreview,
    ).toBe(false);
    expect(
      avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.canUseFixtureFallback,
    ).toBe(true);
    expect(avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.canCallBridge).toBe(
      false,
    );
    expect(
      avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.canFetchLocalhost,
    ).toBe(false);
    expect(avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.canPoll).toBe(
      false,
    );
    expect(avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.canExecute).toBe(
      false,
    );
    expect(
      avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.controlsEnabled,
    ).toBe(false);
    expect(avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard.gateLocked).toBe(
      true,
    );
  });

  test("dev-only fixture can allow read-only selectedRecommendation preview", () => {
    const decision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "dev_only",
        explicitReadOnlyDevPreview: true,
      });

    expect(decision.status).toBe("read_only_dev_preview_allowed");
    expect(decision.canReadRealSelectedRecommendation).toBe(true);
    expect(decision.canDerivePreviewState).toBe(true);
    expect(decision.canRenderReadOnlyPreview).toBe(true);
    expect(decision.canUseFixtureFallback).toBe(true);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("production-forbidden read-only selectedRecommendation preview is blocked", () => {
    const decision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "production_forbidden",
      });

    expect(decision.status).toBe("blocked");
    expect(decision.canReadRealSelectedRecommendation).toBe(false);
    expect(decision.canDerivePreviewState).toBe(false);
    expect(decision.canRenderReadOnlyPreview).toBe(false);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation dev preview guard has no execution-ready or production-ready copy", () => {
    const serialized = JSON.stringify([
      avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "dev_only",
        explicitReadOnlyDevPreview: true,
      }),
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "production_forbidden",
      }),
    ]);

    expect(serialized).not.toMatch(/execution-ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("read-only selectedRecommendation dev preview guard is pure and contains no live behavior", () => {
    const source = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-dev-preview-guard.ts",
    );

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|app\/dev\/avanza-visual-qa/);
    expect(source).not.toMatch(/useState|useEffect|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(source).not.toMatch(/setInterval|setTimeout/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(source).not.toMatch(/supabase|execution[_-]?record/i);
  });

  test("read-only selectedRecommendation derivation decision returns no_input with fixture fallback", () => {
    const decision =
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision: avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
        selectedRecommendation: null,
      });

    expect(decision.status).toBe("no_input");
    expect(decision.sourceMode).toBe("fixture_only");
    expect(decision.canReadInput).toBe(false);
    expect(decision.canDerivePreviewState).toBe(false);
    expect(decision.canRenderReadOnlyPreview).toBe(false);
    expect(decision.canUseFixtureFallback).toBe(true);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation derivation decision blocks when guard blocks", () => {
    const guardDecision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "production_forbidden",
      });
    const decision =
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision,
        selectedRecommendation: { ticker: "VOLV B" },
      });

    expect(decision.status).toBe("blocked");
    expect(decision.sourceMode).toBe("blocked");
    expect(decision.canReadInput).toBe(false);
    expect(decision.canDerivePreviewState).toBe(false);
    expect(decision.canRenderReadOnlyPreview).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation derivation decision rejects invalid input", () => {
    const guardDecision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "dev_only",
        explicitReadOnlyDevPreview: true,
      });
    const decision =
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision,
        selectedRecommendation: { company: "Missing ticker" },
      });

    expect(decision.status).toBe("invalid_input");
    expect(decision.sourceMode).toBe("blocked");
    expect(decision.canReadInput).toBe(true);
    expect(decision.canDerivePreviewState).toBe(false);
    expect(decision.canRenderReadOnlyPreview).toBe(false);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation derivation decision can allow valid input in model state only", () => {
    const guardDecision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "dev_only",
        explicitReadOnlyDevPreview: true,
      });
    const decision =
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision,
        selectedRecommendation: {
          company: "Volvo",
          quantity: 10,
          ticker: "VOLV B",
        },
        sourceLabel: "read_only_selected_recommendation_dev_preview",
      });

    expect(decision.status).toBe("derivation_allowed");
    expect(decision.sourceMode).toBe(
      "read_only_selected_recommendation_dev_preview",
    );
    expect(decision.canReadInput).toBe(true);
    expect(decision.canDerivePreviewState).toBe(true);
    expect(decision.canRenderReadOnlyPreview).toBe(true);
    expect(decision.canUseFixtureFallback).toBe(true);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation derivation decision has no execution-ready or production-ready copy", () => {
    const guardDecision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "dev_only",
        explicitReadOnlyDevPreview: true,
      });
    const serialized = JSON.stringify([
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision: avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
        selectedRecommendation: null,
      }),
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision,
        selectedRecommendation: {},
      }),
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision,
        selectedRecommendation: { symbol: "VOLV B" },
      }),
    ]);

    expect(serialized).not.toMatch(/execution-ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("read-only selectedRecommendation derivation decision helper is pure and contains no live behavior", () => {
    const source = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-derivation-decision.ts",
    );

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|app\/dev\/avanza-visual-qa/);
    expect(source).not.toMatch(/useState|useEffect|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(source).not.toMatch(/setInterval|setTimeout/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(source).not.toMatch(/supabase|execution[_-]?record/i);
  });

  test("read-only selectedRecommendation derivation decision fixtures cover no_input, blocked, invalid, and allowed states", () => {
    const noInputFixture = readOnlyDerivationDecisionFixtureById("no_input");
    const blockedFixture =
      readOnlyDerivationDecisionFixtureById("blocked_guard");
    const invalidFixture =
      readOnlyDerivationDecisionFixtureById("invalid_input");
    const allowedFixture =
      readOnlyDerivationDecisionFixtureById("derivation_allowed");

    expect(noInputFixture.expectedState).toBe("no_input");
    expect(noInputFixture.decision.status).toBe("no_input");
    expect(noInputFixture.decision.sourceMode).toBe("fixture_only");
    expect(noInputFixture.decision.canUseFixtureFallback).toBe(true);
    expect(noInputFixture.decision.canDerivePreviewState).toBe(false);
    expect(noInputFixture.decision.canRenderReadOnlyPreview).toBe(false);

    expect(blockedFixture.expectedState).toBe("blocked");
    expect(blockedFixture.decision.status).toBe("blocked");
    expect(blockedFixture.decision.canDerivePreviewState).toBe(false);
    expect(blockedFixture.decision.canRenderReadOnlyPreview).toBe(false);

    expect(invalidFixture.expectedState).toBe("invalid_input");
    expect(invalidFixture.decision.status).toBe("invalid_input");
    expect(invalidFixture.decision.canDerivePreviewState).toBe(false);
    expect(invalidFixture.decision.canRenderReadOnlyPreview).toBe(false);

    expect(allowedFixture.expectedState).toBe("derivation_allowed");
    expect(allowedFixture.decision.status).toBe("derivation_allowed");
    expect(allowedFixture.decision.sourceMode).toBe(
      "read_only_selected_recommendation_dev_preview",
    );
    expect(allowedFixture.decision.canReadInput).toBe(true);
    expect(allowedFixture.decision.canDerivePreviewState).toBe(true);
    expect(allowedFixture.decision.canRenderReadOnlyPreview).toBe(true);
  });

  test("all read-only selectedRecommendation derivation decision fixtures keep hard safety limits", () => {
    for (const fixture of avanzaReadOnlySelectedRecommendationDerivationDecisionFixtures) {
      expect(fixture.decision.canCallBridge).toBe(false);
      expect(fixture.decision.canFetchLocalhost).toBe(false);
      expect(fixture.decision.canPoll).toBe(false);
      expect(fixture.decision.canExecute).toBe(false);
      expect(fixture.decision.controlsEnabled).toBe(false);
      expect(fixture.decision.gateLocked).toBe(true);
    }
  });

  test("read-only selectedRecommendation derivation decision fixtures have no execution-ready or production-ready copy", () => {
    const serialized = JSON.stringify(
      avanzaReadOnlySelectedRecommendationDerivationDecisionFixtures,
    );

    expect(serialized).not.toMatch(/execution-ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("read-only selectedRecommendation derivation decision fixtures are pure and contain no live behavior", () => {
    const source = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures.ts",
    );

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|app\/dev\/avanza-visual-qa/);
    expect(source).not.toMatch(/useState|useEffect|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(source).not.toMatch(/setInterval|setTimeout/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(source).not.toMatch(/supabase|execution[_-]?record/i);
  });

  test("read-only selectedRecommendation derivation decision harness renders fixture states and safety copy", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx",
    );

    expect(harnessSource).toContain(
      "Read-only selectedRecommendation derivation decision",
    );
    expect(harnessSource).toContain("Decision fixture only");
    expect(harnessSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(harnessSource).toContain("No real preview state is derived");
    expect(harnessSource).toContain("No bridge calls");
    expect(harnessSource).toContain("No localhost fetch");
    expect(harnessSource).toContain("No polling");
    expect(harnessSource).toContain("No execution");
    expect(harnessSource).toContain("Controls disabled");
    expect(harnessSource).toContain("Gate locked");
    expect(harnessSource).toContain("sourceMode");
    expect(harnessSource).toContain("canReadInput");
    expect(harnessSource).toContain("canDerivePreviewState");
    expect(harnessSource).toContain("canRenderReadOnlyPreview");
    expect(harnessSource).toContain("canUseFixtureFallback");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(harnessSource).toContain(
      "avanzaReadOnlySelectedRecommendationDerivationDecisionFixtures",
    );
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("read-only selectedRecommendation derivation decision harness fixture data covers fallback, blocked, invalid, and allowed model states", () => {
    const noInputFixture = readOnlyDerivationDecisionFixtureById("no_input");
    const blockedFixture =
      readOnlyDerivationDecisionFixtureById("blocked_guard");
    const invalidFixture =
      readOnlyDerivationDecisionFixtureById("invalid_input");
    const allowedFixture =
      readOnlyDerivationDecisionFixtureById("derivation_allowed");

    expect(noInputFixture.label).toContain("No selectedRecommendation input");
    expect(noInputFixture.decision.canUseFixtureFallback).toBe(true);

    expect(blockedFixture.decision.status).toBe("blocked");

    expect(invalidFixture.decision.status).toBe("invalid_input");
    expect(invalidFixture.decision.canDerivePreviewState).toBe(false);
    expect(invalidFixture.decision.canRenderReadOnlyPreview).toBe(false);

    expect(allowedFixture.decision.status).toBe("derivation_allowed");
    expect(allowedFixture.decision.canDerivePreviewState).toBe(true);
    expect(allowedFixture.decision.canRenderReadOnlyPreview).toBe(true);
    expect(allowedFixture.decision.canCallBridge).toBe(false);
    expect(allowedFixture.decision.canFetchLocalhost).toBe(false);
    expect(allowedFixture.decision.canPoll).toBe(false);
    expect(allowedFixture.decision.canExecute).toBe(false);
    expect(allowedFixture.decision.controlsEnabled).toBe(false);
    expect(allowedFixture.decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation derivation decision harness source stays pure and passive", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx",
    );

    expect(harnessSource).not.toMatch(/process\.env/);
    expect(harnessSource).not.toMatch(/app\/trade-app|app\/dev\/avanza-visual-qa/);
    expect(harnessSource).not.toMatch(/useState|useEffect|useMemo|from ["']react["']/);
    expect(harnessSource).not.toMatch(/fetch\s*\(/);
    expect(harnessSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(harnessSource).not.toMatch(/setInterval|setTimeout/);
    expect(harnessSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(harnessSource).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(harnessSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(harnessSource).not.toMatch(/method:\s*["']POST["']/);
    expect(harnessSource).not.toMatch(/localStorage|sessionStorage/);
    expect(harnessSource).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(harnessSource).not.toMatch(/supabase|execution[_-]?record/i);
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("read-only selectedRecommendation derivation decision harness is not wired into Trade UI or the dev route", () => {
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness",
    );
    expect(routeSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness",
    );
  });

  test("read-only selectedRecommendation derivation decision checkpoint doc exists and records isolated non-wired state", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-derivation-decision-checkpoint.md",
    );

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_derivation_decision_checkpoint_added",
    );
    expect(checkpoint).toContain("no_input");
    expect(checkpoint).toContain("fixture fallback");
    expect(checkpoint).toContain("blocked_guard");
    expect(checkpoint).toContain("blocks derivation and rendering");
    expect(checkpoint).toContain("invalid_input");
    expect(checkpoint).toContain("derivation_allowed");
    expect(checkpoint).toContain("fixture/model state");
    expect(checkpoint).toContain("model read-only capability only");
    expect(checkpoint).toContain("harness is isolated");
    expect(checkpoint).toContain("not rendered in `app/trade-app.tsx`");
    expect(checkpoint).toContain(
      "not rendered in `app/dev/avanza-visual-qa/page.tsx`",
    );
    expect(checkpoint).toContain("existing dev route remains fixture/model-only");
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is read from app or route",
    );
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("no real preview state is derived");
    expect(checkpoint).toContain("no real preview state is rendered");
    expect(checkpoint).toContain(
      "selectedRecommendation preview disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain("no Supabase execution write");
  });

  test("read-only selectedRecommendation dev preview fixtures cover hidden, blocked, and allowed states", () => {
    const hiddenFixture = readOnlyPreviewFixtureById("hidden_default");
    const blockedFixture = readOnlyPreviewFixtureById(
      "blocked_production_forbidden",
    );
    const allowedFixture = readOnlyPreviewFixtureById(
      "read_only_dev_preview_allowed",
    );

    expect(hiddenFixture.expectedState).toBe("hidden");
    expect(hiddenFixture.guardDecision.status).toBe("hidden");
    expect(hiddenFixture.guardDecision.canReadRealSelectedRecommendation).toBe(
      false,
    );
    expect(hiddenFixture.guardDecision.canDerivePreviewState).toBe(false);
    expect(hiddenFixture.guardDecision.canRenderReadOnlyPreview).toBe(false);
    expect(hiddenFixture.guardDecision.canUseFixtureFallback).toBe(true);

    expect(blockedFixture.expectedState).toBe("blocked");
    expect(blockedFixture.guardDecision.status).toBe("blocked");
    expect(blockedFixture.guardDecision.canReadRealSelectedRecommendation).toBe(
      false,
    );
    expect(blockedFixture.guardDecision.canDerivePreviewState).toBe(false);
    expect(blockedFixture.guardDecision.canRenderReadOnlyPreview).toBe(false);

    expect(allowedFixture.expectedState).toBe(
      "read_only_dev_preview_allowed",
    );
    expect(allowedFixture.guardDecision.status).toBe(
      "read_only_dev_preview_allowed",
    );
    expect(allowedFixture.guardDecision.canReadRealSelectedRecommendation).toBe(
      true,
    );
    expect(allowedFixture.guardDecision.canDerivePreviewState).toBe(true);
    expect(allowedFixture.guardDecision.canRenderReadOnlyPreview).toBe(true);
  });

  test("all read-only selectedRecommendation dev preview fixtures keep hard safety limits", () => {
    for (const fixture of avanzaReadOnlySelectedRecommendationDevPreviewFixtures) {
      expect(fixture.guardDecision.canCallBridge).toBe(false);
      expect(fixture.guardDecision.canFetchLocalhost).toBe(false);
      expect(fixture.guardDecision.canPoll).toBe(false);
      expect(fixture.guardDecision.canExecute).toBe(false);
      expect(fixture.guardDecision.controlsEnabled).toBe(false);
      expect(fixture.guardDecision.gateLocked).toBe(true);
    }
  });

  test("read-only selectedRecommendation dev preview fixtures have no execution-ready or production-ready copy", () => {
    const serialized = JSON.stringify(
      avanzaReadOnlySelectedRecommendationDevPreviewFixtures,
    );

    expect(serialized).not.toMatch(/execution-ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("read-only selectedRecommendation dev preview fixtures are pure and contain no live behavior", () => {
    const source = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-dev-preview-fixtures.ts",
    );

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|app\/dev\/avanza-visual-qa/);
    expect(source).not.toMatch(/useState|useEffect|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(source).not.toMatch(/setInterval|setTimeout/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(source).not.toMatch(/supabase|execution[_-]?record/i);
  });

  test("read-only selectedRecommendation dev preview guard harness renders fixture states and safety copy", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness.tsx",
    );

    expect(harnessSource).toContain(
      "Read-only selectedRecommendation dev preview guard",
    );
    expect(harnessSource).toContain("Guard fixture only");
    expect(harnessSource).toContain(
      "No real selectedRecommendation state is read",
    );
    expect(harnessSource).toContain("No bridge calls");
    expect(harnessSource).toContain("No localhost fetch");
    expect(harnessSource).toContain("No polling");
    expect(harnessSource).toContain("No execution");
    expect(harnessSource).toContain("Controls disabled");
    expect(harnessSource).toContain("Gate locked");
    expect(harnessSource).toContain("canReadRealSelectedRecommendation");
    expect(harnessSource).toContain("canDerivePreviewState");
    expect(harnessSource).toContain("canRenderReadOnlyPreview");
    expect(harnessSource).toContain("canUseFixtureFallback");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(harnessSource).toContain(
      "avanzaReadOnlySelectedRecommendationDevPreviewFixtures",
    );
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("read-only selectedRecommendation dev preview guard harness source stays pure and passive", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness.tsx",
    );

    expect(harnessSource).not.toMatch(/process\.env/);
    expect(harnessSource).not.toMatch(/app\/trade-app|app\/dev\/avanza-visual-qa/);
    expect(harnessSource).not.toMatch(/useState|useEffect|useMemo|from ["']react["']/);
    expect(harnessSource).not.toMatch(/fetch\s*\(/);
    expect(harnessSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(harnessSource).not.toMatch(/setInterval|setTimeout/);
    expect(harnessSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(harnessSource).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(harnessSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(harnessSource).not.toMatch(/method:\s*["']POST["']/);
    expect(harnessSource).not.toMatch(/localStorage|sessionStorage/);
    expect(harnessSource).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
    expect(harnessSource).not.toMatch(/supabase|execution[_-]?record/i);
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("read-only selectedRecommendation dev preview guard harness is rendered only by the fixture-only dev route, not Trade UI", () => {
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness",
    );
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness",
    );
    expect(routeSource).toContain("Fixture/model only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
  });

  test("read-only selectedRecommendation dev preview guard checkpoint doc exists and records non-wired safety state", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-dev-preview-guard-checkpoint.md",
    );

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_dev_preview_guard_checkpoint_added",
    );
    expect(checkpoint).toContain("default guard is hidden");
    expect(checkpoint).toContain("cannot read real selectedRecommendation");
    expect(checkpoint).toContain("cannot derive preview state");
    expect(checkpoint).toContain("cannot render read-only preview");
    expect(checkpoint).toContain("fixture fallback remains available");
    expect(checkpoint).toContain("read_only_dev_preview_allowed");
    expect(checkpoint).toContain("fixture/model state");
    expect(checkpoint).toContain("future read-only capability only");
    expect(checkpoint).toContain("harness remains isolated");
    expect(checkpoint).toContain("not rendered in `app/trade-app.tsx`");
    expect(checkpoint).toContain(
      "rendered in `app/dev/avanza-visual-qa/page.tsx` as a",
    );
    expect(checkpoint).toContain("fixture/model-only section");
    expect(checkpoint).toContain("existing dev route remains fixture-only");
    expect(checkpoint).toContain("dev route harness section is fixture/model-only");
    expect(checkpoint).toContain("no real selectedRecommendation state is read");
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain(
      "selectedRecommendation preview disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain("no Supabase execution write");
  });

  test("read-only selectedRecommendation dev preview route section checkpoint doc exists and records fixture-only route section", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-dev-preview-route-section-checkpoint.md",
    );

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_dev_preview_route_section_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "guard harness is rendered on `app/dev/avanza-visual-qa/page.tsx`",
    );
    expect(checkpoint).toContain("route section is fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain("guard harness is not rendered in Trade UI");
    expect(checkpoint).toContain("no real selectedRecommendation state is read");
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("no real preview state is derived");
    expect(checkpoint).toContain(
      "selectedRecommendation preview disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain("no Supabase execution write");
  });

  test("default cannot expose route, render gallery, or use real state", () => {
    const decision = buildAvanzaDevVisualQaRouteAccess();

    expect(decision.status).toBe("hidden");
    expect(decision.canExposeRoute).toBe(false);
    expect(decision.canLinkFromMainNavigation).toBe(false);
    expect(decision.canRenderFixtureGallery).toBe(false);
    expect(decision.canUseRealSelectedRecommendationState).toBe(false);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canExecute).toBe(false);
  });

  test("dev-only fixture can allow route exposure for fixture gallery only", () => {
    const visiblePreviewSurfaceGuard =
      buildAvanzaDevVisiblePreviewSurfaceGuard({
        enablementState: avanzaDevOnlyPreviewEnablementCandidateState,
      });
    const decision = buildAvanzaDevVisualQaRouteAccess({
      visiblePreviewSurfaceGuard,
    });

    expect(decision.status).toBe("dev_route_allowed");
    expect(decision.canExposeRoute).toBe(true);
    expect(decision.canRenderFixtureGallery).toBe(true);
    expect(decision.canLinkFromMainNavigation).toBe(false);
    expect(decision.canUseRealSelectedRecommendationState).toBe(false);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canExecute).toBe(false);
  });

  test("production-forbidden fixture blocks route exposure", () => {
    const visiblePreviewSurfaceGuard =
      buildAvanzaDevVisiblePreviewSurfaceGuard({
        enablementState: avanzaDevOnlyPreviewEnablementProductionForbiddenState,
      });
    const decision = buildAvanzaDevVisualQaRouteAccess({
      visiblePreviewSurfaceGuard,
    });

    expect(decision.status).toBe("blocked");
    expect(decision.canExposeRoute).toBe(false);
    expect(decision.canRenderFixtureGallery).toBe(false);
  });

  test("force blocked input blocks route exposure", () => {
    const visiblePreviewSurfaceGuard =
      buildAvanzaDevVisiblePreviewSurfaceGuard({
        enablementState: avanzaDevOnlyPreviewEnablementCandidateState,
      });
    const decision = buildAvanzaDevVisualQaRouteAccess({
      blockedReason: "Manual dev-only route access block.",
      forceBlocked: true,
      visiblePreviewSurfaceGuard,
    });

    expect(decision.status).toBe("blocked");
    expect(decision.reason).toBe("Manual dev-only route access block.");
    expect(decision.canExposeRoute).toBe(false);
  });

  test("no execution-ready or production-ready copy appears", () => {
    const visiblePreviewSurfaceGuard =
      buildAvanzaDevVisiblePreviewSurfaceGuard({
        enablementState: avanzaDevOnlyPreviewEnablementCandidateState,
      });
    const serialized = JSON.stringify([
      avanzaDevVisualQaRouteAccessDefaultDecision,
      buildAvanzaDevVisualQaRouteAccess({ visiblePreviewSurfaceGuard }),
    ]);

    expect(serialized).not.toMatch(/execution-ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("helper is pure and contains no live endpoints, trigger phrase, or bridge behavior", () => {
    const source = readRepoFile("lib/avanza-dev-visual-qa-route-access.ts");

    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/app\/trade-app|useState|useMemo|from ["']react["']/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
  });

  test("route access fixtures cover hidden, blocked, and allowed states", () => {
    const hiddenFixture = fixtureById("hidden");
    const blockedFixture = fixtureById("blocked_production_forbidden");
    const allowedFixture = fixtureById("dev_route_allowed");

    expect(hiddenFixture.expectedState).toBe("hidden");
    expect(hiddenFixture.accessDecision.status).toBe("hidden");
    expect(hiddenFixture.accessDecision.canExposeRoute).toBe(false);

    expect(blockedFixture.expectedState).toBe("blocked");
    expect(blockedFixture.accessDecision.status).toBe("blocked");
    expect(blockedFixture.accessDecision.canExposeRoute).toBe(false);

    expect(allowedFixture.expectedState).toBe("dev_route_allowed");
    expect(allowedFixture.accessDecision.status).toBe("dev_route_allowed");
    expect(allowedFixture.accessDecision.canExposeRoute).toBe(true);
    expect(allowedFixture.accessDecision.canRenderFixtureGallery).toBe(true);
  });

  test("all route access fixtures keep hard route and execution limits", () => {
    for (const fixture of avanzaDevVisualQaRouteAccessFixtures) {
      expect(fixture.accessDecision.canLinkFromMainNavigation).toBe(false);
      expect(fixture.accessDecision.canUseRealSelectedRecommendationState).toBe(
        false,
      );
      expect(fixture.accessDecision.canCallBridge).toBe(false);
      expect(fixture.accessDecision.canFetchLocalhost).toBe(false);
      expect(fixture.accessDecision.canExecute).toBe(false);
    }
  });

  test("route access harness renders fixture states and safety copy", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaDevVisualQaRouteAccessHarness.tsx",
    );

    expect(harnessSource).toContain("Route access fixture only");
    expect(harnessSource).toContain("No route is created");
    expect(harnessSource).toContain("Not linked from main navigation");
    expect(harnessSource).toContain("No bridge calls");
    expect(harnessSource).toContain("No localhost fetch");
    expect(harnessSource).toContain("No execution");
    expect(harnessSource).toContain("canExposeRoute");
    expect(harnessSource).toContain("canRenderFixtureGallery");
    expect(harnessSource).toContain("canLinkFromMainNavigation");
    expect(harnessSource).toContain("canUseRealSelectedRecommendationState");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("fixtures and harness contain no live endpoints, trigger phrase, active controls, or app state reads", () => {
    const fixtureSource = readRepoFile(
      "lib/avanza-dev-visual-qa-route-access-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaDevVisualQaRouteAccessHarness.tsx",
    );

    for (const source of [fixtureSource, harnessSource]) {
      expect(source).not.toMatch(/process\.env/);
      expect(source).not.toMatch(/app\/trade-app|useState|useMemo|from ["']react["']/);
      expect(source).not.toMatch(/fetch\s*\(/);
      expect(source).not.toMatch(/localhost:|127\.0\.0\.1/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/method:\s*["']POST["']/);
      expect(source).not.toMatch(/localStorage|sessionStorage/);
      expect(source).not.toMatch(/document\.cookie|cookies\.set|cookies\(\)/i);
      expect(source).not.toMatch(/supabase|execution[_-]?record/i);
      expect(source).not.toContain("<button");
      expect(source).not.toMatch(/onClick\s*=/);
    }
  });
});
