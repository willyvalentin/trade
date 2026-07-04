import {
  buildAvanzaRealSelectedRecommendationReadOnlyDerivation,
  type AvanzaRealSelectedRecommendationReadOnlyDerivationResult,
  type AvanzaRealSelectedRecommendationReadOnlyDerivationStatus,
} from "./avanza-real-selected-recommendation-read-only-derivation";
import {
  buildAvanzaRealSelectedRecommendationReadOnlyInputGuard,
  type AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision,
} from "./avanza-real-selected-recommendation-read-only-input-guard";

export type AvanzaRealSelectedRecommendationReadOnlyDerivationFixtureId =
  | "no_input"
  | "guard_blocked"
  | "invalid_input"
  | "adapter_rejected"
  | "derived_preview_failed"
  | "read_only_preview_ready";

export type AvanzaRealSelectedRecommendationReadOnlyDerivationFixture = {
  derivationResult: AvanzaRealSelectedRecommendationReadOnlyDerivationResult;
  expectedStatus: AvanzaRealSelectedRecommendationReadOnlyDerivationStatus;
  guardDecision?: AvanzaRealSelectedRecommendationReadOnlyInputGuardDecision;
  id: AvanzaRealSelectedRecommendationReadOnlyDerivationFixtureId;
  label: string;
  selectedRecommendationLikeInput?: unknown;
};

const readOnlyAllowedGuardDecision =
  buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
    environment: "dev_read_only",
    explicitReadOnlyInput: true,
    sourceLabel: "real selectedRecommendation read-only derivation fixture",
  });

const productionBlockedGuardDecision =
  buildAvanzaRealSelectedRecommendationReadOnlyInputGuard({
    blockedReason:
      "Real selectedRecommendation read-only derivation is blocked for this fixture.",
    environment: "production_forbidden",
  });

const guardBlockedInput = {
  direction: "buy",
  entryPrice: 125.5,
  quantity: 10,
  ticker: "VOLV B",
};

const invalidInput = {
  companyName: "Missing ticker and direction",
  quantity: 10,
};

const adapterRejectedInput = {
  direction: "sell",
  entryPrice: 125.5,
  quantity: 10,
  ticker: "VOLV B",
};

const derivedPreviewFailedInput = {
  direction: "buy",
  ticker: "VOLV B",
};

const readOnlyPreviewReadyInput = {
  accountId: "fixture-unsafe-account",
  brokerSecret: "fixture-unsafe-secret",
  companyName: "Volvo",
  confidence: 0.72,
  cookie: "fixture-unsafe-cookie",
  credentials: "fixture-unsafe-credentials",
  direction: "buy",
  entryPrice: 125.5,
  id: "real-read-only-fixture-1",
  quantity: 10,
  session: "fixture-unsafe-session",
  storage: "fixture-unsafe-storage",
  ticker: "VOLV B",
};

export const avanzaRealSelectedRecommendationReadOnlyDerivationFixtures: AvanzaRealSelectedRecommendationReadOnlyDerivationFixture[] =
  [
    {
      derivationResult: buildAvanzaRealSelectedRecommendationReadOnlyDerivation(),
      expectedStatus: "no_input",
      id: "no_input",
      label: "No explicit real selectedRecommendation read-only derivation input",
    },
    {
      derivationResult: buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision: productionBlockedGuardDecision,
        selectedRecommendationLikeInput: guardBlockedInput,
      }),
      expectedStatus: "guard_blocked",
      guardDecision: productionBlockedGuardDecision,
      id: "guard_blocked",
      label: "Guard-blocked real selectedRecommendation read-only derivation",
      selectedRecommendationLikeInput: guardBlockedInput,
    },
    {
      derivationResult: buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision: readOnlyAllowedGuardDecision,
        selectedRecommendationLikeInput: invalidInput,
      }),
      expectedStatus: "invalid_input",
      guardDecision: readOnlyAllowedGuardDecision,
      id: "invalid_input",
      label: "Invalid real selectedRecommendation read-only derivation input",
      selectedRecommendationLikeInput: invalidInput,
    },
    {
      derivationResult: buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision: readOnlyAllowedGuardDecision,
        selectedRecommendationLikeInput: adapterRejectedInput,
      }),
      expectedStatus: "adapter_rejected",
      guardDecision: readOnlyAllowedGuardDecision,
      id: "adapter_rejected",
      label: "Adapter-rejected real selectedRecommendation read-only derivation",
      selectedRecommendationLikeInput: adapterRejectedInput,
    },
    {
      derivationResult: buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision: readOnlyAllowedGuardDecision,
        selectedRecommendationLikeInput: derivedPreviewFailedInput,
      }),
      expectedStatus: "derived_preview_failed",
      guardDecision: readOnlyAllowedGuardDecision,
      id: "derived_preview_failed",
      label:
        "Derived-preview-failed real selectedRecommendation read-only derivation",
      selectedRecommendationLikeInput: derivedPreviewFailedInput,
    },
    {
      derivationResult: buildAvanzaRealSelectedRecommendationReadOnlyDerivation({
        guardDecision: readOnlyAllowedGuardDecision,
        selectedRecommendationLikeInput: readOnlyPreviewReadyInput,
        sourceLabel: "read_only_selected_recommendation_dev_preview_fixture",
      }),
      expectedStatus: "read_only_preview_ready",
      guardDecision: readOnlyAllowedGuardDecision,
      id: "read_only_preview_ready",
      label: "Read-only preview ready real selectedRecommendation derivation",
      selectedRecommendationLikeInput: readOnlyPreviewReadyInput,
    },
  ];
