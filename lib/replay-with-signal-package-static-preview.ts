import type { ReplayWithSignalPackageResult } from "@/lib/replay-with-signal-package-result-model";
import {
  buildLongFixtureSimulationInput,
  buildShortFixtureSimulationInput,
  type ReplayStaticFixtureKind,
} from "@/lib/replay-with-signal-package-static-fixtures";
import {
  assertReplayWithSignalPackageInspectionReportSafety,
  buildReplayWithSignalPackageStaticInspectionReport,
  renderReplayWithSignalPackageInspectionReportMarkdown,
} from "@/lib/replay-with-signal-package-static-inspection-report";
import { simulateReplayWithSignalPackage } from "@/lib/replay-with-signal-package-static-simulation";

export type ReplayWithSignalPackageStaticPreviewScenario = {
  scenario_id: string;
  direction: "long" | "short";
  fixture_kind: ReplayStaticFixtureKind;
};

export type ReplayWithSignalPackageStaticPreviewJson = {
  preview_status: "safe_static_preview_available" | "blocked";
  generated_from_static_inputs: true;
  production_runtime_touched: false;
  provider_call_executed: false;
  supabase_write_executed: false;
  synthetic_outcomes_persisted: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  recommendation_rows_mutated: false;
  scenario_count: number;
  scenarios: ReplayWithSignalPackageStaticPreviewScenario[];
  results: ReplayWithSignalPackageResult[];
  report: ReturnType<typeof buildReplayWithSignalPackageStaticInspectionReport>;
  safety: ReturnType<typeof assertReplayWithSignalPackageInspectionReportSafety>;
};

const fixtureKinds: ReplayStaticFixtureKind[] = [
  "no_entry",
  "target_hit",
  "stop_hit",
  "open_at_window_end",
  "ambiguous_same_candle",
];

export const replayWithSignalPackageStaticPreviewScenarios: ReplayWithSignalPackageStaticPreviewScenario[] =
  [
    ...fixtureKinds.map((fixture_kind) => ({
      scenario_id: `long_${fixture_kind}`,
      direction: "long" as const,
      fixture_kind,
    })),
    ...fixtureKinds.map((fixture_kind) => ({
      scenario_id: `short_${fixture_kind}`,
      direction: "short" as const,
      fixture_kind,
    })),
  ];

export function buildReplayWithSignalPackageStaticPreviewResults(): ReplayWithSignalPackageResult[] {
  return replayWithSignalPackageStaticPreviewScenarios.map((scenario) => {
    const input =
      scenario.direction === "long"
        ? buildLongFixtureSimulationInput(scenario.fixture_kind)
        : buildShortFixtureSimulationInput(scenario.fixture_kind);

    return simulateReplayWithSignalPackage(input);
  });
}

export function buildReplayWithSignalPackageStaticPreviewReport() {
  return buildReplayWithSignalPackageStaticInspectionReport(
    buildReplayWithSignalPackageStaticPreviewResults(),
  );
}

export function renderReplayWithSignalPackageStaticPreviewMarkdown() {
  const report = buildReplayWithSignalPackageStaticPreviewReport();
  const scenarioLines = replayWithSignalPackageStaticPreviewScenarios.map((scenario) => {
    return `- ${scenario.scenario_id}: ${scenario.direction} ${scenario.fixture_kind}`;
  });

  return [
    "# Replay With Signal Package Static Preview",
    "",
    "Scenarios:",
    ...scenarioLines,
    "",
    renderReplayWithSignalPackageInspectionReportMarkdown(report).trimEnd(),
    "",
  ].join("\n");
}

export function buildReplayWithSignalPackageStaticPreviewJson(): ReplayWithSignalPackageStaticPreviewJson {
  const results = buildReplayWithSignalPackageStaticPreviewResults();
  const report = buildReplayWithSignalPackageStaticInspectionReport(results);
  const safety = assertReplayWithSignalPackageInspectionReportSafety(report);

  return {
    preview_status: safety.ok ? "safe_static_preview_available" : "blocked",
    generated_from_static_inputs: true,
    production_runtime_touched: false,
    provider_call_executed: false,
    supabase_write_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendation_rows_mutated: false,
    scenario_count: replayWithSignalPackageStaticPreviewScenarios.length,
    scenarios: replayWithSignalPackageStaticPreviewScenarios,
    results,
    report,
    safety,
  };
}
