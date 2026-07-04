import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
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
  buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision,
} from "../../lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision";
import {
  avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures,
} from "../../lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-fixtures";
import {
  buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper,
} from "../../lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper";
import {
  avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures,
} from "../../lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures";
import {
  avanzaReadOnlySelectedRecommendationDerivationDecisionFixtures,
} from "../../lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures";
import {
  avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard,
  buildAvanzaRealSelectedRecommendationReadOnlyInputGuard,
} from "../../lib/avanza-real-selected-recommendation-read-only-input-guard";
import {
  avanzaRealSelectedRecommendationReadOnlyInputGuardFixtures,
} from "../../lib/avanza-real-selected-recommendation-read-only-input-guard-fixtures";
import {
  buildAvanzaRealSelectedRecommendationReadOnlyInputValidation,
} from "../../lib/avanza-real-selected-recommendation-read-only-input-validation";
import {
  buildAvanzaRealSelectedRecommendationReadOnlyDerivation,
} from "../../lib/avanza-real-selected-recommendation-read-only-derivation";
import {
  avanzaRealSelectedRecommendationReadOnlyDerivationFixtures,
} from "../../lib/avanza-real-selected-recommendation-read-only-derivation-fixtures";
import {
  buildAvanzaTradeUiReadOnlySelectedRecommendationPreview,
  type AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel,
} from "../../lib/avanza-trade-ui-read-only-selected-recommendation-preview-model";
import {
  avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures,
} from "../../lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures";
import {
  avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures,
} from "../../lib/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures";

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

function readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
  id: string,
) {
  const fixture =
    avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures.find(
      (item) => item.id === id,
    );

  if (!fixture) {
    throw new Error(
      `Missing read-only selectedRecommendation adapter/derived-preview integration decision fixture ${id}`,
    );
  }

  return fixture;
}

function readOnlyAdapterDerivedPreviewWrapperFixtureById(id: string) {
  const fixture =
    avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures.find(
      (item) => item.id === id,
    );

  if (!fixture) {
    throw new Error(
      `Missing read-only selectedRecommendation adapter/derived-preview wrapper fixture ${id}`,
    );
  }

  return fixture;
}

function realSelectedRecommendationReadOnlyInputGuardFixtureById(id: string) {
  const fixture =
    avanzaRealSelectedRecommendationReadOnlyInputGuardFixtures.find(
      (item) => item.id === id,
    );

  if (!fixture) {
    throw new Error(
      `Missing real selectedRecommendation read-only input guard fixture ${id}`,
    );
  }

  return fixture;
}

function realSelectedRecommendationReadOnlyDerivationFixtureById(id: string) {
  const fixture =
    avanzaRealSelectedRecommendationReadOnlyDerivationFixtures.find(
      (item) => item.id === id,
    );

  if (!fixture) {
    throw new Error(
      `Missing real selectedRecommendation read-only derivation fixture ${id}`,
    );
  }

  return fixture;
}

function tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
  id: string,
) {
  const fixture =
    avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures.find(
      (item) => item.id === id,
    );

  if (!fixture) {
    throw new Error(
      `Missing Trade UI read-only selectedRecommendation preview model fixture ${id}`,
    );
  }

  return fixture;
}

const navigationSourceFiles = [
  "app/page.tsx",
  "app/settings/page.tsx",
  "app/trade-app.tsx",
] as const;

const selectedRecommendationAdapterSafetyAuditTargetFiles = [
  "lib/avanza-selected-recommendation-adapter.ts",
  "lib/avanza-selected-recommendation-derived-preview-state.ts",
  "lib/avanza-selected-recommendation-preview-state.ts",
  "lib/avanza-selected-recommendation-preview-integration-guard.ts",
  "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts",
  "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts",
  "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts",
] as const;

