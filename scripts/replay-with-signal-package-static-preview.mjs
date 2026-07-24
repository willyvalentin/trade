#!/usr/bin/env node

import { createRequire } from "module";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const fs = require("fs");
const Module = require("module");
const ts = require("typescript");

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveStaticPreviewAlias(request, parent, isMain, options) {
  if (typeof request === "string" && request.startsWith("@/")) {
    return originalResolveFilename.call(
      this,
      join(repoRoot, request.slice(2)),
      parent,
      isMain,
      options,
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require.extensions[".ts"] = function compileStaticPreviewTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  });

  module._compile(transpiled.outputText, filename);
};

const formatArg = process.argv.find((arg) => arg.startsWith("--format="));
const format = formatArg ? formatArg.slice("--format=".length) : "markdown";

if (format !== "markdown" && format !== "json") {
  console.error("Unsupported format. Use --format=markdown or --format=json.");
  process.exit(1);
}

const {
  buildReplayWithSignalPackageStaticPreviewJson,
  renderReplayWithSignalPackageStaticPreviewMarkdown,
} = require("../lib/replay-with-signal-package-static-preview.ts");

const preview = buildReplayWithSignalPackageStaticPreviewJson();
if (!preview.safety.ok) {
  const output =
    format === "json"
      ? `${JSON.stringify(preview, null, 2)}\n`
      : renderReplayWithSignalPackageStaticPreviewMarkdown();

  process.stdout.write(output);
  process.exit(1);
}

if (format === "json") {
  process.stdout.write(`${JSON.stringify(preview, null, 2)}\n`);
} else {
  process.stdout.write(renderReplayWithSignalPackageStaticPreviewMarkdown());
}
