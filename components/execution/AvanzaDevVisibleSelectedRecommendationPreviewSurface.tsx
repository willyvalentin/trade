import {
  AvanzaSelectedRecommendationPreviewStatePanel,
} from "@/components/execution/AvanzaSelectedRecommendationPreviewStatePanel";
import type {
  AvanzaDevVisiblePreviewSurfaceGuardDecision,
} from "@/lib/avanza-dev-visible-preview-surface-guard";
import type {
  AvanzaSelectedRecommendationPreviewState,
} from "@/lib/avanza-selected-recommendation-preview-state";

type AvanzaDevVisibleSelectedRecommendationPreviewSurfaceProps = {
  guard: AvanzaDevVisiblePreviewSurfaceGuardDecision;
  previewState: AvanzaSelectedRecommendationPreviewState | null;
  title?: string;
  copy?: string;
};

const safetyCopy = [
  "Dev-only visible preview",
  "Preview only",
  "No bridge calls",
  "No localhost fetch",
  "No execution",
  "Controls disabled",
  "Gate locked",
] as const;

function statusTone(status: AvanzaDevVisiblePreviewSurfaceGuardDecision["status"]) {
  if (status === "blocked") {
    return "border-red-300/20 bg-red-500/10 text-red-100";
  }

  if (status === "visible_dev_only_allowed") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-300";
}

export function AvanzaDevVisibleSelectedRecommendationPreviewSurface({
  copy = "Dev-only visual QA surface for passive selectedRecommendation preview state.",
  guard,
  previewState,
  title = "Dev-only visible selectedRecommendation preview",
}: AvanzaDevVisibleSelectedRecommendationPreviewSurfaceProps) {
  const canRenderPreview =
    guard.status === "visible_dev_only_allowed" &&
    guard.canRenderVisiblePreviewSurface &&
    previewState;

  return (
    <section className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            {safetyCopy.map((item) => (
              <span
                className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
          <h3 className="mt-3 text-sm font-semibold text-zinc-100">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-400">{copy}</p>
        </div>
        <div
          className={`rounded-md border px-2.5 py-2 text-xs font-semibold ${statusTone(
            guard.status,
          )}`}
        >
          {guard.status}
        </div>
      </div>

      <div className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-2 text-xs leading-5 text-zinc-400">
        <p className="font-semibold text-zinc-200">{guard.label}</p>
        <p className="mt-1">{guard.reason}</p>
      </div>

      {canRenderPreview ? (
        <div className="mt-3">
          <AvanzaSelectedRecommendationPreviewStatePanel
            previewState={previewState}
          />
        </div>
      ) : (
        <div className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-2 text-xs leading-5 text-zinc-400">
          <p className="font-semibold text-zinc-200">
            SelectedRecommendation preview surface is not visible
          </p>
          <p className="mt-1">
            The guard is hidden or blocked, or no preview state was supplied.
            Default Trade UI behavior remains static fixture.
          </p>
        </div>
      )}
    </section>
  );
}
