import {
  avanzaHandoffPackageBuilderFixtures,
} from "./avanza-handoff-package-builder-fixtures";
import {
  buildAvanzaFillOnlyAdapterResponse,
  type AvanzaFillOnlyAdapterMode,
  type AvanzaFillOnlyAdapterResponse,
  type AvanzaFillOnlyAdapterStatus,
  type BuildAvanzaFillOnlyAdapterContractInput,
} from "./avanza-fill-only-adapter-contract";

export type AvanzaFillOnlyAdapterContractFixtureId =
  | "adapter_disabled"
  | "package_unavailable"
  | "package_invalid"
  | "dry_run_ready_buy"
  | "dry_run_ready_sell"
  | "fill_only_ready_buy"
  | "fill_only_ready_sell"
  | "fill_only_blocked_unsafe_package"
  | "package_invalid_side"
  | "package_invalid_quantity"
  | "package_invalid_missing_ticker"
  | "package_invalid_missing_price"
  | "fill_started_display_only"
  | "fill_completed_waiting_manual_review_display_only"
  | "fill_failed_display_only"
  | "cancelled_display_only"
  | "unknown_display_only";

export type AvanzaFillOnlyAdapterContractFixture = {
  adapterInput?: BuildAvanzaFillOnlyAdapterContractInput;
  expectedStatus: AvanzaFillOnlyAdapterStatus;
  expectedSurface: "blocked_or_empty" | "ready_request" | "display_only";
  id: AvanzaFillOnlyAdapterContractFixtureId;
  label: string;
  mode: AvanzaFillOnlyAdapterMode;
  response: AvanzaFillOnlyAdapterResponse;
};

const fixtureNow = "2026-07-04T12:30:00.000Z";

const readyBuyPackage = avanzaHandoffPackageBuilderFixtures.find(
  (fixture) => fixture.id === "handoff_ready_read_only_buy",
)?.result.package;
const readySellPackage = avanzaHandoffPackageBuilderFixtures.find(
  (fixture) => fixture.id === "handoff_ready_read_only_sell",
)?.result.package;
const fillOnlyPackage = avanzaHandoffPackageBuilderFixtures.find(
  (fixture) => fixture.id === "handoff_ready_fill_only",
)?.result.package;
const blockedPackageResult = avanzaHandoffPackageBuilderFixtures.find(
  (fixture) => fixture.id === "risk_blocked_missing_price",
)?.result;

const baseSafety = {
  canClickConfirm: false,
  canClickReview: false,
  canFillForm: false,
  canHandleCredentials: false,
  canReadBankId: false,
  canReadCookies: false,
  canSubmitOrder: false,
  canWriteSupabaseExecution: false,
  controlsEnabled: false,
  finalHumanClickRequired: true,
  gateLocked: true,
  userMustConfirm: true,
} as const;

function buildFixture(
  id: AvanzaFillOnlyAdapterContractFixtureId,
  label: string,
  mode: AvanzaFillOnlyAdapterMode,
  adapterInput: BuildAvanzaFillOnlyAdapterContractInput,
  expectedSurface: AvanzaFillOnlyAdapterContractFixture["expectedSurface"],
): AvanzaFillOnlyAdapterContractFixture {
  const response = buildAvanzaFillOnlyAdapterResponse(adapterInput);

  return {
    adapterInput,
    expectedStatus: response.status,
    expectedSurface,
    id,
    label,
    mode,
    response,
  };
}

function buildDisplayOnlyFixture(
  id: AvanzaFillOnlyAdapterContractFixtureId,
  label: string,
  status: AvanzaFillOnlyAdapterStatus,
  reason: string,
): AvanzaFillOnlyAdapterContractFixture {
  const response: AvanzaFillOnlyAdapterResponse = {
    ...baseSafety,
    blockedReasons: [],
    label,
    reason,
    safetyFlags: baseSafety,
    status,
    warnings: ["display-only fixture state"],
  };

  return {
    expectedStatus: status,
    expectedSurface: "display_only",
    id,
    label,
    mode: "fill_only",
    response,
  };
}

