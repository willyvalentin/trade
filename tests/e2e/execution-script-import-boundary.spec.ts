import { expect, test } from "@playwright/test";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { extname, join } from "node:path";

const repoRoot = process.cwd();

const restrictedScriptPaths = [
  "scripts/avanza-login-smoke-test.local.ts",
  "scripts/avanza-order-chain-smoke-test.local.ts",
  "scripts/avanza-localhost-bridge-server.mjs",
  "scripts/avanza-localhost-bridge-server-smoke.mjs",
  "scripts/avanza-dry-run-runner-skeleton.mjs",
  "scripts/mock-order-page-agent-runner.mjs",
] as const;

const protectedRuntimeRoots = ["app", "components", "hooks", "lib"] as const;
const uiAndApiRuntimeRoots = ["app", "components", "hooks"] as const;

const sourceExtensions = new Set([
  ".cjs",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
]);

const ignoredDirectoryNames = new Set([
  ".git",
  ".next",
  "coverage",
  "node_modules",
  "test-results",
]);

const allowedRestrictedScriptTextReferenceFiles = new Set([
  "lib/avanza-headless-execution-architecture-checkpoint.ts",
]);

const allowedChildProcessFiles = new Set([
  "lib/first-real-avanza-fill-only-poc-approved-live-fill-only-cdp-runner.ts",
]);

const importSpecifierPattern =
  /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s*)?["']([^"']+)["']|(?:require|import)\s*\(\s*["']([^"']+)["']\s*\)/g;

function toRepoPath(path: string) {
  return path.replaceAll("\\", "/");
}

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function isSourceFile(path: string) {
  return sourceExtensions.has(extname(path));
}

function collectSourceFiles(rootPath: string): string[] {
  const absoluteRootPath = join(repoRoot, rootPath);

  if (!existsSync(absoluteRootPath)) return [];

  const files: string[] = [];
  const entries = readdirSync(absoluteRootPath);

  for (const entry of entries) {
    if (ignoredDirectoryNames.has(entry)) continue;

    const repoPath = toRepoPath(join(rootPath, entry));
    const absolutePath = join(repoRoot, repoPath);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(repoPath));
      continue;
    }

    if (stats.isFile() && isSourceFile(repoPath)) {
      files.push(repoPath);
    }
  }

  return files;
}

function collectRuntimeSourceFiles(roots: readonly string[]) {
  return roots.flatMap((rootPath) => collectSourceFiles(rootPath)).sort();
}

function extractImportSpecifiers(source: string) {
  const specifiers: string[] = [];

  for (const match of source.matchAll(importSpecifierPattern)) {
    const specifier = match[1] ?? match[2];

    if (specifier) {
      specifiers.push(specifier);
    }
  }

  return specifiers;
}

function scriptPathVariants(scriptPath: string) {
  const normalizedScriptPath = toRepoPath(scriptPath);
  const withoutExtension = normalizedScriptPath.replace(/\.(mjs|ts)$/u, "");
  const basename = normalizedScriptPath.split("/").at(-1) ?? normalizedScriptPath;
  const basenameWithoutExtension = basename.replace(/\.(mjs|ts)$/u, "");

  return [
    normalizedScriptPath,
    withoutExtension,
    `/${normalizedScriptPath}`,
    `/${withoutExtension}`,
    `@/${normalizedScriptPath}`,
    `@/${withoutExtension}`,
    basename,
    basenameWithoutExtension,
  ];
}

function specifierTargetsRestrictedScript(specifier: string) {
  const normalizedSpecifier = toRepoPath(specifier);

  return restrictedScriptPaths.some((scriptPath) =>
    scriptPathVariants(scriptPath).some(
      (variant) =>
        normalizedSpecifier === variant ||
        normalizedSpecifier.endsWith(`/${variant}`),
    ),
  );
}

function sourceMentionsRestrictedScript(source: string) {
  return restrictedScriptPaths.some((scriptPath) =>
    scriptPathVariants(scriptPath).some((variant) => source.includes(variant)),
  );
}

function hasChildProcessCapability(source: string) {
  return /node:child_process|["']child_process["']|child_process|execFileSync|execFile\(|execSync|spawnSync|spawn\(|fork\(/u.test(
    source,
  );
}

test.describe("execution script import boundary", () => {
  test("restricted terminal and local-dev scripts are inventoried", () => {
    for (const scriptPath of restrictedScriptPaths) {
      expect(
        existsSync(join(repoRoot, scriptPath)),
        `${scriptPath} should exist as an explicitly restricted terminal/local-dev script.`,
      ).toBe(true);
      expect(scriptPath.startsWith("scripts/"), `${scriptPath} must stay under scripts/.`).toBe(
        true,
      );
    }
  });

  test("runtime-facing source files do not import restricted scripts", () => {
    const violations = collectRuntimeSourceFiles(protectedRuntimeRoots).flatMap(
      (filePath) => {
        const specifiers = extractImportSpecifiers(readRepoFile(filePath));
        return specifiers
          .filter(specifierTargetsRestrictedScript)
          .map((specifier) => `${filePath} imports ${specifier}`);
      },
    );

    expect(violations, violations.join("\n")).toEqual([]);
  });

  test("app/trade-app.tsx does not import script, bridge, browser, or credential runtimes", () => {
    const source = readRepoFile("app/trade-app.tsx");
    const specifiers = extractImportSpecifiers(source);
    const forbiddenSpecifierFragments = [
      "scripts/",
      "avanza-login-smoke-test",
      "avanza-order-chain-smoke-test",
      "avanza-localhost-bridge-server",
      "avanza-dry-run-runner-skeleton",
      "mock-order-page-agent-runner",
      "avanza-local-playwright",
      "avanza-secure-credential-provider",
      "avanza-macos-keychain-credential-provider",
      "avanza-login-credential-resolution-bridge",
      "avanza-login-local-dev-credential-executor",
    ];

    const violations = specifiers.filter((specifier) =>
      forbiddenSpecifierFragments.some((fragment) =>
        toRepoPath(specifier).includes(fragment),
      ),
    );

    expect(violations, violations.join("\n")).toEqual([]);
  });

  test("UI and API runtime files do not expose process-spawn invocation", () => {
    const violations = collectRuntimeSourceFiles(uiAndApiRuntimeRoots)
      .filter((filePath) => hasChildProcessCapability(readRepoFile(filePath)))
      .map((filePath) => `${filePath} contains child_process/spawn capability`);

    expect(violations, violations.join("\n")).toEqual([]);
  });

  test("lib child_process usage remains explicitly allowlisted and isolated", () => {
    const violations = collectRuntimeSourceFiles(["lib"])
      .filter((filePath) => hasChildProcessCapability(readRepoFile(filePath)))
      .filter((filePath) => !allowedChildProcessFiles.has(filePath))
      .map((filePath) => `${filePath} contains non-allowlisted child_process usage`);

    expect(violations, violations.join("\n")).toEqual([]);
  });

  test("restricted script text references outside scripts are explicitly allowlisted", () => {
    const violations = collectRuntimeSourceFiles(protectedRuntimeRoots)
      .filter((filePath) => sourceMentionsRestrictedScript(readRepoFile(filePath)))
      .filter((filePath) => !allowedRestrictedScriptTextReferenceFiles.has(filePath))
      .map((filePath) => `${filePath} mentions a restricted script path/name`);

    expect(violations, violations.join("\n")).toEqual([]);
  });
});
