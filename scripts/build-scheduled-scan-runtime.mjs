import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const rootDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputFile = join(
  rootDirectory,
  "netlify",
  ".generated",
  "scheduled-scan-runtime.cjs",
);

await mkdir(dirname(outputFile), { recursive: true });

await build({
  absWorkingDir: rootDirectory,
  alias: {
    "@": rootDirectory,
  },
  bundle: true,
  conditions: ["react-server"],
  entryPoints: ["app/api/automation/run-scan/route.ts"],
  format: "cjs",
  legalComments: "none",
  logLevel: "info",
  outfile: outputFile,
  platform: "node",
  target: "node20",
});
