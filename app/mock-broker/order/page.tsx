import Link from "next/link";
import { isExecutionDevToolsEnabled } from "@/lib/execution";
import {
  MockBrokerOrderTicket,
  type MockBrokerOrderInitialValues,
} from "./ticket";

type MockBrokerOrderPageProps = {
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

function buildInitialValues(
  searchParams: Record<string, string | string[] | undefined>,
): MockBrokerOrderInitialValues {
  return {
    action: readSingleSearchParam(searchParams, "action"),
    intendedPrice: readSingleSearchParam(searchParams, "intendedPrice"),
    intentId: readSingleSearchParam(searchParams, "intentId"),
    limitPrice: readSingleSearchParam(searchParams, "limitPrice"),
    mode: readSingleSearchParam(searchParams, "mode"),
    orderType: readSingleSearchParam(searchParams, "orderType"),
    quantity: readSingleSearchParam(searchParams, "quantity"),
    requestId: readSingleSearchParam(searchParams, "requestId"),
    stopLossPrice: readSingleSearchParam(searchParams, "stopLossPrice"),
    targetPrice: readSingleSearchParam(searchParams, "targetPrice"),
    ticker: readSingleSearchParam(searchParams, "ticker"),
  };
}

export default async function MockBrokerOrderPage({
  searchParams,
}: MockBrokerOrderPageProps) {
  const devToolsEnabled = isExecutionDevToolsEnabled();
  const initialValues = buildInitialValues((await searchParams) ?? {});

  if (!devToolsEnabled) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Execution dev tools disabled
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white">
            Mock broker order page unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This local mock broker page is hidden unless execution dev tools are
            enabled. It is not Avanza, cannot place orders, and does not connect
            to any broker.
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

  return <MockBrokerOrderTicket initialValues={initialValues} />;
}
