import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import {
  compareDatabentoExplicitInstantsV1,
  DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
  DATABENTO_EXPLICIT_NANOSECOND_INSTANT_POLICY_V1,
  evaluateDatabentoFreshnessV1,
  evaluateDatabentoIntervalMembershipV1,
  parseDatabentoExplicitNanosecondInstantV1,
} from "../../lib/market-context-intelligence-lab/databento-explicit-nanosecond-instant-v1";

const pythonParser =
  "scripts/databento_explicit_nanosecond_instant_v1.py";
const m5cHarness = "/private/tmp/action667m5c_submit_once.py";
const maxAgeNanoseconds = "900000000000";
const evidencePath =
  "docs/evidence/action-667m5c1-nanosecond-parser-remediation.json";
const reportPath =
  "docs/action-667m5c1-nanosecond-entitlement-parser-remediation.md";

function canonical(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonical(
            (value as Record<string, unknown>)[key],
          )}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function fileSha256(path: string) {
  return createHash("sha256")
    .update(readFileSync(path))
    .digest("hex");
}

function parse(value: unknown) {
  return parseDatabentoExplicitNanosecondInstantV1(
    value,
    "timestamp",
  );
}

function pythonOperations(
  operations: Array<Record<string, unknown>>,
  timezone: string,
) {
  return JSON.parse(
    execFileSync("python3", [pythonParser, "--evaluate-json"], {
      cwd: process.cwd(),
      env: { ...process.env, TZ: timezone },
      input: JSON.stringify(operations),
      encoding: "utf8",
    }),
  ) as unknown[];
}

const acceptedFractions = [
  ["2026-07-27T00:00:00Z", BigInt(0)],
  ["2026-07-27T00:00:00.1Z", BigInt(100_000_000)],
  ["2026-07-27T00:00:00.123Z", BigInt(123_000_000)],
  ["2026-07-27T00:00:00.123456Z", BigInt(123_456_000)],
  ["2026-07-27T00:00:00.12345678Z", BigInt(123_456_780)],
  ["2026-07-27T00:00:00.123456789Z", BigInt(123_456_789)],
] as const;

const invalidValues: Array<[unknown, string]> = [
  ["2026-07-27T00:00:00", "syntax_not_strict_explicit_instant"],
  ["2026-07-27T00:00:00z", "syntax_not_strict_explicit_instant"],
  ["2026-02-29T00:00:00Z", "calendar_date_invalid"],
  ["2026-13-01T00:00:00Z", "calendar_date_invalid"],
  ["2026-07-27T24:00:00Z", "clock_time_invalid"],
  ["2026-07-27T00:60:00Z", "clock_time_invalid"],
  ["2026-07-27T00:00:60Z", "leap_second_unsupported"],
  ["2026-07-27T00:00:00+01:60", "offset_out_of_policy"],
  ["2026-07-27T00:00:00+14:01", "offset_out_of_policy"],
  ["2026-07-27T00:00:00-14:01", "offset_out_of_policy"],
  [
    "2026-07-27T00:00:00.1234567890Z",
    "syntax_not_strict_explicit_instant",
  ],
  [" 2026-07-27T00:00:00Z", "syntax_not_strict_explicit_instant"],
  ["2026-07-27T00:00:00Z ", "syntax_not_strict_explicit_instant"],
  [
    "2026-07-27T00:00:00Ztrailing",
    "syntax_not_strict_explicit_instant",
  ],
  ["NaN", "syntax_not_strict_explicit_instant"],
  ["Infinity", "syntax_not_strict_explicit_instant"],
  ["1969-12-31T23:59:59Z", "year_out_of_policy"],
  ["0000-01-01T00:00:00Z", "year_out_of_policy"],
  [null, "value_not_string"],
  [Number.NaN, "value_not_string"],
  [Number.POSITIVE_INFINITY, "value_not_string"],
];

test("version and strict lossless policy are explicit", () => {
  expect(DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1).toBe(
    "databento_explicit_nanosecond_instant_parser_v1",
  );
  expect(DATABENTO_EXPLICIT_NANOSECOND_INSTANT_POLICY_V1).toEqual({
    minimum_year: 1970,
    maximum_year: 9999,
    fractional_digits_minimum: 0,
    fractional_digits_maximum: 9,
    explicit_utc_z_allowed: true,
    explicit_offset_allowed: true,
    maximum_absolute_offset_minutes: 840,
    lowercase_z_allowed: false,
    leap_second_supported: false,
    canonical_representation:
      "signed_unix_nanosecond_decimal_string",
    floating_point_conversion_allowed: false,
    host_timezone_used: false,
  });
});

