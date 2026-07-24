import {
  AvanzaSelectedRecommendationPreviewStateScenarioGallery,
  type AvanzaSelectedRecommendationPreviewStateScenarioGroup,
} from "@/components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGallery";
import type {
  AvanzaScenarioGalleryAccessDecision,
} from "@/lib/avanza-scenario-gallery-access";
import {
  avanzaSelectedRecommendationAdapterScenarios,
} from "@/lib/avanza-selected-recommendation-adapter-fixtures";
import {
  avanzaSelectedRecommendationPreviewStateScenarios,
} from "@/lib/avanza-selected-recommendation-preview-state-fixtures";

type AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarnessProps = {
  access: AvanzaScenarioGalleryAccessDecision;
  scenarioGroups?: readonly AvanzaSelectedRecommendationPreviewStateScenarioGroup[];
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness({
  access,
  scenarioGroups = [
    {
      id: "generic_preview_state_scenarios",
      label: "Generic preview-state scenarios",
      scenarios: avanzaSelectedRecommendationPreviewStateScenarios,
    },
    {
      id: "adapter_based_selected_recommendation_scenarios",
      label: "Adapter-based selectedRecommendation scenarios",
      scenarios: avanzaSelectedRecommendationAdapterScenarios,
    },
  ],
}: AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarnessProps) {
  const safetyCopy = [
    "Fixture-only",
    "No real selected recommendation state",
    "No bridge calls",
    "No localhost fetch",
    "No execution",
  ];

  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              Scenario gallery access
            </span>
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              {formatStatus(access.accessStatus)}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {access.label}
          </p>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-400">
            {access.reason}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {safetyCopy.map((copy) => (
          <span
            className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
            key={copy}
          >
            {copy}
          </span>
        ))}
      </div>

      {access.accessStatus === "dev_only_allowed" && access.canRenderGallery ? (
        <div className="mt-3">
          <AvanzaSelectedRecommendationPreviewStateScenarioGallery
            scenarioGroups={scenarioGroups}
          />
        </div>
      ) : (
        <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
          <p className="text-xs font-semibold text-amber-100">
            Scenario gallery is not rendered.
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Access is disabled or blocked. Static scenarios remain unavailable
            from this harness until an explicit dev-only access decision allows
            fixture rendering.
          </p>
        </div>
      )}
    </section>
  );
}