export const avanzaFillOnlyAdapterContractFixtures: AvanzaFillOnlyAdapterContractFixture[] =
  [
    buildFixture(
      "adapter_disabled",
      "Adapter disabled",
      "disabled",
      {
        adapterEnabled: false,
        broker: "avanza",
        mode: "disabled",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "package_unavailable",
      "Package unavailable",
      "dry_run",
      {
        adapterEnabled: true,
        broker: "avanza",
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "package_invalid",
      "Package invalid",
      "dry_run",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: "not a handoff package",
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "dry_run_ready_buy",
      "Safe BUY dry_run",
      "dry_run",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: readyBuyPackage,
        mode: "dry_run",
        now: fixtureNow,
        requestId: "fixture-dry-run-buy",
      },
      "ready_request",
    ),
    buildFixture(
      "dry_run_ready_sell",
      "Safe SELL dry_run",
      "dry_run",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: readySellPackage,
        mode: "dry_run",
        now: fixtureNow,
        requestId: "fixture-dry-run-sell",
      },
      "ready_request",
    ),
    buildFixture(
      "fill_only_ready_buy",
      "Safe BUY fill_only",
      "fill_only",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: fillOnlyPackage,
        mode: "fill_only",
        now: fixtureNow,
        requestId: "fixture-fill-only-buy",
      },
      "ready_request",
    ),
    buildFixture(
      "fill_only_ready_sell",
      "Safe SELL fill_only",
      "fill_only",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: readySellPackage,
        mode: "fill_only",
        now: fixtureNow,
        requestId: "fixture-fill-only-sell",
      },
      "ready_request",
    ),
    buildFixture(
      "fill_only_blocked_unsafe_package",
      "Blocked unsafe package",
      "fill_only",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: blockedPackageResult,
        mode: "fill_only",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "package_invalid_side",
      "Invalid side",
      "dry_run",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: {
          limitPrice: 240.5,
          orderType: "LIMIT",
          packageId: "fixture-invalid-side",
          quantity: 12,
          side: "HOLD",
          symbol: "GME",
          ticker: "GME",
        },
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "package_invalid_quantity",
      "Invalid quantity",
      "dry_run",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: {
          limitPrice: 240.5,
          orderType: "LIMIT",
          packageId: "fixture-invalid-quantity",
          quantity: 0,
          side: "BUY",
          symbol: "GME",
          ticker: "GME",
        },
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "package_invalid_missing_ticker",
      "Missing ticker",
      "dry_run",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: {
          limitPrice: 240.5,
          orderType: "LIMIT",
          packageId: "fixture-missing-ticker",
          quantity: 12,
          side: "BUY",
          symbol: "GME",
        },
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "package_invalid_missing_price",
      "Missing or unsafe price",
      "dry_run",
      {
        adapterEnabled: true,
        broker: "avanza",
        handoffPackage: {
          orderType: "LIMIT",
          packageId: "fixture-missing-price",
          quantity: 12,
          side: "BUY",
          symbol: "GME",
          ticker: "GME",
        },
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildDisplayOnlyFixture(
      "fill_started_display_only",
      "Fill started display-only",
      "fill_started",
      "Display-only lifecycle state. No browser, bridge, review, confirm, submit, or order behavior is available.",
    ),
    buildDisplayOnlyFixture(
      "fill_completed_waiting_manual_review_display_only",
      "Fill completed waiting manual review display-only",
      "fill_completed_waiting_manual_review",
      "Display-only lifecycle state. The user must still manually review and confirm outside this model.",
    ),
    buildDisplayOnlyFixture(
      "fill_failed_display_only",
      "Fill failed display-only",
      "fill_failed",
      "Display-only lifecycle state for a failed future adapter attempt. No retry or execution behavior is available.",
    ),
    buildDisplayOnlyFixture(
      "cancelled_display_only",
      "Cancelled display-only",
      "cancelled",
      "Display-only lifecycle state for a cancelled future adapter attempt.",
    ),
    buildDisplayOnlyFixture(
      "unknown_display_only",
      "Unknown display-only",
      "unknown",
      "Display-only lifecycle state for an unknown future adapter result.",
    ),
  ];