const staticSafetyForbiddenPatterns = [
  /fetch\s*\(/,
  /localhost:|127\.0\.0\.1/,
  /setInterval|setTimeout|window\.setInterval|window\.setTimeout/,
  /\/live-fill-only-runner\//,
  /method:\s*["']POST["']/,
  /FINAL\s+LIVE\s+EXECUTE/,
  /fillQuantityField|fillPriceField|fillAmountField/,
  /clickGranska|granskaKop|reviewModal|finalConfirmation|submitOrder|placeOrder/i,
  /BankID|document\.cookie|cookies\.set|cookies\(\)|localStorage|sessionStorage/,
  /supabase.*execution|execution[_-]?record/i,
  /production-ready|production ready|execution-ready|execution ready/i,
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
    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness",
    );
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness",
    );
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
  });

  test("isolated route content renders the expected fixture-only sections and copy", () => {
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(routeSource).toContain("Route access fixtures");
    expect(routeSource).toContain("Visible preview surface fixtures");
    expect(routeSource).toContain(
      "Read-only selectedRecommendation dev preview guard",
    );
    expect(routeSource).toContain(
      "Read-only selectedRecommendation derivation decision",
    );
    expect(routeSource).toContain(
      "Adapter/derived-preview integration decision",
    );
    expect(routeSource).toContain("Static route-access decisions only");
    expect(routeSource).toContain(
      "Static selectedRecommendation preview fixtures only",
    );
    expect(routeSource).toContain("Fixture/model only");
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain("No adapter is called");
    expect(routeSource).toContain("no derived-preview builder is called");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no real preview state is derived");
    expect(routeSource).toContain("no real preview state");
    expect(routeSource).toContain("is rendered");
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

    expect(serialized).not.toMatch(/is execution-ready/i);
    expect(serialized).not.toMatch(/execution-ready and enabled/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
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

  test("real selectedRecommendation read-only input guard is hidden by default", () => {
    expect(avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.status).toBe(
      "hidden",
    );
    expect(
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.sourceMode,
    ).toBe("fixture_only");
    expect(
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.canReadRealSelectedRecommendation,
    ).toBe(false);
    expect(
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.canValidateInput,
    ).toBe(false);
    expect(
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.canProceedToReadOnlyDerivation,
    ).toBe(false);
    expect(
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.canUseFixtureFallback,
    ).toBe(true);
    expect(
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.canCallBridge,
    ).toBe(false);
    expect(
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.canFetchLocalhost,
    ).toBe(false);
    expect(avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.canPoll).toBe(
      false,
    );
    expect(
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.canExecute,
    ).toBe(false);
    expect(
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.controlsEnabled,
    ).toBe(false);
    expect(avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard.gateLocked).toBe(
      true,
    );
  });

  test("real selectedRecommendation read-only input guard blocks production-forbidden config", () => {
    const decision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "production_forbidden",
      blockedReason: "Production scope is not allowed for read-only input.",
    });

    expect(decision.status).toBe("blocked");
    expect(decision.sourceMode).toBe("blocked");
    expect(decision.canReadRealSelectedRecommendation).toBe(false);
    expect(decision.canValidateInput).toBe(false);
    expect(decision.canProceedToReadOnlyDerivation).toBe(false);
    expect(decision.canUseFixtureFallback).toBe(true);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("explicit dev/read-only config allows real selectedRecommendation input in model only", () => {
    const decision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
      sourceLabel: "manual dev input fixture",
    });

    expect(decision.status).toBe("read_only_input_allowed");
    expect(decision.sourceMode).toBe("real_selected_recommendation_read_only");
    expect(decision.sourceLabel).toBe("manual dev input fixture");
    expect(decision.canReadRealSelectedRecommendation).toBe(true);
    expect(decision.canValidateInput).toBe(true);
    expect(decision.canProceedToReadOnlyDerivation).toBe(true);
    expect(decision.canUseFixtureFallback).toBe(true);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("real selectedRecommendation read-only input guard has no execution-ready or production-ready copy", () => {
    const serialized = JSON.stringify([
      avanzaRealSelectedRecommendationReadOnlyInputDefaultGuard,
      buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
        environment: "dev_read_only",
        explicitReadOnlyInput: true,
      }),
      buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
        environment: "production_forbidden",
      }),
    ]);

    expect(serialized).not.toMatch(/is execution-ready/i);
    expect(serialized).not.toMatch(/execution-ready and enabled/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("real selectedRecommendation read-only input guard is pure and contains no live behavior", () => {
    const source = readRepoFile(
      "lib/avanza-real-selected-recommendation-read-only-input-guard.ts",
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
    expect(source).not.toMatch(
      /adaptSelectedRecommendation|buildAvanzaSelectedRecommendationPreviewState|buildAvanzaPreviewStateFromSelectedRecommendation/,
    );
  });

  test("real selectedRecommendation read-only input guard fixtures cover hidden, blocked, and allowed states", () => {
    const hiddenFixture =
      realSelectedRecommendationReadOnlyInputGuardFixtureById("hidden_default");
    const blockedFixture =
      realSelectedRecommendationReadOnlyInputGuardFixtureById(
        "blocked_production_forbidden",
      );
    const allowedFixture =
      realSelectedRecommendationReadOnlyInputGuardFixtureById(
        "read_only_input_allowed",
      );

    expect(hiddenFixture.expectedState).toBe("hidden");
    expect(hiddenFixture.guardDecision.status).toBe("hidden");
    expect(hiddenFixture.guardDecision.sourceMode).toBe("fixture_only");
    expect(hiddenFixture.guardDecision.canReadRealSelectedRecommendation).toBe(
      false,
    );
    expect(hiddenFixture.guardDecision.canValidateInput).toBe(false);
    expect(hiddenFixture.guardDecision.canProceedToReadOnlyDerivation).toBe(
      false,
    );
    expect(hiddenFixture.guardDecision.canUseFixtureFallback).toBe(true);

    expect(blockedFixture.expectedState).toBe("blocked");
    expect(blockedFixture.guardDecision.status).toBe("blocked");
    expect(blockedFixture.guardDecision.canReadRealSelectedRecommendation).toBe(
      false,
    );
    expect(blockedFixture.guardDecision.canProceedToReadOnlyDerivation).toBe(
      false,
    );

    expect(allowedFixture.expectedState).toBe("read_only_input_allowed");
    expect(allowedFixture.guardDecision.status).toBe("read_only_input_allowed");
    expect(allowedFixture.guardDecision.sourceMode).toBe(
      "real_selected_recommendation_read_only",
    );
    expect(allowedFixture.guardDecision.canReadRealSelectedRecommendation).toBe(
      true,
    );
    expect(allowedFixture.guardDecision.canValidateInput).toBe(true);
    expect(allowedFixture.guardDecision.canProceedToReadOnlyDerivation).toBe(
      true,
    );
  });

  test("real selectedRecommendation read-only input guard fixtures keep hard safety limits", () => {
    for (const fixture of avanzaRealSelectedRecommendationReadOnlyInputGuardFixtures) {
      expect(fixture.guardDecision.canCallBridge).toBe(false);
      expect(fixture.guardDecision.canFetchLocalhost).toBe(false);
      expect(fixture.guardDecision.canPoll).toBe(false);
      expect(fixture.guardDecision.canExecute).toBe(false);
      expect(fixture.guardDecision.controlsEnabled).toBe(false);
      expect(fixture.guardDecision.gateLocked).toBe(true);
    }
  });

  test("real selectedRecommendation read-only input guard fixtures have no execution-ready or production-ready copy", () => {
    const serialized = JSON.stringify(
      avanzaRealSelectedRecommendationReadOnlyInputGuardFixtures,
    );

    expect(serialized).not.toMatch(/is execution-ready/i);
    expect(serialized).not.toMatch(/execution-ready and enabled/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("real selectedRecommendation read-only input guard fixtures are pure and contain no live behavior", () => {
    const source = readRepoFile(
      "lib/avanza-real-selected-recommendation-read-only-input-guard-fixtures.ts",
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
    expect(source).not.toMatch(
      /adaptSelectedRecommendation|buildAvanzaSelectedRecommendationPreviewState|buildAvanzaPreviewStateFromSelectedRecommendation/,
    );
  });

  test("real selectedRecommendation read-only input guard harness renders fixture states and safety copy", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness.tsx",
    );

    expect(harnessSource).toContain(
      "Real selectedRecommendation read-only input guard",
    );
    expect(harnessSource).toContain("Guard fixture only");
    expect(harnessSource).toContain("No real selectedRecommendation state is read");
    expect(harnessSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(harnessSource).toContain("No app/route preview state is derived");
    expect(harnessSource).toContain("No bridge calls");
    expect(harnessSource).toContain("No localhost fetch");
    expect(harnessSource).toContain("No polling");
    expect(harnessSource).toContain("No execution");
    expect(harnessSource).toContain("Controls disabled");
    expect(harnessSource).toContain("Gate locked");
    expect(harnessSource).toContain("fixture.label");
    expect(harnessSource).toContain("decision.status");
    expect(harnessSource).toContain("decision.sourceMode");
    expect(harnessSource).toContain("canReadRealSelectedRecommendation");
    expect(harnessSource).toContain("canValidateInput");
    expect(harnessSource).toContain("canProceedToReadOnlyDerivation");
    expect(harnessSource).toContain("canUseFixtureFallback");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("real selectedRecommendation read-only input guard harness fixture data covers hidden, blocked, and allowed model states", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness.tsx",
    );
    const hiddenFixture =
      realSelectedRecommendationReadOnlyInputGuardFixtureById("hidden_default");
    const blockedFixture =
      realSelectedRecommendationReadOnlyInputGuardFixtureById(
        "blocked_production_forbidden",
      );
    const allowedFixture =
      realSelectedRecommendationReadOnlyInputGuardFixtureById(
        "read_only_input_allowed",
      );

    expect(harnessSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyInputGuardFixtures",
    );
    expect(hiddenFixture.guardDecision.status).toBe("hidden");
    expect(hiddenFixture.guardDecision.canReadRealSelectedRecommendation).toBe(
      false,
    );
    expect(hiddenFixture.guardDecision.canUseFixtureFallback).toBe(true);
    expect(blockedFixture.guardDecision.status).toBe("blocked");
    expect(blockedFixture.guardDecision.canReadRealSelectedRecommendation).toBe(
      false,
    );
    expect(allowedFixture.guardDecision.status).toBe("read_only_input_allowed");
    expect(allowedFixture.label).toContain("model-only/read-only");
    expect(allowedFixture.guardDecision.canReadRealSelectedRecommendation).toBe(
      true,
    );
    expect(allowedFixture.guardDecision.canValidateInput).toBe(true);
    expect(allowedFixture.guardDecision.canProceedToReadOnlyDerivation).toBe(
      true,
    );
  });

  test("real selectedRecommendation read-only input guard harness source stays pure and passive", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness.tsx",
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
    expect(harnessSource).not.toMatch(
      /adaptSelectedRecommendation|buildAvanzaSelectedRecommendationPreviewState|buildAvanzaPreviewStateFromSelectedRecommendation/,
    );
  });

  test("real selectedRecommendation read-only input guard harness is rendered only on the fixture/model-only dev route", () => {
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(tradeAppSource).not.toContain(
      "AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness",
    );
    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness",
    );
    expect(routeSource).toContain(
      "Real selectedRecommendation read-only input guard",
    );
    expect(routeSource).toContain("Guard fixture only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).toContain("No bridge calls");
    expect(routeSource).toContain("No localhost fetch");
    expect(routeSource).toContain("No polling");
    expect(routeSource).toContain("No execution");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");
    expect(routeSource).toContain("read_only_input_allowed");
    expect(routeSource).toContain("model-only/read-only");
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toMatch(/method:\s*["']POST["']/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
  });

  test("real selectedRecommendation read-only input guard route section pre-implementation checkpoint records fixture-only route permission", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-pre-implementation-checkpoint.md",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_real_selected_recommendation_read_only_input_guard_route_section_pre_implementation_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "avanza_real_selected_recommendation_read_only_input_guard_route_section_rendered_fixture_model_only",
    );
    expect(checkpoint).toContain("Preconditions for a future route section");
    expect(checkpoint).toContain(
      "updates `app/dev/avanza-visual-qa/page.tsx` to",
    );
    expect(checkpoint).toContain("import and render");
    expect(checkpoint).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness",
    );
    expect(checkpoint).toContain("render only static guard fixtures");
    expect(checkpoint).toContain("label the section fixture/model-only");
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is read",
    );
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain(
      "No app/route preview state is derived",
    );
    expect(checkpoint).toContain("No bridge calls");
    expect(checkpoint).toContain("No localhost fetch");
    expect(checkpoint).toContain("No polling");
    expect(checkpoint).toContain("No execution");
    expect(checkpoint).toContain("Controls disabled");
    expect(checkpoint).toContain("Gate locked");
    expect(checkpoint).toContain("hidden_default");
    expect(checkpoint).toContain("blocked_production_forbidden");
    expect(checkpoint).toContain("read_only_input_allowed");
    expect(checkpoint).toContain("canCallBridge: false");
    expect(checkpoint).toContain("canFetchLocalhost: false");
    expect(checkpoint).toContain("canPoll: false");
    expect(checkpoint).toContain("canExecute: false");
    expect(checkpoint).toContain("controlsEnabled: false");
    expect(checkpoint).toContain("gateLocked: true");
    expect(checkpoint).toContain("no active handoff button");
    expect(checkpoint).toContain("no real selectedRecommendation state read");
    expect(checkpoint).toContain("no real selectedRecommendation state render");
    expect(checkpoint).toContain("no real app/route preview state derivation");
    expect(checkpoint).toContain("no real app/route preview state render");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain("no Supabase execution writes");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("app/trade-app.tsx` remains unchanged");
    expect(checkpoint).toMatch(/route-visible as\s+fixture\/model-only content/);
    expect(tradeAppSource).not.toContain(
      "AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness",
    );
    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness",
    );
  });

  test("real selectedRecommendation read-only input guard route section checkpoint records completed fixture-only section", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-checkpoint.md",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const harnessSource = readRepoFile(
      "components/execution/AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness.tsx",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-real-selected-recommendation-read-only-input-guard-fixtures.ts",
    );

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_real_selected_recommendation_read_only_input_guard_route_section_checkpoint_added",
    );
    expect(checkpoint).toContain("route section is rendered");
    expect(checkpoint).toContain("fixture/model-only content");
    expect(checkpoint).toContain("static guard fixtures only");
    expect(checkpoint).toContain("hidden_default");
    expect(checkpoint).toContain("blocked_production_forbidden");
    expect(checkpoint).toContain("read_only_input_allowed");
    expect(checkpoint).toContain(
      "`read_only_input_allowed` is model-only/read-only, not active",
    );
    expect(checkpoint).toContain("No real selectedRecommendation state is read");
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("No app/route preview state is derived");
    expect(checkpoint).toContain(
      "No app/route preview state is rendered from real input",
    );
    expect(checkpoint).toContain("harness is not wired into Trade UI");
    expect(checkpoint).toContain("app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain(
      "selectedRecommendation preview disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain(
      "Add a real selectedRecommendation read-only input validation model",
    );
    expect(checkpoint).toContain("accept explicit input only");
    expect(checkpoint).toContain("not read app/route state");
    expect(checkpoint).toContain("not derive preview yet");
    expect(checkpoint).toContain("not wire into Trade UI");
    expect(checkpoint).toContain("keep bridge/local/poll/execution false");

    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness",
    );
    expect(routeSource).toContain(
      "Real selectedRecommendation read-only input guard",
    );
    expect(routeSource).toContain("Guard fixture only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).toContain("No bridge calls");
    expect(routeSource).toContain("No localhost fetch");
    expect(routeSource).toContain("No polling");
    expect(routeSource).toContain("No execution");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");
    expect(routeSource).toContain("read_only_input_allowed");
    expect(routeSource).toContain("model-only/read-only");
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);

    expect(fixtureSource).toContain("hidden_default");
    expect(fixtureSource).toContain("blocked_production_forbidden");
    expect(fixtureSource).toContain("read_only_input_allowed");
    expect(fixtureSource).toContain("model-only/read-only");
    expect(fixtureSource).not.toMatch(/fetch\s*\(/);
    expect(fixtureSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(fixtureSource).not.toMatch(/setInterval|setTimeout/);
    expect(fixtureSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(fixtureSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(harnessSource).not.toMatch(/fetch\s*\(/);
    expect(harnessSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(harnessSource).not.toMatch(/setInterval|setTimeout/);
    expect(harnessSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
    expect(harnessSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);

    for (const fixture of avanzaRealSelectedRecommendationReadOnlyInputGuardFixtures) {
      expect(fixture.guardDecision.canCallBridge).toBe(false);
      expect(fixture.guardDecision.canFetchLocalhost).toBe(false);
      expect(fixture.guardDecision.canPoll).toBe(false);
      expect(fixture.guardDecision.canExecute).toBe(false);
      expect(fixture.guardDecision.controlsEnabled).toBe(false);
      expect(fixture.guardDecision.gateLocked).toBe(true);
    }

    expect(
      realSelectedRecommendationReadOnlyInputGuardFixtureById(
        "hidden_default",
      ).guardDecision.status,
    ).toBe("hidden");
    expect(
      realSelectedRecommendationReadOnlyInputGuardFixtureById(
        "blocked_production_forbidden",
      ).guardDecision.status,
    ).toBe("blocked");
    expect(
      realSelectedRecommendationReadOnlyInputGuardFixtureById(
        "read_only_input_allowed",
      ).label,
    ).toContain("model-only/read-only");

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }

    expect(tradeAppSource).not.toContain(
      "AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness",
    );
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toContain("read_only_input_allowed");
  });

  test("real selectedRecommendation read-only input validation returns no_input by default", () => {
    const validation =
      buildAvanzaRealSelectedRecommendationReadOnlyInputValidation();

    expect(validation.status).toBe("no_input");
    expect(validation.sourceMode).toBe("none");
    expect(validation.normalizedInputSummary).toBeUndefined();
    expect(validation.canProceedToAdapterNormalization).toBe(false);
    expect(validation.canProceedToReadOnlyDerivation).toBe(false);
    expect(validation.canCallBridge).toBe(false);
    expect(validation.canFetchLocalhost).toBe(false);
    expect(validation.canPoll).toBe(false);
    expect(validation.canExecute).toBe(false);
    expect(validation.controlsEnabled).toBe(false);
    expect(validation.gateLocked).toBe(true);
  });

  test("real selectedRecommendation read-only input validation blocks when guard blocks", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "production_forbidden",
    });
    const validation = buildAvanzaRealSelectedRecommendationReadOnlyInputValidation({
      guardDecision,
      input: {
        direction: "buy",
        ticker: "VOLV B",
      },
    });

    expect(validation.status).toBe("guard_blocked");
    expect(validation.sourceMode).toBe("blocked");
    expect(validation.normalizedInputSummary).toBeUndefined();
    expect(validation.canProceedToAdapterNormalization).toBe(false);
    expect(validation.canProceedToReadOnlyDerivation).toBe(false);
    expect(validation.canCallBridge).toBe(false);
    expect(validation.canFetchLocalhost).toBe(false);
    expect(validation.canPoll).toBe(false);
    expect(validation.canExecute).toBe(false);
    expect(validation.controlsEnabled).toBe(false);
    expect(validation.gateLocked).toBe(true);
  });

  test("real selectedRecommendation read-only input validation rejects invalid inputs", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
    });
    const primitiveValidation =
      buildAvanzaRealSelectedRecommendationReadOnlyInputValidation({
        guardDecision,
        input: "VOLV B",
      });
    const missingRequiredValidation =
      buildAvanzaRealSelectedRecommendationReadOnlyInputValidation({
        guardDecision,
        input: {
          company: "Volvo",
        },
      });
    const invalidNumberValidation =
      buildAvanzaRealSelectedRecommendationReadOnlyInputValidation({
        guardDecision,
        input: {
          direction: "buy",
          price: Number.POSITIVE_INFINITY,
          ticker: "VOLV B",
        },
      });

    for (const validation of [
      primitiveValidation,
      missingRequiredValidation,
      invalidNumberValidation,
    ]) {
      expect(validation.status).toBe("invalid_input");
      expect(validation.sourceMode).toBe("blocked");
      expect(validation.normalizedInputSummary).toBeUndefined();
      expect(validation.canProceedToAdapterNormalization).toBe(false);
      expect(validation.canProceedToReadOnlyDerivation).toBe(false);
      expect(validation.canCallBridge).toBe(false);
      expect(validation.canFetchLocalhost).toBe(false);
      expect(validation.canPoll).toBe(false);
      expect(validation.canExecute).toBe(false);
      expect(validation.controlsEnabled).toBe(false);
      expect(validation.gateLocked).toBe(true);
    }
  });

  test("real selectedRecommendation read-only input validation returns safe summary for valid explicit input", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
    });
    const validation = buildAvanzaRealSelectedRecommendationReadOnlyInputValidation({
      guardDecision,
      input: {
        accountId: "unsafe-account",
        direction: "buy",
        brokerSecret: "unsafe-secret",
        confidence: 0.72,
        cookie: "unsafe-cookie",
        credentials: "unsafe-credentials",
        entry: 125.5,
        id: "rec-123",
        quantity: 10,
        session: "unsafe-session",
        stopLoss: 120,
        storage: "unsafe-storage",
        target: 134,
        ticker: "VOLV B",
      },
    });

    expect(validation.status).toBe("valid_read_only_input");
    expect(validation.sourceMode).toBe("real_selected_recommendation_read_only");
    expect(validation.canProceedToAdapterNormalization).toBe(true);
    expect(validation.canProceedToReadOnlyDerivation).toBe(true);
    expect(validation.normalizedInputSummary).toMatchObject({
      confidence: 0.72,
      direction: "buy",
      entry: 125.5,
      id: "rec-123",
      quantity: 10,
      stopLoss: 120,
      target: 134,
      ticker: "VOLV B",
    });

    const serializedSummary = JSON.stringify(validation.normalizedInputSummary);

    expect(serializedSummary).not.toMatch(
      /credential|session|account|cookie|storage|brokerSecret|secret/i,
    );
    expect(validation.canCallBridge).toBe(false);
    expect(validation.canFetchLocalhost).toBe(false);
    expect(validation.canPoll).toBe(false);
    expect(validation.canExecute).toBe(false);
    expect(validation.controlsEnabled).toBe(false);
    expect(validation.gateLocked).toBe(true);
  });

  test("real selectedRecommendation read-only input validation has no execution-ready or production-ready copy", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
    });
    const serialized = JSON.stringify([
      buildAvanzaRealSelectedRecommendationReadOnlyInputValidation(),
      buildAvanzaRealSelectedRecommendationReadOnlyInputValidation({
        guardDecision,
        input: {
          direction: "buy",
          ticker: "VOLV B",
        },
      }),
      buildAvanzaRealSelectedRecommendationReadOnlyInputValidation({
        guardDecision,
        input: {},
      }),
    ]);

    expect(serialized).not.toMatch(/[^a-z-]execution-ready/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("real selectedRecommendation read-only input validation helper is pure and contains no live behavior", () => {
    const source = readRepoFile(
      "lib/avanza-real-selected-recommendation-read-only-input-validation.ts",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

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
    expect(source).not.toMatch(
      /adaptSelectedRecommendation|buildAvanzaSelectedRecommendationPreviewState|buildAvanzaPreviewStateFromSelectedRecommendation/,
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaRealSelectedRecommendationReadOnlyInputValidation",
    );
    expect(routeSource).not.toContain(
      "buildAvanzaRealSelectedRecommendationReadOnlyInputValidation",
    );
  });

  test("real selectedRecommendation read-only derivation helper returns no_input without explicit input", () => {
    const derivation =
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation();

    expect(derivation.status).toBe("no_input");
    expect(derivation.sourceMode).toBe("none");
    expect(derivation.normalizedInputSummary).toBeUndefined();
    expect(derivation.previewState).toBeUndefined();
    expect(derivation.canRenderReadOnlyPreview).toBe(false);
    expect(derivation.canProceedToHandoff).toBe(false);
    expect(derivation.canCallBridge).toBe(false);
    expect(derivation.canFetchLocalhost).toBe(false);
    expect(derivation.canPoll).toBe(false);
    expect(derivation.canExecute).toBe(false);
    expect(derivation.controlsEnabled).toBe(false);
    expect(derivation.gateLocked).toBe(true);
  });

  test("real selectedRecommendation read-only derivation helper blocks when guard blocks", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "production_forbidden",
    });
    const derivation = buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
      guardDecision,
      selectedRecommendationLikeInput: {
        direction: "buy",
        entryPrice: 125.5,
        quantity: 10,
        ticker: "VOLV B",
      },
    });

    expect(derivation.status).toBe("guard_blocked");
    expect(derivation.sourceMode).toBe("blocked");
    expect(derivation.normalizedInputSummary).toBeUndefined();
    expect(derivation.previewState).toBeUndefined();
    expect(derivation.canRenderReadOnlyPreview).toBe(false);
    expect(derivation.canProceedToHandoff).toBe(false);
    expect(derivation.controlsEnabled).toBe(false);
    expect(derivation.gateLocked).toBe(true);
  });

  test("real selectedRecommendation read-only derivation helper rejects invalid input before adapter normalization", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
    });
    const derivation = buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
      guardDecision,
      selectedRecommendationLikeInput: {
        companyName: "Missing ticker and direction",
      },
    });

    expect(derivation.status).toBe("invalid_input");
    expect(derivation.sourceMode).toBe("blocked");
    expect(derivation.normalizedInputSummary).toBeUndefined();
    expect(derivation.previewState).toBeUndefined();
    expect(derivation.canRenderReadOnlyPreview).toBe(false);
    expect(derivation.canProceedToHandoff).toBe(false);
  });

  test("real selectedRecommendation read-only derivation helper rejects non-buy adapter candidates", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
    });
    const derivation = buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
      guardDecision,
      selectedRecommendationLikeInput: {
        direction: "sell",
        entryPrice: 125.5,
        quantity: 10,
        ticker: "VOLV B",
      },
    });

    expect(derivation.status).toBe("adapter_rejected");
    expect(derivation.normalizedInputSummary).toMatchObject({
      direction: "sell",
      hasTicker: true,
      hasTradeSide: true,
      ticker: "VOLV B",
    });
    expect(derivation.previewState).toBeUndefined();
    expect(derivation.canRenderReadOnlyPreview).toBe(false);
    expect(derivation.canProceedToHandoff).toBe(false);
    expect(derivation.controlsEnabled).toBe(false);
    expect(derivation.gateLocked).toBe(true);
  });

  test("real selectedRecommendation read-only derivation helper keeps advisory derived previews non-renderable", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
    });
    const derivation = buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
      guardDecision,
      selectedRecommendationLikeInput: {
        direction: "buy",
        ticker: "VOLV B",
      },
    });

    expect(derivation.status).toBe("derived_preview_failed");
    expect(derivation.normalizedInputSummary).toMatchObject({
      direction: "long",
      hasQuantity: false,
      hasTicker: true,
      hasTradeSide: true,
      ticker: "VOLV B",
    });
    expect(derivation.previewState).toBeUndefined();
    expect(derivation.canRenderReadOnlyPreview).toBe(false);
    expect(derivation.canProceedToHandoff).toBe(false);
    expect(derivation.canCallBridge).toBe(false);
    expect(derivation.canFetchLocalhost).toBe(false);
    expect(derivation.canPoll).toBe(false);
    expect(derivation.canExecute).toBe(false);
    expect(derivation.controlsEnabled).toBe(false);
    expect(derivation.gateLocked).toBe(true);
  });

  test("real selectedRecommendation read-only derivation helper can produce passive locked preview state", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
    });
    const derivation = buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
      guardDecision,
      selectedRecommendationLikeInput: {
        accountId: "unsafe-account",
        direction: "buy",
        brokerSecret: "unsafe-secret",
        companyName: "Volvo",
        cookie: "unsafe-cookie",
        credentials: "unsafe-credentials",
        entryPrice: 125.5,
        id: "real-read-only-1",
        quantity: 10,
        session: "unsafe-session",
        storage: "unsafe-storage",
        ticker: "VOLV B",
      },
      sourceLabel: "read_only_selected_recommendation_dev_preview",
    });

    expect(derivation.status).toBe("read_only_preview_ready");
    expect(derivation.sourceMode).toBe("real_selected_recommendation_read_only");
    expect(derivation.sourceLabel).toBe(
      "read_only_selected_recommendation_dev_preview",
    );
    expect(derivation.normalizedInputSummary).toMatchObject({
      company: "Volvo",
      direction: "long",
      hasQuantity: true,
      hasTicker: true,
      hasTradeSide: true,
      id: "real-read-only-1",
      quantity: 10,
      ticker: "VOLV B",
    });
    expect(derivation.previewState).toBeTruthy();
    expect(derivation.previewState?.displayState).toBe("preview_ready_locked");
    expect(derivation.previewState?.sourceMode.activeMode).toBe(
      "selected_recommendation_preview_only",
    );
    expect(derivation.previewState?.preActivationGate.gateStatus).toBe(
      "locked",
    );
    expect(derivation.canRenderReadOnlyPreview).toBe(true);
    expect(derivation.canProceedToHandoff).toBe(false);
    expect(derivation.canCallBridge).toBe(false);
    expect(derivation.canFetchLocalhost).toBe(false);
    expect(derivation.canPoll).toBe(false);
    expect(derivation.canExecute).toBe(false);
    expect(derivation.controlsEnabled).toBe(false);
    expect(derivation.gateLocked).toBe(true);

    const serializedSummary = JSON.stringify(
      derivation.normalizedInputSummary,
    );

    expect(serializedSummary).not.toMatch(
      /credential|session|account|cookie|storage|brokerSecret|secret/i,
    );
  });

  test("real selectedRecommendation read-only derivation helper exposes previewState only for ready status", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
    });
    const derivations = [
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation(),
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision: buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
          environment: "production_forbidden",
        }),
        selectedRecommendationLikeInput: {
          direction: "buy",
          entryPrice: 125.5,
          quantity: 10,
          ticker: "VOLV B",
        },
      }),
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision,
        selectedRecommendationLikeInput: { companyName: "Missing ticker" },
      }),
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision,
        selectedRecommendationLikeInput: {
          direction: "sell",
          entryPrice: 125.5,
          quantity: 10,
          ticker: "VOLV B",
        },
      }),
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision,
        selectedRecommendationLikeInput: {
          direction: "buy",
          ticker: "VOLV B",
        },
      }),
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision,
        selectedRecommendationLikeInput: {
          direction: "buy",
          entryPrice: 125.5,
          quantity: 10,
          ticker: "VOLV B",
        },
      }),
    ];

    for (const derivation of derivations) {
      if (derivation.status === "read_only_preview_ready") {
        expect(derivation.previewState).toBeTruthy();
        expect(derivation.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(derivation.previewState).toBeUndefined();
        expect(derivation.canRenderReadOnlyPreview).toBe(false);
      }

      expect(derivation.canProceedToHandoff).toBe(false);
      expect(derivation.canCallBridge).toBe(false);
      expect(derivation.canFetchLocalhost).toBe(false);
      expect(derivation.canPoll).toBe(false);
      expect(derivation.canExecute).toBe(false);
      expect(derivation.controlsEnabled).toBe(false);
      expect(derivation.gateLocked).toBe(true);
    }
  });

  test("real selectedRecommendation read-only derivation helper has no execution-ready or production-ready copy", () => {
    const guardDecision = buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
      environment: "dev_read_only",
      explicitReadOnlyInput: true,
    });
    const serialized = JSON.stringify([
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation(),
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision,
        selectedRecommendationLikeInput: {
          direction: "buy",
          entryPrice: 125.5,
          quantity: 10,
          ticker: "VOLV B",
        },
      }),
      buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision,
        selectedRecommendationLikeInput: {
          direction: "buy",
          ticker: "VOLV B",
        },
      }),
    ]);

    expect(serialized).not.toMatch(/is execution-ready/i);
    expect(serialized).not.toMatch(/execution-ready and enabled/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("real selectedRecommendation read-only derivation helper is pure and not wired into app or route", () => {
    const source = readRepoFile(
      "lib/avanza-real-selected-recommendation-read-only-derivation.ts",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(source).toContain(
      "buildAvanzaRealSelectedRecommendationReadOnlyInputValidation",
    );
    expect(source).toContain("adaptSelectedRecommendationToAvanzaHandoffSource");
    expect(source).toContain("buildAvanzaPreviewStateFromSelectedRecommendation");
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
    expect(tradeAppSource).not.toContain(
      "buildAvanzaRealSelectedRecommendationReadOnlyDerivation",
    );
    expect(routeSource).not.toContain(
      "buildAvanzaRealSelectedRecommendationReadOnlyDerivation",
    );
    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
  });

  test("real selectedRecommendation read-only derivation fixtures cover all six statuses", () => {
    const expectedStatuses = [
      "no_input",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ] as const;

    expect(avanzaRealSelectedRecommendationReadOnlyDerivationFixtures).toHaveLength(
      expectedStatuses.length,
    );

    for (const expectedStatus of expectedStatuses) {
      const fixture =
        realSelectedRecommendationReadOnlyDerivationFixtureById(expectedStatus);

      expect(fixture.id).toBe(expectedStatus);
      expect(fixture.expectedStatus).toBe(expectedStatus);
      expect(fixture.derivationResult.status).toBe(expectedStatus);
    }
  });

  test("real selectedRecommendation read-only derivation fixtures expose previewState only for ready fixture", () => {
    for (const fixture of avanzaRealSelectedRecommendationReadOnlyDerivationFixtures) {
      if (fixture.expectedStatus === "read_only_preview_ready") {
        expect(fixture.derivationResult.previewState).toBeTruthy();
        expect(fixture.derivationResult.canRenderReadOnlyPreview).toBe(true);
        expect(fixture.derivationResult.previewState?.displayState).toBe(
          "preview_ready_locked",
        );
        expect(fixture.derivationResult.previewState?.preActivationGate.gateStatus).toBe(
          "locked",
        );
      } else {
        expect(fixture.derivationResult.previewState).toBeUndefined();
        expect(fixture.derivationResult.canRenderReadOnlyPreview).toBe(false);
      }
    }
  });

  test("real selectedRecommendation read-only derivation fixtures keep hard safety limits", () => {
    for (const fixture of avanzaRealSelectedRecommendationReadOnlyDerivationFixtures) {
      expect(fixture.derivationResult.canProceedToHandoff).toBe(false);
      expect(fixture.derivationResult.canCallBridge).toBe(false);
      expect(fixture.derivationResult.canFetchLocalhost).toBe(false);
      expect(fixture.derivationResult.canPoll).toBe(false);
      expect(fixture.derivationResult.canExecute).toBe(false);
      expect(fixture.derivationResult.controlsEnabled).toBe(false);
      expect(fixture.derivationResult.gateLocked).toBe(true);
    }
  });

  test("real selectedRecommendation read-only derivation fixture summaries stay safe and minimal", () => {
    const fixturesWithSummary =
      avanzaRealSelectedRecommendationReadOnlyDerivationFixtures.filter(
        (fixture) => fixture.derivationResult.normalizedInputSummary,
      );

    expect(fixturesWithSummary.length).toBeGreaterThan(0);

    for (const fixture of fixturesWithSummary) {
      const serializedSummary = JSON.stringify(
        fixture.derivationResult.normalizedInputSummary,
      );

      expect(serializedSummary).not.toMatch(
        /credential|session|account|cookie|storage|brokerSecret|secret/i,
      );
    }

    const readyFixture = realSelectedRecommendationReadOnlyDerivationFixtureById(
      "read_only_preview_ready",
    );

    expect(readyFixture.derivationResult.normalizedInputSummary).toMatchObject({
      company: "Volvo",
      confidence: 0.72,
      direction: "long",
      hasQuantity: true,
      hasTicker: true,
      hasTradeSide: true,
      id: "real-read-only-fixture-1",
      quantity: 10,
      ticker: "VOLV B",
    });
  });

  test("real selectedRecommendation read-only derivation fixtures have no execution-ready or production-ready copy", () => {
    const serialized = JSON.stringify(
      avanzaRealSelectedRecommendationReadOnlyDerivationFixtures,
    );

    expect(serialized).not.toMatch(/is execution-ready/i);
    expect(serialized).not.toMatch(/execution-ready and enabled/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("real selectedRecommendation read-only derivation fixtures are pure and wired only into the fixture route", () => {
    const source = readRepoFile(
      "lib/avanza-real-selected-recommendation-read-only-derivation-fixtures.ts",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(source).toContain(
      "buildAvanzaRealSelectedRecommendationReadOnlyDerivation",
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
    expect(tradeAppSource).not.toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );
    expect(routeSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );
    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
  });

  test("real selectedRecommendation read-only derivation harness renders all fixture statuses and safety copy", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaRealSelectedRecommendationReadOnlyDerivationHarness.tsx",
    );

    expect(harnessSource).toContain(
      "Real selectedRecommendation read-only derivation",
    );
    expect(harnessSource).toContain("Derivation fixture only");
    expect(harnessSource).toContain("Explicit input only");
    expect(harnessSource).toContain("No real selectedRecommendation state is read");
    expect(harnessSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(harnessSource).toContain("No app/route preview state is derived");
    expect(harnessSource).toContain("No Trade UI wiring");
    expect(harnessSource).toContain("No bridge calls");
    expect(harnessSource).toContain("No localhost fetch");
    expect(harnessSource).toContain("No polling");
    expect(harnessSource).toContain("No execution");
    expect(harnessSource).toContain("Controls disabled");
    expect(harnessSource).toContain("Gate locked");
    expect(harnessSource).toContain("no_input");
    expect(harnessSource).toContain("guard_blocked");
    expect(harnessSource).toContain("invalid_input");
    expect(harnessSource).toContain("adapter_rejected");
    expect(harnessSource).toContain("derived_preview_failed");
    expect(harnessSource).toContain("read_only_preview_ready");
    expect(harnessSource).toContain(
      "read_only_preview_ready is read-only/model-only, not active",
    );
    expect(harnessSource).toContain("previewState present");
    expect(harnessSource).toContain("previewState absent");
    expect(harnessSource).toContain("canRenderReadOnlyPreview");
    expect(harnessSource).toContain("canProceedToHandoff");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("real selectedRecommendation read-only derivation harness fixture data keeps previewState exclusive and passive", () => {
    for (const fixture of avanzaRealSelectedRecommendationReadOnlyDerivationFixtures) {
      if (fixture.id === "read_only_preview_ready") {
        expect(fixture.derivationResult.status).toBe("read_only_preview_ready");
        expect(fixture.derivationResult.previewState).toBeTruthy();
        expect(fixture.derivationResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.derivationResult.previewState).toBeUndefined();
        expect(fixture.derivationResult.canRenderReadOnlyPreview).toBe(false);
      }

      expect(fixture.derivationResult.canProceedToHandoff).toBe(false);
      expect(fixture.derivationResult.canCallBridge).toBe(false);
      expect(fixture.derivationResult.canFetchLocalhost).toBe(false);
      expect(fixture.derivationResult.canPoll).toBe(false);
      expect(fixture.derivationResult.canExecute).toBe(false);
      expect(fixture.derivationResult.controlsEnabled).toBe(false);
      expect(fixture.derivationResult.gateLocked).toBe(true);
    }
  });

  test("real selectedRecommendation read-only derivation harness source stays pure and route fixture-only", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaRealSelectedRecommendationReadOnlyDerivationHarness.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(harnessSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
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
    expect(tradeAppSource).not.toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(routeSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
  });

  test("real selectedRecommendation read-only derivation route section pre-implementation checkpoint records fixture-only route permission", () => {
    const checkpointSource = readRepoFile(
      "docs/avanza-real-selected-recommendation-read-only-derivation-route-section-pre-implementation-checkpoint.md",
    );
    const planSource = readRepoFile(
      "docs/avanza-real-selected-recommendation-read-only-derivation-route-section-plan.md",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(checkpointSource.length).toBeGreaterThan(0);
    expect(checkpointSource).toContain(
      "avanza_real_selected_recommendation_read_only_derivation_route_section_pre_implementation_checkpoint_added",
    );
    expect(checkpointSource).toContain("Current Status");
    expect(checkpointSource).toContain("Preconditions Met");
    expect(checkpointSource).toContain("Allowed Next Implementation Scope");
    expect(checkpointSource).toContain("Required Route Section Behavior");
    expect(checkpointSource).toContain("Required Fixture/Model-Only Labels");
    expect(checkpointSource).toContain("Required PreviewState Visibility Rules");
    expect(checkpointSource).toContain("Required Safety Guarantees");
    expect(checkpointSource).toContain("Explicit Non-Goals");
    expect(checkpointSource).toContain("Go/No-Go Checklist");
    expect(checkpointSource).toContain("Recommended Next Implementation Task");

    expect(checkpointSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(checkpointSource).toContain("only static derivation fixtures");
    expect(checkpointSource).toContain("fixture/model-only");
    expect(checkpointSource).toContain("explicit input only");
    expect(checkpointSource).toContain(
      "No real selectedRecommendation state is read",
    );
    expect(checkpointSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpointSource).toContain("No app/route preview state is derived");
    expect(checkpointSource).toContain("No Trade UI wiring");
    expect(checkpointSource).toContain("No bridge calls");
    expect(checkpointSource).toContain("No localhost fetch");
    expect(checkpointSource).toContain("No polling");
    expect(checkpointSource).toContain("No execution");
    expect(checkpointSource).toContain("Controls disabled");
    expect(checkpointSource).toContain("Gate locked");

    for (const status of [
      "no_input",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ]) {
      expect(checkpointSource).toContain(status);
    }

    expect(checkpointSource).toContain(
      "`previewState` visible only for `read_only_preview_ready`",
    );
    expect(checkpointSource).toContain(
      "`read_only_preview_ready` labeled read-only/model-only and not active",
    );
    expect(checkpointSource).toContain("`canProceedToHandoff: false`");
    expect(checkpointSource).toContain("`canCallBridge: false`");
    expect(checkpointSource).toContain("`canFetchLocalhost: false`");
    expect(checkpointSource).toContain("`canPoll: false`");
    expect(checkpointSource).toContain("`canExecute: false`");
    expect(checkpointSource).toContain("`controlsEnabled: false`");
    expect(checkpointSource).toContain("`gateLocked: true`");
    expect(checkpointSource).toContain("no active handoff button");
    expect(checkpointSource).toContain("route remains unlinked from main navigation");
    expect(checkpointSource).toContain("`app/trade-app.tsx` remains unchanged");

    expect(planSource).toContain(
      "avanza-real-selected-recommendation-read-only-derivation-route-section-pre-implementation-checkpoint.md",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
    expect(routeSource).toContain("No execution");
    expect(routeSource).not.toMatch(/<button|onClick=/);

    for (const source of [checkpointSource, routeSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }

    for (const navigationSourceFile of navigationSourceFiles) {
      const navigationSource = readRepoFile(navigationSourceFile);
      expect(navigationSource).not.toContain("/dev/avanza-visual-qa");
    }
  });

  test("real selectedRecommendation read-only derivation route section renders static fixture statuses only", () => {
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const harnessSource = readRepoFile(
      "components/execution/AvanzaRealSelectedRecommendationReadOnlyDerivationHarness.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(routeSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );
    expect(routeSource).toContain(
      "Real selectedRecommendation read-only derivation",
    );
    expect(routeSource).toContain("Derivation fixture only");
    expect(routeSource).toContain("Explicit input only");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).toContain("No Trade UI wiring");
    expect(routeSource).toContain("No bridge calls");
    expect(routeSource).toContain("No localhost fetch");
    expect(routeSource).toContain("No polling");
    expect(routeSource).toContain("No execution");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");

    for (const status of [
      "no_input",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ]) {
      expect(harnessSource).toContain(status);
    }

    expect(harnessSource).toContain(
      "read_only_preview_ready is read-only/model-only, not active",
    );
    expect(harnessSource).toContain("previewState present");
    expect(harnessSource).toContain("previewState absent");
    expect(harnessSource).toContain("canProceedToHandoff");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(tradeAppSource).not.toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");

    for (const navigationSourceFile of navigationSourceFiles) {
      const navigationSource = readRepoFile(navigationSourceFile);
      expect(navigationSource).not.toContain("/dev/avanza-visual-qa");
    }
  });

  test("real selectedRecommendation read-only derivation route section checkpoint records completed fixture-only section", () => {
    const checkpointSource = readRepoFile(
      "docs/avanza-real-selected-recommendation-read-only-derivation-route-section-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const harnessSource = readRepoFile(
      "components/execution/AvanzaRealSelectedRecommendationReadOnlyDerivationHarness.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpointSource.length).toBeGreaterThan(0);
    expect(checkpointSource).toContain(
      "avanza_real_selected_recommendation_read_only_derivation_route_section_checkpoint_added",
    );
    expect(checkpointSource).toContain("Current Status");
    expect(checkpointSource).toContain("Implemented Route Section Behavior");
    expect(checkpointSource).toContain("Static Derivation Fixture Scope");
    expect(checkpointSource).toContain("Visible Fixture States");
    expect(checkpointSource).toContain("PreviewState Visibility Behavior");
    expect(checkpointSource).toContain("Harness Behavior");
    expect(checkpointSource).toContain(
      "No Real SelectedRecommendation State Guarantee",
    );
    expect(checkpointSource).toContain(
      "No Real App/Route Preview Derivation Guarantee",
    );
    expect(checkpointSource).toContain("Trade UI Default Behavior");
    expect(checkpointSource).toContain("Safety Guarantees");
    expect(checkpointSource).toContain("What Remains Not Implemented");
    expect(checkpointSource).toContain("Recommended Next Step");

    expect(checkpointSource).toContain("fixture/model-only");
    expect(checkpointSource).toContain("static derivation fixtures only");
    expect(checkpointSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(checkpointSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );
    expect(checkpointSource).toContain("No real selectedRecommendation state is read");
    expect(checkpointSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpointSource).toContain("No app/route preview state is derived");
    expect(checkpointSource).toContain("No Trade UI wiring");

    for (const status of [
      "no_input",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ]) {
      expect(checkpointSource).toContain(status);
      expect(harnessSource).toContain(status);
    }

    expect(checkpointSource).toContain(
      "`read_only_preview_ready` is model-only/read-only, not active",
    );
    expect(checkpointSource).toContain(
      "`previewState` is visible only for `read_only_preview_ready`",
    );
    expect(checkpointSource).toContain(
      "`previewState` is absent or null for every other status",
    );
    expect(checkpointSource).toContain("`canProceedToHandoff: false`");
    expect(checkpointSource).toContain("`canCallBridge: false`");
    expect(checkpointSource).toContain("`canFetchLocalhost: false`");
    expect(checkpointSource).toContain("`canPoll: false`");
    expect(checkpointSource).toContain("`canExecute: false`");
    expect(checkpointSource).toContain("`controlsEnabled: false`");
    expect(checkpointSource).toContain("`gateLocked: true`");
    expect(checkpointSource).toContain("no active handoff button");
    expect(checkpointSource).toContain("no bridge calls");
    expect(checkpointSource).toContain("no localhost fetch");
    expect(checkpointSource).toContain("no polling");
    expect(checkpointSource).toContain("no runner/fill invocation");
    expect(checkpointSource).toContain("no trigger phrase");
    expect(checkpointSource).toContain("no fill/click/review/final/submit/order");
    expect(checkpointSource).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpointSource).toContain("no Supabase execution write");
    expect(checkpointSource).toContain("no production readiness claim");
    expect(checkpointSource).toContain(
      "selectedRecommendation preview remains disabled by default in Trade UI",
    );
    expect(checkpointSource).toContain(
      "Add a real selectedRecommendation read-only derivation phase completion",
    );
    expect(checkpointSource).toContain("checkpoint.");

    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(routeSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );
    expect(routeSource).toContain("Derivation fixture only");
    expect(routeSource).toContain("Explicit input only");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).not.toMatch(/<button|onClick=/);
    expect(harnessSource).toContain("previewState present");
    expect(harnessSource).toContain("previewState absent");
    expect(harnessSource).toContain(
      "read_only_preview_ready is read-only/model-only, not active",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");

    for (const source of [checkpointSource, routeSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }

    for (const navigationSourceFile of navigationSourceFiles) {
      const navigationSource = readRepoFile(navigationSourceFile);
      expect(navigationSource).not.toContain("/dev/avanza-visual-qa");
    }
  });

  test("real selectedRecommendation read-only derivation phase completion checkpoint records completed fixture-model phase", () => {
    const checkpointSource = readRepoFile(
      "docs/avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md",
    );
    const routeSectionCheckpointSource = readRepoFile(
      "docs/avanza-real-selected-recommendation-read-only-derivation-route-section-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const harnessSource = readRepoFile(
      "components/execution/AvanzaRealSelectedRecommendationReadOnlyDerivationHarness.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpointSource.length).toBeGreaterThan(0);
    expect(checkpointSource).toContain(
      "avanza_real_selected_recommendation_read_only_derivation_phase_complete_fixture_model_only",
    );
    expect(checkpointSource).toContain("Phase Completion Status");
    expect(checkpointSource).toContain("Completed Artifacts");
    expect(checkpointSource).toContain("Input Guard Status");
    expect(checkpointSource).toContain("Input Validation Status");
    expect(checkpointSource).toContain("Derivation Helper Status");
    expect(checkpointSource).toContain("Derivation Fixture Status");
    expect(checkpointSource).toContain("Derivation Harness Status");
    expect(checkpointSource).toContain("Dev-Route Fixture/Model-Only Status");
    expect(checkpointSource).toContain("PreviewState Behavior");
    expect(checkpointSource).toContain(
      "No Real SelectedRecommendation State Guarantee",
    );
    expect(checkpointSource).toContain(
      "No Real App/Route Preview Derivation Guarantee",
    );
    expect(checkpointSource).toContain("Trade UI Default Behavior");
    expect(checkpointSource).toContain("Safety Guarantees");
    expect(checkpointSource).toContain(
      "What Remains Deliberately Not Implemented",
    );
    expect(checkpointSource).toContain("Recommended Next-Phase Options");

    expect(checkpointSource).toContain(
      "complete at the dev-only fixture/model-only level",
    );
    expect(checkpointSource).toContain(
      "The derivation helper is pure and explicit-input only",
    );
    expect(checkpointSource).toContain(
      "The input guard must allow read-only input before validation or derivation can",
    );
    expect(checkpointSource).toContain("`valid_read_only_input`");
    expect(checkpointSource).toContain(
      "Adapter normalization only happens after valid input",
    );
    expect(checkpointSource).toContain(
      "The derived-preview builder only runs after successful adapter",
    );
    expect(checkpointSource).toContain("fixture/model-only section");
    expect(checkpointSource).toContain("static derivation fixtures only");

    for (const status of [
      "no_input",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ]) {
      expect(checkpointSource).toContain(status);
      expect(harnessSource).toContain(status);
    }

    expect(checkpointSource).toContain(
      "`read_only_preview_ready` is model-only/read-only, not active",
    );
    expect(checkpointSource).toContain(
      "`previewState` is visible only for `read_only_preview_ready`",
    );
    expect(checkpointSource).toContain(
      "`previewState` is absent or null for every other status",
    );
    expect(checkpointSource).toContain("`canProceedToHandoff: false`");
    expect(checkpointSource).toContain("No real selectedRecommendation state is read");
    expect(checkpointSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpointSource).toContain("No app/route preview state is derived");
    expect(checkpointSource).toContain(
      "No app/route preview state is rendered from real input",
    );
    expect(checkpointSource).toContain("not wired into Trade UI");
    expect(checkpointSource).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpointSource).toContain("route remains unlinked from main navigation");
    expect(checkpointSource).toContain(
      "selectedRecommendation preview remains disabled by default in Trade UI",
    );
    expect(checkpointSource).toContain("controls disabled");
    expect(checkpointSource).toContain("pre-activation gate locked");
    expect(checkpointSource).toContain("no bridge calls");
    expect(checkpointSource).toContain("no localhost fetch");
    expect(checkpointSource).toContain("no polling");
    expect(checkpointSource).toContain("no runner/fill invocation");
    expect(checkpointSource).toContain("no trigger phrase");
    expect(checkpointSource).toContain("no fill/click/review/final/submit/order");
    expect(checkpointSource).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpointSource).toContain("no Supabase execution write");
    expect(checkpointSource).toContain("no production readiness claim");
    expect(checkpointSource).toContain(
      "Option A: Stop here and keep real selectedRecommendation derivation",
    );
    expect(checkpointSource).toContain(
      "Option B: Add a broader architecture checkpoint",
    );
    expect(checkpointSource).toContain(
      "Option C: Plan Trade UI read-only preview integration separately",
    );
    expect(checkpointSource).toContain(
      "Option D: Plan handoff package readiness separately",
    );
    expect(checkpointSource).toContain(
      "All options must still forbid execution, fill, and trigger behavior",
    );

    expect(routeSectionCheckpointSource).toContain(
      "avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md",
    );
    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(routeSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );
    expect(routeSource).toContain("Derivation fixture only");
    expect(routeSource).toContain("Explicit input only");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).not.toMatch(/<button|onClick=/);
    expect(harnessSource).toContain("previewState present");
    expect(harnessSource).toContain("previewState absent");
    expect(harnessSource).toContain("canProceedToHandoff");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(tradeAppSource).not.toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");

    for (const source of [checkpointSource, routeSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }

    for (const navigationSourceFile of navigationSourceFiles) {
      const navigationSource = readRepoFile(navigationSourceFile);
      expect(navigationSource).not.toContain("/dev/avanza-visual-qa");
    }
  });

  test("read-only selectedRecommendation architecture checkpoint records boundary before Trade UI planning", () => {
    const checkpointSource = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md",
    );
    const derivationPhaseCheckpointSource = readRepoFile(
      "docs/avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md",
    );
    const routeSectionCheckpointSource = readRepoFile(
      "docs/avanza-real-selected-recommendation-read-only-derivation-route-section-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpointSource.length).toBeGreaterThan(0);
    expect(checkpointSource).toContain(
      "avanza_read_only_selected_recommendation_architecture_checkpoint_before_trade_ui",
    );

    for (const heading of [
      "Current Architecture Status",
      "Completed Static-Fixture Chain",
      "Completed Real SelectedRecommendation Input Guard/Validation Chain",
      "Completed Real SelectedRecommendation Read-Only Derivation Chain",
      "Dev QA Route Status",
      "Trade UI Status",
      "Safety Guarantees",
      "What Remains Deliberately Not Implemented",
      "Risks Before Trade UI Planning",
      "Required Next-Phase Boundaries",
      "Recommended Next-Phase Options",
    ]) {
      expect(checkpointSource).toContain(heading);
    }

    for (const completedArtifact of [
      "static-fixture adapter normalization",
      "static-fixture derived-preview invocation",
      "real selectedRecommendation read-only input guard",
      "real selectedRecommendation read-only input fixtures",
      "real selectedRecommendation read-only input guard harness",
      "input guard dev-route fixture/model-only section",
      "real selectedRecommendation read-only input validation model",
      "pure real selectedRecommendation read-only derivation helper",
      "real selectedRecommendation read-only derivation fixtures",
      "real selectedRecommendation read-only derivation harness",
      "derivation dev-route fixture/model-only section",
    ]) {
      expect(checkpointSource).toContain(completedArtifact);
    }

    for (const boundary of [
      "`app/trade-app.tsx` was not changed",
      "no Trade UI selectedRecommendation preview integration exists",
      "selectedRecommendation preview remains disabled by default",
      "no real app/route selectedRecommendation state is read",
      "no real selectedRecommendation state is rendered",
      "no real app/route preview state is derived",
      "no app/route preview state is rendered from real input",
      "dev route remains unlinked from main navigation",
      "only static fixtures are visible on the dev route",
      "`previewState` is visible only for the `read_only_preview_ready`",
      "`read_only_preview_ready` is model-only/read-only, not active",
    ]) {
      expect(checkpointSource).toContain(boundary);
    }

    for (const safetyGuarantee of [
      "controls disabled",
      "gate locked",
      "`canProceedToHandoff: false`",
      "no bridge calls",
      "no localhost fetch",
      "no polling",
      "no runner/fill invocation",
      "no trigger phrase",
      "no fill/click/review/final/submit/order",
      "no credential/session/BankID/cookies/storage handling",
      "no Supabase execution write",
      "no production readiness claim",
    ]) {
      expect(checkpointSource).toContain(safetyGuarantee);
    }

    for (const nextPhaseBoundary of [
      "Trade UI integration must be planned separately",
      "Trade UI integration must be default-off",
      "Trade UI integration must be passive/read-only only",
      "no buttons or active controls",
      "no bridge/fetch/polling",
      "no handoff package",
      "no Avanza behavior",
      "no execution behavior",
      "no Supabase execution writes",
    ]) {
      expect(checkpointSource).toContain(nextPhaseBoundary);
    }

    for (const option of [
      "Option A: Stop here and keep the system dev-QA fixture/model-only",
      "Option B: Add Trade UI read-only preview integration plan",
      "Option C: Add a real selectedRecommendation source discovery plan",
      "Option D: Add handoff package readiness plan separately",
      "All options must still forbid execution, fill, and trigger behavior",
    ]) {
      expect(checkpointSource).toContain(option);
    }

    expect(derivationPhaseCheckpointSource).toContain(
      "avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md",
    );
    expect(routeSectionCheckpointSource).toContain(
      "avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md",
    );

    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness",
    );
    expect(routeSource).toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(routeSource).toContain("Derivation fixture only");
    expect(routeSource).toContain("Guard fixture only");
    expect(routeSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );
    expect(routeSource).not.toMatch(/<button|onClick=/);

    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toContain(
      "AvanzaRealSelectedRecommendationReadOnlyDerivationHarness",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaRealSelectedRecommendationReadOnlyDerivation",
    );
    expect(tradeAppSource).not.toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );

    for (const navigationSourceFile of navigationSourceFiles) {
      const navigationSource = readRepoFile(navigationSourceFile);
      expect(navigationSource).not.toContain("/dev/avanza-visual-qa");
    }

    for (const source of [checkpointSource, routeSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }
  });

  test("Trade UI read-only selectedRecommendation preview pre-implementation checkpoint permits only future pure model", () => {
    const checkpointSource = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-pre-implementation-checkpoint.md",
    );
    const integrationPlanSource = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const modelPath = join(
      repoRoot,
      "lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts",
    );

    expect(checkpointSource.length).toBeGreaterThan(0);
    expect(checkpointSource).toContain(
      "avanza_trade_ui_read_only_selected_recommendation_preview_pre_implementation_checkpoint",
    );

    for (const heading of [
      "Current Status",
      "Preconditions Met",
      "Allowed Next Implementation Scope",
      "Required Future Trade UI Preview Model Behavior",
      "Required Default-Off Behavior",
      "Required Status Model",
      "Required Output Model",
      "Required Rendering Boundary",
      "Required Safety Guarantees",
      "Explicit Non-Goals",
      "Go/No-Go Checklist",
      "Recommended Next Implementation Task",
    ]) {
      expect(checkpointSource).toContain(heading);
    }

    for (const allowedScope of [
      "add a pure Trade UI read-only preview model only",
      "model accepts explicit input only",
      "model accepts explicit preview-enabled config only",
      "model may call/use the pure real selectedRecommendation read-only derivation",
      "model must not read app state, route state, React state, process.env, browser",
      "model must not be wired into Trade UI yet",
      "dev route section remains fixture/model-only",
    ]) {
      expect(checkpointSource).toContain(allowedScope);
    }

    for (const status of [
      "hidden",
      "disabled",
      "no_selected_recommendation",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ]) {
      expect(checkpointSource).toContain(status);
    }

    for (const outputField of [
      "previewState only for `read_only_preview_ready`",
      "`canRenderReadOnlyPreview: true` only for `read_only_preview_ready`",
      "`canProceedToHandoff: false`",
      "`canCallBridge: false`",
      "`canFetchLocalhost: false`",
      "`canPoll: false`",
      "`canExecute: false`",
      "`controlsEnabled: false`",
      "`gateLocked: true`",
    ]) {
      expect(checkpointSource).toContain(outputField);
    }

    for (const defaultBoundary of [
      "default status `hidden` or `disabled`",
      "no preview rendered by default",
      "selectedRecommendation preview remains disabled by default in Trade UI",
      "no visible user toggle",
      "no runtime env dependency for production enablement",
      "no `app/trade-app.tsx` wiring yet",
    ]) {
      expect(checkpointSource).toContain(defaultBoundary);
    }

    for (const renderingBoundary of [
      "passive read-only card/section only",
      "no active button",
      "no handoff button",
      "no prepare button",
      "no broker execution wording",
      "no order submission copy",
      "no production-ready copy",
      "no credentials/account/session data",
    ]) {
      expect(checkpointSource).toContain(renderingBoundary);
    }

    for (const safetyGuarantee of [
      "no bridge calls",
      "no localhost fetch",
      "no polling",
      "no runner/fill invocation",
      "no trigger phrase",
      "no fill/click/review/final/submit/order",
      "no credential/session/BankID/cookies/storage handling",
      "no Supabase execution write",
      "no production readiness claim",
    ]) {
      expect(checkpointSource).toContain(safetyGuarantee);
    }

    expect(checkpointSource).toContain(
      "Add a pure Trade UI read-only selectedRecommendation preview model",
    );
    expect(checkpointSource).toContain(
      "without wiring it into `app/trade-app.tsx`",
    );
    expect(existsSync(modelPath)).toBe(true);

    expect(integrationPlanSource).toContain(
      "avanza-trade-ui-read-only-selected-recommendation-preview-pre-implementation-checkpoint.md",
    );
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toContain(
      "avanza-trade-ui-read-only-selected-recommendation-preview-model",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaTradeUiReadOnlySelectedRecommendationPreview",
    );
    expect(routeSource).toContain("Derivation fixture only");
    expect(routeSource).toContain("Guard fixture only");
    expect(routeSource).toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(routeSource).toContain(
      "avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures",
    );
    expect(routeSource).toContain("Preview model fixture only");
    expect(routeSource).not.toMatch(/<button|onClick=/);

    for (const navigationSourceFile of navigationSourceFiles) {
      const navigationSource = readRepoFile(navigationSourceFile);
      expect(navigationSource).not.toContain("/dev/avanza-visual-qa");
    }

    for (const source of [checkpointSource, routeSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }
  });

  test("pure Trade UI read-only selectedRecommendation preview model defaults to hidden or disabled without derivation", () => {
    const throwingDerivation = () => {
      throw new Error("Derivation should not be called while preview is off");
    };
    const defaultModel = buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
      deriveReadOnlyPreview: throwingDerivation,
    });
    const disabledModel = buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
      deriveReadOnlyPreview: throwingDerivation,
      previewConfig: {
        disabledReason: "Explicit test disabled config",
        environment: "default",
        explicitPreviewEnabled: false,
      },
      selectedRecommendationLikeInput:
        realSelectedRecommendationReadOnlyDerivationFixtureById(
          "read_only_preview_ready",
        ).selectedRecommendationLikeInput,
    });

    expect(defaultModel.status).toBe("hidden");
    expect(disabledModel.status).toBe("disabled");

    for (const model of [defaultModel, disabledModel]) {
      expect(model.previewState).toBeUndefined();
      expect(model.canRenderReadOnlyPreview).toBe(false);
      expect(model.canProceedToHandoff).toBe(false);
      expect(model.canCallBridge).toBe(false);
      expect(model.canFetchLocalhost).toBe(false);
      expect(model.canPoll).toBe(false);
      expect(model.canExecute).toBe(false);
      expect(model.controlsEnabled).toBe(false);
      expect(model.gateLocked).toBe(true);
      expect(model.renderingBoundary.handoffButtonAllowed).toBe(false);
      expect(model.renderingBoundary.prepareButtonAllowed).toBe(false);
      expect(model.renderingBoundary.brokerExecutionWordingAllowed).toBe(false);
      expect(model.renderingBoundary.orderSubmissionCopyAllowed).toBe(false);
      expect(model.renderingBoundary.productionReadyCopyAllowed).toBe(false);
      expect(
        model.renderingBoundary.credentialsAccountSessionDataAllowed,
      ).toBe(false);
    }
  });

  test("pure Trade UI read-only selectedRecommendation preview model maps explicit enabled inputs to passive statuses", () => {
    const enabledConfig = {
      environment: "dev_read_only" as const,
      explicitPreviewEnabled: true,
      sourceLabel: "trade_ui_read_only_model_test",
    };
    const blockedGuardDecision =
      buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
        blockedReason: "Blocked by explicit model test guard",
        environment: "production_forbidden",
      });
    const cases: Array<{
      expectedStatus: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel["status"];
      model: AvanzaTradeUiReadOnlySelectedRecommendationPreviewModel;
    }> = [
      {
        expectedStatus: "no_selected_recommendation",
        model: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
          previewConfig: enabledConfig,
        }),
      },
      {
        expectedStatus: "guard_blocked",
        model: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
          previewConfig: {
            ...enabledConfig,
            inputGuardDecision: blockedGuardDecision,
          },
          selectedRecommendationLikeInput:
            realSelectedRecommendationReadOnlyDerivationFixtureById(
              "guard_blocked",
            ).selectedRecommendationLikeInput,
        }),
      },
      {
        expectedStatus: "invalid_input",
        model: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
          previewConfig: enabledConfig,
          selectedRecommendationLikeInput:
            realSelectedRecommendationReadOnlyDerivationFixtureById(
              "invalid_input",
            ).selectedRecommendationLikeInput,
        }),
      },
      {
        expectedStatus: "adapter_rejected",
        model: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
          previewConfig: enabledConfig,
          selectedRecommendationLikeInput:
            realSelectedRecommendationReadOnlyDerivationFixtureById(
              "adapter_rejected",
            ).selectedRecommendationLikeInput,
        }),
      },
      {
        expectedStatus: "derived_preview_failed",
        model: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
          previewConfig: enabledConfig,
          selectedRecommendationLikeInput:
            realSelectedRecommendationReadOnlyDerivationFixtureById(
              "derived_preview_failed",
            ).selectedRecommendationLikeInput,
        }),
      },
      {
        expectedStatus: "read_only_preview_ready",
        model: buildAvanzaTradeUiReadOnlySelectedRecommendationPreview({
          previewConfig: enabledConfig,
          selectedRecommendationLikeInput:
            realSelectedRecommendationReadOnlyDerivationFixtureById(
              "read_only_preview_ready",
            ).selectedRecommendationLikeInput,
        }),
      },
    ];

    for (const { expectedStatus, model } of cases) {
      expect(model.status).toBe(expectedStatus);
      expect(model.canProceedToHandoff).toBe(false);
      expect(model.canCallBridge).toBe(false);
      expect(model.canFetchLocalhost).toBe(false);
      expect(model.canPoll).toBe(false);
      expect(model.canExecute).toBe(false);
      expect(model.controlsEnabled).toBe(false);
      expect(model.gateLocked).toBe(true);
      expect(model.renderingBoundary.handoffButtonAllowed).toBe(false);
      expect(model.renderingBoundary.prepareButtonAllowed).toBe(false);
      expect(model.renderingBoundary.brokerExecutionWordingAllowed).toBe(false);
      expect(model.renderingBoundary.orderSubmissionCopyAllowed).toBe(false);
      expect(model.renderingBoundary.productionReadyCopyAllowed).toBe(false);
      expect(
        model.renderingBoundary.credentialsAccountSessionDataAllowed,
      ).toBe(false);

      if (expectedStatus === "read_only_preview_ready") {
        expect(model.canRenderReadOnlyPreview).toBe(true);
        expect(model.previewState).toBeDefined();
        expect(model.previewState?.displayState).toBe("preview_ready_locked");
        expect(model.previewState?.preActivationGate.gateStatus).toBe("locked");
      } else {
        expect(model.canRenderReadOnlyPreview).toBe(false);
        expect(model.previewState).toBeUndefined();
      }
    }
  });

  test("pure Trade UI read-only selectedRecommendation preview model source remains isolated and passive", () => {
    const modelSource = readRepoFile(
      "lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(modelSource).toContain(
      "buildAvanzaRealSelectedRecommendationReadOnlyDerivation",
    );
    expect(modelSource).not.toContain("app/trade-app");
    expect(modelSource).not.toContain("app/dev/avanza-visual-qa");
    expect(modelSource).not.toContain("process.env");
    expect(modelSource).not.toMatch(/\bfetch\s*\(/);
    expect(modelSource).not.toMatch(/\bSupabase\b|createClient|from\(/);
    expect(modelSource).not.toMatch(/bridge\/|bridgeEndpoint|callBridgeEndpoint/i);
    expect(modelSource).not.toMatch(/https?:\/\/localhost|127\.0\.0\.1/);
    expect(modelSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(modelSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(modelSource).not.toMatch(/execution-ready|production-ready/i);
    expect(modelSource).not.toMatch(/method:\s*["']POST["']/);
    expect(tradeAppSource).not.toContain(
      "avanza-trade-ui-read-only-selected-recommendation-preview-model",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaTradeUiReadOnlySelectedRecommendationPreview",
    );
    expect(routeSource).toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(routeSource).toContain(
      "avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures",
    );
    expect(routeSource).not.toContain(
      "buildAvanzaTradeUiReadOnlySelectedRecommendationPreview",
    );
  });

  test("Trade UI read-only selectedRecommendation preview model fixtures cover every passive status", () => {
    const expectedFixtureIds = [
      "hidden_default",
      "disabled_config",
      "no_selected_recommendation",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ];

    expect(
      avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures.map(
        (fixture) => fixture.id,
      ),
    ).toEqual(expectedFixtureIds);

    expect(
      tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
        "hidden_default",
      ).modelResult.status,
    ).toMatch(/hidden|disabled/);
    expect(
      tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
        "disabled_config",
      ).modelResult.status,
    ).toBe("disabled");
    expect(
      tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
        "no_selected_recommendation",
      ).modelResult.status,
    ).toBe("no_selected_recommendation");
    expect(
      tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
        "guard_blocked",
      ).modelResult.status,
    ).toBe("guard_blocked");
    expect(
      tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
        "invalid_input",
      ).modelResult.status,
    ).toBe("invalid_input");
    expect(
      tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
        "adapter_rejected",
      ).modelResult.status,
    ).toBe("adapter_rejected");
    expect(
      tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
        "derived_preview_failed",
      ).modelResult.status,
    ).toBe("derived_preview_failed");
    expect(
      tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
        "read_only_preview_ready",
      ).modelResult.status,
    ).toBe("read_only_preview_ready");

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures) {
      const model = fixture.modelResult;

      expect(model.status).toBe(fixture.expectedStatus);
      expect(model.canProceedToHandoff).toBe(false);
      expect(model.canCallBridge).toBe(false);
      expect(model.canFetchLocalhost).toBe(false);
      expect(model.canPoll).toBe(false);
      expect(model.canExecute).toBe(false);
      expect(model.controlsEnabled).toBe(false);
      expect(model.gateLocked).toBe(true);
      expect(model.renderingBoundary.handoffButtonAllowed).toBe(false);
      expect(model.renderingBoundary.prepareButtonAllowed).toBe(false);
      expect(model.renderingBoundary.brokerExecutionWordingAllowed).toBe(false);
      expect(model.renderingBoundary.orderSubmissionCopyAllowed).toBe(false);
      expect(model.renderingBoundary.productionReadyCopyAllowed).toBe(false);
      expect(
        model.renderingBoundary.credentialsAccountSessionDataAllowed,
      ).toBe(false);

      if (fixture.expectedStatus === "read_only_preview_ready") {
        expect(model.previewState).toBeDefined();
        expect(model.canRenderReadOnlyPreview).toBe(true);
        expect(model.previewState?.displayState).toBe("preview_ready_locked");
        expect(model.previewState?.preActivationGate.gateStatus).toBe("locked");
      } else {
        expect(model.previewState).toBeUndefined();
        expect(model.canRenderReadOnlyPreview).toBe(false);
      }
    }
  });

  test("Trade UI read-only selectedRecommendation preview model fixtures stay pure and unwired", () => {
    const fixtureSource = readRepoFile(
      "lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures.ts",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(fixtureSource).toContain(
      "buildAvanzaTradeUiReadOnlySelectedRecommendationPreview",
    );
    expect(fixtureSource).toContain(
      "avanzaRealSelectedRecommendationReadOnlyDerivationFixtures",
    );
    expect(fixtureSource).not.toContain("app/trade-app");
    expect(fixtureSource).not.toContain("app/dev/avanza-visual-qa");
    expect(fixtureSource).not.toContain("process.env");
    expect(fixtureSource).not.toMatch(/\bfetch\s*\(/);
    expect(fixtureSource).not.toMatch(/\bSupabase\b|createClient|from\(/);
    expect(fixtureSource).not.toMatch(
      /bridge\/|bridgeEndpoint|callBridgeEndpoint/i,
    );
    expect(fixtureSource).not.toMatch(/https?:\/\/localhost|127\.0\.0\.1/);
    expect(fixtureSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(fixtureSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(fixtureSource).not.toMatch(/execution-ready|production-ready/i);
    expect(fixtureSource).not.toMatch(/method:\s*["']POST["']/);
    expect(tradeAppSource).not.toContain(
      "avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures",
    );
    expect(routeSource).toContain(
      "avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures",
    );
  });

  test("Trade UI read-only selectedRecommendation preview model harness renders all fixture states and safety copy", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx",
    );

    expect(harnessSource).toContain(
      "Trade UI read-only selectedRecommendation preview model",
    );
    expect(harnessSource).toContain("Preview model fixture only");
    expect(harnessSource).toContain("Default-off");
    expect(harnessSource).toContain("Explicit input/config only");
    expect(harnessSource).toContain(
      "No real selectedRecommendation state is read",
    );
    expect(harnessSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(harnessSource).toContain("No app/route preview state is derived");
    expect(harnessSource).toContain("No Trade UI wiring");
    expect(harnessSource).toContain("No bridge calls");
    expect(harnessSource).toContain("No localhost fetch");
    expect(harnessSource).toContain("No polling");
    expect(harnessSource).toContain("No execution");
    expect(harnessSource).toContain("Controls disabled");
    expect(harnessSource).toContain("Gate locked");
    expect(harnessSource).toContain("hidden_default");
    expect(harnessSource).toContain("disabled_config");
    expect(harnessSource).toContain("no_selected_recommendation");
    expect(harnessSource).toContain("guard_blocked");
    expect(harnessSource).toContain("invalid_input");
    expect(harnessSource).toContain("adapter_rejected");
    expect(harnessSource).toContain("derived_preview_failed");
    expect(harnessSource).toContain("read_only_preview_ready");
    expect(harnessSource).toContain(
      "read_only_preview_ready is passive/read-only/model-only, not active",
    );
    expect(harnessSource).toContain("Fixture id");
    expect(harnessSource).toContain("Fixture label");
    expect(harnessSource).toContain("Model status");
    expect(harnessSource).toContain("sourceMode");
    expect(harnessSource).toContain("previewState");
    expect(harnessSource).toContain("canRenderReadOnlyPreview");
    expect(harnessSource).toContain("canProceedToHandoff");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(harnessSource).toContain(
      "avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures",
    );
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("Trade UI read-only selectedRecommendation preview model harness fixture data remains passive", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx",
    );

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures) {
      const model = fixture.modelResult;

      expect(harnessSource).toContain(fixture.id);
      expect(model.canProceedToHandoff).toBe(false);
      expect(model.canCallBridge).toBe(false);
      expect(model.canFetchLocalhost).toBe(false);
      expect(model.canPoll).toBe(false);
      expect(model.canExecute).toBe(false);
      expect(model.controlsEnabled).toBe(false);
      expect(model.gateLocked).toBe(true);

      if (fixture.expectedStatus === "read_only_preview_ready") {
        expect(model.previewState).toBeDefined();
        expect(model.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(model.previewState).toBeUndefined();
        expect(model.canRenderReadOnlyPreview).toBe(false);
      }
    }
  });

  test("Trade UI read-only selectedRecommendation preview model harness source stays pure and route fixture-only", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

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
    expect(harnessSource).not.toMatch(/execution-ready|production-ready/i);
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(routeSource).toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(routeSource).toContain(
      "avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures",
    );
    expect(routeSource).toContain("Preview model fixture only");
    expect(routeSource).toContain("Default-off");
    expect(routeSource).toContain("Explicit input/config only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).toContain("No Trade UI wiring");
    expect(routeSource).toContain("No bridge calls");
    expect(routeSource).toContain("No localhost fetch");
    expect(routeSource).toContain("No polling");
    expect(routeSource).toContain("No execution");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");
    expect(routeSource).not.toMatch(/<button|onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toMatch(/method:\s*["']POST["']/);
  });

  test("Trade UI read-only selectedRecommendation preview model route section renders static fixture visibility", () => {
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(routeSource).toContain(
      "Trade UI read-only selectedRecommendation preview model",
    );
    expect(routeSource).toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(routeSource).toContain(
      "avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures",
    );
    expect(harnessSource).toContain("hidden_default");
    expect(harnessSource).toContain("disabled_config");
    expect(harnessSource).toContain("no_selected_recommendation");
    expect(harnessSource).toContain("guard_blocked");
    expect(harnessSource).toContain("invalid_input");
    expect(harnessSource).toContain("adapter_rejected");
    expect(harnessSource).toContain("derived_preview_failed");
    expect(harnessSource).toContain("read_only_preview_ready");
    expect(harnessSource).toContain(
      "read_only_preview_ready is passive/read-only/model-only, not active",
    );
    expect(harnessSource).toContain("previewState absent");
    expect(harnessSource).toContain("previewState present");
    expect(harnessSource).toContain("canProceedToHandoff");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures) {
      const model = fixture.modelResult;

      if (fixture.id === "read_only_preview_ready") {
        expect(model.previewState).toBeDefined();
        expect(model.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(model.previewState).toBeUndefined();
        expect(model.canRenderReadOnlyPreview).toBe(false);
      }

      expect(model.canProceedToHandoff).toBe(false);
      expect(model.canCallBridge).toBe(false);
      expect(model.canFetchLocalhost).toBe(false);
      expect(model.canPoll).toBe(false);
      expect(model.canExecute).toBe(false);
      expect(model.controlsEnabled).toBe(false);
      expect(model.gateLocked).toBe(true);
    }

    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }
  });

  test("Trade UI read-only selectedRecommendation preview model route section pre-implementation checkpoint records fixture-only route permission", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md",
    );
    const routePlan = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-plan.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.trim().length).toBeGreaterThan(0);
    expect(checkpoint).toContain("Current Status");
    expect(checkpoint).toContain("Preconditions Met");
    expect(checkpoint).toContain("Allowed Next Implementation Scope");
    expect(checkpoint).toContain("Required Route Section Behavior");
    expect(checkpoint).toContain("Required Fixture/Model-Only Labels");
    expect(checkpoint).toContain("Required PreviewState Visibility Rules");
    expect(checkpoint).toContain("Required Default-Off Guarantees");
    expect(checkpoint).toContain("Required Safety Guarantees");
    expect(checkpoint).toContain("Explicit Non-Goals");
    expect(checkpoint).toContain("Go/No-Go Checklist");
    expect(checkpoint).toContain("Recommended Next Implementation Task");
    expect(checkpoint).toContain(
      "app/dev/avanza-visual-qa/page.tsx",
    );
    expect(checkpoint).toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(checkpoint).toContain("static Trade UI preview model fixtures");
    expect(checkpoint).toContain("Preview model fixture only");
    expect(checkpoint).toContain("Default-off");
    expect(checkpoint).toContain("Explicit input/config only");
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is read",
    );
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("No app/route preview state is derived");
    expect(checkpoint).toContain("No Trade UI wiring");
    expect(checkpoint).toContain("No bridge calls");
    expect(checkpoint).toContain("No localhost fetch");
    expect(checkpoint).toContain("No polling");
    expect(checkpoint).toContain("No execution");
    expect(checkpoint).toContain("Controls disabled");
    expect(checkpoint).toContain("Gate locked");
    expect(checkpoint).toContain("hidden_default");
    expect(checkpoint).toContain("disabled_config");
    expect(checkpoint).toContain("no_selected_recommendation");
    expect(checkpoint).toContain("guard_blocked");
    expect(checkpoint).toContain("invalid_input");
    expect(checkpoint).toContain("adapter_rejected");
    expect(checkpoint).toContain("derived_preview_failed");
    expect(checkpoint).toContain("read_only_preview_ready");
    expect(checkpoint).toContain(
      "previewState is visible only for `read_only_preview_ready`",
    );
    expect(checkpoint).toContain("passive/read-only/model-only");
    expect(checkpoint).toContain("`canProceedToHandoff: false`");
    expect(checkpoint).toContain("`canCallBridge: false`");
    expect(checkpoint).toContain("`canFetchLocalhost: false`");
    expect(checkpoint).toContain("`canPoll: false`");
    expect(checkpoint).toContain("`canExecute: false`");
    expect(checkpoint).toContain("`controlsEnabled: false`");
    expect(checkpoint).toContain("`gateLocked: true`");
    expect(checkpoint).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(checkpoint).not.toMatch(/\/live-fill-only-runner\//);
    expect(checkpoint).not.toMatch(/method:\s*["']POST["']/);

    expect(routePlan).toContain(
      "avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md",
    );
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(routeSource).toContain("Fixture/model only");
    expect(routeSource).toContain("No real selectedRecommendation state");
    expect(routeSource).toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(routeSource).not.toMatch(/<button|onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }
  });

  test("Trade UI read-only selectedRecommendation preview model route section checkpoint records completed fixture-only section", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const expectedFixtureIds = [
      "hidden_default",
      "disabled_config",
      "no_selected_recommendation",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ];

    expect(checkpoint.trim().length).toBeGreaterThan(0);

    for (const heading of [
      "Current Status",
      "Implemented Route Section Behavior",
      "Static Trade UI Preview Model Fixture Scope",
      "Visible Fixture States",
      "PreviewState Visibility Behavior",
      "Harness Behavior",
      "No Real SelectedRecommendation State Guarantee",
      "No Real App/Route Preview Derivation Guarantee",
      "Trade UI Default Behavior",
      "Safety Guarantees",
      "What Remains Not Implemented",
      "Recommended Next Step",
    ]) {
      expect(checkpoint).toContain(heading);
    }

    for (const requiredCopy of [
      "fixture/model-only",
      "static Trade UI preview model fixtures only",
      "Preview model fixture only",
      "Default-off",
      "Explicit input/config only",
      "No real selectedRecommendation state is read",
      "No real selectedRecommendation state is rendered",
      "No app/route preview state is derived",
      "No Trade UI wiring",
      "previewState is visible only for `read_only_preview_ready`",
      "previewState is absent/null for every other status",
      "`read_only_preview_ready` is passive/read-only/model-only, not active",
      "`app/trade-app.tsx` was not changed",
      "route remains unlinked from main navigation",
      "selectedRecommendation preview disabled by default in Trade UI",
      "`canProceedToHandoff: false`",
      "`canCallBridge: false`",
      "`canFetchLocalhost: false`",
      "`canPoll: false`",
      "`canExecute: false`",
      "`controlsEnabled: false`",
      "`gateLocked: true`",
      "controls disabled",
      "pre-activation gate locked",
      "no bridge calls",
      "no localhost fetch",
      "no polling",
      "no runner/fill invocation",
      "no trigger phrase",
      "no fill/click/review/final/submit/order",
      "no credential/session/BankID/cookies/storage handling",
      "no Supabase execution write",
      "no production readiness claim",
      "Trade UI read-only selectedRecommendation preview model phase completion checkpoint",
    ]) {
      expect(checkpoint).toContain(requiredCopy);
    }

    for (const fixtureId of expectedFixtureIds) {
      expect(checkpoint).toContain(fixtureId);
      expect(harnessSource).toContain(fixtureId);
    }

    expect(routeSource).toContain(
      "Trade UI read-only selectedRecommendation preview model",
    );
    expect(routeSource).toContain("Preview model fixture only");
    expect(routeSource).toContain("Default-off");
    expect(routeSource).toContain("Explicit input/config only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(routeSource).toContain(
      "avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures",
    );
    expect(harnessSource).toContain(
      "read_only_preview_ready is passive/read-only/model-only, not active",
    );
    expect(harnessSource).toContain("previewState absent");
    expect(harnessSource).toContain("previewState present");

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures) {
      const model = fixture.modelResult;

      if (fixture.id === "read_only_preview_ready") {
        expect(model.previewState).toBeDefined();
        expect(model.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(model.previewState).toBeUndefined();
        expect(model.canRenderReadOnlyPreview).toBe(false);
      }

      expect(model.canProceedToHandoff).toBe(false);
      expect(model.canCallBridge).toBe(false);
      expect(model.canFetchLocalhost).toBe(false);
      expect(model.canPoll).toBe(false);
      expect(model.canExecute).toBe(false);
      expect(model.controlsEnabled).toBe(false);
      expect(model.gateLocked).toBe(true);
    }

    expect(routeSource).not.toMatch(/<button|onClick\s*=/);
    expect(harnessSource).not.toMatch(/<button|onClick\s*=/);
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );

    for (const navigationSourceFile of navigationSourceFiles) {
      const navigationSource = readRepoFile(navigationSourceFile);

      expect(navigationSource).not.toContain("/dev/avanza-visual-qa");
    }

    for (const source of [checkpoint, routeSource, harnessSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }
  });

  test("Trade UI read-only selectedRecommendation preview model phase completion checkpoint closes fixture-model phase", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md",
    );
    const routeCheckpoint = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const expectedFixtureIds = [
      "hidden_default",
      "disabled_config",
      "no_selected_recommendation",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ];

    expect(checkpoint.trim().length).toBeGreaterThan(0);

    for (const heading of [
      "Phase Completion Status",
      "Completed Artifacts",
      "Preview Model Status",
      "Preview Model Fixture Status",
      "Preview Model Harness Status",
      "Dev-Route Fixture/Model-Only Status",
      "PreviewState Behavior",
      "Default-Off Behavior",
      "No Real SelectedRecommendation State Guarantee",
      "No Real App/Route Preview Derivation Guarantee",
      "Trade UI Default Behavior",
      "Safety Guarantees",
      "What Remains Deliberately Not Implemented",
      "Recommended Next-Phase Options",
    ]) {
      expect(checkpoint).toContain(heading);
    }

    for (const requiredCopy of [
      "Trade UI read-only selectedRecommendation preview model phase is complete at the fixture/model-only level",
      "preview model is pure and explicit input/config only",
      "model is default hidden/disabled",
      "model only calls derivation helper when explicit dev/read-only config allows it",
      "route-visible model is static fixture/model-only",
      "route uses static Trade UI preview model fixtures only",
      "`read_only_preview_ready` is passive/read-only/model-only, not active",
      "previewState is visible only for `read_only_preview_ready`",
      "previewState is absent/null for every other status",
      "`canProceedToHandoff: false`",
      "No real selectedRecommendation state is read",
      "No real selectedRecommendation state is rendered",
      "No app/route preview state is derived",
      "No app/route preview state is rendered from real input",
      "The harness is not wired into Trade UI",
      "`app/trade-app.tsx` was not changed",
      "The route remains unlinked from main navigation",
      "selectedRecommendation preview disabled by default in Trade UI",
      "controls disabled",
      "pre-activation gate locked",
      "no bridge calls",
      "no localhost fetch",
      "no polling",
      "no runner/fill invocation",
      "no trigger phrase",
      "no fill/click/review/final/submit/order",
      "no credential/session/BankID/cookies/storage handling",
      "no Supabase execution write",
      "no production readiness claim",
      "Option A: Stop here and keep Trade UI preview model fixture/model-only.",
      "Option B: Add a default-off Trade UI wiring plan, passive read-only only.",
      "Option C: Add a selectedRecommendation source discovery plan before Trade UI",
      "Option D: Add handoff package readiness plan separately, still no",
      "All options must still forbid execution/fill/trigger.",
    ]) {
      expect(checkpoint).toContain(requiredCopy);
    }

    for (const fixtureId of expectedFixtureIds) {
      expect(checkpoint).toContain(fixtureId);
      expect(harnessSource).toContain(fixtureId);
    }

    expect(routeCheckpoint).toContain(
      "avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md",
    );
    expect(routeSource).toContain(
      "Trade UI read-only selectedRecommendation preview model",
    );
    expect(routeSource).toContain("Preview model fixture only");
    expect(routeSource).toContain("Default-off");
    expect(routeSource).toContain("Explicit input/config only");
    expect(routeSource).toContain("No real selectedRecommendation state is read");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(routeSource).toContain(
      "avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures",
    );
    expect(harnessSource).toContain(
      "read_only_preview_ready is passive/read-only/model-only, not active",
    );
    expect(harnessSource).toContain("previewState absent");
    expect(harnessSource).toContain("previewState present");

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures) {
      const model = fixture.modelResult;

      if (fixture.id === "read_only_preview_ready") {
        expect(model.previewState).toBeDefined();
        expect(model.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(model.previewState).toBeUndefined();
        expect(model.canRenderReadOnlyPreview).toBe(false);
      }

      expect(model.canProceedToHandoff).toBe(false);
      expect(model.canCallBridge).toBe(false);
      expect(model.canFetchLocalhost).toBe(false);
      expect(model.canPoll).toBe(false);
      expect(model.canExecute).toBe(false);
      expect(model.controlsEnabled).toBe(false);
      expect(model.gateLocked).toBe(true);
    }

    expect(routeSource).not.toMatch(/<button|onClick\s*=/);
    expect(harnessSource).not.toMatch(/<button|onClick\s*=/);
    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );

    for (const navigationSourceFile of navigationSourceFiles) {
      const navigationSource = readRepoFile(navigationSourceFile);

      expect(navigationSource).not.toContain("/dev/avanza-visual-qa");
    }

    for (const source of [checkpoint, routeSource, harnessSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }
  });

  test("Trade UI read-only selectedRecommendation default-off wiring pre-implementation checkpoint keeps implementation out", () => {
    const checkpointPath =
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md";
    const checkpoint = readRepoFile(checkpointPath);
    const plan = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md",
    );
    const phaseCheckpoint = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md",
    );
    const routeCheckpoint = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md",
    );
    const integrationPlan = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md",
    );
    const architectureCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md",
    );
    const devPreviewPlan = readRepoFile(
      "docs/avanza-read-only-real-selected-recommendation-dev-preview-plan.md",
    );
    const semiAutoPlan = readRepoFile(
      "docs/semi-auto-avanza-fill-only-poc-ui-integration-plan.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const expectedStatuses = [
      "hidden",
      "disabled",
      "no_selected_recommendation",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ];

    expect(existsSync(join(repoRoot, checkpointPath))).toBe(true);
    expect(checkpoint.trim().length).toBeGreaterThan(0);

    for (const heading of [
      "Current Status",
      "Preconditions Met",
      "Allowed Next Implementation Scope",
      "Required Default-Off Wiring Behavior",
      "Required Passive Component/Model Behavior",
      "Required Status Model",
      "Required Output Model",
      "Required Rendering Boundary",
      "Required Safety Guarantees",
      "Explicit Non-Goals",
      "Go/No-Go Checklist",
      "Recommended Next Implementation Task",
    ]) {
      expect(checkpoint).toContain(heading);
    }

    for (const requiredCopy of [
      "no Trade UI wiring exists yet",
      "add an isolated passive read-only Trade UI preview component/model only",
      "component/model accepts explicit model result or explicit",
      "selectedRecommendation-like input/config only",
      "no implicit app state reads",
      "no route state reads",
      "no React context/global reads",
      "no `process.env` reads",
      "no browser storage reads",
      "no Supabase, network, or fetch",
      "no Trade UI wiring yet",
      "no `app/trade-app.tsx` changes yet",
      "default hidden/disabled",
      "no preview rendered by default",
      "no visible user toggle",
      "no runtime environment production enablement",
      "no localStorage enablement",
      "no accidental production enablement",
      "enabled path remains passive/read-only/model-only",
      "previewState` only for `read_only_preview_ready",
      "canRenderReadOnlyPreview: true` only for `read_only_preview_ready",
      "canProceedToHandoff: false",
      "canCallBridge: false",
      "canFetchLocalhost: false",
      "canPoll: false",
      "canExecute: false",
      "controlsEnabled: false",
      "gateLocked: true",
      "passive read-only card/section only",
      "no active button",
      "no handoff button",
      "no prepare button",
      "no buy/sell CTA",
      "no broker execution wording",
      "no order submission copy",
      "no production-ready copy",
      "no credentials/account/session data",
      "no bridge calls",
      "no localhost fetch",
      "no polling",
      "no runner/fill invocation",
      "no trigger phrase",
      "no fill/click/review/final/submit/order",
      "no credential/session/BankID/cookies/storage handling",
      "no Supabase execution write",
      "no production readiness claim",
    ]) {
      expect(checkpoint).toContain(requiredCopy);
    }

    for (const status of expectedStatuses) {
      expect(checkpoint).toContain(status);
    }

    for (const doc of [
      plan,
      phaseCheckpoint,
      routeCheckpoint,
      integrationPlan,
      architectureCheckpoint,
      devPreviewPlan,
      semiAutoPlan,
    ]) {
      expect(doc).toContain(
        "avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md",
      );
    }

    expect(
      existsSync(
        join(
          repoRoot,
          "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewDefaultOffWiring.tsx",
        ),
      ),
    ).toBe(false);
    expect(
      existsSync(
        join(
          repoRoot,
          "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewDefaultOffWiringPanel.tsx",
        ),
      ),
    ).toBe(false);

    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewDefaultOff",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaTradeUiReadOnlySelectedRecommendationPreview",
    );
    expect(routeSource).toContain("Preview model fixture only");
    expect(routeSource).toContain("No Trade UI wiring");

    for (const navigationSourceFile of navigationSourceFiles) {
      const navigationSource = readRepoFile(navigationSourceFile);

      expect(navigationSource).not.toContain("/dev/avanza-visual-qa");
    }

    for (const source of [checkpoint, routeSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }

    expect(tradeAppSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(tradeAppSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(tradeAppSource).not.toMatch(
      /fillQuantityField|fillPriceField|fillAmountField/,
    );
  });

  test("isolated passive Trade UI read-only selectedRecommendation preview component renders explicit model results only", () => {
    const componentSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const readyFixture =
      tradeUiReadOnlySelectedRecommendationPreviewModelFixtureById(
        "read_only_preview_ready",
      );

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewModelFixtures) {
      if (fixture.id === "read_only_preview_ready") {
        expect(fixture.modelResult.previewState).toBeDefined();
        expect(fixture.modelResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.modelResult.previewState).toBeUndefined();
        expect(fixture.modelResult.canRenderReadOnlyPreview).toBe(false);
      }

      expect(fixture.modelResult.canProceedToHandoff).toBe(false);
      expect(fixture.modelResult.canCallBridge).toBe(false);
      expect(fixture.modelResult.canFetchLocalhost).toBe(false);
      expect(fixture.modelResult.canPoll).toBe(false);
      expect(fixture.modelResult.canExecute).toBe(false);
      expect(fixture.modelResult.controlsEnabled).toBe(false);
      expect(fixture.modelResult.gateLocked).toBe(true);
    }

    expect(componentSource).toContain("modelResult");
    expect(componentSource).toContain("readyPreview");
    expect(componentSource).toContain("!readyPreview");
    expect(componentSource).toContain("status === \"read_only_preview_ready\"");
    expect(componentSource).toContain("modelResult.canRenderReadOnlyPreview");
    expect(componentSource).toContain("Boolean(modelResult.previewState)");
    expect(componentSource).toContain("Passive read-only preview");
    expect(componentSource).toContain("Passive read-only");
    expect(componentSource).toContain("Not active");
    expect(componentSource).toContain("No handoff");
    expect(componentSource).toContain("No bridge calls");
    expect(componentSource).toContain("No localhost fetch");
    expect(componentSource).toContain("No polling");
    expect(componentSource).toContain("No execution");
    expect(componentSource).toContain("Controls disabled");
    expect(componentSource).toContain("Gate locked");
    expect(componentSource).toContain("canProceedToHandoff");
    expect(componentSource).toContain("canCallBridge");
    expect(componentSource).toContain("canFetchLocalhost");
    expect(componentSource).toContain("canPoll");
    expect(componentSource).toContain("canExecute");
    expect(componentSource).toContain("controlsEnabled");
    expect(componentSource).toContain("gateLocked");
    expect(componentSource).toContain("previewState present");
    expect(componentSource).toContain("passive only");
    expect(readyFixture.modelResult.previewState).toBeDefined();
    expect(componentSource).not.toContain(
      "buildAvanzaTradeUiReadOnlySelectedRecommendationPreview(",
    );
    expect(componentSource).not.toContain("app/trade-app");
    expect(componentSource).not.toContain("app/dev/avanza-visual-qa");
    expect(componentSource).not.toMatch(/process\.env/);
    expect(componentSource).not.toMatch(/localStorage|sessionStorage/);
    expect(componentSource).not.toMatch(/\bfetch\s*\(/);
    expect(componentSource).not.toMatch(/createClient|supabase/i);
    expect(componentSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(componentSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(componentSource).not.toMatch(
      /fillQuantityField|fillPriceField|fillAmountField/,
    );
    expect(componentSource).not.toMatch(/method:\s*["']POST["']/);
    expect(componentSource).not.toMatch(/<button|onClick\s*=/);

    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreview\b/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreview["']/,
    );
    expect(routeSource).not.toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreview\b/,
    );
    expect(routeSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreview["']/,
    );
  });

  test("passive Trade UI read-only selectedRecommendation preview component fixtures and harness stay isolated", () => {
    const fixtureSource = readRepoFile(
      "lib/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures.ts",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness.tsx",
    );
    const componentSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const expectedFixtureIds = [
      "hidden_default",
      "disabled_config",
      "no_selected_recommendation",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ];

    expect(
      avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures,
    ).toHaveLength(8);

    for (const fixtureId of expectedFixtureIds) {
      const fixture =
        avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures.find(
          (item) => item.id === fixtureId,
        );

      expect(fixture).toBeDefined();
    }

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures) {
      if (fixture.id === "hidden_default") {
        expect(fixture.expectedRenderMode).toBe("hidden_or_disabled");
        expect(fixture.modelResult.status).toBe("hidden");
      } else if (fixture.id === "disabled_config") {
        expect(fixture.expectedRenderMode).toBe("hidden_or_disabled");
        expect(fixture.modelResult.status).toBe("disabled");
      } else if (fixture.id === "read_only_preview_ready") {
        expect(fixture.expectedRenderMode).toBe("passive_preview_ready");
        expect(fixture.modelResult.status).toBe("read_only_preview_ready");
        expect(fixture.modelResult.previewState).toBeDefined();
        expect(fixture.modelResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.expectedRenderMode).toBe("passive_status");
        expect([
          "no_selected_recommendation",
          "guard_blocked",
          "invalid_input",
          "adapter_rejected",
          "derived_preview_failed",
        ]).toContain(fixture.modelResult.status);
      }

      if (fixture.id !== "read_only_preview_ready") {
        expect(fixture.modelResult.previewState).toBeUndefined();
        expect(fixture.modelResult.canRenderReadOnlyPreview).toBe(false);
      }

      expect(fixture.modelResult.canProceedToHandoff).toBe(false);
      expect(fixture.modelResult.canCallBridge).toBe(false);
      expect(fixture.modelResult.canFetchLocalhost).toBe(false);
      expect(fixture.modelResult.canPoll).toBe(false);
      expect(fixture.modelResult.canExecute).toBe(false);
      expect(fixture.modelResult.controlsEnabled).toBe(false);
      expect(fixture.modelResult.gateLocked).toBe(true);
    }

    for (const copy of [
      "Passive Trade UI read-only selectedRecommendation preview",
      "Component fixture only",
      "Explicit modelResult only",
      "Default-off",
      "No real selectedRecommendation state is read",
      "No real selectedRecommendation state is rendered",
      "No app/route preview state is derived",
      "No Trade UI wiring",
      "No bridge calls",
      "No localhost fetch",
      "No polling",
      "No execution",
      "Controls disabled",
      "Gate locked",
      "previewState visible only for read_only_preview_ready",
      "previewState absent/null for every other status",
      "passive/read-only/model-only and not active",
      "canProceedToHandoff",
      "canCallBridge",
      "canFetchLocalhost",
      "canPoll",
      "canExecute",
      "controlsEnabled",
      "gateLocked",
    ]) {
      expect(harnessSource).toContain(copy);
    }

    expect(harnessSource).toContain(
      "AvanzaTradeUiReadOnlySelectedRecommendationPreview",
    );
    expect(harnessSource).toContain("modelResult={model}");
    expect(harnessSource).not.toMatch(/<button|onClick\s*=/);
    expect(harnessSource).not.toMatch(/prepare button/i);
    expect(harnessSource).not.toMatch(/handoff button/i);
    expect(harnessSource).not.toMatch(/\bbuy\/sell CTA\b/i);

    for (const source of [fixtureSource, harnessSource, componentSource]) {
      expect(source).not.toContain("app/trade-app");
      expect(source).not.toContain("app/dev/avanza-visual-qa");
      expect(source).not.toMatch(/process\.env/);
      expect(source).not.toMatch(/localStorage|sessionStorage/);
      expect(source).not.toMatch(/\bfetch\s*\(/);
      expect(source).not.toMatch(/createClient|supabase/i);
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }

    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness["']/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreview["']/,
    );
    expect(routeSource).toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
    );
    expect(routeSource).toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness["']/,
    );
    expect(routeSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreview["']/,
    );
  });

  test("passive Trade UI read-only selectedRecommendation preview component route section renders fixture-only harness", () => {
    const checkpointPath =
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md";
    const checkpointSource = readRepoFile(checkpointPath);
    const routeSectionCheckpointPath =
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md";
    const routeSectionCheckpointSource = readRepoFile(routeSectionCheckpointPath);
    const routePlanSource = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(existsSync(join(repoRoot, checkpointPath))).toBe(true);
    expect(checkpointSource.trim().length).toBeGreaterThan(0);
    expect(existsSync(join(repoRoot, routeSectionCheckpointPath))).toBe(true);
    expect(routeSectionCheckpointSource.trim().length).toBeGreaterThan(0);
    expect(routePlanSource).toContain(
      "avanza_trade_ui_read_only_selected_recommendation_preview_component_route_section_pre_implementation_checkpoint_added",
    );
    expect(routePlanSource).toContain(
      "avanza_trade_ui_read_only_selected_recommendation_preview_component_route_section_checkpoint_added",
    );

    for (const copy of [
      "Current Status",
      "Implemented Route Section Behavior",
      "Static Passive Preview Component Fixture Scope",
      "Visible Fixture States",
      "PreviewState Visibility Behavior",
      "Component/Harness Behavior",
      "No Real SelectedRecommendation State Guarantee",
      "No Real App/Route Preview Derivation Guarantee",
      "Trade UI Default Behavior",
      "Safety Guarantees",
      "What Remains Not Implemented",
      "Recommended Next Step",
      "AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness",
      "route section is fixture/model-only",
      "route uses static passive preview component fixtures only",
      "component receives explicit `modelResult` only",
      "fixture/model-only",
      "Passive Trade UI read-only selectedRecommendation preview",
      "Component fixture only",
      "Explicit modelResult only",
      "Default-off",
      "No real selectedRecommendation state is read",
      "No real selectedRecommendation state is rendered",
      "No app/route preview state is derived",
      "No Trade UI wiring",
      "No bridge calls",
      "No localhost fetch",
      "No polling",
      "No execution",
      "Controls disabled",
      "Gate locked",
      "hidden_default",
      "disabled_config",
      "no_selected_recommendation",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
      "previewState is visible only for `read_only_preview_ready`",
      "previewState is absent/null for every other status",
      "passive/read-only/model-only and not active",
      "`canProceedToHandoff: false`",
      "`canCallBridge: false`",
      "`canFetchLocalhost: false`",
      "`canPoll: false`",
      "`canExecute: false`",
      "`controlsEnabled: false`",
      "`gateLocked: true`",
      "no active handoff button",
      "no buy/sell CTA",
      "no prepare button",
      "component/harness are not wired into Trade UI",
      "`app/trade-app.tsx` was not changed",
      "route remains unlinked from main navigation",
      "selectedRecommendation preview disabled by default in Trade UI",
      "no runner/fill invocation",
      "no trigger phrase",
      "no fill/click/review/final/submit/order",
      "no credential/session/BankID/cookies/storage handling",
      "no Supabase execution write",
      "no production readiness claim",
    ]) {
      expect(routeSectionCheckpointSource).toContain(copy);
    }

    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness["']/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreview["']/,
    );

    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain(
      "Passive Trade UI read-only selectedRecommendation preview",
    );
    expect(routeSource).toContain("Component fixture only");
    expect(routeSource).toContain("Explicit modelResult only");
    expect(routeSource).toContain("Default-off");
    expect(routeSource).toContain("No real selectedRecommendation state");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).toContain("No Trade UI wiring");
    expect(routeSource).toContain("No bridge calls");
    expect(routeSource).toContain("No localhost fetch");
    expect(routeSource).toContain("No polling");
    expect(routeSource).toContain("No execution");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");
    expect(routeSource).toContain("does not read Trade UI state");
    expect(routeSource).toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
    );
    expect(routeSource).toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness["']/,
    );
    expect(routeSource).toMatch(
      /@\/lib\/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures["']/,
    );
    expect(routeSource).toContain(
      "fixtures={avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures}",
    );
    expect(routeSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreview["']/,
    );

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures) {
      expect([
        "hidden_default",
        "disabled_config",
        "no_selected_recommendation",
        "guard_blocked",
        "invalid_input",
        "adapter_rejected",
        "derived_preview_failed",
        "read_only_preview_ready",
      ]).toContain(fixture.id);

      if (fixture.id === "read_only_preview_ready") {
        expect(fixture.modelResult.previewState).toBeDefined();
        expect(fixture.modelResult.status).toBe("read_only_preview_ready");
      } else {
        expect(fixture.modelResult.previewState).toBeUndefined();
      }

      expect(fixture.modelResult.canProceedToHandoff).toBe(false);
      expect(fixture.modelResult.canCallBridge).toBe(false);
      expect(fixture.modelResult.canFetchLocalhost).toBe(false);
      expect(fixture.modelResult.canPoll).toBe(false);
      expect(fixture.modelResult.canExecute).toBe(false);
      expect(fixture.modelResult.controlsEnabled).toBe(false);
      expect(fixture.modelResult.gateLocked).toBe(true);
    }

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source, `${sourceFile} must not link the dev QA route`).not.toContain(
        "/dev/avanza-visual-qa",
      );
      expect(source).not.toMatch(
        /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
      );
    }

    for (const source of [checkpointSource, routeSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }
  });

  test("passive Trade UI read-only selectedRecommendation preview component phase completion checkpoint closes fixture-model phase", () => {
    const phaseCheckpointPath =
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md";
    const phaseCheckpointSource = readRepoFile(phaseCheckpointPath);
    const routeSectionCheckpointSource = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md",
    );
    const routePlanSource = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md",
    );
    const defaultOffPlanSource = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const componentSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness.tsx",
    );
    const fixtureSource = readRepoFile(
      "lib/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures.ts",
    );

    expect(existsSync(join(repoRoot, phaseCheckpointPath))).toBe(true);
    expect(phaseCheckpointSource.trim().length).toBeGreaterThan(0);

    for (const source of [
      routeSectionCheckpointSource,
      routePlanSource,
      defaultOffPlanSource,
    ]) {
      expect(source).toContain(
        "avanza_trade_ui_read_only_selected_recommendation_preview_component_phase_completion_checkpoint_added",
      );
      expect(source).toContain(
        "avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md",
      );
    }

    for (const copy of [
      "Phase Completion Status",
      "Completed Artifacts",
      "Passive Component Status",
      "Passive Component Fixture Status",
      "Passive Component Harness Status",
      "Dev-Route Fixture/Model-Only Status",
      "PreviewState Behavior",
      "Default-Off Behavior",
      "No Real SelectedRecommendation State Guarantee",
      "No Real App/Route Preview Derivation Guarantee",
      "Trade UI Default Behavior",
      "Safety Guarantees",
      "What Remains Deliberately Not Implemented",
      "Recommended Next-Phase Options",
      "passive component/default-off wiring preparation phase is complete at the",
      "fixture/model-only level",
      "passive component accepts explicit `modelResult` only",
      "component does not call the model itself",
      "route-visible component is static fixture/model-only",
      "route uses static passive preview component fixtures only",
      "hidden_default",
      "disabled_config",
      "no_selected_recommendation",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
      "passive/read-only/model-only and not active",
      "previewState is visible only for `read_only_preview_ready`",
      "previewState is absent/null for every other status",
      "`canProceedToHandoff: false`",
      "No real selectedRecommendation state is read",
      "No real selectedRecommendation state is rendered",
      "No app/route preview state is derived",
      "No app/route preview state is rendered from real input",
      "component/harness are not wired into Trade UI",
      "`app/trade-app.tsx` was not changed",
      "route remains unlinked from main navigation",
      "selectedRecommendation preview disabled by default in Trade UI",
      "controls disabled",
      "pre-activation gate locked",
      "no bridge calls",
      "no localhost fetch",
      "no polling",
      "no runner/fill invocation",
      "no trigger phrase",
      "no fill/click/review/final/submit/order",
      "no credential/session/BankID/cookies/storage handling",
      "no Supabase execution write",
      "no production readiness claim",
      "Option A: Stop here and keep passive preview component fixture/model-only.",
      "Option B: Add a separate default-off Trade UI wiring checkpoint before touching",
      "Option C: Add a selectedRecommendation source discovery/read-only input plan",
      "Option D: Add handoff package readiness plan separately",
      "All options must still forbid execution/fill/trigger.",
    ]) {
      expect(phaseCheckpointSource).toContain(copy);
    }

    expect(routeSource).toContain(
      "Passive Trade UI read-only selectedRecommendation preview",
    );
    expect(routeSource).toContain("Component fixture only");
    expect(routeSource).toContain("Explicit modelResult only");
    expect(routeSource).toContain("Default-off");
    expect(routeSource).toContain("No real selectedRecommendation state");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
    );
    expect(routeSource).toContain(
      "fixtures={avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures}",
    );

    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness["']/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreview["']/,
    );

    const expectedStatuses = [
      "hidden_default",
      "disabled_config",
      "no_selected_recommendation",
      "guard_blocked",
      "invalid_input",
      "adapter_rejected",
      "derived_preview_failed",
      "read_only_preview_ready",
    ];

    expect(
      avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures.map(
        (fixture) => fixture.id,
      ),
    ).toEqual(expectedStatuses);

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures) {
      expect(fixture.modelResult.status).toBe(fixture.expectedStatus);
      expect(fixture.modelResult.canProceedToHandoff).toBe(false);
      expect(fixture.modelResult.canCallBridge).toBe(false);
      expect(fixture.modelResult.canFetchLocalhost).toBe(false);
      expect(fixture.modelResult.canPoll).toBe(false);
      expect(fixture.modelResult.canExecute).toBe(false);
      expect(fixture.modelResult.controlsEnabled).toBe(false);
      expect(fixture.modelResult.gateLocked).toBe(true);

      if (fixture.id === "read_only_preview_ready") {
        expect(fixture.modelResult.previewState).toBeDefined();
      } else {
        expect(fixture.modelResult.previewState).toBeUndefined();
      }
    }

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source, `${sourceFile} must not link the dev QA route`).not.toContain(
        "/dev/avanza-visual-qa",
      );
    }

    for (const source of [routeSource, componentSource, harnessSource, fixtureSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
      expect(source).not.toMatch(/Granska köp/);
      expect(source).not.toMatch(/buy\/sell CTA/i);
      expect(source).not.toMatch(/prepare button/i);
    }
  });

  test("pre-Trade-UI wiring architecture checkpoint records strict app boundary", () => {
    const architectureCheckpointPath =
      "docs/avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md";
    const architectureCheckpointSource = readRepoFile(
      architectureCheckpointPath,
    );
    const phaseCheckpointSource = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md",
    );
    const defaultOffPlanSource = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const componentSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness.tsx",
    );

    expect(existsSync(join(repoRoot, architectureCheckpointPath))).toBe(true);
    expect(architectureCheckpointSource.trim().length).toBeGreaterThan(0);

    for (const source of [phaseCheckpointSource, defaultOffPlanSource]) {
      expect(source).toContain(
        "avanza_trade_ui_read_only_selected_recommendation_pre_trade_ui_wiring_architecture_checkpoint_added",
      );
      expect(source).toContain(
        "avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md",
      );
    }

    for (const copy of [
      "Current Architecture Status",
      "Completed Read-Only Derivation Chain",
      "Completed Trade UI Preview Model Chain",
      "Completed Passive Component Chain",
      "Dev QA Route Status",
      "Trade UI Status",
      "app/trade-app.tsx Boundary",
      "Required Future Wiring Constraints",
      "Required Safety Guarantees",
      "What Remains Deliberately Not Implemented",
      "Risks Before Touching app/trade-app.tsx",
      "Recommended Next-Phase Options",
      "real selectedRecommendation read-only input guard",
      "real selectedRecommendation read-only input validation",
      "real selectedRecommendation read-only derivation helper",
      "real selectedRecommendation read-only derivation fixtures and harness",
      "Trade UI read-only preview model artifacts",
      "passive Trade UI read-only preview component",
      "passive component fixtures and harness",
      "dev QA route fixture/model-only sections",
      "`app/trade-app.tsx` was not changed",
      "component/harness are not wired into Trade UI",
      "no Trade UI selectedRecommendation preview integration exists yet",
      "selectedRecommendation preview remains disabled by default",
      "no real selectedRecommendation state is read from app/route",
      "no real selectedRecommendation state is rendered",
      "no real app/route preview state is derived",
      "no app/route preview state is rendered from real input",
      "dev route is fixture/model-only",
      "dev route remains unlinked from main navigation",
      "only static fixtures are visible on the dev route",
      "previewState is visible only for `read_only_preview_ready`",
      "`read_only_preview_ready` is passive/read-only/model-only and not active",
      "must be planned separately",
      "must be default-off",
      "must be passive/read-only only",
      "must initially render nothing unless explicit internal/test-only guard allows",
      "must accept already-present selectedRecommendation-like input only",
      "must not discover/search/fetch selectedRecommendation",
      "must not introduce polling or refresh",
      "must not add active controls",
      "must not add handoff button",
      "must not add prepare button",
      "must not add buy/sell CTA",
      "must not include broker execution wording",
      "must not include order submission copy",
      "controls disabled",
      "gate locked",
      "`canProceedToHandoff: false`",
      "`canCallBridge: false`",
      "`canFetchLocalhost: false`",
      "`canPoll: false`",
      "`canExecute: false`",
      "no bridge calls",
      "no localhost fetch",
      "no polling",
      "no runner/fill invocation",
      "no trigger phrase",
      "no fill/click/review/final/submit/order",
      "no credential/session/BankID/cookies/storage handling",
      "no Supabase execution write",
      "no production readiness claim",
      "Option A: Stop here and keep everything fixture/model-only.",
      "Option B: Add a default-off Trade UI wiring plan specifically for",
      "Option C: Add a selectedRecommendation source discovery/read-only source map",
      "Option D: Add handoff package readiness plan separately",
      "All options must still forbid execution/fill/trigger.",
    ]) {
      expect(architectureCheckpointSource).toContain(copy);
    }

    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness["']/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreview["']/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/lib\/avanza-trade-ui-read-only-selected-recommendation-preview-model["']/,
    );

    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain(
      "Passive Trade UI read-only selectedRecommendation preview",
    );
    expect(routeSource).toContain("Component fixture only");
    expect(routeSource).toContain("Explicit modelResult only");
    expect(routeSource).toContain("No real selectedRecommendation state");
    expect(routeSource).toContain("No app/route preview state is derived");
    expect(routeSource).toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
    );

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source, `${sourceFile} must not link the dev QA route`).not.toContain(
        "/dev/avanza-visual-qa",
      );
    }

    for (const fixture of avanzaTradeUiReadOnlySelectedRecommendationPreviewComponentFixtures) {
      expect(fixture.modelResult.canProceedToHandoff).toBe(false);
      expect(fixture.modelResult.canCallBridge).toBe(false);
      expect(fixture.modelResult.canFetchLocalhost).toBe(false);
      expect(fixture.modelResult.canPoll).toBe(false);
      expect(fixture.modelResult.canExecute).toBe(false);
      expect(fixture.modelResult.controlsEnabled).toBe(false);
      expect(fixture.modelResult.gateLocked).toBe(true);
    }

    for (const source of [routeSource, componentSource, harnessSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
      expect(source).not.toMatch(/Granska köp/);
      expect(source).not.toMatch(/Bekräfta köp|Bekräfta sälj/);
    }
  });

  test("app trade passive read-only selectedRecommendation preview wiring pre-implementation checkpoint keeps Trade UI unwired", () => {
    const checkpointPath =
      "docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md";
    const checkpointSource = readRepoFile(checkpointPath);
    const wiringPlanSource = readRepoFile(
      "docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md",
    );
    const architectureCheckpointSource = readRepoFile(
      "docs/avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md",
    );
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(existsSync(join(repoRoot, checkpointPath))).toBe(true);
    expect(checkpointSource.trim().length).toBeGreaterThan(0);

    for (const source of [wiringPlanSource, architectureCheckpointSource]) {
      expect(source).toContain(
        "avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_pre_implementation_checkpoint_added",
      );
      expect(source).toContain(
        "avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md",
      );
    }

    for (const copy of [
      "Current Status",
      "Preconditions Met",
      "Allowed Next Implementation Scope",
      "Required app/trade-app.tsx Integration Boundary",
      "Required Default-Off Guard",
      "Required Passive Rendering Behavior",
      "Required Placement Constraints",
      "Required Safety Guarantees",
      "Explicit Non-Goals",
      "Go/No-Go Checklist",
      "Recommended Next Implementation Task",
      "app/trade-app.tsx may be touched only after this checkpoint",
      "integration must be passive/read-only",
      "integration must be default-off",
      "integration must render nothing by default",
      "integration may import the passive preview component only",
      "integration may import/use the pure Trade UI preview model only behind a",
      "hardcoded/internal disabled guard",
      "integration may pass only an already-present selectedRecommendation-like",
      "integration must not discover/search/fetch selectedRecommendation",
      "integration must not introduce polling",
      "integration must not introduce refresh",
      "integration must not add active controls",
      "integration must not add handoff button",
      "integration must not add prepare button",
      "integration must not add buy/sell CTA",
      "hardcoded false or equivalent disabled internal constant initially",
      "no visible user toggle",
      "no runtime environment production enablement",
      "no localStorage/sessionStorage enablement",
      "no accidental production enablement",
      "enabled path remains passive/read-only only",
      "previewState visible only for `read_only_preview_ready`",
      "`canProceedToHandoff: false`",
      "`controlsEnabled: false`",
      "`gateLocked: true`",
      "preview must not disrupt existing recommendation card CTAs",
      "preview must not be placed near active trading CTAs",
      "preview must not appear as an execution panel",
      "preview must not appear as a broker handoff panel",
      "preview must be visually labeled passive/read-only if rendered",
      "no bridge calls",
      "no localhost fetch",
      "no polling",
      "no refresh outside existing app behavior",
      "no runner/fill invocation",
      "no trigger phrase",
      "no fill/click/review/final/submit/order",
      "no credential/session/BankID/cookies/storage handling",
      "no Supabase execution write",
      "no production readiness claim",
    ]) {
      expect(checkpointSource).toContain(copy);
    }

    expect(tradeAppSource).toContain("selectedRecommendation preview: disabled");
    expect(tradeAppSource).not.toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness\b/,
    );
    expect(tradeAppSource).not.toMatch(
      /<AvanzaTradeUiReadOnlySelectedRecommendationPreview\b/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness["']/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/components\/execution\/AvanzaTradeUiReadOnlySelectedRecommendationPreview["']/,
    );
    expect(tradeAppSource).not.toMatch(
      /@\/lib\/avanza-trade-ui-read-only-selected-recommendation-preview-model["']/,
    );

    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain(
      "Passive Trade UI read-only selectedRecommendation preview",
    );

    for (const source of [checkpointSource, routeSource]) {
      expect(source).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
      expect(source).not.toMatch(/\/live-fill-only-runner\//);
      expect(source).not.toMatch(
        /fillQuantityField|fillPriceField|fillAmountField/,
      );
      expect(source).not.toMatch(/method:\s*["']POST["']/);
    }
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

    expect(serialized).not.toMatch(/[^a-z-]execution-ready/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
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

  test("read-only selectedRecommendation adapter/derived-preview integration decision returns no_input with fixture fallback", () => {
    const decision =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
        derivationDecision:
          buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
            guardDecision:
              avanzaReadOnlySelectedRecommendationDevPreviewDefaultGuard,
            selectedRecommendation: null,
          }),
        selectedRecommendation: null,
      });

    expect(decision.status).toBe("no_input");
    expect(decision.sourceMode).toBe("fixture_only");
    expect(decision.canReviewAdapter).toBe(false);
    expect(decision.canNormalizeInput).toBe(false);
    expect(decision.canCallDerivedPreviewBuilder).toBe(false);
    expect(decision.canRenderReadOnlyPreview).toBe(false);
    expect(decision.canUseFixtureFallback).toBe(true);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision blocks when derivation decision blocks", () => {
    const guardDecision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "production_forbidden",
      });
    const derivationDecision =
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision,
        selectedRecommendation: { ticker: "VOLV B" },
      });
    const decision =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
        derivationDecision,
        selectedRecommendation: { ticker: "VOLV B" },
      });

    expect(decision.status).toBe("blocked");
    expect(decision.sourceMode).toBe("blocked");
    expect(decision.canReviewAdapter).toBe(false);
    expect(decision.canNormalizeInput).toBe(false);
    expect(decision.canCallDerivedPreviewBuilder).toBe(false);
    expect(decision.canRenderReadOnlyPreview).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision rejects invalid input", () => {
    const guardDecision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "dev_only",
        explicitReadOnlyDevPreview: true,
      });
    const derivationDecision =
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision,
        selectedRecommendation: { ticker: "VOLV B" },
      });
    const decision =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
        derivationDecision,
        selectedRecommendation: { company: "Missing ticker" },
      });

    expect(decision.status).toBe("invalid_input");
    expect(decision.sourceMode).toBe("blocked");
    expect(decision.canReviewAdapter).toBe(false);
    expect(decision.canNormalizeInput).toBe(false);
    expect(decision.canCallDerivedPreviewBuilder).toBe(false);
    expect(decision.canRenderReadOnlyPreview).toBe(false);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision can request adapter review for valid input in model state only", () => {
    const guardDecision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "dev_only",
        explicitReadOnlyDevPreview: true,
      });
    const selectedRecommendation = {
      company: "Volvo",
      quantity: 10,
      ticker: "VOLV B",
    };
    const derivationDecision =
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision,
        selectedRecommendation,
        sourceLabel: "read_only_selected_recommendation_dev_preview",
      });
    const decision =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
        derivationDecision,
        integrationSourceLabel: "read_only_selected_recommendation_dev_preview",
        selectedRecommendation,
      });

    expect(["adapter_review_required", "integration_allowed"]).toContain(
      decision.status,
    );
    expect(decision.status).toBe("adapter_review_required");
    expect(decision.sourceMode).toBe(
      "read_only_selected_recommendation_dev_preview",
    );
    expect(decision.canReviewAdapter).toBe(true);
    expect(decision.canNormalizeInput).toBe(false);
    expect(decision.canCallDerivedPreviewBuilder).toBe(false);
    expect(decision.canRenderReadOnlyPreview).toBe(false);
    expect(decision.canUseFixtureFallback).toBe(true);
    expect(decision.canCallBridge).toBe(false);
    expect(decision.canFetchLocalhost).toBe(false);
    expect(decision.canPoll).toBe(false);
    expect(decision.canExecute).toBe(false);
    expect(decision.controlsEnabled).toBe(false);
    expect(decision.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision has no execution-ready or production-ready copy", () => {
    const guardDecision =
      buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "dev_only",
        explicitReadOnlyDevPreview: true,
      });
    const derivationDecision =
      buildAvanzaReadOnlySelectedRecommendationDerivationDecision({
        guardDecision,
        selectedRecommendation: { ticker: "VOLV B" },
      });
    const serialized = JSON.stringify([
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
        derivationDecision,
        selectedRecommendation: null,
      }),
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
        derivationDecision,
        selectedRecommendation: {},
      }),
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision({
        derivationDecision,
        selectedRecommendation: { symbol: "VOLV B" },
      }),
    ]);

    expect(serialized).not.toMatch(/[^a-z-]execution-ready/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision helper is pure and does not call adapter or derived-preview builder", () => {
    const source = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts",
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
    expect(source).not.toMatch(/avanza-selected-recommendation-adapter/);
    expect(source).not.toMatch(/avanza-selected-recommendation-derived-preview-state/);
    expect(source).not.toMatch(/adaptSelectedRecommendation/);
    expect(source).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(source).not.toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision fixtures cover no_input, blocked, invalid, review, and allowed states", () => {
    const noInputFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById("no_input");
    const blockedFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "blocked_derivation_decision",
      );
    const invalidFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "invalid_input",
      );
    const reviewFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "adapter_review_required",
      );
    const allowedFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "integration_allowed",
      );

    expect(noInputFixture.expectedState).toBe("no_input");
    expect(noInputFixture.decision.status).toBe("no_input");
    expect(noInputFixture.decision.sourceMode).toBe("fixture_only");
    expect(noInputFixture.decision.canUseFixtureFallback).toBe(true);
    expect(noInputFixture.decision.canNormalizeInput).toBe(false);
    expect(noInputFixture.decision.canCallDerivedPreviewBuilder).toBe(false);
    expect(noInputFixture.decision.canRenderReadOnlyPreview).toBe(false);

    expect(blockedFixture.expectedState).toBe("blocked");
    expect(blockedFixture.decision.status).toBe("blocked");
    expect(blockedFixture.decision.canNormalizeInput).toBe(false);
    expect(blockedFixture.decision.canCallDerivedPreviewBuilder).toBe(false);
    expect(blockedFixture.decision.canRenderReadOnlyPreview).toBe(false);

    expect(invalidFixture.expectedState).toBe("invalid_input");
    expect(invalidFixture.decision.status).toBe("invalid_input");
    expect(invalidFixture.decision.canNormalizeInput).toBe(false);
    expect(invalidFixture.decision.canCallDerivedPreviewBuilder).toBe(false);
    expect(invalidFixture.decision.canRenderReadOnlyPreview).toBe(false);

    expect(reviewFixture.expectedState).toBe("adapter_review_required");
    expect(reviewFixture.decision.status).toBe("adapter_review_required");
    expect(reviewFixture.decision.canReviewAdapter).toBe(true);
    expect(reviewFixture.decision.canNormalizeInput).toBe(false);
    expect(reviewFixture.decision.canCallDerivedPreviewBuilder).toBe(false);
    expect(reviewFixture.decision.canRenderReadOnlyPreview).toBe(false);

    expect(allowedFixture.expectedState).toBe("integration_allowed");
    expect(allowedFixture.decision.status).toBe("integration_allowed");
    expect(allowedFixture.decision.sourceMode).toBe(
      "read_only_selected_recommendation_dev_preview",
    );
    expect(allowedFixture.decision.canReviewAdapter).toBe(true);
    expect(allowedFixture.decision.canNormalizeInput).toBe(true);
    expect(allowedFixture.decision.canCallDerivedPreviewBuilder).toBe(true);
    expect(allowedFixture.decision.canRenderReadOnlyPreview).toBe(true);
  });

  test("all read-only selectedRecommendation adapter/derived-preview integration decision fixtures keep hard safety limits", () => {
    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures) {
      expect(fixture.decision.canCallBridge).toBe(false);
      expect(fixture.decision.canFetchLocalhost).toBe(false);
      expect(fixture.decision.canPoll).toBe(false);
      expect(fixture.decision.canExecute).toBe(false);
      expect(fixture.decision.controlsEnabled).toBe(false);
      expect(fixture.decision.gateLocked).toBe(true);
    }
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision fixtures have no execution-ready or production-ready copy", () => {
    const serialized = JSON.stringify(
      avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures,
    );

    expect(serialized).not.toMatch(/[^a-z-]execution-ready/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision fixtures are pure and do not call adapter or derived-preview builder", () => {
    const source = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-fixtures.ts",
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
    expect(source).not.toMatch(/avanza-selected-recommendation-adapter/);
    expect(source).not.toMatch(/avanza-selected-recommendation-derived-preview-state/);
    expect(source).not.toMatch(/adaptSelectedRecommendation/);
    expect(source).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(source).not.toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision harness renders fixture states and safety copy", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx",
    );

    expect(harnessSource).toContain(
      "Adapter/derived-preview integration decision",
    );
    expect(harnessSource).toContain("Decision fixture only");
    expect(harnessSource).toContain("No adapter is called");
    expect(harnessSource).toContain(
      "No derived-preview builder is called",
    );
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
    expect(harnessSource).toContain("no_input");
    expect(harnessSource).toContain("blocked_derivation_decision");
    expect(harnessSource).toContain("invalid_input");
    expect(harnessSource).toContain("adapter_review_required");
    expect(harnessSource).toContain("integration_allowed");
    expect(harnessSource).toContain("canReviewAdapter");
    expect(harnessSource).toContain("canNormalizeInput");
    expect(harnessSource).toContain("canCallDerivedPreviewBuilder");
    expect(harnessSource).toContain("canRenderReadOnlyPreview");
    expect(harnessSource).toContain("canUseFixtureFallback");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(harnessSource).toContain(
      "avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionFixtures",
    );
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision harness fixture data covers fallback, blocked, invalid, review, and allowed model states", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx",
    );
    const noInputFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById("no_input");
    const reviewFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "adapter_review_required",
      );
    const allowedFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "integration_allowed",
      );

    expect(noInputFixture.decision.canUseFixtureFallback).toBe(true);
    expect(reviewFixture.decision.canReviewAdapter).toBe(true);
    expect(reviewFixture.decision.canCallDerivedPreviewBuilder).toBe(false);
    expect(allowedFixture.decision.status).toBe("integration_allowed");
    expect(allowedFixture.decision.canNormalizeInput).toBe(true);
    expect(allowedFixture.decision.canCallDerivedPreviewBuilder).toBe(true);
    expect(allowedFixture.decision.canRenderReadOnlyPreview).toBe(true);
    expect(allowedFixture.decision.canCallBridge).toBe(false);
    expect(allowedFixture.decision.canFetchLocalhost).toBe(false);
    expect(allowedFixture.decision.canPoll).toBe(false);
    expect(allowedFixture.decision.canExecute).toBe(false);
    expect(allowedFixture.decision.controlsEnabled).toBe(false);
    expect(allowedFixture.decision.gateLocked).toBe(true);
    expect(harnessSource).toContain("call the adapter");
    expect(harnessSource).toContain("call the derived-preview builder");
    expect(harnessSource).toContain("derive real");
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision harness source stays pure and passive", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

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
    expect(harnessSource).not.toMatch(/avanza-selected-recommendation-adapter/);
    expect(harnessSource).not.toMatch(/avanza-selected-recommendation-derived-preview-state/);
    expect(harnessSource).not.toMatch(/adaptSelectedRecommendation/);
    expect(harnessSource).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(harnessSource).not.toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
    expect(routeSource).toContain("Adapter/derived-preview integration decision");
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain("No adapter is called");
    expect(routeSource).toContain("no derived-preview builder is called");
    expect(routeSource).toContain(
      "no real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no real preview state is derived");
    expect(routeSource).toContain("no real preview state is rendered");
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision checkpoint records isolated non-wired state", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-checkpoint.md",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_checkpoint_added",
    );
    expect(checkpoint).toContain("integration decision model is pure");
    expect(checkpoint).toContain("integration decision fixtures are static");
    expect(checkpoint).toContain("integration decision harness is isolated");
    expect(checkpoint).toContain("no_input");
    expect(checkpoint).toContain("fixture fallback");
    expect(checkpoint).toContain("blocked_derivation_decision");
    expect(checkpoint).toContain("blocks integration");
    expect(checkpoint).toContain("invalid_input");
    expect(checkpoint).toContain("adapter_review_required");
    expect(checkpoint).toContain("exists only as fixture/model state");
    expect(checkpoint).toContain("integration_allowed");
    expect(checkpoint).toContain("future read-only capability only");
    expect(checkpoint).toContain("harness is isolated");
    expect(checkpoint).toContain("not rendered in `app/trade-app.tsx`");
    expect(checkpoint).toContain(
      "rendered in `app/dev/avanza-visual-qa/page.tsx` as a",
    );
    expect(checkpoint).toContain("fixture/model-only section");
    expect(checkpoint).toContain("existing dev route remains fixture/model-only");
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is read from app/route",
    );
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("adapter is not called");
    expect(checkpoint).toContain("derived-preview builder is not called");
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
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain(
      "Option A: stop here and keep integration decision harness isolated",
    );
    expect(checkpoint).toContain(
      "Option B: add integration decision harness to the dev-only visual QA route",
    );
    expect(checkpoint).toContain(
      "Option C: plan actual adapter safety review separately",
    );
    expect(checkpoint).toContain(
      "Option D: plan actual adapter/derived-preview invocation behind explicit",
    );

    expect(harnessSource).toContain("no_input");
    expect(harnessSource).toContain("blocked_derivation_decision");
    expect(harnessSource).toContain("invalid_input");
    expect(harnessSource).toContain("adapter_review_required");
    expect(harnessSource).toContain("integration_allowed");
    expect(harnessSource).toContain("No adapter is called");
    expect(harnessSource).toContain(
      "No derived-preview builder is called",
    );
    expect(harnessSource).toContain("No bridge calls");
    expect(harnessSource).toContain("No localhost fetch");
    expect(harnessSource).toContain("No polling");
    expect(harnessSource).toContain("No execution");
    expect(harnessSource).toContain("Controls disabled");
    expect(harnessSource).toContain("Gate locked");
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
    expect(harnessSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(harnessSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain("No adapter is called");
    expect(routeSource).toContain(
      "no derived-preview builder is called",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no real preview state is derived");
    expect(routeSource).toContain("no real preview state is rendered");
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
    expect(routeSource).not.toMatch(/app\/trade-app|TradeApp/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toContain(
      "FINAL LIVE EXECUTE",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision route section checkpoint records fixture-only route section", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-route-section-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_route_section_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "integration decision harness is rendered on",
    );
    expect(checkpoint).toContain("`app/dev/avanza-visual-qa/page.tsx`");
    expect(checkpoint).toContain("route section is fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain(
      "integration decision harness is not rendered in Trade UI",
    );
    expect(checkpoint).toContain("no real selectedRecommendation state is read");
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is read from app or route",
    );
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("adapter is not called");
    expect(checkpoint).toContain("derived-preview builder is not called");
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
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain(
      "Option A: stop here and keep integration decision harness as fixture/model-only",
    );
    expect(checkpoint).toContain("Option B: add visual polish");
    expect(checkpoint).toContain(
      "Option C: plan actual adapter safety review separately",
    );
    expect(checkpoint).toContain(
      "Option D: plan actual adapter/derived-preview invocation behind explicit",
    );

    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
    expect(routeSource).toContain("Adapter/derived-preview integration decision");
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain("No adapter is called");
    expect(routeSource).toContain(
      "no derived-preview builder is called",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no real preview state is derived");
    expect(routeSource).toContain("no real preview state is rendered");
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
    expect(routeSource).not.toMatch(/app\/trade-app|TradeApp/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
  });

  test("read-only selectedRecommendation adapter/derived-preview integration decision phase completion checkpoint records completed fixture-model phase", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_phase_completion_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "adapter/derived-preview integration decision phase is complete as",
    );
    expect(checkpoint).toContain("route-visible fixture/model phase");
    expect(checkpoint).toContain(
      "integration decision harness is rendered on",
    );
    expect(checkpoint).toContain("`app/dev/avanza-visual-qa/page.tsx`");
    expect(checkpoint).toContain("route section is fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain(
      "integration decision harness is not rendered in Trade UI",
    );
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is read from app/route",
    );
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("adapter is not called");
    expect(checkpoint).toContain("derived-preview builder is not called");
    expect(checkpoint).toContain("no real preview state is derived");
    expect(checkpoint).toContain("no real preview state is rendered");
    expect(checkpoint).toContain(
      "selectedRecommendation preview disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("`explicitPreviewOnlyFlag` false by default");
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain(
      "Option A: stop here and keep integration decision route section",
    );
    expect(checkpoint).toContain("Option B: visual polish only");
    expect(checkpoint).toContain(
      "Option C: plan adapter safety review separately",
    );
    expect(checkpoint).toContain(
      "Option D: plan actual adapter/derived-preview invocation behind explicit",
    );

    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
    expect(routeSource).toContain("Adapter/derived-preview integration decision");
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain("No adapter is called");
    expect(routeSource).toContain(
      "no derived-preview builder is called",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no real preview state is derived");
    expect(routeSource).toContain("no real preview state is rendered");
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
    expect(routeSource).not.toMatch(/app\/trade-app|TradeApp/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
  });

  test("selectedRecommendation adapter and derived-preview target files pass static safety audit", () => {
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    for (const targetFile of selectedRecommendationAdapterSafetyAuditTargetFiles) {
      const source = readRepoFile(targetFile);

      for (const forbiddenPattern of staticSafetyForbiddenPatterns) {
        expect(source, `${targetFile} should not match ${forbiddenPattern}`).not.toMatch(
          forbiddenPattern,
        );
      }

      expect(source, `${targetFile} should not import app code`).not.toMatch(
        /app\/trade-app|app\/dev\/avanza-visual-qa/,
      );
      expect(source, `${targetFile} should not import React state`).not.toMatch(
        /useState|useEffect|useMemo|from ["']react["']/,
      );
      expect(source, `${targetFile} should not contain live endpoint strings`).not.toMatch(
        /\/api\/avanza|\/api\/automation|bridge\/|runner\/|fill-only/i,
      );
    }

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
    expect(tradeAppSource).not.toContain("app/dev/avanza-visual-qa");
    expect(tradeAppSource).not.toContain("/dev/avanza-visual-qa");
    expect(tradeAppSource).not.toContain(
      "adaptSelectedRecommendationToAvanzaHandoffSource",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaSelectedRecommendationPreviewState",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision",
    );

    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).not.toMatch(/adaptSelectedRecommendationToAvanzaHandoffSource/);
    expect(routeSource).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(routeSource).not.toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
    expect(routeSource).not.toMatch(
      /buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision/,
    );
    expect(routeSource).not.toMatch(/app\/trade-app|TradeApp/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }
  });

  test("selectedRecommendation adapter safety review result checkpoint records static audit boundary", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-selected-recommendation-adapter-safety-review-result-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_selected_recommendation_adapter_safety_review_result_checkpoint_added",
    );
    expect(checkpoint).toContain("static audit only");
    expect(checkpoint).toContain(
      "lib/avanza-selected-recommendation-adapter.ts",
    );
    expect(checkpoint).toContain(
      "lib/avanza-selected-recommendation-derived-preview-state.ts",
    );
    expect(checkpoint).toContain(
      "lib/avanza-selected-recommendation-preview-state.ts",
    );
    expect(checkpoint).toContain(
      "lib/avanza-selected-recommendation-preview-integration-guard.ts",
    );
    expect(checkpoint).toContain(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts",
    );
    expect(checkpoint).toContain("Current static audit result: pass");
    expect(checkpoint).toContain("adapter is not called");
    expect(checkpoint).toContain("derived-preview builder is not called");
    expect(checkpoint).toContain("no real selectedRecommendation state is read");
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("no real preview state is derived");
    expect(checkpoint).toContain("no real preview state is rendered");
    expect(checkpoint).toContain("no route behavior changed");
    expect(checkpoint).toContain("no Trade UI behavior changed");
    expect(checkpoint).toContain(
      "selectedRecommendation preview remains disabled by default",
    );
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("gate locked");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain(
      "does not prove runtime adapter output correctness",
    );
    expect(checkpoint).toContain("does not execute adapter normalization");
    expect(checkpoint).toContain("does not execute the derived-preview builder");
    expect(checkpoint).toContain("does not prove");
    expect(checkpoint).toContain("all future inputs are safe");
    expect(checkpoint).toContain("does not enable route integration");
    expect(checkpoint).toContain("does not enable Trade UI integration");
    expect(checkpoint).toContain(
      "Option A: stop here and keep adapter/derived-preview integration as",
    );
    expect(checkpoint).toContain(
      "Option B: add a pure adapter/derived-preview invocation wrapper plan",
    );
    expect(checkpoint).toContain(
      "Option C: add a pure wrapper model that invokes adapter only with static",
    );
    expect(checkpoint).toContain(
      "Option D: postpone actual invocation until broader architecture checkpoint",
    );

    for (const targetFile of selectedRecommendationAdapterSafetyAuditTargetFiles) {
      const source = readRepoFile(targetFile);

      for (const forbiddenPattern of staticSafetyForbiddenPatterns) {
        expect(source, `${targetFile} should not match ${forbiddenPattern}`).not.toMatch(
          forbiddenPattern,
        );
      }
    }

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
    expect(tradeAppSource).not.toContain("app/dev/avanza-visual-qa");
    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).not.toMatch(/adaptSelectedRecommendationToAvanzaHandoffSource/);
    expect(routeSource).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(routeSource).not.toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
    expect(routeSource).not.toMatch(
      /buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision/,
    );
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }
  });

  test("adapter/derived-preview integration phase completion checkpoint records complete non-wired phase", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md",
    );
    const staticAuditCheckpoint = readRepoFile(
      "docs/avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_adapter_derived_preview_integration_phase_completion_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "adapter/derived-preview integration phase is complete as a",
    );
    expect(checkpoint).toContain("plan/decision/static-audit/wrapper-plan phase");
    expect(checkpoint).toContain(
      "integration decision harness is rendered on",
    );
    expect(checkpoint).toContain("`app/dev/avanza-visual-qa/page.tsx`");
    expect(checkpoint).toContain("fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain(
      "no integration harness is rendered in Trade UI",
    );
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is read from app/route",
    );
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("adapter is not called");
    expect(checkpoint).toContain("derived-preview builder is not called");
    expect(checkpoint).toContain("no real preview state is derived");
    expect(checkpoint).toContain("no real preview state is rendered");
    expect(checkpoint).toContain(
      "selectedRecommendation preview disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("`explicitPreviewOnlyFlag` false by default");
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain(
      "Option A: stop here and keep adapter/derived-preview integration as",
    );
    expect(checkpoint).toContain("Option B: visual polish only");
    expect(checkpoint).toContain(
      "Option C: implement pure adapter/derived-preview wrapper with static fixtures",
    );
    expect(checkpoint).toContain(
      "Option D: postpone actual invocation until broader architecture checkpoint",
    );

    for (const targetFile of selectedRecommendationAdapterSafetyAuditTargetFiles) {
      expect(staticAuditCheckpoint).toContain(targetFile);
      const source = readRepoFile(targetFile);

      for (const forbiddenPattern of staticSafetyForbiddenPatterns) {
        expect(source, `${targetFile} should not match ${forbiddenPattern}`).not.toMatch(
          forbiddenPattern,
        );
      }
    }

    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
    expect(routeSource).toContain("Adapter/derived-preview integration decision");
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain("No adapter is called");
    expect(routeSource).toContain("no derived-preview builder is called");
    expect(routeSource).toContain(
      "no real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no real preview state is derived");
    expect(routeSource).toContain("no real preview state is rendered");
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
    expect(routeSource).not.toMatch(/app\/trade-app|TradeApp/);
    expect(routeSource).not.toMatch(/adaptSelectedRecommendationToAvanzaHandoffSource/);
    expect(routeSource).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(routeSource).not.toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
    expect(routeSource).not.toMatch(
      /buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision/,
    );
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness",
    );
    expect(tradeAppSource).not.toContain("app/dev/avanza-visual-qa");
    expect(tradeAppSource).not.toContain("/dev/avanza-visual-qa");
    expect(tradeAppSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecision",
    );

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper skeleton returns no_input without input", () => {
    const noInputFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById("no_input");
    const state =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
        integrationDecision: noInputFixture.decision,
        selectedRecommendation: null,
      });

    expect(state.status).toBe("no_input");
    expect(state.sourceMode).toBe("fixture_only");
    expect(state.previewState).toBeNull();
    expect(state.canRenderReadOnlyPreview).toBe(false);
    expect(state.canCallBridge).toBe(false);
    expect(state.canFetchLocalhost).toBe(false);
    expect(state.canPoll).toBe(false);
    expect(state.canExecute).toBe(false);
    expect(state.controlsEnabled).toBe(false);
    expect(state.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper skeleton blocks blocked integration decision", () => {
    const blockedFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "blocked_derivation_decision",
      );
    const state =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
        integrationDecision: blockedFixture.decision,
        selectedRecommendation: blockedFixture.selectedRecommendation,
      });

    expect(state.status).toBe("blocked");
    expect(state.sourceMode).toBe("blocked");
    expect(state.previewState).toBeNull();
    expect(state.canRenderReadOnlyPreview).toBe(false);
    expect(state.canCallBridge).toBe(false);
    expect(state.canFetchLocalhost).toBe(false);
    expect(state.canPoll).toBe(false);
    expect(state.canExecute).toBe(false);
    expect(state.controlsEnabled).toBe(false);
    expect(state.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper skeleton rejects invalid input", () => {
    const allowedFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "integration_allowed",
      );
    const state =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
        integrationDecision: allowedFixture.decision,
        selectedRecommendation: { company: "Missing ticker" },
      });

    expect(state.status).toBe("invalid_input");
    expect(state.sourceMode).toBe("blocked");
    expect(state.normalizedInputSummary?.hasTicker).toBe(false);
    expect(state.previewState).toBeNull();
    expect(state.canRenderReadOnlyPreview).toBe(false);
    expect(state.canCallBridge).toBe(false);
    expect(state.canFetchLocalhost).toBe(false);
    expect(state.canPoll).toBe(false);
    expect(state.canExecute).toBe(false);
    expect(state.controlsEnabled).toBe(false);
    expect(state.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper can keep adapter-normalized static fixture without preview state", () => {
    const allowedFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "integration_allowed",
      );
    const state =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
        derivePreviewState: false,
        integrationDecision: allowedFixture.decision,
        selectedRecommendation: {
          company: "Volvo",
          entryPrice: 245.5,
          quantity: 10,
          side: "buy",
          ticker: "VOLV B",
        },
        sourceLabel: "read_only_selected_recommendation_dev_preview",
      });

    expect(state.status).toBe("adapter_normalized_static_fixture");
    expect(state.sourceMode).toBe(
      "read_only_selected_recommendation_dev_preview",
    );
    expect(state.normalizedInputSummary?.ticker).toBe("VOLV B");
    expect(state.normalizedInputSummary?.direction).toBe("long");
    expect(state.normalizedInputSummary?.hasTicker).toBe(true);
    expect(state.normalizedInputSummary?.hasQuantity).toBe(true);
    expect(state.normalizedInputSummary?.quantity).toBe(10);
    expect(state.previewState).toBeNull();
    expect(state.canRenderReadOnlyPreview).toBe(false);
    expect(state.canCallBridge).toBe(false);
    expect(state.canFetchLocalhost).toBe(false);
    expect(state.canPoll).toBe(false);
    expect(state.canExecute).toBe(false);
    expect(state.controlsEnabled).toBe(false);
    expect(state.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper derives read-only preview from valid static fixture", () => {
    const allowedFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "integration_allowed",
      );
    const state =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
        integrationDecision: allowedFixture.decision,
        selectedRecommendation: {
          company: "Volvo",
          entryPrice: 245.5,
          quantity: 10,
          side: "buy",
          ticker: "VOLV B",
        },
        sourceLabel: "read_only_selected_recommendation_dev_preview",
      });

    expect(state.status).toBe("read_only_preview_ready");
    expect(state.sourceMode).toBe(
      "read_only_selected_recommendation_dev_preview",
    );
    expect(state.normalizedInputSummary?.ticker).toBe("VOLV B");
    expect(state.previewState).not.toBeNull();
    expect(state.previewState?.displayState).toBe("preview_ready_locked");
    expect(state.previewState?.preActivationGate.gateStatus).toBe("locked");
    expect(state.previewState?.sourceMode.activeMode).toBe(
      "selected_recommendation_preview_only",
    );
    expect(state.canRenderReadOnlyPreview).toBe(true);
    expect(state.canCallBridge).toBe(false);
    expect(state.canFetchLocalhost).toBe(false);
    expect(state.canPoll).toBe(false);
    expect(state.canExecute).toBe(false);
    expect(state.controlsEnabled).toBe(false);
    expect(state.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper keeps derived-preview failure safe", () => {
    const allowedFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "integration_allowed",
      );
    const state =
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
        integrationDecision: allowedFixture.decision,
        selectedRecommendation: {
          company: "Volvo",
          entryPrice: 245.5,
          quantity: 10,
          side: "buy",
          ticker: "VOLV B",
        },
        simulateDerivedPreviewFailure: true,
        sourceLabel: "read_only_selected_recommendation_dev_preview",
      });

    expect(state.status).toBe("derived_preview_failed");
    expect(state.normalizedInputSummary?.ticker).toBe("VOLV B");
    expect(state.previewState).toBeNull();
    expect(state.canRenderReadOnlyPreview).toBe(false);
    expect(state.canCallBridge).toBe(false);
    expect(state.canFetchLocalhost).toBe(false);
    expect(state.canPoll).toBe(false);
    expect(state.canExecute).toBe(false);
    expect(state.controlsEnabled).toBe(false);
    expect(state.gateLocked).toBe(true);
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper skeleton has no execution-ready or production-ready copy", () => {
    const allowedFixture =
      readOnlyAdapterDerivedPreviewIntegrationDecisionFixtureById(
        "integration_allowed",
      );
    const serialized = JSON.stringify([
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
        integrationDecision: allowedFixture.decision,
        selectedRecommendation: null,
      }),
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
        integrationDecision: allowedFixture.decision,
        selectedRecommendation: {},
      }),
      buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper({
        integrationDecision: allowedFixture.decision,
        selectedRecommendation: allowedFixture.selectedRecommendation,
      }),
    ]);

    expect(serialized).not.toMatch(/(?<!not )execution-ready/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper is pure and only calls adapter or derived-preview builder for static fixtures", () => {
    const source = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

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
    expect(source).toMatch(/adaptSelectedRecommendationToAvanzaHandoffSource/);
    expect(source).toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
    expect(source).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(routeSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper",
    );
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper fixtures cover skeleton states", () => {
    const noInputFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("no_input");
    const blockedFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("blocked");
    const invalidFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("invalid_input");
    const adapterRejectedFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("adapter_rejected");
    const normalizedFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById(
        "adapter_normalized_static_fixture",
      );
    const derivedFailureFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("derived_preview_failed");
    const previewReadyFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("read_only_preview_ready");

    expect(noInputFixture.expectedState).toBe("no_input");
    expect(noInputFixture.wrapperResult.status).toBe("no_input");
    expect(noInputFixture.wrapperResult.previewState).toBeNull();

    expect(blockedFixture.expectedState).toBe("blocked");
    expect(blockedFixture.wrapperResult.status).toBe("blocked");
    expect(blockedFixture.wrapperResult.previewState).toBeNull();

    expect(invalidFixture.expectedState).toBe("invalid_input");
    expect(invalidFixture.wrapperResult.status).toBe("invalid_input");
    expect(invalidFixture.wrapperResult.previewState).toBeNull();

    expect(adapterRejectedFixture.expectedState).toBe("adapter_rejected");
    expect(adapterRejectedFixture.wrapperResult.status).toBe("adapter_rejected");
    expect(adapterRejectedFixture.wrapperResult.previewState).toBeNull();

    expect(normalizedFixture.id).toBe("adapter_normalized_static_fixture");
    expect(normalizedFixture.expectedState).toBe(
      "adapter_normalized_static_fixture",
    );
    expect(normalizedFixture.wrapperResult.status).toBe(
      "adapter_normalized_static_fixture",
    );
    expect(normalizedFixture.wrapperResult.normalizedInputSummary?.ticker).toBe(
      "VOLV B",
    );
    expect(normalizedFixture.wrapperResult.normalizedInputSummary?.direction).toBe(
      "long",
    );
    expect(normalizedFixture.wrapperResult.previewState).toBeNull();
    expect(normalizedFixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);

    expect(derivedFailureFixture.expectedState).toBe("derived_preview_failed");
    expect(derivedFailureFixture.wrapperResult.status).toBe(
      "derived_preview_failed",
    );
    expect(derivedFailureFixture.wrapperResult.previewState).toBeNull();
    expect(derivedFailureFixture.wrapperResult.canRenderReadOnlyPreview).toBe(
      false,
    );

    expect(previewReadyFixture.expectedState).toBe("read_only_preview_ready");
    expect(previewReadyFixture.wrapperResult.status).toBe(
      "read_only_preview_ready",
    );
    expect(previewReadyFixture.wrapperResult.previewState).not.toBeNull();
    expect(previewReadyFixture.wrapperResult.previewState?.displayState).toBe(
      "preview_ready_locked",
    );
    expect(
      previewReadyFixture.wrapperResult.previewState?.preActivationGate
        .gateStatus,
    ).toBe("locked");
    expect(previewReadyFixture.wrapperResult.canRenderReadOnlyPreview).toBe(
      true,
    );
  });

  test("all read-only selectedRecommendation adapter/derived-preview wrapper fixtures keep hard safety limits", () => {
    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures) {
      if (fixture.wrapperResult.status === "read_only_preview_ready") {
        expect(fixture.wrapperResult.previewState).not.toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.wrapperResult.previewState).toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
      }
      expect(fixture.wrapperResult.canCallBridge).toBe(false);
      expect(fixture.wrapperResult.canFetchLocalhost).toBe(false);
      expect(fixture.wrapperResult.canPoll).toBe(false);
      expect(fixture.wrapperResult.canExecute).toBe(false);
      expect(fixture.wrapperResult.controlsEnabled).toBe(false);
      expect(fixture.wrapperResult.gateLocked).toBe(true);
    }
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper fixtures have no execution-ready or production-ready copy", () => {
    const serialized = JSON.stringify(
      avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures,
    );

    expect(serialized).not.toMatch(/(?<!not )execution-ready/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
    expect(serialized).not.toMatch(/production-ready/i);
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper fixtures are pure and keep adapter invocation static-only", () => {
    const source = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

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
    expect(source).not.toMatch(/avanza-selected-recommendation-derived-preview-state/);
    expect(source).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(source).not.toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
    expect(routeSource).not.toContain(
      "avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures",
    );
    expect(tradeAppSource).not.toContain(
      "avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures",
    );
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper harness renders fixture states and safety copy", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx",
    );

    expect(harnessSource).toContain("Adapter/derived-preview wrapper");
    expect(harnessSource).toContain("Wrapper fixture only");
    expect(harnessSource).toContain(
      "Adapter normalization uses static fixtures only",
    );
    expect(harnessSource).toContain(
      "Derived-preview builder uses static fixtures only",
    );
    expect(harnessSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(harnessSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(harnessSource).toContain("No real app or route preview state is derived");
    expect(harnessSource).toContain(
      "Read-only previewState may appear for ready fixture",
    );
    expect(harnessSource).toContain("No bridge calls");
    expect(harnessSource).toContain("No localhost fetch");
    expect(harnessSource).toContain("No polling");
    expect(harnessSource).toContain("No execution");
    expect(harnessSource).toContain("Controls disabled");
    expect(harnessSource).toContain("Gate locked");
    expect(harnessSource).toContain("no_input");
    expect(harnessSource).toContain("blocked");
    expect(harnessSource).toContain("invalid_input");
    expect(harnessSource).toContain("adapter_rejected");
    expect(harnessSource).toContain("adapter_normalized_static_fixture");
    expect(harnessSource).toContain("derived_preview_failed");
    expect(harnessSource).toContain("read_only_preview_ready");
    expect(harnessSource).toContain("Wrapper status");
    expect(harnessSource).toContain("sourceMode");
    expect(harnessSource).toContain("normalizedInputSummary");
    expect(harnessSource).toContain("previewState");
    expect(harnessSource).toContain("canRenderReadOnlyPreview");
    expect(harnessSource).toContain("canCallBridge");
    expect(harnessSource).toContain("canFetchLocalhost");
    expect(harnessSource).toContain("canPoll");
    expect(harnessSource).toContain("canExecute");
    expect(harnessSource).toContain("controlsEnabled");
    expect(harnessSource).toContain("gateLocked");
    expect(harnessSource).toContain(
      "avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures",
    );
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper harness fixture data covers every wrapper fixture", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx",
    );

    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures) {
      expect(harnessSource).toContain(fixture.id);
      if (fixture.wrapperResult.status === "read_only_preview_ready") {
        expect(fixture.wrapperResult.previewState).not.toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.wrapperResult.previewState).toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
      }
      expect(fixture.wrapperResult.canCallBridge).toBe(false);
      expect(fixture.wrapperResult.canFetchLocalhost).toBe(false);
      expect(fixture.wrapperResult.canPoll).toBe(false);
      expect(fixture.wrapperResult.canExecute).toBe(false);
      expect(fixture.wrapperResult.controlsEnabled).toBe(false);
      expect(fixture.wrapperResult.gateLocked).toBe(true);
    }
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper harness source stays pure and route fixture-only", () => {
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

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
    expect(harnessSource).not.toMatch(/avanza-selected-recommendation-derived-preview-state/);
    expect(harnessSource).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(harnessSource).not.toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(routeSource).toContain("Adapter/derived-preview wrapper");
    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "Adapter and derived-preview invocation use static fixtures only",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No real app or route preview state is derived");
    expect(routeSource).toContain("No real preview state is rendered in Trade UI");
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/method:\s*["']POST["']/);
    expect(routeSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper checkpoint records isolated skeleton fixture harness phase", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md",
    );
    const harnessSource = readRepoFile(
      "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_adapter_derived_preview_wrapper_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts",
    );
    expect(checkpoint).toContain(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts",
    );
    expect(checkpoint).toContain(
      "components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx",
    );
    expect(checkpoint).toContain("wrapper accepts explicit selectedRecommendation-like input");
    expect(checkpoint).toContain("explicit integration decision");
    expect(checkpoint).toContain("`previewState` appears only for `read_only_preview_ready`");
    expect(checkpoint).toContain("wrapper now calls adapter only for explicit static fixture normalization");
    expect(checkpoint).toContain("derived-preview builder is called only for explicit static fixtures");
    expect(checkpoint).toContain("adapter_normalized_static_fixture");
    expect(checkpoint).toContain("derived_preview_failed");
    expect(checkpoint).toContain("read_only_preview_ready");
    expect(checkpoint).toContain("harness is isolated");
    expect(checkpoint).toContain("not rendered in `app/trade-app.tsx`");
    expect(checkpoint).toContain(
      "rendered in `app/dev/avanza-visual-qa/page.tsx` as fixture/model-only",
    );
    expect(checkpoint).toContain("existing dev route remains fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is read from app/route",
    );
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("no real app or route preview state is derived");
    expect(checkpoint).toContain("no real preview state is rendered in Trade UI");
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
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain(
      "Option A: stop here and keep wrapper harness route section fixture/model-only",
    );
    expect(checkpoint).toContain(
      "Option B: add a route-section checkpoint for the fixture/model-only wrapper harness",
    );
    expect(checkpoint).toContain(
      "Option C: static-fixture adapter invocation behind pure wrapper fixtures has",
    );
    expect(checkpoint).toContain(
      "Option D: plan real selectedRecommendation read-only derivation separately",
    );

    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures) {
      expect(harnessSource).toContain(fixture.id);
      if (fixture.wrapperResult.status === "read_only_preview_ready") {
        expect(fixture.wrapperResult.previewState).not.toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.wrapperResult.previewState).toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
      }
    }

    expect(harnessSource).toContain(
      "Adapter normalization uses static fixtures only",
    );
    expect(harnessSource).toContain(
      "Derived-preview builder uses static fixtures only",
    );
    expect(harnessSource).toContain(
      "Read-only previewState may appear for ready fixture",
    );
    expect(harnessSource).not.toContain("<button");
    expect(harnessSource).not.toMatch(/onClick\s*=/);
    expect(harnessSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(harnessSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).toContain("Fixture-only");
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "Adapter and derived-preview invocation use static fixtures only",
    );
    expect(routeSource).toContain("No real app or route preview state is derived");
    expect(routeSource).toContain("No real preview state is rendered in Trade UI");
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper route section checkpoint records fixture-only route section", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md",
    );
    const wrapperCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_adapter_derived_preview_wrapper_route_section_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "wrapper harness is now rendered on `app/dev/avanza-visual-qa/page.tsx`",
    );
    expect(checkpoint).toContain("route section is fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain("wrapper harness is not rendered in Trade UI");
    expect(checkpoint).toContain("No real selectedRecommendation state is read");
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain(
      "The wrapper may call the adapter and derived-preview builder only for explicit",
    );
    expect(checkpoint).toContain(
      "`previewState` appears only for `read_only_preview_ready`",
    );
    expect(checkpoint).toContain("no real app or route");
    expect(checkpoint).toContain("preview state is derived");
    expect(checkpoint).toContain("no real preview state is rendered in Trade UI");
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
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain(
      "Option A: stop here and keep wrapper harness as fixture/model-only route",
    );
    expect(checkpoint).toContain(
      "Option B: add visual polish to fixture/model-only route sections only",
    );
    expect(checkpoint).toContain(
      "Option C: static-fixture adapter invocation behind pure wrapper fixtures has",
    );
    expect(checkpoint).toContain(
      "Option D: postpone actual invocation until broader architecture checkpoint",
    );
    expect(wrapperCheckpoint).toContain(
      "avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md",
    );

    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "Adapter and derived-preview invocation use static fixtures only",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No real app or route preview state is derived");
    expect(routeSource).toContain("No real preview state is rendered in Trade UI");
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(routeSource).toContain("No bridge calls");
    expect(routeSource).toContain("No localhost fetch");
    expect(routeSource).toContain("No polling");
    expect(routeSource).toContain("No execution");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");
    expect(routeSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
  });

  test("read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint records completed fixture route phase", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md",
    );
    const routeSectionCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md",
    );
    const wrapperCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_adapter_derived_preview_wrapper_phase_completion_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "The pure wrapper phase is complete as static-fixture adapter/derived-preview",
    );
    expect(checkpoint).toContain(
      "wrapper harness is rendered on `app/dev/avanza-visual-qa/page.tsx`",
    );
    expect(checkpoint).toContain("route section is fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain("The wrapper harness is not rendered in Trade UI");
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is read from app/route",
    );
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain(
      "The wrapper may call the adapter and derived-preview builder only for explicit",
    );
    expect(checkpoint).toContain("static fixtures");
    expect(checkpoint).toContain("derived-preview-failed");
    expect(checkpoint).toContain("read-only-preview-ready");
    expect(checkpoint).toContain(
      "`previewState` appears only for `read_only_preview_ready`",
    );
    expect(checkpoint).toContain("No real app or route preview state is derived");
    expect(checkpoint).toContain("No real preview state is rendered in Trade UI");
    expect(checkpoint).toContain(
      "selectedRecommendation preview disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("`explicitPreviewOnlyFlag` false by default");
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain(
      "Option A: stop here and keep wrapper route section fixture/model-only",
    );
    expect(checkpoint).toContain(
      "Option B: visual polish only on the dev-only QA route sections",
    );
    expect(checkpoint).toContain(
      "Option C: plan broader read-only derivation beyond static fixtures separately",
    );
    expect(checkpoint).toContain(
      "Option D: postpone actual invocation until broader architecture checkpoint",
    );
    expect(routeSectionCheckpoint).toContain(
      "avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md",
    );
    expect(wrapperCheckpoint).toContain(
      "avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md",
    );

    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "Adapter and derived-preview invocation use static fixtures only",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No real app or route preview state is derived");
    expect(routeSource).toContain("No real preview state is rendered in Trade UI");
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(routeSource).toContain("No bridge calls");
    expect(routeSource).toContain("No localhost fetch");
    expect(routeSource).toContain("No polling");
    expect(routeSource).toContain("No execution");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");
    expect(routeSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
  });

  test("static-fixture adapter invocation pre-implementation checkpoint records no invocation yet", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md",
    );
    const plan = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md",
    );
    const wrapperSource = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts",
    );
    const wrapperFixturesSource = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_static_fixture_adapter_invocation_pre_implementation_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "The static-fixture adapter invocation checkpoint has now been followed",
    );
    expect(checkpoint).toContain("pure wrapper code only");
    expect(checkpoint).toContain("static selectedRecommendation-like fixture input only");
    expect(checkpoint).toContain("explicit integration decision input only");
    expect(checkpoint).toContain(
      "adapter may be called only inside the pure wrapper with static fixtures/tests",
    );
    expect(checkpoint).toContain("no derived-preview builder call");
    expect(checkpoint).toContain("`previewState` remains null");
    expect(checkpoint).toContain("no route wiring");
    expect(checkpoint).toContain("no Trade UI wiring");
    expect(checkpoint).toContain("no real selectedRecommendation state read");
    expect(checkpoint).toContain("`no_input`");
    expect(checkpoint).toContain("`blocked`");
    expect(checkpoint).toContain("`invalid_input`");
    expect(checkpoint).toContain("`adapter_rejected`");
    expect(checkpoint).toContain("`adapter_normalized_static_fixture`");
    expect(checkpoint).toContain("`previewState: null`");
    expect(checkpoint).toContain("`canRenderReadOnlyPreview: false`");
    expect(checkpoint).toContain("`canCallBridge: false`");
    expect(checkpoint).toContain("`canFetchLocalhost: false`");
    expect(checkpoint).toContain("`canPoll: false`");
    expect(checkpoint).toContain("`canExecute: false`");
    expect(checkpoint).toContain("`controlsEnabled: false`");
    expect(checkpoint).toContain("`gateLocked: true`");
    expect(checkpoint).toContain("`app/trade-app.tsx` must remain unchanged");
    expect(checkpoint).toContain(
      "`app/dev/avanza-visual-qa/page.tsx` must remain unchanged",
    );
    expect(checkpoint).toContain("existing dev route remains fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain(
      "selectedRecommendation preview remains disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("no active handoff button");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no execution readiness claim");
    expect(plan).toContain(
      "avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md",
    );

    expect(wrapperSource).toMatch(/avanza-selected-recommendation-adapter/);
    expect(wrapperSource).toMatch(/adaptSelectedRecommendationToAvanzaHandoffSource/);
    expect(wrapperSource).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(wrapperSource).toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
    expect(wrapperSource).not.toMatch(/fetch\s*\(/);
    expect(wrapperSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(wrapperSource).not.toMatch(/setInterval|setTimeout/);
    expect(wrapperSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(wrapperSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(wrapperFixturesSource).not.toMatch(
      /avanza-selected-recommendation-derived-preview-state/,
    );
    expect(wrapperFixturesSource).not.toMatch(
      /avanza-selected-recommendation-derived-preview-state/,
    );
    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "Adapter and derived-preview invocation use static fixtures only",
    );
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(routeSource).not.toMatch(/adaptSelectedRecommendationToAvanzaHandoffSource/);
    expect(routeSource).not.toMatch(/buildAvanzaPreviewStateFromSelectedRecommendation/);
    expect(routeSource).not.toMatch(/buildAvanzaSelectedRecommendationPreviewState/);
    expect(routeSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper",
    );

    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures) {
      if (fixture.wrapperResult.status === "read_only_preview_ready") {
        expect(fixture.wrapperResult.previewState).not.toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.wrapperResult.previewState).toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
      }
      expect(fixture.wrapperResult.canCallBridge).toBe(false);
      expect(fixture.wrapperResult.canFetchLocalhost).toBe(false);
      expect(fixture.wrapperResult.canPoll).toBe(false);
      expect(fixture.wrapperResult.canExecute).toBe(false);
      expect(fixture.wrapperResult.controlsEnabled).toBe(false);
      expect(fixture.wrapperResult.gateLocked).toBe(true);
    }
  });

  test("static-fixture adapter invocation checkpoint records pure wrapper-only adapter normalization", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md",
    );
    const plan = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md",
    );
    const preImplementationCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md",
    );
    const wrapperCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md",
    );
    const wrapperSource = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts",
    );
    const wrapperFixturesSource = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const normalizedFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById(
        "adapter_normalized_static_fixture",
      );

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_static_fixture_adapter_invocation_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "The static-fixture adapter invocation step is implemented inside the pure",
    );
    expect(checkpoint).toContain(
      "Adapter invocation exists only inside the pure wrapper",
    );
    expect(checkpoint).toContain("explicit wrapper input");
    expect(checkpoint).toContain("explicit integration decision");
    expect(checkpoint).toContain("static fixture/test input");
    expect(checkpoint).toContain("`adapter_normalized_static_fixture`");
    expect(checkpoint).toContain("`normalizedInputSummary`");
    expect(checkpoint).toContain("safe and minimal");
    expect(checkpoint).toContain("`previewState: null`");
    expect(checkpoint).toContain("`canRenderReadOnlyPreview: false`");
    expect(checkpoint).toContain("`canCallBridge: false`");
    expect(checkpoint).toContain("`canFetchLocalhost: false`");
    expect(checkpoint).toContain("`canPoll: false`");
    expect(checkpoint).toContain("`canExecute: false`");
    expect(checkpoint).toContain("`controlsEnabled: false`");
    expect(checkpoint).toContain("`gateLocked: true`");
    expect(checkpoint).toContain("Static-Fixture Derived-Preview Invocation Plan");
    expect(checkpoint).toContain("`buildAvanzaPreviewStateFromSelectedRecommendation(...)`");
    expect(checkpoint).toContain("`buildAvanzaSelectedRecommendationPreviewState(...)`");
    expect(checkpoint).toContain(
      "`previewState` appears only for `read_only_preview_ready`",
    );
    expect(checkpoint).toContain("No real selectedRecommendation state is read or rendered");
    expect(checkpoint).toContain("No real app/route preview state is derived");
    expect(checkpoint).toContain("wrapper harness remains fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain("active/default source remains `static_fixture`");
    expect(checkpoint).toContain(
      "selectedRecommendation preview remains disabled by default",
    );
    expect(checkpoint).toContain("pre-activation gate remains locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain("no execution readiness claim");
    expect(checkpoint).toContain(
      "Option A: stop here and keep adapter invocation static-fixture-only",
    );
    expect(checkpoint).toContain(
      "Option B: add a checkpoint before any derived-preview builder invocation",
    );
    expect(checkpoint).toContain(
      "Option C: plan derived-preview builder invocation with static fixtures only",
    );
    expect(checkpoint).toContain(
      "Option D: postpone derived-preview invocation until a broader architecture",
    );

    expect(plan).toContain(
      "avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md",
    );
    expect(preImplementationCheckpoint).toContain(
      "avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md",
    );
    expect(wrapperCheckpoint).toContain(
      "avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md",
    );

    expect(normalizedFixture.wrapperResult.status).toBe(
      "adapter_normalized_static_fixture",
    );
    expect(normalizedFixture.wrapperResult.normalizedInputSummary).toMatchObject({
      ticker: "VOLV B",
      direction: "long",
      entry: 245.5,
      quantity: 10,
    });
    expect(normalizedFixture.wrapperResult.previewState).toBeNull();
    expect(normalizedFixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
    expect(normalizedFixture.wrapperResult.canCallBridge).toBe(false);
    expect(normalizedFixture.wrapperResult.canFetchLocalhost).toBe(false);
    expect(normalizedFixture.wrapperResult.canPoll).toBe(false);
    expect(normalizedFixture.wrapperResult.canExecute).toBe(false);
    expect(normalizedFixture.wrapperResult.controlsEnabled).toBe(false);
    expect(normalizedFixture.wrapperResult.gateLocked).toBe(true);

    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures) {
      if (fixture.wrapperResult.status === "read_only_preview_ready") {
        expect(fixture.wrapperResult.previewState).not.toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.wrapperResult.previewState).toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
      }
      expect(fixture.wrapperResult.canCallBridge).toBe(false);
      expect(fixture.wrapperResult.canFetchLocalhost).toBe(false);
      expect(fixture.wrapperResult.canPoll).toBe(false);
      expect(fixture.wrapperResult.canExecute).toBe(false);
      expect(fixture.wrapperResult.controlsEnabled).toBe(false);
      expect(fixture.wrapperResult.gateLocked).toBe(true);
    }

    expect(wrapperSource).toContain("adaptSelectedRecommendationToAvanzaHandoffSource");
    expect(wrapperSource).not.toContain(
      "buildAvanzaPreviewStateFromSelectedRecommendation",
    );
    expect(wrapperSource).toContain("buildAvanzaSelectedRecommendationPreviewState");
    expect(wrapperSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(wrapperSource).not.toMatch(/from ["'].*app\/dev\/avanza-visual-qa/);
    expect(wrapperSource).not.toMatch(/fetch\s*\(/);
    expect(wrapperSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(wrapperSource).not.toMatch(/setInterval|setTimeout/);
    expect(wrapperSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(wrapperSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(wrapperFixturesSource).toContain("adapter_normalized_static_fixture");
    expect(wrapperFixturesSource).not.toContain(
      "buildAvanzaPreviewStateFromSelectedRecommendation",
    );
    expect(wrapperFixturesSource).not.toContain(
      "buildAvanzaSelectedRecommendationPreviewState",
    );
    expect(wrapperFixturesSource).not.toMatch(/fetch\s*\(/);
    expect(wrapperFixturesSource).not.toMatch(/localhost:|127\.0\.0\.1/);

    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(routeSource).not.toContain("adaptSelectedRecommendationToAvanzaHandoffSource");
    expect(routeSource).not.toContain(
      "buildAvanzaPreviewStateFromSelectedRecommendation",
    );
    expect(routeSource).not.toContain("buildAvanzaSelectedRecommendationPreviewState");
    expect(routeSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper",
    );
    expect(tradeAppSource).not.toContain(
      "adapter_normalized_static_fixture",
    );
  });

  test("static-fixture derived-preview invocation pre-implementation checkpoint keeps wrapper unchanged", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md",
    );
    const plan = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md",
    );
    const adapterInvocationCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md",
    );
    const wrapperSource = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts",
    );
    const wrapperFixturesSource = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_static_fixture_derived_preview_invocation_pre_implementation_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "pre-implementation checkpoint has",
    );
    expect(checkpoint).toContain("now been followed");
    expect(checkpoint).toContain("pure wrapper code only");
    expect(checkpoint).toContain("static fixture input only");
    expect(checkpoint).toContain("explicit integration decision only");
    expect(checkpoint).toContain(
      "adapter normalization must remain static-fixture-only",
    );
    expect(checkpoint).toContain(
      "derived-preview builder is called only inside the pure wrapper with static",
    );
    expect(checkpoint).toContain("no route behavior wiring");
    expect(checkpoint).toContain("no Trade UI wiring");
    expect(checkpoint).toContain("no real selectedRecommendation state read");
    expect(checkpoint).toContain("no live Avanza");
    expect(checkpoint).toContain("`no_input`");
    expect(checkpoint).toContain("`blocked`");
    expect(checkpoint).toContain("`invalid_input`");
    expect(checkpoint).toContain("`adapter_rejected`");
    expect(checkpoint).toContain("`adapter_normalized_static_fixture`");
    expect(checkpoint).toContain("`derived_preview_failed`");
    expect(checkpoint).toContain("`read_only_preview_ready`");
    expect(checkpoint).toContain(
      "`previewState` only for `read_only_preview_ready`",
    );
    expect(checkpoint).toContain(
      "`canRenderReadOnlyPreview: true` only for `read_only_preview_ready`",
    );
    expect(checkpoint).toContain("`canCallBridge: false`");
    expect(checkpoint).toContain("`canFetchLocalhost: false`");
    expect(checkpoint).toContain("`canPoll: false`");
    expect(checkpoint).toContain("`canExecute: false`");
    expect(checkpoint).toContain("`controlsEnabled: false`");
    expect(checkpoint).toContain("`gateLocked: true`");
    expect(checkpoint).toContain("`app/trade-app.tsx` must remain unchanged");
    expect(checkpoint).toContain(
      "`app/dev/avanza-visual-qa/page.tsx` remains fixture/model-only",
    );
    expect(checkpoint).toContain("existing dev route remains fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain(
      "selectedRecommendation preview remains disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("no active handoff button");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain("no execution readiness claim");
    expect(checkpoint).toContain(
      "has been implemented inside the pure wrapper only",
    );

    expect(plan).toContain(
      "avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md",
    );
    expect(adapterInvocationCheckpoint).toContain(
      "avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md",
    );

    expect(wrapperSource).toContain("adaptSelectedRecommendationToAvanzaHandoffSource");
    expect(wrapperSource).not.toContain(
      "buildAvanzaPreviewStateFromSelectedRecommendation",
    );
    expect(wrapperSource).toContain("buildAvanzaSelectedRecommendationPreviewState");
    expect(wrapperSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(wrapperSource).not.toMatch(/from ["'].*app\/dev\/avanza-visual-qa/);
    expect(wrapperSource).not.toMatch(/fetch\s*\(/);
    expect(wrapperSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(wrapperSource).not.toMatch(/setInterval|setTimeout/);
    expect(wrapperSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(wrapperSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);

    expect(wrapperFixturesSource).toContain("adapter_normalized_static_fixture");
    expect(wrapperFixturesSource).toContain("derived_preview_failed");
    expect(wrapperFixturesSource).toContain("read_only_preview_ready");
    expect(wrapperFixturesSource).not.toContain(
      "buildAvanzaPreviewStateFromSelectedRecommendation",
    );
    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures) {
      if (fixture.wrapperResult.status === "read_only_preview_ready") {
        expect(fixture.wrapperResult.previewState).not.toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.wrapperResult.previewState).toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
      }
      expect(fixture.wrapperResult.canCallBridge).toBe(false);
      expect(fixture.wrapperResult.canFetchLocalhost).toBe(false);
      expect(fixture.wrapperResult.canPoll).toBe(false);
      expect(fixture.wrapperResult.canExecute).toBe(false);
      expect(fixture.wrapperResult.controlsEnabled).toBe(false);
      expect(fixture.wrapperResult.gateLocked).toBe(true);
    }

    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(routeSource).not.toContain(
      "buildAvanzaPreviewStateFromSelectedRecommendation",
    );
    expect(routeSource).not.toContain("buildAvanzaSelectedRecommendationPreviewState");
    expect(routeSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper",
    );
  });

  test("static-fixture derived-preview invocation checkpoint records completed pure wrapper phase", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md",
    );
    const preImplementationCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md",
    );
    const plan = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md",
    );
    const adapterInvocationCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md",
    );
    const wrapperPhaseCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md",
    );
    const wrapperCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md",
    );
    const wrapperPlan = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md",
    );
    const wrapperRouteCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md",
    );
    const semiAutoPlan = readRepoFile(
      "docs/semi-auto-avanza-fill-only-poc-ui-integration-plan.md",
    );
    const wrapperSource = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts",
    );
    const wrapperFixturesSource = readRepoFile(
      "lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_static_fixture_derived_preview_invocation_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "derived-preview invocation exists only inside the pure wrapper",
    );
    expect(checkpoint).toContain(
      "derived-preview invocation uses explicit static fixture input only",
    );
    expect(checkpoint).toContain(
      "adapter normalization remains static-fixture-only",
    );
    expect(checkpoint).toContain(
      "`previewState` is produced only for the `read_only_preview_ready` static",
    );
    expect(checkpoint).toContain("`previewState` is read-only");
    expect(checkpoint).toContain("expose active controls");
    expect(checkpoint).toContain("does not read app state");
    expect(checkpoint).toContain("route state");
    expect(checkpoint).toContain("Trade UI state");
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is read from app/route",
    );
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("No real app/route preview state is derived");
    expect(checkpoint).toContain("No real app/route preview state is rendered");
    expect(checkpoint).toContain("wrapper harness remains fixture/model-only");
    expect(checkpoint).toContain("route remains fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
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
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain(
      "Option A: stop here and keep derived-preview invocation static-fixture only",
    );
    expect(checkpoint).toContain(
      "Option C: add route-section hardening/checkpoint for static previewState",
    );
    expect(checkpoint).toContain(
      "Option D: plan real selectedRecommendation read-only derivation separately",
    );

    for (const doc of [
      preImplementationCheckpoint,
      plan,
      adapterInvocationCheckpoint,
      wrapperPhaseCheckpoint,
      wrapperCheckpoint,
      wrapperPlan,
      wrapperRouteCheckpoint,
      semiAutoPlan,
    ]) {
      expect(doc).toContain(
        "avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md",
      );
    }

    const previewReadyFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("read_only_preview_ready");
    const derivedFailureFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("derived_preview_failed");
    const adapterRejectedFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("adapter_rejected");
    const invalidFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("invalid_input");

    expect(previewReadyFixture.wrapperResult.status).toBe(
      "read_only_preview_ready",
    );
    expect(previewReadyFixture.wrapperResult.previewState).not.toBeNull();
    expect(previewReadyFixture.wrapperResult.canRenderReadOnlyPreview).toBe(
      true,
    );
    expect(
      previewReadyFixture.wrapperResult.previewState?.preActivationGate
        .gateStatus,
    ).toBe("locked");
    expect(previewReadyFixture.wrapperResult.previewState?.displayState).toBe(
      "preview_ready_locked",
    );
    expect(previewReadyFixture.wrapperResult.previewState?.sourceMode.activeMode).toBe(
      "selected_recommendation_preview_only",
    );

    expect(derivedFailureFixture.wrapperResult.status).toBe(
      "derived_preview_failed",
    );
    expect(derivedFailureFixture.wrapperResult.previewState).toBeNull();
    expect(derivedFailureFixture.wrapperResult.canRenderReadOnlyPreview).toBe(
      false,
    );

    expect(adapterRejectedFixture.wrapperResult.status).toBe("adapter_rejected");
    expect(adapterRejectedFixture.wrapperResult.previewState).toBeNull();
    expect(adapterRejectedFixture.wrapperResult.canRenderReadOnlyPreview).toBe(
      false,
    );

    expect(invalidFixture.wrapperResult.status).toBe("invalid_input");
    expect(invalidFixture.wrapperResult.previewState).toBeNull();
    expect(invalidFixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);

    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures) {
      if (fixture.wrapperResult.status === "read_only_preview_ready") {
        expect(fixture.wrapperResult.previewState).not.toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.wrapperResult.previewState).toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
      }

      expect(fixture.wrapperResult.canCallBridge).toBe(false);
      expect(fixture.wrapperResult.canFetchLocalhost).toBe(false);
      expect(fixture.wrapperResult.canPoll).toBe(false);
      expect(fixture.wrapperResult.canExecute).toBe(false);
      expect(fixture.wrapperResult.controlsEnabled).toBe(false);
      expect(fixture.wrapperResult.gateLocked).toBe(true);
    }

    expect(wrapperSource).toContain("selectedRecommendation");
    expect(wrapperSource).toContain("buildAvanzaSelectedRecommendationPreviewState");
    expect(wrapperSource).toContain("adaptSelectedRecommendationToAvanzaHandoffSource");
    expect(wrapperSource).not.toContain(
      "buildAvanzaPreviewStateFromSelectedRecommendation",
    );
    expect(wrapperSource).not.toMatch(/app\/trade-app|app\/dev\/avanza-visual-qa/);
    expect(wrapperSource).not.toMatch(/fetch\s*\(/);
    expect(wrapperSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(wrapperSource).not.toMatch(/setInterval|setTimeout/);
    expect(wrapperSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(wrapperSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(wrapperSource).not.toMatch(/method:\s*["']POST["']/);
    expect(wrapperSource).not.toMatch(/supabase|execution[_-]?record/i);

    expect(wrapperFixturesSource).toContain("read_only_preview_ready");
    expect(wrapperFixturesSource).toContain("derived_preview_failed");
    expect(wrapperFixturesSource).not.toMatch(/app\/trade-app|app\/dev\/avanza-visual-qa/);
    expect(wrapperFixturesSource).not.toMatch(/fetch\s*\(/);
    expect(wrapperFixturesSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(wrapperFixturesSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);

    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper",
    );
  });

  test("static previewState route visibility hardening checkpoint keeps route fixture-only", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md",
    );
    const derivedPreviewCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md",
    );
    const derivedPreviewPlan = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md",
    );
    const wrapperRouteCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md",
    );
    const wrapperPhaseCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md",
    );
    const semiAutoPlan = readRepoFile(
      "docs/semi-auto-avanza-fill-only-poc-ui-integration-plan.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_static_previewstate_route_visibility_hardening_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "previewState may be visible only through wrapper harness static fixture output",
    );
    expect(checkpoint).toContain(
      "previewState is produced only for `read_only_preview_ready` static fixture",
    );
    expect(checkpoint).toContain("route section remains fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain("wrapper harness is not rendered in Trade UI");
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is read from app/route",
    );
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("No real app/route preview state is derived");
    expect(checkpoint).toContain("No real app/route preview state is rendered");
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
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");

    for (const doc of [
      derivedPreviewCheckpoint,
      derivedPreviewPlan,
      wrapperRouteCheckpoint,
      wrapperPhaseCheckpoint,
      semiAutoPlan,
    ]) {
      expect(doc).toContain(
        "avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md",
      );
    }

    expect(routeSource).toContain("Adapter/derived-preview wrapper");
    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "Adapter and derived-preview invocation use static fixtures only",
    );
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No real app or route preview state is derived");
    expect(routeSource).toContain("No real preview state is rendered in Trade UI");
    expect(routeSource).toContain("No bridge calls");
    expect(routeSource).toContain("No localhost fetch");
    expect(routeSource).toContain("No polling");
    expect(routeSource).toContain("No execution");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(routeSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(routeSource).not.toMatch(/method:\s*["']POST["']/);
    expect(routeSource).not.toMatch(/supabase|execution[_-]?record/i);

    const readyFixture =
      readOnlyAdapterDerivedPreviewWrapperFixtureById("read_only_preview_ready");

    expect(readyFixture.wrapperResult.previewState).not.toBeNull();
    expect(readyFixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);

    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures) {
      if (fixture.id === "read_only_preview_ready") {
        expect(fixture.wrapperResult.previewState).not.toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.wrapperResult.previewState).toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
      }

      expect(fixture.wrapperResult.controlsEnabled).toBe(false);
      expect(fixture.wrapperResult.gateLocked).toBe(true);
      expect(fixture.wrapperResult.canCallBridge).toBe(false);
      expect(fixture.wrapperResult.canFetchLocalhost).toBe(false);
      expect(fixture.wrapperResult.canPoll).toBe(false);
      expect(fixture.wrapperResult.canExecute).toBe(false);
    }

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper",
    );
    expect(tradeAppSource).not.toContain("/dev/avanza-visual-qa");
  });

  test("static-fixture derived-preview phase completion checkpoint closes safe pause boundary", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md",
    );
    const routeVisibilityCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md",
    );
    const derivedPreviewCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md",
    );
    const derivedPreviewPlan = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md",
    );
    const wrapperRouteCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md",
    );
    const wrapperPhaseCheckpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md",
    );
    const semiAutoPlan = readRepoFile(
      "docs/semi-auto-avanza-fill-only-poc-ui-integration-plan.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_static_fixture_derived_preview_phase_completion_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "The static-fixture derived-preview phase is complete",
    );
    expect(checkpoint).toContain("safe to pause before");
    expect(checkpoint).toContain(
      "future planning for real selectedRecommendation read-only input",
    );
    expect(checkpoint).toContain(
      "derived-preview invocation exists only inside the pure wrapper",
    );
    expect(checkpoint).toContain(
      "derived-preview invocation uses explicit static fixture input only",
    );
    expect(checkpoint).toContain(
      "adapter normalization remains static-fixture only",
    );
    expect(checkpoint).toContain(
      "previewState is produced only for `read_only_preview_ready` static fixture",
    );
    expect(checkpoint).toContain("previewState is read-only");
    expect(checkpoint).toContain("Route-visible previewState is fixture-only");
    expect(checkpoint).toContain("no active controls are exposed");
    expect(checkpoint).toContain("no app state is read");
    expect(checkpoint).toContain("no route state is read");
    expect(checkpoint).toContain("no Trade UI state is read");
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is read from app/route",
    );
    expect(checkpoint).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("No real app/route preview state is derived");
    expect(checkpoint).toContain("No real app/route preview state is rendered");
    expect(checkpoint).toContain("wrapper harness remains fixture/model-only");
    expect(checkpoint).toContain("route remains fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
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
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain(
      "Option A: stop here and keep derived-preview invocation static-fixture only",
    );
    expect(checkpoint).toContain(
      "Option C: plan real selectedRecommendation read-only input separately",
    );
    expect(checkpoint).toContain(
      "Option D: postpone real selectedRecommendation input until broader architecture",
    );

    for (const doc of [
      routeVisibilityCheckpoint,
      derivedPreviewCheckpoint,
      derivedPreviewPlan,
      wrapperRouteCheckpoint,
      wrapperPhaseCheckpoint,
      semiAutoPlan,
    ]) {
      expect(doc).toContain(
        "avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md",
      );
    }

    expect(routeSource).toContain("Adapter/derived-preview wrapper");
    expect(routeSource).toContain("Wrapper fixture only");
    expect(routeSource).toContain(
      "previewState appears only for read_only_preview_ready fixture output",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "No real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("No real app or route preview state is derived");
    expect(routeSource).toContain("No real preview state is rendered in Trade UI");
    expect(routeSource).toContain("Controls disabled");
    expect(routeSource).toContain("Gate locked");
    expect(routeSource).not.toMatch(/from ["'].*trade-app["']/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/fetch\s*\(/);
    expect(routeSource).not.toMatch(/localhost:|127\.0\.0\.1/);
    expect(routeSource).not.toMatch(/setInterval|setTimeout/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);

    for (const fixture of avanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperFixtures) {
      if (fixture.id === "read_only_preview_ready") {
        expect(fixture.wrapperResult.previewState).not.toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(true);
      } else {
        expect(fixture.wrapperResult.previewState).toBeNull();
        expect(fixture.wrapperResult.canRenderReadOnlyPreview).toBe(false);
      }

      expect(fixture.wrapperResult.controlsEnabled).toBe(false);
      expect(fixture.wrapperResult.gateLocked).toBe(true);
      expect(fixture.wrapperResult.canCallBridge).toBe(false);
      expect(fixture.wrapperResult.canFetchLocalhost).toBe(false);
      expect(fixture.wrapperResult.canPoll).toBe(false);
      expect(fixture.wrapperResult.canExecute).toBe(false);
    }

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness",
    );
    expect(tradeAppSource).not.toContain(
      "buildAvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapper",
    );
    expect(tradeAppSource).not.toContain("/dev/avanza-visual-qa");
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

    expect(serialized).not.toMatch(/[^a-z-]execution-ready/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
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

  test("read-only selectedRecommendation derivation decision harness is rendered only by the fixture-only dev route, not Trade UI", () => {
    const tradeAppSource = readRepoFile("app/trade-app.tsx");
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness",
    );
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness",
    );
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no real preview state is derived");
    expect(routeSource).toContain("no real preview state");
    expect(routeSource).toContain("is rendered");
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
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
    expect(checkpoint).toContain("harness is fixture/model-only");
    expect(checkpoint).toContain("not rendered in `app/trade-app.tsx`");
    expect(checkpoint).toContain(
      "rendered in `app/dev/avanza-visual-qa/page.tsx` as a",
    );
    expect(checkpoint).toContain("fixture/model-only section");
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

  test("read-only selectedRecommendation derivation decision route section checkpoint records fixture-only route section", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-derivation-decision-route-section-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_derivation_decision_route_section_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "derivation decision harness is rendered on",
    );
    expect(checkpoint).toContain("`app/dev/avanza-visual-qa/page.tsx`");
    expect(checkpoint).toContain("route section is fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain(
      "derivation decision harness is not rendered in Trade UI",
    );
    expect(checkpoint).toContain("no real selectedRecommendation state is read");
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
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain(
      "Option A: stop here and keep the derivation decision harness as a",
    );
    expect(checkpoint).toContain("Option B: add visual polish");
    expect(checkpoint).toContain(
      "Option C: plan actual adapter/derived-preview integration separately",
    );

    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness",
    );
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no real preview state is derived");
    expect(routeSource).toContain("no real preview state is rendered");
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
    expect(routeSource).not.toMatch(/app\/trade-app|TradeApp/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness",
    );
  });

  test("read-only selectedRecommendation dev preview phase completion checkpoint records completed fixture-model phase", () => {
    const checkpoint = readRepoFile(
      "docs/avanza-read-only-selected-recommendation-dev-preview-phase-completion-checkpoint.md",
    );
    const routeSource = readRepoFile("app/dev/avanza-visual-qa/page.tsx");
    const tradeAppSource = readRepoFile("app/trade-app.tsx");

    expect(checkpoint.length).toBeGreaterThan(0);
    expect(checkpoint).toContain(
      "avanza_read_only_selected_recommendation_dev_preview_phase_completion_checkpoint_added",
    );
    expect(checkpoint).toContain(
      "read-only selectedRecommendation dev preview phase is complete as a",
    );
    expect(checkpoint).toContain("guard/decision/route-visible fixture-model phase");
    expect(checkpoint).toContain(
      "guard harness is rendered on `app/dev/avanza-visual-qa/page.tsx`",
    );
    expect(checkpoint).toContain(
      "derivation decision harness is rendered on `app/dev/avanza-visual-qa/page.tsx`",
    );
    expect(checkpoint).toContain("both sections are fixture/model-only");
    expect(checkpoint).toContain("route remains unlinked from main navigation");
    expect(checkpoint).toContain("`app/trade-app.tsx` was not changed");
    expect(checkpoint).toContain("no harness is rendered in Trade UI");
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is read from app/route",
    );
    expect(checkpoint).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(checkpoint).toContain("no real preview state is derived");
    expect(checkpoint).toContain("no real preview state is rendered");
    expect(checkpoint).toContain(
      "selectedRecommendation preview disabled by default in Trade UI",
    );
    expect(checkpoint).toContain("`explicitPreviewOnlyFlag` false by default");
    expect(checkpoint).toContain("controls disabled");
    expect(checkpoint).toContain("pre-activation gate locked");
    expect(checkpoint).toContain("total-read remains advisory");
    expect(checkpoint).toContain("no bridge calls");
    expect(checkpoint).toContain("no localhost fetch");
    expect(checkpoint).toContain("no polling");
    expect(checkpoint).toContain("no runner/fill invocation");
    expect(checkpoint).toContain("no trigger phrase");
    expect(checkpoint).toContain("no fill/click/review/final/submit/order");
    expect(checkpoint).toContain(
      "no credential/session/BankID/cookies/storage handling",
    );
    expect(checkpoint).toContain("no Supabase execution write");
    expect(checkpoint).toContain("no production readiness claim");
    expect(checkpoint).toContain(
      "Option A: stop here and keep read-only selectedRecommendation dev preview",
    );
    expect(checkpoint).toContain("Option B: visual polish only");
    expect(checkpoint).toContain(
      "Option C: plan actual adapter/derived-preview integration separately",
    );
    expect(checkpoint).toContain(
      "Option D: add a pure adapter/derived-preview integration model",
    );

    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness",
    );
    expect(routeSource).toContain(
      "AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness",
    );
    expect(routeSource).toContain("Fixture/model only");
    expect(routeSource).toContain("Decision fixture only");
    expect(routeSource).toContain(
      "No real selectedRecommendation state is read from app or route",
    );
    expect(routeSource).toContain(
      "no real selectedRecommendation state is rendered",
    );
    expect(routeSource).toContain("no real preview state is derived");
    expect(routeSource).toContain("no real preview state is rendered");
    expect(routeSource).toContain("no bridge calls");
    expect(routeSource).toContain("no localhost fetch");
    expect(routeSource).toContain("no polling");
    expect(routeSource).toContain("no execution");
    expect(routeSource).toContain("controls disabled");
    expect(routeSource).toContain("gate locked");
    expect(routeSource).not.toMatch(/app\/trade-app|TradeApp/);
    expect(routeSource).not.toContain("<button");
    expect(routeSource).not.toMatch(/onClick\s*=/);
    expect(routeSource).not.toMatch(/FINAL\s+LIVE\s+EXECUTE/);
    expect(routeSource).not.toMatch(/\/live-fill-only-runner\//);

    for (const sourceFile of navigationSourceFiles) {
      const source = readRepoFile(sourceFile);

      expect(source).not.toContain("/dev/avanza-visual-qa");
    }

    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness",
    );
    expect(tradeAppSource).not.toContain(
      "AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness",
    );
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

    expect(serialized).not.toMatch(/[^a-z-]execution-ready/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
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

    expect(serialized).not.toMatch(/[^a-z-]execution-ready/i);
    expect(serialized).not.toMatch(/ready for execution/i);
    expect(serialized).not.toMatch(/execution ready/i);
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
