import type { Metadata } from "next";
import {
  AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery,
} from "@/components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery";
import {
  AvanzaDevVisualQaRouteStatusPanel,
} from "@/components/execution/AvanzaDevVisualQaRouteStatusPanel";
import {
  AvanzaDevVisualQaRouteAccessHarness,
} from "@/components/execution/AvanzaDevVisualQaRouteAccessHarness";
import {
  AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness,
} from "@/components/execution/AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness";

export const metadata: Metadata = {
  title: "Avanza Dev Visual QA",
  description:
    "Fixture-only Avanza selectedRecommendation preview visual QA surface",
};

const safetyBadges = [
  "Dev-only visual QA",
  "Fixture-only",
  "Not linked from main navigation",
  "No real selectedRecommendation state",
  "No bridge calls",
  "No localhost fetch",
  "No execution",
  "Controls disabled",
  "Gate locked",
] as const;

export default function AvanzaDevVisualQaPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {safetyBadges.map((badge) => (
              <span
                className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
                key={badge}
              >
                {badge}
              </span>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-zinc-500">
              Isolated Avanza fixture surface
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-white">
              Dev-only visual QA
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Fixture-only route shell for Avanza selectedRecommendation
              preview scenarios. It does not read Trade UI state, does not use
              real selectedRecommendation state, does not fetch, does not call
              the bridge, and does not enable execution.
            </p>
          </div>
        </header>

        <AvanzaDevVisualQaRouteStatusPanel />

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Route access fixtures
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Static route-access decisions only. The default route access
              model remains hidden; this page renders fixture states for visual
              QA and is not linked from main navigation.
            </p>
          </div>
          <AvanzaDevVisualQaRouteAccessHarness />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Visible preview surface fixtures
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Static selectedRecommendation preview fixtures only. Controls
              remain disabled, the pre-activation gate remains locked, and
              total-read remains advisory.
            </p>
          </div>
          <AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery />
        </section>

        <section className="grid gap-4 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Read-only selectedRecommendation dev preview guard
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Fixture/model only. No real selectedRecommendation state is read,
              no real selectedRecommendation state is rendered, no bridge calls,
              no localhost fetch, no polling, no execution, controls disabled,
              and gate locked.
            </p>
          </div>
          <AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness />
        </section>
      </div>
    </main>
  );
}
