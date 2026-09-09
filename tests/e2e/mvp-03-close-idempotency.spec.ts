import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  ownedPositionCloseValuesMatch,
  parseOwnedPositionCloseValues,
} from "../../lib/server/owned-position-close";

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

  test("the server updates only an open owned position before checking a closed replay", async () => {
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
    expect(partialUpdateSource).toContain('.eq("status", "open")');
    expect(route).toContain('body.operation === "close"');
    expect(route).toContain("closeApplicationPosition({");
    expect(route).toContain("session.owner_user_id");
  });
});
