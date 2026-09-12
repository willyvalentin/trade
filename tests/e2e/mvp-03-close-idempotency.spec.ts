import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  calculateOwnedLongPositionCloseMetrics,
  ownedLongPositionCloseMetricsMatch,
  ownedPositionCloseValuesMatch,
  parseOwnedPositionCloseValues,
} from "../../lib/server/owned-position-close";
import {
  applicationPositionCloseResultMessage,
  parseApplicationPositionCloseResult,
} from "../../lib/application-position-close-result";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

const closeValues = {
  exit_price: 112.5,
  closed_at: "2026-09-10T14:30:00.000Z",
  pnl: 25,
  pnl_percent: 12.5,
  r_multiple: 1.25,
  exit_notes: "Manual broker exit recorded.",
  execution_metadata: {
    broker_exit_confirmation: { manually_recorded: true, reference: "redacted" },
    fee_basis: "gross_price_difference_before_fees",
  },
};

test.describe("MVP-03 owner-bound close idempotency", () => {
  test("accepts a complete manual exit and recognizes a replay without changing its values", () => {
    const parsed = parseOwnedPositionCloseValues(closeValues);

    expect(parsed).toEqual(closeValues);
    expect(
      ownedPositionCloseValuesMatch(
        {
          ...closeValues,
          closed_at: "2026-09-10T14:30:00+00:00",
          execution_metadata: {
            fee_basis: "gross_price_difference_before_fees",
            broker_exit_confirmation: {
              reference: "redacted",
              manually_recorded: true,
            },
          },
        },
        parsed!,
      ),
    ).toBe(true);
  });

  test("fails closed instead of treating a changed close as a harmless replay", () => {
    const parsed = parseOwnedPositionCloseValues(closeValues);

    expect(
      ownedPositionCloseValuesMatch(
        { ...closeValues, exit_price: 113 },
        parsed!,
      ),
    ).toBe(false);
    expect(
      ownedPositionCloseValuesMatch(
        { ...closeValues, exit_notes: "A different manual exit." },
        parsed!,
      ),
    ).toBe(false);
    expect(
      parseOwnedPositionCloseValues({ ...closeValues, execution_metadata: [] }),
    ).toBeNull();
    expect(parseOwnedPositionCloseValues({ ...closeValues, pnl: Infinity })).toBeNull();
  });

  test("rejects client-supplied metrics that disagree with a fully open owned long position", () => {
    const parsed = parseOwnedPositionCloseValues(closeValues);
    const metrics = calculateOwnedLongPositionCloseMetrics(
      {
        entry_price: "100",
        position_size: "10",
        current_stop: "80",
        execution_metadata: { entry_fills: [] },
      },
      closeValues.exit_price,
    );

    expect(metrics).toEqual({ pnl: 125, pnl_percent: 12.5, r_multiple: 0.625 });
    expect(ownedLongPositionCloseMetricsMatch(parsed!, metrics!)).toBe(false);
    expect(
      ownedLongPositionCloseMetricsMatch(
        { ...parsed!, pnl: 125, r_multiple: 0.625 },
        metrics!,
      ),
    ).toBe(true);
  });

  test("leaves prior partial-exit accounting outside the one-fill close check", () => {
    expect(
      calculateOwnedLongPositionCloseMetrics(
        {
          entry_price: 100,
          position_size: 5,
          current_stop: 80,
          execution_metadata: { exit_fills: [{ fill_id: "prior-exit" }] },
        },
        112.5,
      ),
    ).toBeNull();
  });

  test("keeps the server-owned closed-versus-reused outcome visible to a close retry", () => {
    const reused = parseApplicationPositionCloseResult({
      ok: true,
      disposition: "reused",
    });
    const closed = parseApplicationPositionCloseResult({
      ok: true,
      disposition: "closed",
    });

    expect(reused).not.toBeNull();
    expect(closed).not.toBeNull();
    expect(applicationPositionCloseResultMessage(reused!, "ACME", null)).toContain(
      "no duplicate close was recorded",
    );
    expect(applicationPositionCloseResultMessage(closed!, "ACME", "Fee pending")).toBe(
      "ACME closed from broker exit fill. Fee pending",
    );
    expect(parseApplicationPositionCloseResult({ ok: true, disposition: "changed" })).toBeNull();
    expect(parseApplicationPositionCloseResult({ disposition: "closed" })).toBeNull();
  });

  test("the server only shrinks an open owned position before checking a closed replay", async () => {
    const dataAccess = await source("lib/server/application-data-access.ts");
    const route = await source("app/api/app/positions/route.ts");
    const partialUpdateSource = dataAccess.slice(
      dataAccess.indexOf("export async function updateApplicationPosition"),
      dataAccess.indexOf("export async function closeApplicationPosition"),
    );

    expect(dataAccess).toContain("export async function closeApplicationPosition");
    expect(dataAccess).toContain('.eq("owner_user_id", owner)');
    expect(dataAccess).toContain('.eq("status", "open")');
    expect(dataAccess).toContain('.eq("status", "closed")');
    expect(dataAccess).toContain("ownedPositionCloseValuesMatch(existing.data, values)");
    expect(dataAccess).toContain("calculateOwnedLongPositionCloseMetrics(");
    expect(dataAccess).toContain("ownedLongPositionCloseMetricsMatch(values, metrics)");
    expect(partialUpdateSource).toContain('.eq("status", "open")');
    expect(
      partialUpdateSource.match(/\.gt\("position_size", values\.position_size\)/g),
    ).toHaveLength(1);
    expect(partialUpdateSource).toContain("hasManualBrokerExitEvidence({");
    expect(partialUpdateSource).not.toContain("delete fallback.execution_metadata");
    expect(route).toContain('body.operation === "close"');
    expect(route).toContain("closeApplicationPosition({");
    expect(route).toContain("session.owner_user_id");
    expect(route).toContain('error: "Invalid position lifecycle values."');
    expect(route).toContain("{ status: 400 }");
    expect(dataAccess).toContain('disposition: "closed"');
    expect(dataAccess).toContain('disposition: "reused"');
    expect(route).toContain('"data" in result ? result.data : {}');
    const tradeApp = await source("app/trade-app.tsx");
    expect(tradeApp).toContain("parseApplicationPositionCloseResult(payload)");
    expect(tradeApp).toContain('closeResult?.disposition === "closed"');
    expect(tradeApp).toContain("applicationPositionCloseResultMessage(");
  });
});
