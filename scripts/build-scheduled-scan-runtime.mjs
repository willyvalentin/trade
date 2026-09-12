import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const rootDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
const runtimes = [
  {
    entryPoint: "app/api/automation/run-scan/route.ts",
    outputFile: "scheduled-scan-runtime.cjs",
  },
  {
    entryPoint: "app/api/recommendations/evaluate-outcomes/route.ts",
    outputFile: "scheduled-outcome-evaluation-runtime.cjs",
  },
];

for (const runtime of runtimes) {
  const outputFile = join(
    rootDirectory,
    "netlify",
    ".generated",
    runtime.outputFile,
  );

  await mkdir(dirname(outputFile), { recursive: true });

  await build({
    absWorkingDir: rootDirectory,
    alias: {
      "@": rootDirectory,
    },
    bundle: true,
    conditions: ["react-server"],
    entryPoints: [runtime.entryPoint],
    format: "cjs",
    legalComments: "none",
    logLevel: "info",
    outfile: outputFile,
    platform: "node",
    target: "node20",
  });
}
