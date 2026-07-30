import { expect, test } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const root = process.cwd();
const manifestPath = join(
  root,
  "docs/recovery/action-661j5r10/final-freeze-manifest.json",
);
const reviewPath = join(
  root,
  "docs/recovery/action-661j5r10/independent-review.json",
);

function isObject(value: unknown): value is JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function parse(path: string): JsonObject {
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!isObject(value)) throw new Error("json_root_not_object");
  return value;
}

function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function sha256(value: JsonValue | string): string {
  return createHash("sha256")
    .update(typeof value === "string" ? value : canonicalJson(value))
    .digest("hex");
}

test("R10 freeze manifest is self-excluding and review is independently bound", () => {
  const manifest = parse(manifestPath);
  const review = parse(reviewPath);
  const projection = Object.fromEntries(
    Object.entries(manifest).filter(([key]) => key !== "manifest_digest"),
  );

  expect(manifest.manifest_digest).toBe(
    "9e6f8237a5f760c0ef34b2783eca69d7d1496a935d984bc8f07a92493982a4a6",
  );
  expect(sha256(projection)).toBe(manifest.manifest_digest);
  expect(readFileSync(manifestPath, "utf8")).toBe(
    `${canonicalJson(manifest)}\n`,
  );
  expect(review.manifest_digest).toBe(manifest.manifest_digest);
  expect(review.approved).toBe(true);
  expect(review.checkpoint_readiness).toBe(true);
  expect(manifest.digest_exclusions).toEqual(["manifest_digest"]);
  expect(manifest.evidence_files).toHaveLength(28);
  expect(manifest.preservation_refs).toHaveLength(12);
});

test("R10 preservation commitments are present, reachable and immutable", () => {
  const manifest = parse(manifestPath);
  const refs = Array.isArray(manifest.preservation_refs)
    ? manifest.preservation_refs
    : [];
  const finalCommit = "104e00c6c2980e024d4f342d82dd0b817ef44090";

  expect(
    execFileSync(
      "git",
      ["rev-parse", "refs/preservation/action-661j5r9-complete-runtime-certification"],
      { cwd: root, encoding: "utf8" },
    ).trim(),
  ).toBe(finalCommit);
  for (const value of refs) {
    if (!isObject(value)) throw new Error("ref_not_object");
    const ref = String(value.ref);
    const commit = String(value.commit);
    expect(
      execFileSync("git", ["rev-parse", ref], {
        cwd: root,
        encoding: "utf8",
      }).trim(),
    ).toBe(commit);
    expect(
      spawnSync("git", ["merge-base", "--is-ancestor", commit, finalCommit], {
        cwd: root,
      }).status,
    ).toBe(0);
    expect(value.reachable_from_final).toBe(true);
  }
});
