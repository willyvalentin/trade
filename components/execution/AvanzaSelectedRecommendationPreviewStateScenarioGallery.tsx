import {
  AvanzaSelectedRecommendationPreviewStatePanel,
} from "@/components/execution/AvanzaSelectedRecommendationPreviewStatePanel";
import type {
  AvanzaSelectedRecommendationPreviewDisplayState,
  AvanzaSelectedRecommendationPreviewState,
} from "@/lib/avanza-selected-recommendation-preview-state";

export type AvanzaSelectedRecommendationPreviewStateGalleryScenario = {
  expectedDisplayState: AvanzaSelectedRecommendationPreviewDisplayState;
  id: string;
  label: string;
  previewState: AvanzaSelectedRecommendationPreviewState;
};

export type AvanzaSelectedRecommendationPreviewStateScenarioGroup = {
  id: string;
  label: string;
  scenarios: readonly AvanzaSelectedRecommendationPreviewStateGalleryScenario[];
};

type AvanzaSelectedRecommendationPreviewStateScenarioGalleryProps = {
  scenarioGroups?: readonly AvanzaSelectedRecommendationPreviewStateScenarioGroup[];
  scenarios?: readonly AvanzaSelectedRecommendationPreviewStateGalleryScenario[];
};

function formatState(value: string) {
  return value.replaceAll("_", " ");
}

export function AvanzaSelectedRecommendationPreviewStateScenarioGallery({
  scenarioGroups,
  scenarios,
}: AvanzaSelectedRecommendationPreviewStateScenarioGalleryProps) {
  const groups =
    scenarioGroups ??
    (scenarios
      ? [
          {
            id: "generic_preview_state_scenarios",
            label: "Generic preview-state scenarios",
            scenarios,
          },
        ]
      : []);

  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
            Fixture-only preview scenarios
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
            No execution
          </span>
        </div>
        <p className="text-sm font-semibold text-zinc-100">
          Avanza selected-recommendation preview state scenarios
        </p>
        <p className="max-w-3xl text-xs leading-5 text-zinc-400">
          Not connected to real selected recommendation state. No bridge calls,
          no active handoff controls, and no order placement.
        </p>
      </div>

      <div className="mt-3 grid gap-3">
        {groups.map((group) => (
          <div
            className="rounded-md border border-white/10 bg-white/[0.015] p-3"
            key={group.id}
          >
            <div className="mb-3">
              <p className="text-sm font-semibold text-zinc-100">
                {group.label}
              </p>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                Scenario group: {group.id}
              </p>
            </div>

            <div className="grid gap-3">
              {group.scenarios.map((scenario) => (
                <article
                  className="rounded-md border border-white/10 bg-white/[0.025] p-3"
                  key={`${group.id}:${scenario.id}`}
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {scenario.label}
                      </p>
                      <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                        Scenario: {scenario.id}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                      Expected: {formatState(scenario.expectedDisplayState)}
                    </span>
                  </div>
                  <AvanzaSelectedRecommendationPreviewStatePanel
                    previewState={scenario.previewState}
                  />
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