test("zero through nine supported fractional digits remain exact", () => {
  const base =
    BigInt(Date.parse("2026-07-27T00:00:00Z")) *
    BigInt(1_000_000);
  for (const [value, expectedFraction] of acceptedFractions) {
    expect(parse(value)).toEqual({
      ok: true,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      unix_nanoseconds: (base + expectedFraction).toString(),
    });
  }
});

test("observed Databento entitlement nanoseconds are supported", () => {
  expect(parse("2023-03-28T00:00:00.000000000Z")).toEqual({
    ok: true,
    parser_version:
      DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
    unix_nanoseconds: "1679961600000000000",
  });
  expect(parse("2026-07-27T04:00:00.000000000Z")).toEqual({
    ok: true,
    parser_version:
      DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
    unix_nanoseconds: "1785124800000000000",
  });
});

test("one nanosecond, rollovers, leap year, and offsets are exact", () => {
  const oneNanosecondBoundaries = [
    [
      "2026-07-27T00:00:00.000000001Z",
      "2026-07-27T00:00:00.000000000Z",
    ],
    [
      "2026-07-27T00:01:00.000000000Z",
      "2026-07-27T00:00:59.999999999Z",
    ],
    [
      "2026-07-27T01:00:00.000000000Z",
      "2026-07-27T00:59:59.999999999Z",
    ],
    [
      "2026-07-28T00:00:00.000000000Z",
      "2026-07-27T23:59:59.999999999Z",
    ],
  ] as const;
  for (const [later, earlier] of oneNanosecondBoundaries) {
    expect(
      compareDatabentoExplicitInstantsV1(later, earlier),
    ).toMatchObject({
      ok: true,
      relation: 1,
      signed_delta_nanoseconds: "1",
    });
  }
  expect(parse("2024-02-29T23:59:59.999999999Z").ok).toBe(true);
  expect(parse("2100-02-29T00:00:00Z")).toMatchObject({
    ok: false,
    reason_code: "calendar_date_invalid",
  });
  const equivalent = [
    parse("2026-07-27T00:00:00.123456789Z"),
    parse("2026-07-27T02:00:00.123456789+02:00"),
    parse("2026-07-26T19:00:00.123456789-05:00"),
  ];
  expect(equivalent[1]).toEqual(equivalent[0]);
  expect(equivalent[2]).toEqual(equivalent[0]);
  expect(parse("2026-07-27T14:00:00+14:00")).toEqual(
    parse("2026-07-27T00:00:00Z"),
  );
});

test("invalid runtime values return deterministic structured rejections", () => {
  for (const [value, reason] of invalidValues) {
    expect(parse(value)).toEqual({
      ok: false,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      error_code:
        "databento_explicit_nanosecond_instant_rejected",
      reason_code: reason,
      field: "timestamp",
    });
  }
});

test("freshness boundary is exact at 900 seconds plus or minus one ns", () => {
  const cases = [
    ["2026-07-27T00:14:59.999999999Z", "fresh", true],
    ["2026-07-27T00:15:00.000000000Z", "fresh", true],
    ["2026-07-27T00:15:00.000000001Z", "stale", false],
  ] as const;
  for (const [current, state, within] of cases) {
    expect(
      evaluateDatabentoFreshnessV1({
        current_instant: current,
        observed_instant: "2026-07-27T00:00:00Z",
        maximum_age_nanoseconds: maxAgeNanoseconds,
      }),
    ).toMatchObject({
      ok: true,
      freshness_state: state,
      within_maximum_age: within,
      maximum_age_nanoseconds: maxAgeNanoseconds,
    });
  }
  expect(
    evaluateDatabentoFreshnessV1({
      current_instant: "2026-07-26T23:59:59.999999999Z",
      observed_instant: "2026-07-27T00:00:00Z",
      maximum_age_nanoseconds: maxAgeNanoseconds,
    }),
  ).toMatchObject({
    ok: true,
    freshness_state: "future",
    age_nanoseconds: "-1",
    within_maximum_age: false,
  });
});

