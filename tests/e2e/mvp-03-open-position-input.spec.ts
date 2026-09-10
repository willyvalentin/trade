import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseOwnedPositionOpenValues } from "../../lib/server/owned-position-open";

const repositoryRoot = path.resolve(__dirname, "../..");

const manualEntryPayload = {
  recommendation_id: "44e29c6a-f7e4-4f5d-9d61-83f6c9c1fc5a",
  ticker: "DEMO",
  company_name: "Demo Trade Corp.",
  entry_price: 100.5,
  position_size: 10,
  current_stop: "96.00",
  target_1: "108.00",
  target_2: "112.00",
  execution_metadata: { source: "manual_broker_record" },
};

test.describe("MVP-03 manual entry input", () => {
  test("accepts the numeric plan fields emitted by the recommendation UI", () => {
    expect(parseOwnedPositionOpenValues(manualEntryPayload)).toEqual({
      ...manualEntryPayload,
      current_stop: 96,
      target_1: 108,
      target_2: 112,
    });
  });

  test("rejects non-finite, non-decimal, and incomplete manual entry values", () => {
    expect(
      parseOwnedPositionOpenValues({ ...manualEntryPayload, target_1: "108 dollars" }),
    ).toBeNull();
    expect(
      parseOwnedPositionOpenValues({ ...manualEntryPayload, current_stop: 0 }),
    ).toBeNull();
    expect(
      parseOwnedPositionOpenValues({ ...manualEntryPayload, position_size: Infinity }),
    ).toBeNull();
    expect(
      parseOwnedPositionOpenValues({ ...manualEntryPayload, execution_metadata: [] }),
    ).toBeNull();
  });

  test("normalizes before the owner-bound transaction RPC", async () => {
    const dataAccess = await readFile(
      path.join(repositoryRoot, "lib/server/application-data-access.ts"),
      "utf8",
    );

    expect(dataAccess).toContain('import { parseOwnedPositionOpenValues }');
    expect(dataAccess).toContain("const values = parseOwnedPositionOpenValues(input);");
    expect(dataAccess).toContain('client.rpc("app_open_owned_position_transaction"');
    expect(dataAccess).toContain("p_current_stop: values.current_stop");
    expect(dataAccess).toContain("p_target_1: values.target_1");
    expect(dataAccess).toContain("p_target_2: values.target_2");
  });
});
