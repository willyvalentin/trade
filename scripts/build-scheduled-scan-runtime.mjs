import { mkdir, writeFile } from "node:fs/promises";
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
  {
    entryPoint: "lib/server/internal-paper-worker-persistence.ts",
    outputFile: "scheduled-internal-paper-worker-runtime.cjs",
  },
];

const deploymentIdentityOutputFile = join(
  rootDirectory,
  "netlify",
  ".generated",
  "scheduled-scan-deployment-identity.json",
);
const canonicalValue = (value, pattern) => {
  const normalized = value?.trim().toLowerCase();
  return normalized && pattern.test(normalized) ? normalized : null;
};
const deploymentIdentity = {
  schema_version: "scheduled_scan_deployment_identity_v1",
  deploy_id: canonicalValue(process.env.DEPLOY_ID, /^[0-9a-f]{24}$/),
  deploy_context:
    process.env.CONTEXT?.trim().toLowerCase() === "production"
      ? "production"
      : null,
  commit_ref: canonicalValue(process.env.COMMIT_REF, /^[0-9a-f]{40}$/),
  site_id: canonicalValue(
    process.env.SITE_ID,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  ),
};

await mkdir(dirname(deploymentIdentityOutputFile), { recursive: true });
await writeFile(
  deploymentIdentityOutputFile,
  `${JSON.stringify(deploymentIdentity, null, 2)}\n`,
  "utf8",
);

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