test("interval membership is inclusive-start and exclusive-end", () => {
  const input = {
    start_inclusive: "2026-06-26T00:00:00Z",
    end_exclusive: "2026-07-20T00:00:00Z",
  };
  expect(
    evaluateDatabentoIntervalMembershipV1({
      ...input,
      value_instant: input.start_inclusive,
    }),
  ).toMatchObject({ ok: true, is_member: true });
  expect(
    evaluateDatabentoIntervalMembershipV1({
      ...input,
      value_instant: "2026-07-19T23:59:59.999999999Z",
    }),
  ).toMatchObject({ ok: true, is_member: true });
  expect(
    evaluateDatabentoIntervalMembershipV1({
      ...input,
      value_instant: input.end_exclusive,
    }),
  ).toMatchObject({ ok: true, is_member: false });
});

test("TypeScript and Python contracts are byte-material equivalent", () => {
  const operations: Array<Record<string, unknown>> = [
    ...acceptedFractions.map(([value]) => ({
      operation: "parse",
      value,
      field: "timestamp",
    })),
    ...invalidValues.map(([value]) => ({
      operation: "parse",
      value,
      field: "timestamp",
    })),
    {
      operation: "compare",
      left: "2026-07-28T00:00:00Z",
      right: "2026-07-27T23:59:59.999999999Z",
    },
    {
      operation: "freshness",
      input: {
        current_instant: "2026-07-27T00:15:00.000000001Z",
        observed_instant: "2026-07-27T00:00:00Z",
        maximum_age_nanoseconds: maxAgeNanoseconds,
      },
    },
    {
      operation: "interval",
      input: {
        value_instant: "2026-07-19T23:59:59.999999999Z",
        start_inclusive: "2026-06-26T00:00:00Z",
        end_exclusive: "2026-07-20T00:00:00Z",
      },
    },
  ];
  const typescript = operations.map((operation) => {
    if (operation.operation === "parse") {
      return parseDatabentoExplicitNanosecondInstantV1(
        operation.value,
        String(operation.field),
      );
    }
    if (operation.operation === "compare") {
      return compareDatabentoExplicitInstantsV1(
        operation.left,
        operation.right,
      );
    }
    if (operation.operation === "freshness") {
      return evaluateDatabentoFreshnessV1(
        operation.input as Parameters<
          typeof evaluateDatabentoFreshnessV1
        >[0],
      );
    }
    return evaluateDatabentoIntervalMembershipV1(
      operation.input as Parameters<
        typeof evaluateDatabentoIntervalMembershipV1
      >[0],
    );
  });
  expect(pythonOperations(operations, "UTC")).toEqual(typescript);
});

test("UTC, Stockholm, and New York produce one fixed digest", () => {
  const operations = acceptedFractions.map(([value]) => ({
    operation: "parse",
    value,
    field: "timestamp",
  }));
  const outputs = [
    pythonOperations(operations, "UTC"),
    pythonOperations(operations, "Europe/Stockholm"),
    pythonOperations(operations, "America/New_York"),
  ];
  expect(outputs[1]).toEqual(outputs[0]);
  expect(outputs[2]).toEqual(outputs[0]);
  const digest = createHash("sha256")
    .update(JSON.stringify(outputs[0]))
    .digest("hex");
  console.log(`ACTION_667M5C1_TZ_DIGEST=${digest}`);
});

test("M.5C harness uses only the v1 parser for instant parsing", () => {
  const harness = readFileSync(m5cHarness, "utf8");
  expect(harness).toContain(
    "databento_explicit_nanosecond_instant_v1",
  );
  expect(harness).toContain(
    "parse_databento_explicit_nanosecond_instant_v1",
  );
  expect(harness).not.toContain("datetime.fromisoformat");
  expect(harness).not.toContain("Date.parse");
  expect(harness).not.toContain(".total_seconds()");
  expect(harness).toContain(
    "MAX_QUOTE_AGE_SECONDS * 1_000_000_000",
  );
});

test("machine-readable evidence digest and readable status stay in parity", () => {
  const evidence = JSON.parse(
    readFileSync(evidencePath, "utf8"),
  ) as {
    evidence_digest: string;
    decision_material: {
      artifacts: Array<{
        path: string;
        sha256: string;
      }>;
      statuses: Record<string, boolean>;
    };
  };
  expect(
    createHash("sha256")
      .update(canonical(evidence.decision_material))
      .digest("hex"),
  ).toBe(evidence.evidence_digest);
  for (const artifact of evidence.decision_material.artifacts) {
    expect(fileSha256(artifact.path)).toBe(artifact.sha256);
  }

  const report = readFileSync(reportPath, "utf8");
  for (const [status, value] of Object.entries(
    evidence.decision_material.statuses,
  )) {
    expect(report).toContain(`\`${status}: ${String(value)}\``);
  }
  expect(report).toContain(evidence.evidence_digest);
});
