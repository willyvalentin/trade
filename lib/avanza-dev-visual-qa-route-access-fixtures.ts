import {
  avanzaDevOnlyPreviewEnablementCandidateState,
  avanzaDevOnlyPreviewEnablementProductionForbiddenState,
} from "@/lib/avanza-dev-only-preview-enablement-state";
import {
  buildAvanzaDevVisiblePreviewSurfaceGuard,
} from "@/lib/avanza-dev-visible-preview-surface-guard";
import {
  avanzaDevVisualQaRouteAccessDefaultDecision,
  buildAvanzaDevVisualQaRouteAccess,
  type AvanzaDevVisualQaRouteAccessDecision,
} from "@/lib/avanza-dev-visual-qa-route-access";

export type AvanzaDevVisualQaRouteAccessFixtureId =
  | "hidden"
  | "blocked_production_forbidden"
  | "dev_route_allowed";

export type AvanzaDevVisualQaRouteAccessExpectedState =
  | "hidden"
  | "blocked"
  | "dev_route_allowed";

export type AvanzaDevVisualQaRouteAccessFixture = {
  accessDecision: AvanzaDevVisualQaRouteAccessDecision;
  expectedState: AvanzaDevVisualQaRouteAccessExpectedState;
  id: AvanzaDevVisualQaRouteAccessFixtureId;
  label: string;
};

export const avanzaDevVisualQaRouteAccessFixtures = [
  {
    accessDecision: avanzaDevVisualQaRouteAccessDefaultDecision,
    expectedState: "hidden",
    id: "hidden",
    label: "Default hidden route access",
  },
  {
    accessDecision: buildAvanzaDevVisualQaRouteAccess({
      visiblePreviewSurfaceGuard: buildAvanzaDevVisiblePreviewSurfaceGuard({
        enablementState: avanzaDevOnlyPreviewEnablementProductionForbiddenState,
      }),
    }),
    expectedState: "blocked",
    id: "blocked_production_forbidden",
    label: "Blocked production-forbidden route access",
  },
  {
    accessDecision: buildAvanzaDevVisualQaRouteAccess({
      visiblePreviewSurfaceGuard: buildAvanzaDevVisiblePreviewSurfaceGuard({
        enablementState: avanzaDevOnlyPreviewEnablementCandidateState,
      }),
    }),
    expectedState: "dev_route_allowed",
    id: "dev_route_allowed",
    label: "Dev-only route access for fixture gallery",
  },
] as const satisfies readonly AvanzaDevVisualQaRouteAccessFixture[];
