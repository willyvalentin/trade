import Link from "next/link";
import { isExecutionDevToolsEnabled } from "@/lib/execution";
import { parseMockOrderConfirmationFields } from "@/lib/mock-order-confirmation-contract";
import { MockBrokerConfirmation } from "./confirmation";

type MockBrokerConfirmationPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSingleSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function MockBrokerConfirmationPage({
  searchParams,
}: MockBrokerConfirmationPageProps) {
  const devToolsEnabled = isExecutionDevToolsEnabled();
  const params = (await searchParams) ?? {};

  if (!devToolsEnabled) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Execution dev tools disabled
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white">
            Mock broker confirmation page unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This local mock broker confirmation page is hidden unless execution
            dev tools are enabled. It is not Avanza, cannot confirm orders, and
            does not create broker results.
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
              href="/settings"
            >
              Back to Settings
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const parsed = parseMockOrderConfirmationFields({
    action: readSingleSearchParam(params, "action"),
    executedPrice: readSingleSearchParam(params, "executedPrice"),
    intentId: readSingleSearchParam(params, "intentId"),
    message: readSingleSearchParam(params, "message"),
    orderId: readSingleSearchParam(params, "orderId"),
    positionId: readSingleSearchParam(params, "positionId"),
    quantity: readSingleSearchParam(params, "quantity"),
    recommendationId: readSingleSearchParam(params, "recommendationId"),
    requestId: readSingleSearchParam(params, "requestId"),
    requestedPrice: readSingleSearchParam(params, "requestedPrice"),
    status: readSingleSearchParam(params, "status"),
    ticker: readSingleSearchParam(params, "ticker"),
  });

  return (
    <MockBrokerConfirmation
      payload={parsed.payload}
      validation={parsed.validation}
    />
  );
}
