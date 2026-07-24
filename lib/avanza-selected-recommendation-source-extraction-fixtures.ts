import {
  buildAvanzaSelectedRecommendationSourceExtraction,
  type AvanzaSelectedRecommendationSourceExtractionResult,
  type AvanzaSelectedRecommendationSourceExtractionStatus,
  type AvanzaSelectedRecommendationSourceKind,
  type BuildAvanzaSelectedRecommendationSourceExtractionInput,
} from "./avanza-selected-recommendation-source-extraction";

export type AvanzaSelectedRecommendationSourceExtractionFixtureId =
  | "no_source"
  | "source_unavailable"
  | "source_blocked"
  | "source_invalid"
  | "source_ready_read_only";

export type AvanzaSelectedRecommendationSourceExtractionFixture = {
  candidateInput?: unknown;
  expectedStatus: AvanzaSelectedRecommendationSourceExtractionStatus;
  extractionInput: BuildAvanzaSelectedRecommendationSourceExtractionInput;
  extractionResult: AvanzaSelectedRecommendationSourceExtractionResult;
  id: AvanzaSelectedRecommendationSourceExtractionFixtureId;
  label: string;
  sourceKind?: AvanzaSelectedRecommendationSourceKind;
  sourceName?: string;
};

const noSourceInput: BuildAvanzaSelectedRecommendationSourceExtractionInput = {
  sourceKind: "trade_ui_state",
  sourceName: "selectedRecommendation",
};

const unavailableInput: BuildAvanzaSelectedRecommendationSourceExtractionInput =
  {
    candidate: null,
    sourceKind: "trade_ui_state",
    sourceName: "selectedRecommendation",
  };

const blockedInput: BuildAvanzaSelectedRecommendationSourceExtractionInput = {
  blocked: true,
  blockedReason:
    "Explicit source extraction is blocked for fixture-only read-only preview.",
  candidate: {
    ticker: "SHOULD_NOT_READ",
  },
  sourceKind: "trade_ui_state",
  sourceName: "selectedRecommendation",
};

const invalidInput: BuildAvanzaSelectedRecommendationSourceExtractionInput = {
  candidate: {
    company: "Missing safe ticker",
    direction: "buy",
  },
  sourceKind: "trade_ui_state",
  sourceName: "selectedRecommendation",
};

const readyReadOnlyInput: BuildAvanzaSelectedRecommendationSourceExtractionInput =
  {
    candidate: {
      accountId: "redacted-account",
      action: "buy",
      brokerSecret: "redacted-broker-secret",
      confidence: 0.74,
      cookie: "redacted-cookie",
      entry: 240.5,
      id: "fixture-rec-1",
      quantity: 12,
      sessionToken: "redacted-session",
      stopLoss: 230,
      storageKey: "redacted-storage",
      symbol: "VOLV B",
      target: 260,
    },
    sourceKind: "trade_ui_state",
    sourceName: "selectedRecommendation",
  };

function buildFixture(
  id: AvanzaSelectedRecommendationSourceExtractionFixtureId,
  label: string,
  expectedStatus: AvanzaSelectedRecommendationSourceExtractionStatus,
  extractionInput: BuildAvanzaSelectedRecommendationSourceExtractionInput,
): AvanzaSelectedRecommendationSourceExtractionFixture {
  return {
    candidateInput: extractionInput.candidate,
    expectedStatus,
    extractionInput,
    extractionResult:
      buildAvanzaSelectedRecommendationSourceExtraction(extractionInput),
    id,
    label,
    sourceKind: extractionInput.sourceKind ?? undefined,
    sourceName: extractionInput.sourceName ?? undefined,
  };
}

export const avanzaSelectedRecommendationSourceExtractionFixtures: AvanzaSelectedRecommendationSourceExtractionFixture[] =
  [
    buildFixture(
      "no_source",
      "No explicit selectedRecommendation source",
      "no_source",
      noSourceInput,
    ),
    buildFixture(
      "source_unavailable",
      "Unavailable selectedRecommendation source",
      "source_unavailable",
      unavailableInput,
    ),
    buildFixture(
      "source_blocked",
      "Blocked selectedRecommendation source",
      "source_blocked",
      blockedInput,
    ),
    buildFixture(
      "source_invalid",
      "Invalid selectedRecommendation source",
      "source_invalid",
      invalidInput,
    ),
    buildFixture(
      "source_ready_read_only",
      "Ready read-only selectedRecommendation source",
      "source_ready_read_only",
      readyReadOnlyInput,
    ),
  ];
