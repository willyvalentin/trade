import {
  AvanzaDevVisibleSelectedRecommendationPreviewSurface,
} from "@/components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurface";
import {
  avanzaDevVisiblePreviewSurfaceFixtures,
  type AvanzaDevVisiblePreviewSurfaceFixture,
} from "@/lib/avanza-dev-visible-preview-surface-fixtures";

type AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGalleryProps = {
  fixtures?: readonly AvanzaDevVisiblePreviewSurfaceFixture[];
};

export function AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery({
  fixtures = avanzaDevVisiblePreviewSurfaceFixtures,
}: AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGalleryProps) {
  return (
    <section className="grid gap-4 rounded-md border border-white/10 bg-black/20 p-3">
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            "Fixture-only visible preview surface scenarios",
            "Not rendered in production Trade UI",
            "No bridge calls",
            "No localhost fetch",
            "No execution",
          ].map((copy) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={copy}
            >
              {copy}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-100">
          Dev-only visible selectedRecommendation preview scenarios
        </h3>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Static fixtures only. This gallery does not fetch, call the bridge,
          read app state, or enable execution.
        </p>
      </div>

      <div className="grid gap-3">
        {fixtures.map((fixture) => (
          <article
            className="rounded-md border border-white/10 bg-white/[0.02] p-3"
            key={fixture.id}
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {fixture.label}
                </p>
                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  Expected render state: {fixture.expectedRenderState}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                {fixture.guard.status}
              </span>
            </div>
            <AvanzaDevVisibleSelectedRecommendationPreviewSurface
              copy="Fixture-only visible preview surface scenario. No bridge calls, no localhost fetch, no execution, controls disabled, and gate locked."
              guard={fixture.guard}
              previewState={fixture.previewState}
              title={fixture.label}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
