import {
  buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard,
  type AvanzaReadOnlySelectedRecommendationDevPreviewGuardDecision,
  type AvanzaReadOnlySelectedRecommendationDevPreviewGuardStatus,
} from "./avanza-read-only-selected-recommendation-dev-preview-guard";

export type AvanzaReadOnlySelectedRecommendationDevPreviewFixtureId =
  | "hidden_default"
  | "blocked_production_forbidden"
  | "read_only_dev_preview_allowed";

export type AvanzaReadOnlySelectedRecommendationDevPreviewFixture = {
  expectedState: AvanzaReadOnlySelectedRecommendationDevPreviewGuardStatus;
  guardDecision: AvanzaReadOnlySelectedRecommendationDevPreviewGuardDecision;
  id: AvanzaReadOnlySelectedRecommendationDevPreviewFixtureId;
  label: string;
};

export const avanzaReadOnlySelectedRecommendationDevPreviewFixtures: AvanzaReadOnlySelectedRecommendationDevPreviewFixture[] =
  [
    {
      expectedState: "hidden",
      guardDecision: buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard(),
      id: "hidden_default",
      label: "Default hidden read-only selectedRecommendation dev preview",
    },
    {
      expectedState: "blocked",
      guardDecision: buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        blockedReason:
          "Read-only selectedRecommendation dev preview is blocked for production-forbidden scope.",
        environment: "production_forbidden",
      }),
      id: "blocked_production_forbidden",
      label: "Blocked production-forbidden read-only selectedRecommendation dev preview",
    },
    {
      expectedState: "read_only_dev_preview_allowed",
      guardDecision: buildAvanzaReadOnlySelectedRecommendationDevPreviewGuard({
        environment: "dev_only",
        explicitReadOnlyDevPreview: true,
      }),
      id: "read_only_dev_preview_allowed",
      label: "Allowed read-only selectedRecommendation dev preview model state",
    },
  ];

