import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { relative } from "node:path";

export const SYNTHETIC_ATTACK_CASES = Object.freeze([
  Object.freeze({ expected_status: "incomplete", id: "missing_artifact" }),
  Object.freeze({ expected_status: "tampered", id: "extra_artifact" }),
  Object.freeze({ expected_status: "tampered", id: "renamed_artifact" }),
  Object.freeze({ expected_status: "tampered", id: "reordered_artifact" }),
  Object.freeze({ expected_status: "scope_rejected", id: "symlink_artifact" }),
  Object.freeze({ expected_status: "scope_rejected", id: "traversal_root" }),
  Object.freeze({ expected_status: "tampered", id: "self_consistent_inner_tampering" }),
  Object.freeze({ expected_status: "tampered", id: "aggregate_downgrade" }),
  Object.freeze({ expected_status: "tampered", id: "recovery_disclosure_stripped" }),
]);

export function canonicalJsonForFixture(value) {
  const active = new Set();
  function project(current) {
    if (current === null || typeof current === "boolean" || typeof current === "string") {
      return JSON.stringify(current);
    }
    if (typeof current === "number") {
      if (!Number.isFinite(current)) throw new TypeError("unsupported_number");
      return JSON.stringify(current);
    }
    if (typeof current !== "object") throw new TypeError("unsupported_value");
    if (Object.getPrototypeOf(current) !== Object.prototype && !Array.isArray(current)) {
      throw new TypeError("non_plain_object");
    }
    if (active.has(current)) throw new TypeError("cycle");
    active.add(current);
    const result = Array.isArray(current)
      ? `[${current.map(project).join(",")}]`
      : `{${Object.keys(current).sort().map((key) => `${JSON.stringify(key)}:${project(current[key])}`).join(",")}}`;
    active.delete(current);
    return result;
  }
  return project(value);
}

export function sha256ForFixture(value) {
  const bytes = Buffer.isBuffer(value) || typeof value === "string"
    ? value
    : canonicalJsonForFixture(value);
  return createHash("sha256").update(bytes).digest("hex");
}

export function parseFixtureJson(bytes) {
  return JSON.parse(Buffer.from(bytes).toString("utf8"));
}

export function canonicalFixtureBytes(value) {
  return Buffer.from(`${canonicalJsonForFixture(value)}\n`);
}

export function recomputeSelfDigest(value, field) {
  const projection = Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== field),
  );
  value[field] = sha256ForFixture(projection);
  return value;
}

export function createObservedReadBoundary(repositoryRoot, options = {}) {
  const calls = { lstat: 0, readFile: 0, realpath: 0 };
  const missing = new Set(options.missing ?? []);
  const overrides = new Map(options.overrides ?? []);
  const symlinks = new Set(options.symlinks ?? []);
  const toRelative = (absolute) => relative(repositoryRoot, absolute).split("\\").join("/");
  const boundary = Object.freeze({
    lstat(absolute) {
      calls.lstat += 1;
      const path = toRelative(absolute);
      if (missing.has(path)) {
        const error = new Error("synthetic_missing");
        error.code = "ENOENT";
        throw error;
      }
      if (symlinks.has(path)) {
        const metadata = lstatSync(repositoryRoot);
        metadata.isDirectory = () => false;
        metadata.isSymbolicLink = () => true;
        return metadata;
      }
      return lstatSync(absolute);
    },
    readFile(absolute) {
      calls.readFile += 1;
      const path = toRelative(absolute);
      if (missing.has(path)) {
        const error = new Error("synthetic_missing");
        error.code = "ENOENT";
        throw error;
      }
      return overrides.has(path) ? Buffer.from(overrides.get(path)) : readFileSync(absolute);
    },
    realpath(absolute) {
      calls.realpath += 1;
      return realpathSync(absolute);
    },
  });
  return Object.freeze({ boundary, calls });
}
