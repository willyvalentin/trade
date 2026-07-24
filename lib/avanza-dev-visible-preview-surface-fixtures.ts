import {
  avanzaDevOnlyPreviewEnablementCandidateState,
  avanzaDevOnlyPreviewEnablementProductionForbiddenState,
} from "@/lib/avanza-dev-only-preview-enablement-state";
import {
  avanzaDevVisiblePreviewSurfaceDefaultGuard,
  buildAvanzaDevVisiblePreviewSurfaceGuard,
  type AvanzaDevVisiblePreviewSurfaceGuardDecision,
} from "@/lib/avanza-dev-visible-preview-surface-guard";
import type {
  AvanzaSelectedRecommendationPreviewState,
} from "@/lib/avanza-selected-recommendation-preview-state";
import {
  avanzaSelectedRecommendationPreviewStateScenarios,
} from "@/lib/avanza-selected-recommendation-preview-state-fixtures";

export type AvanzaDevVisiblePreviewSurfaceFixtureId =
  | "hidden"
  | "blocked"
  | "visible_dev_only_allowed";

export type AvanzaDevVisiblePreviewSurfaceExpectedRenderState =
  | "hidden_explanation"
  | "blocked_explanation"
  | "passive_preview";

export type AvanzaDevVisiblePreviewSurfaceFixture = {
  expectedRenderState: AvanzaDevVisiblePreviewSurfaceExpectedRenderState;
  guard: AvanzaDevVisiblePreviewSurfaceGuardDecision;
  id: AvanzaDevVisiblePreviewSurfaceFixtureId;
  label: string;
  previewState: AvanzaSelectedRecommendationPreviewState | null;
};

const validBuyPreviewState =
  avanzaSelectedRecommendationPreviewStateScenarios.find(
    (scenario) => scenario.id === "valid_buy",
  )?.previewState;

if (!validBuyPreviewState) {
  throw new Error("Missing valid buy selectedRecommendation preview fixture");
}

export const avanzaDevVisiblePreviewSurfaceFixtures = [
  {
    expectedRenderState: "hidden_explanation",
    guard: avanzaDevVisiblePreviewSurfaceDefaultGuard,
    id: "hidden",
    label: "Default hidden visible-preview surface",
    previewState: null,
  },
  {
    expectedRenderState: "blocked_explanation",
    guard: buildAvanzaDevVisiblePreviewSurfaceGuard({
      enablementState: avanzaDevOnlyPreviewEnablementProductionForbiddenState,
    }),
    id: "blocked",
    label: "Blocked visible-preview surface",
    previewState: null,
  },
  {
    expectedRenderState: "passive_preview",
    guard: buildAvanzaDevVisiblePreviewSurfaceGuard({
      enablementState: avanzaDevOnlyPreviewEnablementCandidateState,
    }),
    id: "visible_dev_only_allowed",
    label: "Visible dev-only passive selectedRecommendation preview",
    previewState: validBuyPreviewState,
  },
] as const satisfies readonly AvanzaDevVisiblePreviewSurfaceFixture[];
