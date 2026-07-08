import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertSettlementArtifactRedacted,
  assertSettlementExtractionSafe,
  buildPlanVsActualExecutionReview,
  containsForbiddenSettlementSensitiveData,
  getSettlementExtractionViolations,
  mockBuySettlementExtractionFixture,
  mockMismatchSettlementExtractionFixture,
  mockPartialFillSettlementExtractionFixture,
  mockPlanVsActualDeviationThresholds,
  mockSellSettlementExtractionFixture,
  mockSettlementExtractionFixtures,
  type MockBuySettlementAuthority,
  type MockSellSettlementAuthority,
  type MockSettlementExtractionResult,
  type MockSettlementNoteArtifact,
  type MockSettlementSafety,
  type MockSellSettlementSafety,
} from "../fixtures/execution-settlement-mock-fixtures";

const repoRoot = process.cwd();
const fixturePath = "tests/fixtures/execution-settlement-mock-fixtures.ts";
const specPath = "tests/e2e/execution-settlement-mock-fixtures.spec.ts";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function unsafeClone(
  extraction: MockSettlementExtractionResult,
  patch: Partial<MockSettlementExtractionResult>,
) {
  return {
    ...extraction,
    ...patch,
  } as unknown as MockSettlementExtractionResult;
}

test.describe("settlement mock fixture and extraction model tests", () => {
  test("mock BUY settlement fixture contains safe required extraction fields", () => {
    expect(mockBuySettlementExtractionFixture.side).toBe("BUY");
    expect(mockBuySettlementExtractionFixture.artifact).toMatchObject({
      side: "BUY",
      ticker: "TURBUY",
      quantity: 12,
      executionPrice: 101.4,
      currency: "SEK",
      grossAmount: 1216.8,
      commission: 9,
      totalSettlementAmount: 1225.8,
      sourceLabel: "mock_settlement_note",
      redactionStatus: "redacted",
    });
    expect(mockBuySettlementExtractionFixture.evidence).toMatchObject({
      sourceLabel: "mock_broker_confirmation",
      brokerLabel: "mock_broker_only",
      redactionStatus: "redacted",
    });
    expect(getSettlementExtractionViolations(mockBuySettlementExtractionFixture)).toEqual([]);
    expect(() =>
      assertSettlementExtractionSafe(mockBuySettlementExtractionFixture),
    ).not.toThrow();
  });

  test("mock SELL settlement fixture contains safe position, plan, and PnL fields", () => {
    expect(mockSellSettlementExtractionFixture.side).toBe("SELL");
    expect(mockSellSettlementExtractionFixture.positionReference).toMatchObject({
      ticker: "TURSELL",
      quantity: 8,
      entryReference: 184.5,
    });
    expect(mockSellSettlementExtractionFixture.exitReason).toBe("target_review");
    expect(mockSellSettlementExtractionFixture.realizedPnl).toBe(148.6);
    expect(mockSellSettlementExtractionFixture.roundTripFees).toBe(18);
    expect(getSettlementExtractionViolations(mockSellSettlementExtractionFixture)).toEqual([]);
    expect(() =>
      assertSettlementExtractionSafe(mockSellSettlementExtractionFixture),
    ).not.toThrow();
  });

  test("fixtures keep authority and persistence locked", () => {
    for (const fixture of mockSettlementExtractionFixtures) {
      expect(fixture.authority).toMatchObject({
        brokerAuthority: false,
        accountBinding: false,
        liveOrderIntent: false,
        orderSubmissionAuthority: false,
        supabaseExecutionWriteAuthority: false,
        productionPersistenceAllowed: false,
        humanFinalRequired: true,
      });
      expect(fixture.safety).toMatchObject({
        redactedEvidenceOnly: true,
        noCredentials: true,
        noBankID: true,
        noCookieSession: true,
        noBrowserStorage: true,
        noNetworkDump: true,
        noSupabaseWrite: true,
        noOrderSubmission: true,
        noFinalClick: true,
      });
    }

    expect(mockBuySettlementExtractionFixture.authority).toMatchObject({
      finalBuyAuthority: false,
    });
    expect(mockSellSettlementExtractionFixture.authority).toMatchObject({
      finalSellAuthority: false,
      livePositionMutationAuthority: false,
    });
    expect(mockSellSettlementExtractionFixture.safety).toMatchObject({
      noLivePositionMutation: true,
    });
  });

  test("planned BUY and SELL packages make human-final and no-submit context explicit", () => {
    expect(mockBuySettlementExtractionFixture.plan).toMatchObject({
      side: "BUY",
      ticker: "TURBUY",
      plannedQuantity: 12,
      plannedPrice: 101.25,
      stop: 96.1,
      target: 113.4,
      plannedRisk: 61.8,
      plannedReward: 145.8,
      currency: "SEK",
      planId: "mock_buy_plan_001",
      contractId: "mock_buy_contract_001",
      humanFinalRequired: true,
      noSubmitNoFinalClickContext: true,
    });
    expect(mockSellSettlementExtractionFixture.plan).toMatchObject({
      side: "SELL",
      ticker: "TURSELL",
      plannedQuantity: 8,
      plannedPrice: 205,
      plannedExitReason: "target",
      referenceEntry: 184.5,
      stop: 176.25,
      target: 205,
      currency: "SEK",
      positionReferenceId: "mock_sell_position_001",
      planId: "mock_sell_plan_001",
      contractId: "mock_sell_contract_001",
      humanFinalRequired: true,
      noSubmitNoFinalClickContext: true,
      noLivePositionMutationContext: true,
    });
  });

  test("plan-vs-actual review classifies BUY and SELL settlement outcomes", () => {
    const buyReview = buildPlanVsActualExecutionReview(mockBuySettlementExtractionFixture);
    const sellReview = buildPlanVsActualExecutionReview(mockSellSettlementExtractionFixture);

    expect(buyReview).toMatchObject({
      sideMatches: true,
      tickerMatches: true,
      quantityMatches: true,
      partialFill: false,
      plannedPrice: 101.25,
      executionPrice: 101.4,
      slippageAmount: 0.15,
      slippagePercent: 0.1481,
      feeImpact: 9,
      commissionImpactPercent: 0.7396,
      expectedGrossAmount: 1216.8,
      grossAmountReconciles: true,
      expectedSettlementAmount: 1225.8,
      settlementAmountDelta: 0,
      settlementAmountReconciles: true,
      fxImpact: 0,
      fxMismatch: false,
      realizedPnlReconciles: true,
      deviationClassification: "execution_match",
    });
    expect(sellReview).toMatchObject({
      sideMatches: true,
      tickerMatches: true,
      quantityMatches: true,
      partialFill: false,
      plannedPrice: 205,
      executionPrice: 204.2,
      slippageAmount: 0.8,
      slippagePercent: 0.3902,
      feeImpact: 9,
      commissionImpactPercent: 0.5509,
      expectedGrossAmount: 1633.6,
      grossAmountReconciles: true,
      expectedSettlementAmount: 1624.6,
      settlementAmountDelta: 0,
      settlementAmountReconciles: true,
      expectedRealizedPnl: 148.6,
      realizedPnl: 148.6,
      realizedPnlReconciles: true,
      noLivePositionMutation: true,
      deviationClassification: "minor_execution_deviation",
    });
  });

  test("plan-vs-actual review documents mock-only deviation thresholds", () => {
    expect(mockPlanVsActualDeviationThresholds).toMatchObject({
      exactSlippagePercent: 0.25,
      minorSlippagePercent: 2,
      majorFeeImpactPercent: 5,
      majorSettlementDeltaAmount: 1,
      majorGrossDeltaAmount: 1,
      majorFxImpactAmount: 25,
      fxMismatchTolerance: 0.01,
    });
  });

  test("BUY review maps extraction financial mismatches into explicit review fields", () => {
    const minorFxImpact = unsafeClone(mockBuySettlementExtractionFixture, {
      artifact: {
        ...mockBuySettlementExtractionFixture.artifact,
        totalSettlementAmount: 1227.8,
        costs: {
          ...mockBuySettlementExtractionFixture.artifact.costs,
          fxRate: 1.1,
          fxImpact: 2,
          totalSettlementAmount: 1227.8,
        },
      },
    });
    const majorSettlementMismatch = unsafeClone(mockBuySettlementExtractionFixture, {
      artifact: {
        ...mockBuySettlementExtractionFixture.artifact,
        totalSettlementAmount: 1250,
        costs: {
          ...mockBuySettlementExtractionFixture.artifact.costs,
          totalSettlementAmount: 1250,
        },
      },
    });
    const majorGrossMismatch = unsafeClone(mockBuySettlementExtractionFixture, {
      artifact: {
        ...mockBuySettlementExtractionFixture.artifact,
        grossAmount: 1220,
        totalSettlementAmount: 1229,
        costs: {
          ...mockBuySettlementExtractionFixture.artifact.costs,
          grossAmount: 1220,
          totalSettlementAmount: 1229,
        },
      },
    });
    const highFeeImpact = unsafeClone(mockBuySettlementExtractionFixture, {
      artifact: {
        ...mockBuySettlementExtractionFixture.artifact,
        commission: 80,
        totalSettlementAmount: 1296.8,
        costs: {
          ...mockBuySettlementExtractionFixture.artifact.costs,
          commission: 80,
          totalSettlementAmount: 1296.8,
        },
      },
    });

    expect(buildPlanVsActualExecutionReview(minorFxImpact)).toMatchObject({
      fxRate: 1.1,
      fxImpact: 2,
      fxMismatch: false,
      settlementAmountReconciles: true,
      deviationClassification: "execution_match",
    });
    expect(buildPlanVsActualExecutionReview(majorSettlementMismatch)).toMatchObject({
      settlementAmountReconciles: false,
      settlementAmountDelta: 24.2,
      deviationClassification: "major_execution_deviation",
    });
    expect(buildPlanVsActualExecutionReview(majorSettlementMismatch).blockedReasons).toContain(
      "settlement amount does not reconcile",
    );
    expect(buildPlanVsActualExecutionReview(majorGrossMismatch)).toMatchObject({
      grossAmountReconciles: false,
      deviationClassification: "major_execution_deviation",
    });
    expect(buildPlanVsActualExecutionReview(majorGrossMismatch).blockedReasons).toContain(
      "gross amount does not reconcile",
    );
    expect(buildPlanVsActualExecutionReview(highFeeImpact)).toMatchObject({
      commissionImpactPercent: 6.5746,
      deviationClassification: "major_execution_deviation",
      requiresManualReview: true,
    });
  });

  test("SELL review maps extraction financial mismatches and PnL reconciliation", () => {
    const wrongPnl = unsafeClone(mockSellSettlementExtractionFixture, {
      realizedPnl: 200,
    });
    const fxMismatch = unsafeClone(mockSellSettlementExtractionFixture, {
      artifact: {
        ...mockSellSettlementExtractionFixture.artifact,
        totalSettlementAmount: 1594.6,
        costs: {
          ...mockSellSettlementExtractionFixture.artifact.costs,
          fxRate: 0.91,
          fxImpact: -30,
          totalSettlementAmount: 1594.6,
        },
      },
    });

    expect(buildPlanVsActualExecutionReview(wrongPnl)).toMatchObject({
      expectedRealizedPnl: 148.6,
      realizedPnl: 200,
      realizedPnlReconciles: false,
      deviationClassification: "major_execution_deviation",
    });
    expect(buildPlanVsActualExecutionReview(wrongPnl).blockedReasons).toContain(
      "SELL realized PnL does not reconcile",
    );
    expect(buildPlanVsActualExecutionReview(fxMismatch)).toMatchObject({
      fxRate: 0.91,
      fxImpact: -30,
      fxMismatch: false,
      settlementAmountReconciles: true,
      deviationClassification: "major_execution_deviation",
    });
  });

  test("partial fill and mismatched evidence require review or block clean outcome", () => {
    const partialReview = buildPlanVsActualExecutionReview(
      mockPartialFillSettlementExtractionFixture,
    );
    const mismatchReview = buildPlanVsActualExecutionReview(
      mockMismatchSettlementExtractionFixture,
    );

    expect(partialReview.partialFill).toBe(true);
    expect(partialReview.quantityMatches).toBe(false);
    expect(partialReview.deviationClassification).toBe("requires_manual_review");
    expect(partialReview.requiresManualReview).toBe(true);

    expect(mismatchReview.tickerMatches).toBe(false);
    expect(mismatchReview.deviationClassification).toBe(
      "blocked_sensitive_or_mismatched_evidence",
    );
    expect(mismatchReview.blockedReasons).toContain("ticker mismatch");
  });

  test("redaction validator blocks sensitive settlement evidence fields", () => {
    expect(containsForbiddenSettlementSensitiveData(mockBuySettlementExtractionFixture)).toBe(
      false,
    );
    expect(() =>
      assertSettlementArtifactRedacted(mockBuySettlementExtractionFixture.artifact),
    ).not.toThrow();

    const sensitiveFields: MockSettlementNoteArtifact["forbiddenSensitiveData"][] = [
      { credentials: "blocked" },
      { passwordLikeField: "blocked" },
      { bankIdData: "blocked" },
      { mfaCode: "blocked" },
      { cookieToken: "blocked" },
      { sessionToken: "blocked" },
      { rawBrowserStorage: "blocked" },
      { networkDump: "blocked" },
      { avanzaCustomerId: "blocked" },
      { accountNumber: "blocked" },
      { accountId: "blocked" },
      { customerId: "blocked" },
      { personnummer: "blocked" },
      { personalIdentityData: "blocked" },
      { fullNameAccountLinkage: "blocked" },
      { accountBalance: "blocked" },
      { unrelatedHoldings: "blocked" },
      { envSecret: "blocked" },
      { supabaseServiceKey: "blocked" },
      { apiToken: "blocked" },
      { unredactedRawArtifact: "blocked" },
      { rawPdfWithSensitiveData: "blocked" },
      { screenshotWithSensitiveAccountData: "blocked" },
    ];

    for (const forbiddenSensitiveData of sensitiveFields) {
      const unsafeArtifact = {
        ...mockBuySettlementExtractionFixture.artifact,
        forbiddenSensitiveData,
      };

      expect(containsForbiddenSettlementSensitiveData(unsafeArtifact)).toBe(true);
      expect(() => assertSettlementArtifactRedacted(unsafeArtifact)).toThrow(
        /Unsafe settlement artifact/u,
      );
    }
  });

  test("redaction validator blocks sensitive evidence and extraction-level leakage markers", () => {
    const evidenceSensitive = unsafeClone(mockBuySettlementExtractionFixture, {
      evidence: {
        ...mockBuySettlementExtractionFixture.evidence,
        forbiddenSensitiveData: {
          sessionToken: "blocked",
          screenshotWithSensitiveAccountData: "blocked",
        },
      },
    });
    const artifactSensitive = unsafeClone(mockBuySettlementExtractionFixture, {
      artifact: {
        ...mockBuySettlementExtractionFixture.artifact,
        forbiddenSensitiveData: {
          rawPdfWithSensitiveData: "blocked",
          accountBalance: "blocked",
        },
      },
    });

    for (const extraction of [evidenceSensitive, artifactSensitive]) {
      expect(containsForbiddenSettlementSensitiveData(extraction)).toBe(true);
      expect(getSettlementExtractionViolations(extraction)).toContain(
        "forbidden sensitive data must be absent",
      );
      expect(buildPlanVsActualExecutionReview(extraction)).toMatchObject({
        deviationClassification: "blocked_sensitive_or_mismatched_evidence",
      });
    }
  });

  test("negative extraction cases reject sensitive data, authority escalation, and unsafe flags", () => {
    const unsafeCases: Array<{
      label: string;
      extraction: MockSettlementExtractionResult;
      expected: string;
    }> = [
      {
        label: "Supabase write authority",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          authority: {
            ...mockBuySettlementExtractionFixture.authority,
            supabaseExecutionWriteAuthority: true,
          } as unknown as MockBuySettlementAuthority,
        }),
        expected: "supabaseExecutionWriteAuthority must be false",
      },
      {
        label: "production persistence",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          authority: {
            ...mockBuySettlementExtractionFixture.authority,
            productionPersistenceAllowed: true,
          } as unknown as MockBuySettlementAuthority,
        }),
        expected: "productionPersistenceAllowed must be false",
      },
      {
        label: "broker authority",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          authority: {
            ...mockBuySettlementExtractionFixture.authority,
            brokerAuthority: true,
          } as unknown as MockBuySettlementAuthority,
        }),
        expected: "brokerAuthority must be false",
      },
      {
        label: "account binding",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          authority: {
            ...mockBuySettlementExtractionFixture.authority,
            accountBinding: true,
          } as unknown as MockBuySettlementAuthority,
        }),
        expected: "accountBinding must be false",
      },
      {
        label: "live order intent",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          authority: {
            ...mockBuySettlementExtractionFixture.authority,
            liveOrderIntent: true,
          } as unknown as MockBuySettlementAuthority,
        }),
        expected: "liveOrderIntent must be false",
      },
      {
        label: "order submission authority",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          authority: {
            ...mockBuySettlementExtractionFixture.authority,
            orderSubmissionAuthority: true,
          } as unknown as MockBuySettlementAuthority,
        }),
        expected: "orderSubmissionAuthority must be false",
      },
      {
        label: "final BUY authority",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          authority: {
            ...mockBuySettlementExtractionFixture.authority,
            finalBuyAuthority: true,
          } as unknown as MockBuySettlementAuthority,
        }),
        expected: "finalBuyAuthority must be false",
      },
      {
        label: "automatic result update",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          forbiddenPersistenceCoupling: {
            automaticResultUpdateAuthority: true,
          },
        }),
        expected: "automaticResultUpdateAuthority must be absent or false",
      },
      {
        label: "automatic statistics update",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          forbiddenPersistenceCoupling: {
            automaticStatisticsUpdateAuthority: true,
          },
        }),
        expected: "automaticStatisticsUpdateAuthority must be absent or false",
      },
      {
        label: "automatic learning update",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          forbiddenPersistenceCoupling: {
            automaticLearningUpdateAuthority: true,
          },
        }),
        expected: "automaticLearningUpdateAuthority must be absent or false",
      },
      {
        label: "redacted evidence disabled",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          safety: {
            ...mockBuySettlementExtractionFixture.safety,
            redactedEvidenceOnly: false,
          } as unknown as MockSettlementSafety,
        }),
        expected: "redactedEvidenceOnly must be true",
      },
      {
        label: "credential safety disabled",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          safety: {
            ...mockBuySettlementExtractionFixture.safety,
            noCredentials: false,
          } as unknown as MockSettlementSafety,
        }),
        expected: "noCredentials must be true",
      },
      {
        label: "BankID safety disabled",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          safety: {
            ...mockBuySettlementExtractionFixture.safety,
            noBankID: false,
          } as unknown as MockSettlementSafety,
        }),
        expected: "noBankID must be true",
      },
      {
        label: "cookie/session safety disabled",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          safety: {
            ...mockBuySettlementExtractionFixture.safety,
            noCookieSession: false,
          } as unknown as MockSettlementSafety,
        }),
        expected: "noCookieSession must be true",
      },
      {
        label: "raw browser storage safety disabled",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          safety: {
            ...mockBuySettlementExtractionFixture.safety,
            noBrowserStorage: false,
          } as unknown as MockSettlementSafety,
        }),
        expected: "noBrowserStorage must be true",
      },
      {
        label: "network dump safety disabled",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          safety: {
            ...mockBuySettlementExtractionFixture.safety,
            noNetworkDump: false,
          } as unknown as MockSettlementSafety,
        }),
        expected: "noNetworkDump must be true",
      },
      {
        label: "sensitive artifact data",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: {
            ...mockBuySettlementExtractionFixture.artifact,
            forbiddenSensitiveData: { accountId: "blocked" },
          },
        }),
        expected: "forbidden sensitive data must be absent",
      },
    ];

    for (const { extraction, expected, label } of unsafeCases) {
      const violations = getSettlementExtractionViolations(extraction);

      expect(violations, label).toContain(expected);
      expect(() => assertSettlementExtractionSafe(extraction), label).toThrow(
        /Unsafe settlement extraction/u,
      );
    }
  });

  test("negative extraction cases reject missing fields, impossible math, duplicates, and SELL mutation", () => {
    const unsafeCases: Array<{
      label: string;
      extraction: MockSettlementExtractionResult;
      expectedReviewReason?: string;
      expectedViolation?: string;
    }> = [
      {
        label: "wrong side",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: { ...mockBuySettlementExtractionFixture.artifact, side: "SELL" },
        }),
        expectedViolation: "artifact/evidence side must match extraction side",
      },
      {
        label: "plan side mismatch",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          plan: { ...mockBuySettlementExtractionFixture.plan, side: "SELL" },
        }),
        expectedViolation: "plan side must match extraction side",
      },
      {
        label: "missing ticker",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: { ...mockBuySettlementExtractionFixture.artifact, ticker: "" },
        }),
        expectedViolation: "ticker/instrument must exist",
      },
      {
        label: "currency missing",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: { ...mockBuySettlementExtractionFixture.artifact, currency: "" },
        }),
        expectedViolation: "currency must exist",
      },
      {
        label: "execution timestamp missing",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: {
            ...mockBuySettlementExtractionFixture.artifact,
            executionTimestamp: "",
          },
        }),
        expectedViolation: "execution timestamp must exist",
      },
      {
        label: "planned entry missing",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          plan: { ...mockBuySettlementExtractionFixture.plan, plannedPrice: 0 },
        }),
        expectedViolation: "planned price must be positive",
      },
      {
        label: "planned quantity missing",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          plan: { ...mockBuySettlementExtractionFixture.plan, plannedQuantity: 0 },
        }),
        expectedViolation: "planned quantity must be positive",
      },
      {
        label: "plan reference missing",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          plan: { ...mockBuySettlementExtractionFixture.plan, planId: "" },
        }),
        expectedViolation: "plan reference must exist",
      },
      {
        label: "quantity mismatch without partial fill",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: { ...mockBuySettlementExtractionFixture.artifact, quantity: 11 },
        }),
        expectedReviewReason: "quantity mismatch without partial fill",
      },
      {
        label: "artifact/evidence quantity mismatch",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          evidence: { ...mockBuySettlementExtractionFixture.evidence, quantity: 11 },
        }),
        expectedViolation: "artifact/evidence quantity must match",
      },
      {
        label: "missing execution price",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: { ...mockBuySettlementExtractionFixture.artifact, executionPrice: 0 },
        }),
        expectedViolation: "execution price must be positive",
      },
      {
        label: "actual entry absent in evidence",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          evidence: { ...mockBuySettlementExtractionFixture.evidence, executionPrice: 0 },
        }),
        expectedViolation: "execution price must be positive",
      },
      {
        label: "artifact/evidence execution price mismatch",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          evidence: { ...mockBuySettlementExtractionFixture.evidence, executionPrice: 101 },
        }),
        expectedViolation: "artifact/evidence execution price must match",
      },
      {
        label: "missing commission",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: { ...mockBuySettlementExtractionFixture.artifact, commission: -1 },
        }),
        expectedViolation: "commission/courtage must exist",
      },
      {
        label: "negative commission",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: { ...mockBuySettlementExtractionFixture.artifact, commission: -0.01 },
        }),
        expectedViolation: "commission/courtage must exist",
      },
      {
        label: "missing settlement amount",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: {
            ...mockBuySettlementExtractionFixture.artifact,
            totalSettlementAmount: 0,
          },
        }),
        expectedViolation: "total settlement amount must exist",
      },
      {
        label: "gross amount inconsistent with price times quantity",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: { ...mockBuySettlementExtractionFixture.artifact, grossAmount: 1200 },
        }),
        expectedViolation: "gross amount must equal execution price times quantity",
        expectedReviewReason: "gross amount does not reconcile",
      },
      {
        label: "cost gross amount mismatch",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: {
            ...mockBuySettlementExtractionFixture.artifact,
            costs: {
              ...mockBuySettlementExtractionFixture.artifact.costs,
              grossAmount: 1200,
            },
          },
        }),
        expectedViolation: "cost gross amount must match artifact gross amount",
      },
      {
        label: "cost commission mismatch",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: {
            ...mockBuySettlementExtractionFixture.artifact,
            costs: {
              ...mockBuySettlementExtractionFixture.artifact.costs,
              commission: 1,
            },
          },
        }),
        expectedViolation: "cost commission must match artifact commission",
      },
      {
        label: "cost total mismatch",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: {
            ...mockBuySettlementExtractionFixture.artifact,
            costs: {
              ...mockBuySettlementExtractionFixture.artifact.costs,
              totalSettlementAmount: 1200,
            },
          },
        }),
        expectedViolation: "cost total settlement amount must match artifact total",
      },
      {
        label: "currency mismatch",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          evidence: { ...mockBuySettlementExtractionFixture.evidence, currency: "USD" },
        }),
        expectedViolation: "currency must be consistent across evidence, artifact, and costs",
      },
      {
        label: "impossible settlement math",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: {
            ...mockBuySettlementExtractionFixture.artifact,
            totalSettlementAmount: 9999,
          },
        }),
        expectedReviewReason: "settlement amount does not reconcile",
      },
      {
        label: "duplicate confirmation",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: {
            ...mockBuySettlementExtractionFixture.artifact,
            duplicateConfirmation: true,
          },
        }),
        expectedReviewReason: "sensitive or duplicate evidence blocked",
      },
      {
        label: "missing settlement artifact",
        extraction: unsafeClone(mockBuySettlementExtractionFixture, {
          artifact: { ...mockBuySettlementExtractionFixture.artifact, artifactId: "" },
        }),
        expectedReviewReason: "settlement artifact missing",
      },
      {
        label: "partial fill treated as full fill",
        extraction: unsafeClone(mockPartialFillSettlementExtractionFixture, {
          artifact: {
            ...mockPartialFillSettlementExtractionFixture.artifact,
            treatedAsFullFill: true,
          },
        }),
        expectedViolation: "partial fill cannot be treated as full fill",
        expectedReviewReason: "partial fill requires manual review",
      },
      {
        label: "partial fill missing marker",
        extraction: unsafeClone(mockPartialFillSettlementExtractionFixture, {
          artifact: {
            ...mockPartialFillSettlementExtractionFixture.artifact,
            partialFill: false,
          },
        }),
        expectedReviewReason: "quantity mismatch without partial fill",
      },
      {
        label: "partial fill missing executed quantity",
        extraction: unsafeClone(mockPartialFillSettlementExtractionFixture, {
          artifact: {
            ...mockPartialFillSettlementExtractionFixture.artifact,
            quantity: 0,
          },
        }),
        expectedViolation: "quantity must be positive",
      },
      {
        label: "partial fill missing remaining quantity and manual review marker",
        extraction: unsafeClone(mockPartialFillSettlementExtractionFixture, {
          remainingQuantity: undefined,
          partialFillManualReviewRequired: false,
        }),
        expectedViolation: "partial fill remaining quantity or manual review marker must exist",
      },
      {
        label: "partial fill with wrong ticker",
        extraction: unsafeClone(mockPartialFillSettlementExtractionFixture, {
          artifact: {
            ...mockPartialFillSettlementExtractionFixture.artifact,
            ticker: "WRONG",
          },
        }),
        expectedReviewReason: "ticker mismatch",
      },
      {
        label: "SELL missing position reference",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          positionReference: undefined,
        }),
        expectedViolation: "SELL position reference must exist",
      },
      {
        label: "SELL position ticker mismatch",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          positionReference: {
            ...mockSellSettlementExtractionFixture.positionReference!,
            ticker: "WRONG",
          },
        }),
        expectedViolation: "SELL position ticker must match plan ticker",
      },
      {
        label: "SELL position instrument mismatch",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          positionReference: {
            ...mockSellSettlementExtractionFixture.positionReference!,
            instrument: "Wrong Instrument",
          },
        }),
        expectedViolation: "SELL position instrument must match plan instrument",
      },
      {
        label: "SELL position entry missing",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          positionReference: {
            ...mockSellSettlementExtractionFixture.positionReference!,
            entryReference: 0,
          },
        }),
        expectedViolation: "SELL position entry reference must be positive",
      },
      {
        label: "SELL quantity greater than position quantity",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          artifact: {
            ...mockSellSettlementExtractionFixture.artifact,
            quantity: 9,
            grossAmount: 1837.8,
            totalSettlementAmount: 1828.8,
            costs: {
              ...mockSellSettlementExtractionFixture.artifact.costs,
              grossAmount: 1837.8,
              totalSettlementAmount: 1828.8,
            },
          },
          evidence: {
            ...mockSellSettlementExtractionFixture.evidence,
            quantity: 9,
          },
        }),
        expectedViolation: "SELL quantity must not exceed position quantity",
      },
      {
        label: "SELL missing exit reason",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          exitReason: undefined,
        }),
        expectedViolation: "SELL exit reason must exist",
      },
      {
        label: "SELL planned exit missing",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          plan: { ...mockSellSettlementExtractionFixture.plan, plannedPrice: 0 },
        }),
        expectedViolation: "planned price must be positive",
      },
      {
        label: "SELL planned stop/target missing",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          plan: { ...mockSellSettlementExtractionFixture.plan, stop: 0 },
        }),
        expectedViolation: "SELL planned target/stop must exist",
      },
      {
        label: "SELL realized PnL missing",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          realizedPnl: undefined,
        }),
        expectedViolation: "SELL realized PnL must be mock-calculable",
      },
      {
        label: "SELL final authority",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          authority: {
            ...mockSellSettlementExtractionFixture.authority,
            finalSellAuthority: true,
          } as unknown as MockSellSettlementAuthority,
        }),
        expectedViolation: "finalSellAuthority must be false",
      },
      {
        label: "SELL order submission authority",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          authority: {
            ...mockSellSettlementExtractionFixture.authority,
            orderSubmissionAuthority: true,
          } as unknown as MockSellSettlementAuthority,
        }),
        expectedViolation: "orderSubmissionAuthority must be false",
      },
      {
        label: "SELL live position mutation authority",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          authority: {
            ...mockSellSettlementExtractionFixture.authority,
            livePositionMutationAuthority: true,
          } as unknown as MockSellSettlementAuthority,
        }),
        expectedViolation: "livePositionMutationAuthority must be false",
      },
      {
        label: "SELL live position mutation safety disabled",
        extraction: unsafeClone(mockSellSettlementExtractionFixture, {
          safety: {
            ...mockSellSettlementExtractionFixture.safety,
            noLivePositionMutation: false,
          } as unknown as MockSellSettlementSafety,
        }),
        expectedViolation: "noLivePositionMutation must be true",
      },
    ];

    for (const { expectedReviewReason, expectedViolation, extraction, label } of unsafeCases) {
      const violations = getSettlementExtractionViolations(extraction);
      const review = buildPlanVsActualExecutionReview(extraction);

      if (expectedViolation) {
        expect(violations, label).toContain(expectedViolation);
      }
      if (expectedReviewReason) {
        expect(review.blockedReasons, label).toContain(expectedReviewReason);
      }
      expect(review.deviationClassification, label).not.toBe("execution_match");
    }
  });

  test("deviation classification covers match, minor, major, manual-review, and blocked states", () => {
    const majorPriceMove = unsafeClone(mockBuySettlementExtractionFixture, {
      artifact: {
        ...mockBuySettlementExtractionFixture.artifact,
        executionPrice: 106,
        grossAmount: 1272,
        totalSettlementAmount: 1281,
        costs: {
          ...mockBuySettlementExtractionFixture.artifact.costs,
          grossAmount: 1272,
          totalSettlementAmount: 1281,
        },
      },
      evidence: {
        ...mockBuySettlementExtractionFixture.evidence,
        executionPrice: 106,
      },
    });
    const sensitiveEvidence = unsafeClone(mockBuySettlementExtractionFixture, {
      artifact: {
        ...mockBuySettlementExtractionFixture.artifact,
        forbiddenSensitiveData: { apiToken: "blocked" },
      },
    });

    expect(buildPlanVsActualExecutionReview(mockBuySettlementExtractionFixture)).toMatchObject({
      deviationClassification: "execution_match",
      requiresManualReview: false,
    });
    expect(buildPlanVsActualExecutionReview(mockSellSettlementExtractionFixture)).toMatchObject({
      deviationClassification: "minor_execution_deviation",
      requiresManualReview: false,
    });
    expect(buildPlanVsActualExecutionReview(majorPriceMove)).toMatchObject({
      deviationClassification: "major_execution_deviation",
      requiresManualReview: true,
    });
    expect(
      buildPlanVsActualExecutionReview(mockPartialFillSettlementExtractionFixture),
    ).toMatchObject({
      deviationClassification: "requires_manual_review",
      requiresManualReview: true,
    });
    expect(buildPlanVsActualExecutionReview(sensitiveEvidence)).toMatchObject({
      deviationClassification: "blocked_sensitive_or_mismatched_evidence",
      requiresManualReview: true,
    });
  });

  test("settlement fixture and spec sources stay isolated from runtime and restricted modules", () => {
    const fixtureSource = readSource(fixturePath);
    const specSource = readSource(specPath);
    const forbiddenImportFragments = [
      "scripts/",
      "avanza-login-smoke-test",
      "avanza-order-chain-smoke-test",
      "avanza-localhost-bridge-server",
      "avanza-dry-run-runner-skeleton",
      "mock-order-page-agent-runner",
      "safe-browser-action",
      "@/lib/supabase",
      "createClient(",
      "supabaseServer",
      "process.env",
      "fetch(",
      "localStorage",
      "sessionStorage",
      "app/trade-app",
      "app/dev/avanza-visual-qa/page",
      "app/api/",
      "child_process",
    ];

    for (const [label, source] of [
      [fixturePath, fixtureSource],
      [specPath, specSource],
    ] as const) {
      const importLines = source
        .split("\n")
        .filter((line) => line.trim().startsWith("import "));
      const violations = forbiddenImportFragments.filter((fragment) =>
        importLines.some((line) => line.includes(fragment)),
      );

      expect(violations, `${label}\n${violations.join("\n")}`).toEqual([]);
    }
  });
});
