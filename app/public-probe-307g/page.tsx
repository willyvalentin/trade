export const dynamic = "force-static";

export default function PublicProbe307gPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <section className="mx-auto max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-wide text-emerald-300">
          action_307g_public_probe
        </p>
        <h1 className="text-3xl font-semibold">Public Diagnostic Route</h1>
        <p>public diagnostic route</p>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>no provider call</li>
          <li>no replay</li>
          <li>no write</li>
          <li>no synthetic outcomes</li>
          <li>no scanner/ranking effects</li>
        </ul>
      </section>
    </main>
  );
}
