const knownStatuses = new Set(["A", "M", "D", "R", "C", "T", "U", "X", "B"]);
const contentKinds = new Set(["unknown", "text", "binary", "symlink"]);

const registeredTests = new Set([
  "tests/e2e/action-660k-cost-bounded-provider-free-verification.spec.ts",
]);

const classOrder = [
  "unsafe_metadata",
  "ci_workflow",
  "dependency_or_toolchain",
  "auth_boundary",
  "public_runtime_asset",
  "registered_test",
  "documentation_evidence",
  "unknown_source",
];

const actionOrder = [
  "baseline",
  "draft_ci_contract_smoke",
  "toolchain_containment",
  "authenticated_boundary",
  "browser_server_containment",
];

const decoder = new TextDecoder("utf-8", { fatal: true });

function fail(message) {
  throw new Error(`REL-00 CI-B1 fail-closed classification error: ${message}`);
}

function compareText(left, right) {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function sortedUnique(values, preferredOrder = []) {
  const ranks = new Map(preferredOrder.map((value, index) => [value, index]));
  return [...new Set(values)].sort((left, right) => {
    const leftRank = ranks.get(left);
    const rightRank = ranks.get(right);
    if (leftRank !== undefined || rightRank !== undefined) {
      if (leftRank === undefined) {
        return 1;
      }
      if (rightRank === undefined) {
        return -1;
      }
      return leftRank - rightRank;
    }
    return compareText(left, right);
  });
}

function validateRepositoryPath(value, field) {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${field} must be a non-empty repository-relative path`);
  }
  if (value.includes("\u0000") || value.startsWith("/") || value.includes("\\")) {
    fail(`${field} is not a portable repository-relative path`);
  }

  const segments = value.split("/");
  if (
    segments.some(
      (segment) => segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    fail(`${field} contains an empty or traversal path segment`);
  }
  return value;
}

function normalizeMode(value, field) {
  if (value === null) {
    return null;
  }
  if (typeof value !== "string" || !/^[0-7]{6}$/.test(value)) {
    fail(`${field} must be null or a six-digit Git mode`);
  }
  return value;
}

function normalizeStatus(value) {
  if (typeof value !== "string" || !knownStatuses.has(value)) {
    fail("record status is unknown");
  }
  return value;
}

function optionalBoolean(record, field) {
  if (!(field in record)) {
    return false;
  }
  if (typeof record[field] !== "boolean") {
    fail(`${field} must be boolean when present`);
  }
  return record[field];
}

function normalizeRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail("record must be an object");
  }

  const status = normalizeStatus(record.status);
  const oldPath =
    record.old_path === null
      ? null
      : validateRepositoryPath(record.old_path, "old_path");
  const newPath =
    record.new_path === null
      ? null
      : validateRepositoryPath(record.new_path, "new_path");
  const oldMode = normalizeMode(record.old_mode, "old_mode");
  const newMode = normalizeMode(record.new_mode, "new_mode");

  if (typeof record.metadata_verified !== "boolean") {
    fail("metadata_verified must be boolean");
  }
  if (typeof record.content_kind !== "string" || !contentKinds.has(record.content_kind)) {
    fail("content_kind is unknown");
  }

  if (status === "A" && (oldPath !== null || newPath === null || oldMode !== null)) {
    fail("A records require only new_path and a null old_mode");
  }
  if (status === "D" && (oldPath === null || newPath !== null || newMode !== null)) {
    fail("D records require only old_path and a null new_mode");
  }
  if ((status === "R" || status === "C") && (oldPath === null || newPath === null)) {
    fail(`${status} records require old_path and new_path`);
  }
  if (
    !["A", "D", "R", "C"].includes(status) &&
    (oldPath === null || newPath === null || oldPath !== newPath)
  ) {
    fail(`${status} records require identical old_path and new_path`);
  }

  return Object.freeze({
    status,
    old_path: oldPath,
    new_path: newPath,
    old_mode: oldMode,
    new_mode: newMode,
    content_kind: record.content_kind,
    metadata_verified: record.metadata_verified,
    reference_verified: optionalBoolean(record, "reference_verified"),
    import_graph_verified: optionalBoolean(record, "import_graph_verified"),
    owned_test_mapping_verified: optionalBoolean(
      record,
      "owned_test_mapping_verified",
    ),
  });
}

function decodeTokens(input) {
  if (!(input instanceof Uint8Array)) {
    fail("name-status input must be Uint8Array");
  }
  if (input.length === 0) {
    return [];
  }
  if (input.at(-1) !== 0) {
    fail("name-status input must end with NUL");
  }

  const tokens = [];
  let start = 0;
  for (let index = 0; index < input.length; index += 1) {
    if (input[index] !== 0) {
      continue;
    }
    if (index === start) {
      fail("name-status input contains an empty token");
    }
    try {
      tokens.push(decoder.decode(input.slice(start, index)));
    } catch {
      fail("name-status input is not valid UTF-8");
    }
    start = index + 1;
  }
  return tokens;
}

function parseStatusToken(token) {
  const match = /^([ACDMRTUXB])(\d{1,3})?$/.exec(token);
  if (!match) {
    fail(`unsupported name-status token ${JSON.stringify(token)}`);
  }
  const status = match[1];
  const score = match[2] === undefined ? null : Number(match[2]);
  if ((status !== "R" && status !== "C") && score !== null) {
    fail("only rename and copy status tokens may include a score");
  }
  if (score !== null && score > 100) {
    fail("rename or copy score exceeds 100");
  }
  return { status, score };
}

export function parseNameStatusZ(input) {
  const tokens = decodeTokens(input);
  const records = [];

  for (let index = 0; index < tokens.length; ) {
    const parsedStatus = parseStatusToken(tokens[index]);
    index += 1;
    const requiresBothPaths =
      parsedStatus.status === "R" || parsedStatus.status === "C";
    const pathCount = requiresBothPaths ? 2 : 1;
    if (tokens.length - index < pathCount) {
      fail(`${parsedStatus.status} record is truncated`);
    }

    const firstPath = validateRepositoryPath(tokens[index], "name-status path");
    index += 1;
    const secondPath = requiresBothPaths
      ? validateRepositoryPath(tokens[index], "name-status path")
      : firstPath;
    if (requiresBothPaths) {
      index += 1;
    }

    const record =
      parsedStatus.status === "A"
        ? {
            status: "A",
            old_path: null,
            new_path: firstPath,
          }
        : parsedStatus.status === "D"
          ? {
              status: "D",
              old_path: firstPath,
              new_path: null,
            }
          : {
              status: parsedStatus.status,
              old_path: firstPath,
              new_path: secondPath,
            };

    records.push(
      Object.freeze({
        ...record,
        old_mode: null,
        new_mode: null,
        content_kind: "unknown",
        metadata_verified: false,
        reference_verified: false,
        import_graph_verified: false,
        owned_test_mapping_verified: false,
        similarity_score: parsedStatus.score,
      }),
    );
  }

  return Object.freeze(records);
}

function classifyPath(path, side) {
  const classes = [];
  const actions = [];
  const matchedRules = [];
  let requiresTierThree = false;

  if (path === ".github/workflows/milestone-a-ci.yml" || path.startsWith(".github/")) {
    classes.push("ci_workflow");
    actions.push("draft_ci_contract_smoke");
    matchedRules.push("ci-workflow-or-control");
    requiresTierThree = true;
  }
  if (
    path.startsWith("scripts/") ||
    path === "package.json" ||
    path === "package-lock.json" ||
    path === "tsconfig.json" ||
    path === "netlify.toml" ||
    path === ".gitignore" ||
    /(?:^|\/)\w[\w.-]*\.config\.(?:js|mjs|cjs|ts|mts|cts)$/.test(path)
  ) {
    classes.push("dependency_or_toolchain");
    actions.push("toolchain_containment");
    matchedRules.push("dependency-toolchain-or-script");
    requiresTierThree = true;
  }
  if (
    path.startsWith("app/") ||
    path === "proxy.ts" ||
    path.startsWith("lib/server/") ||
    path.startsWith("lib/auth/") ||
    path.startsWith("lib/supabase") ||
    path.startsWith("lib/trade-auth") ||
    path.startsWith("lib/application-")
  ) {
    classes.push("auth_boundary");
    actions.push("authenticated_boundary");
    matchedRules.push("runtime-or-auth-boundary");
    requiresTierThree = true;
  }
  if (
    path.startsWith("supabase/") ||
    path.startsWith("netlify/") ||
    path.startsWith("data/") ||
    path.endsWith(".sql") ||
    path.startsWith("components/execution/") ||
    path.startsWith("components/live-day-trades/") ||
    path.startsWith("components/recommendations/") ||
    path.startsWith("hooks/")
  ) {
    classes.push("auth_boundary");
    actions.push("authenticated_boundary");
    matchedRules.push("data-external-or-trade-ui-boundary");
    requiresTierThree = true;
  }
  if (path.startsWith("public/")) {
    classes.push("public_runtime_asset");
    actions.push("browser_server_containment");
    matchedRules.push("public-runtime-asset");
    requiresTierThree = true;
  }
  if (registeredTests.has(path)) {
    classes.push("registered_test");
    matchedRules.push("registered-test");
  }
  if (path.startsWith("docs/")) {
    classes.push("documentation_evidence");
    matchedRules.push("documentation");
    if (
      path.startsWith("docs/evidence/") ||
      path.startsWith("docs/ture-") ||
      path.startsWith("docs/rel-00-")
    ) {
      matchedRules.push("control-evidence");
      requiresTierThree = true;
    }
  }
  if (classes.length === 0) {
    classes.push("unknown_source");
    actions.push("browser_server_containment");
    matchedRules.push("default-unknown");
    requiresTierThree = true;
  }

  return {
    path,
    side,
    classes,
    actions,
    matched_rules: matchedRules,
    requires_tier_three: requiresTierThree,
  };
}

function isPlainDocumentationPath(path) {
  return (
    path.startsWith("docs/") &&
    !path.startsWith("docs/evidence/") &&
    !path.startsWith("docs/ture-") &&
    !path.startsWith("docs/rel-00-") &&
    /\.(?:md|mdx|rst|adoc|txt)$/.test(path)
  );
}

function isTierOneCandidateRecord(record) {
  const relevantPath = record.new_path ?? record.old_path;
  return (
    (record.status === "A" || record.status === "M") &&
    record.metadata_verified &&
    record.reference_verified &&
    record.content_kind === "text" &&
    record.old_mode !== "100755" &&
    record.new_mode === "100644" &&
    (record.status === "A" || record.old_mode === "100644") &&
    relevantPath !== null &&
    isPlainDocumentationPath(relevantPath)
  );
}

function isTierTwoCandidateRecord(record) {
  return (
    record.status === "M" &&
    record.old_path === record.new_path &&
    record.new_path !== null &&
    registeredTests.has(record.new_path) &&
    record.metadata_verified &&
    record.reference_verified &&
    record.import_graph_verified &&
    record.owned_test_mapping_verified &&
    record.content_kind === "text" &&
    record.old_mode === "100644" &&
    record.new_mode === "100644"
  );
}

function candidateTier(classes, requiresTierThree, records) {
  if (requiresTierThree || classes.length !== 1) {
    return "tier_3_required";
  }
  if (
    classes[0] === "documentation_evidence" &&
    records.length > 0 &&
    records.every(isTierOneCandidateRecord)
  ) {
    return "tier_1_candidate";
  }
  if (
    classes[0] === "registered_test" &&
    records.length > 0 &&
    records.every(isTierTwoCandidateRecord)
  ) {
    return "tier_2_candidate";
  }
  return "tier_3_required";
}

function isUnsafeRecord(record) {
  return (
    !record.metadata_verified ||
    record.content_kind === "binary" ||
    record.content_kind === "symlink" ||
    (record.old_mode !== null && record.old_mode !== "100644") ||
    (record.new_mode !== null && record.new_mode !== "100644") ||
    [record.old_path, record.new_path].some(
      (path) => path !== null && /[\u0000-\u001f\u007f-\u009f]/.test(path),
    ) ||
    ["D", "R", "C", "T", "U", "X", "B"].includes(record.status)
  );
}

function compareConsideredPaths(left, right) {
  return (
    compareText(left.path, right.path) ||
    compareText(left.side, right.side) ||
    compareText(left.matched_rules.join("\u0000"), right.matched_rules.join("\u0000"))
  );
}

export function classifyChangeSet(records) {
  if (!Array.isArray(records)) {
    fail("records must be an array");
  }

  const normalizedRecords = records.map((record) => normalizeRecord(record));
  const classes = [];
  const actions = ["baseline"];
  const consideredPaths = [];
  let requiresTierThree = normalizedRecords.length === 0;
  let broadContainment = normalizedRecords.length === 0;

  for (const record of normalizedRecords) {
    const sides = [];
    if (record.old_path !== null) {
      sides.push([record.old_path, "old"]);
    }
    if (record.new_path !== null) {
      sides.push([record.new_path, "new"]);
    }

    for (const [path, side] of sides) {
      const classifiedPath = classifyPath(path, side);
      classes.push(...classifiedPath.classes);
      actions.push(...classifiedPath.actions);
      consideredPaths.push({
        path: classifiedPath.path,
        side: classifiedPath.side,
        matched_rules: sortedUnique(classifiedPath.matched_rules),
      });
      requiresTierThree ||= classifiedPath.requires_tier_three;
    }

    if (isUnsafeRecord(record)) {
      classes.push("unsafe_metadata");
      actions.push("browser_server_containment");
      requiresTierThree = true;
      broadContainment = true;
    }
    if (!record.reference_verified) {
      requiresTierThree = true;
    }
    if (
      ["unknown_source", "public_runtime_asset", "dependency_or_toolchain"].some(
        (className) => classes.includes(className),
      )
    ) {
      broadContainment = true;
    }
    if (
      record.status === "M" &&
      record.old_path === record.new_path &&
      record.new_path !== null &&
      registeredTests.has(record.new_path) &&
      !isUnsafeRecord(record)
    ) {
      actions.push(`affected_registered_test:${record.new_path}`);
    }
    if (
      (record.status === "R" || record.status === "C") &&
      [record.old_path, record.new_path].some(
        (path) => path !== null && registeredTests.has(path),
      )
    ) {
      broadContainment = true;
    }
  }

  const orderedClasses = sortedUnique(classes, classOrder);
  const projectedCandidateTier = candidateTier(
    orderedClasses,
    requiresTierThree,
    normalizedRecords,
  );
  return Object.freeze({
    classes: orderedClasses,
    considered_paths: consideredPaths.sort(compareConsideredPaths),
    candidate_tier: projectedCandidateTier,
    effective_tier: 3,
    effective_disposition: broadContainment
      ? "broad_containment"
      : "manual_review_required",
    candidate_action_ids: sortedUnique(actions, actionOrder),
    manual_review_required: true,
    fast_path_eligible: false,
    activation_eligible: false,
  });
}

export function classifyChangeRecord(record) {
  return classifyChangeSet([record]);
}
