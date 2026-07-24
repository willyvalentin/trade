import {
  buildAvanzaTestOnlyEnabledPreviewFixtureModel,
  type AvanzaTestOnlyEnabledPreviewFixtureModel,
  type AvanzaTestOnlyEnabledPreviewFixtureStatus,
  type BuildAvanzaTestOnlyEnabledPreviewFixtureModelInput,
} from "./avanza-test-only-enabled-preview-fixture-model";

export type AvanzaTestOnlyEnabledPreviewFixtureModelFixtureId =
  | "test_only_disabled"
  | "test_only_fixture_ready"
  | "test_only_preview_ready_read_only"
  | "test_only_blocked";

export type AvanzaTestOnlyEnabledPreviewFixtureModelFixture = {
  expectedStatus: AvanzaTestOnlyEnabledPreviewFixtureStatus;
  fixtureCandidate?: unknown;
  id: AvanzaTestOnlyEnabledPreviewFixtureModelFixtureId;
  label: string;
  modelResult: AvanzaTestOnlyEnabledPreviewFixtureModel;
  testOnlyInput: BuildAvanzaTestOnlyEnabledPreviewFixtureModelInput;
};

function buildFixture(
  id: AvanzaTestOnlyEnabledPreviewFixtureModelFixtureId,
  label: string,
  expectedStatus: AvanzaTestOnlyEnabledPreviewFixtureStatus,
  testOnlyInput: BuildAvanzaTestOnlyEnabledPreviewFixtureModelInput,
): AvanzaTestOnlyEnabledPreviewFixtureModelFixture {
  return {
    expectedStatus,
    ...(testOnlyInput.fixtureCandidate !== undefined
      ? { fixtureCandidate: testOnlyInput.fixtureCandidate }
      : {}),
    id,
    label,
    modelResult: buildAvanzaTestOnlyEnabledPreviewFixtureModel(testOnlyInput),
    testOnlyInput,
  };
}

export const avanzaTestOnlyEnabledPreviewFixtureModelFixtures: AvanzaTestOnlyEnabledPreviewFixtureModelFixture[] =
  [
    buildFixture(
      "test_only_disabled",
      "Test-only enabled preview fixture disabled",
      "test_only_disabled",
      {
        fixtureCandidate: {
          action: "buy",
          entry: 240.5,
          quantity: 12,
          symbol: "VOLV B",
        },
        fixtureName: "test_only_disabled_fixture",
        sourceKind: "static_fixture",
        testOnlyEnabled: false,
      },
    ),
    buildFixture(
      "test_only_fixture_ready",
      "Test-only fixture source ready but preview blocked",
      "test_only_fixture_ready",
      {
        fixtureCandidate: {
          action: "buy",
          symbol: "ONLY TICKER",
        },
        fixtureName: "test_only_fixture_ready_static_fixture",
        sourceKind: "static_fixture",
        testOnlyEnabled: true,
      },
    ),
    buildFixture(
      "test_only_preview_ready_read_only",
      "Test-only fixture read-only preview ready",
      "test_only_preview_ready_read_only",
      {
        fixtureCandidate: {
          action: "buy",
          entry: 240.5,
          id: "test-only-fixture-rec-1",
          quantity: 12,
          stopLoss: 230,
          symbol: "VOLV B",
          target: 260,
        },
        fixtureName: "test_only_preview_ready_static_fixture",
        sourceKind: "static_fixture",
        testOnlyEnabled: true,
      },
    ),
    buildFixture(
      "test_only_blocked",
      "Test-only fixture blocked",
      "test_only_blocked",
      {
        fixtureCandidate: {
          company: "Missing ticker fixture",
          direction: "buy",
        },
        fixtureName: "test_only_blocked_static_fixture",
        sourceKind: "static_fixture",
        testOnlyEnabled: true,
      },
    ),
  ];
