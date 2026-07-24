import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  applicationCanonicalProductionOrigin,
  applicationEnvironmentScopeContract,
  buildCanonicalProductionHostRedirect,
  evaluateApplicationEnvironmentScopeMetadata,
} from "../../lib/application-platform-contract";
import {
  evaluateApplicationAuthenticationOrigin,
  evaluateApplicationMutationOrigin,
} from "../../lib/application-mutation-guard-core";
import {
  buildApplicationLoginRuntimeProof,
} from "../../lib/application-login-runtime-proof";
import {
  buildContinuousIntelligenceDeploymentAssertionReadiness,
} from "../../lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function withEnvironment(
  values: Record<string, string | undefined>,
  callback: () => Promise<void> | void,
) {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("default Netlify host redirects permanently without affecting canonical or preview hosts", async () => {
  const config = await source("netlify.toml");
  expect(config).toContain(
    'from = "https://trade-vl.netlify.app/*"',
  );
  expect(config).toContain(
    'to = "https://trade.valentinlabs.com/:splat"',
  );
  expect(config).toContain("status = 301");
  expect(config).toContain("force = true");

  expect(
    buildCanonicalProductionHostRedirect(
      "https://trade-vl.netlify.app/settings?tab=risk",
    ),
  ).toBe("https://trade.valentinlabs.com/settings?tab=risk");
  expect(
    buildCanonicalProductionHostRedirect(
      "https://trade.valentinlabs.com/settings?tab=risk",
    ),
  ).toBeNull();
  expect(
    buildCanonicalProductionHostRedirect(
      "https://deploy-preview-46--trade-vl.netlify.app/settings",
    ),
  ).toBeNull();
});

test("production origin is canonical while preview and branch authentication stay disabled", async () => {
  await withEnvironment(
    {
      NODE_ENV: "production",
      TURE_APPLICATION_ORIGIN: applicationCanonicalProductionOrigin,
      CONTEXT: "production",
    },
    () => {
      const request = new Request(
        `${applicationCanonicalProductionOrigin}/api/auth/login`,
        { method: "POST" },
      );
      expect(evaluateApplicationAuthenticationOrigin(request)).toEqual({
        status: "allowed",
      });
      expect(
        evaluateApplicationMutationOrigin(
          new Request(`${applicationCanonicalProductionOrigin}/api/app/settings`, {
            method: "POST",
            headers: { origin: applicationCanonicalProductionOrigin },
          }),
        ),
      ).toEqual({ status: "allowed" });
    },
  );

  for (const context of ["deploy-preview", "branch-deploy"]) {
    await withEnvironment(
      {
        NODE_ENV: "production",
        TURE_APPLICATION_ORIGIN:
          "https://deploy-preview-46--trade-vl.netlify.app",
        CONTEXT: context,
      },
      () => {
        const request = new Request(
          "https://deploy-preview-46--trade-vl.netlify.app/api/auth/login",
          { method: "POST" },
        );
        expect(evaluateApplicationAuthenticationOrigin(request)).toMatchObject({
          status: "forbidden",
          code: "application_authentication_deploy_context_forbidden",
        });
      },
    );
  }

  expect(applicationEnvironmentScopeContract.deploy_preview.secret_source).toBe(
    "none",
  );
  expect(applicationEnvironmentScopeContract.branch_deploy.secret_source).toBe(
    "none",
  );
});

test("environment metadata evaluator detects preview credential exposure without values", () => {
  const result = evaluateApplicationEnvironmentScopeMetadata([
    {
      key: "TRADE_APP_PASSWORD",
      scopes: ["functions"],
      contexts: ["all"],
    },
    {
      key: "SUPABASE_SERVICE_ROLE_KEY",
      scopes: ["functions"],
      contexts: ["production", "deploy-preview"],
    },
  ]);

  expect(result.preview_credentials_isolated).toBe(false);
  expect(result.preview_exposed_credential_keys).toEqual([
    "SUPABASE_SERVICE_ROLE_KEY",
    "TRADE_APP_PASSWORD",
  ]);
  expect(result.values_returned).toBe(false);
  expect(JSON.stringify(result)).not.toContain("secret-value");
});

test("temporary login runtime proof is production-only, authorized by successful login, and boolean-only", async () => {
  await withEnvironment(
    {
      NODE_ENV: "production",
      CONTEXT: "production",
      TURE_APPLICATION_ORIGIN: applicationCanonicalProductionOrigin,
      TURE_LOGIN_RUNTIME_PROOF_ENABLED: "true",
    },
    async () => {
      const request = new Request(
        `${applicationCanonicalProductionOrigin}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "x-nf-client-connection-ip": "203.0.113.10",
            "x-forwarded-for": "198.51.100.20",
          },
        },
      );
      const proof = await buildApplicationLoginRuntimeProof(request);
      expect(proof).toMatchObject({
        trusted_header_present: true,
        trusted_identity_valid: true,
        runtime_type: "next_node_route_handler",
        header_value_returned: false,
        client_identity_returned: false,
      });
      const serialized = JSON.stringify(proof);
      expect(serialized).not.toContain("203.0.113.10");
      expect(serialized).not.toContain("198.51.100.20");

      const spoofOnly = await buildApplicationLoginRuntimeProof(
        new Request(`${applicationCanonicalProductionOrigin}/api/auth/login`, {
          method: "POST",
          headers: { "x-forwarded-for": "198.51.100.20" },
        }),
      );
      expect(spoofOnly).toMatchObject({
        trusted_header_present: false,
        trusted_identity_valid: false,
      });
    },
  );

  await withEnvironment(
    {
      NODE_ENV: "production",
      CONTEXT: "production",
      TURE_APPLICATION_ORIGIN: applicationCanonicalProductionOrigin,
      TURE_LOGIN_RUNTIME_PROOF_ENABLED: undefined,
    },
    async () => {
      await expect(
        buildApplicationLoginRuntimeProof(
          new Request(`${applicationCanonicalProductionOrigin}/api/auth/login`),
        ),
      ).resolves.toBeNull();
    },
  );
});

test("deployment assertion readiness reports mismatch without returning identity values", () => {
  const deployed = "f3d97de8ed55d68219d8084f76c47cbe80f2126c";
  const stale = "c7fc1f06019f1afff58c9f146a1f0576ef6447dc";
  const readiness = buildContinuousIntelligenceDeploymentAssertionReadiness({
    TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT: stale,
    COMMIT_REF: deployed,
    NETLIFY_COMMIT_REF: deployed,
  });

  expect(readiness).toMatchObject({
    configured: true,
    configured_value_canonical: true,
    platform_identity_present: true,
    assertion_matches_platform: false,
    status: "explicit_configuration_conflict",
    identity_value_returned: false,
  });
  expect(JSON.stringify(readiness)).not.toContain(deployed);
  expect(JSON.stringify(readiness)).not.toContain(stale);
});

test("runtime proof remains disabled by default and login source never logs header values", async () => {
  const login = await source("app/api/auth/login/route.ts");
  const control = await source(
    "lib/application-login-runtime-proof.ts",
  );

  expect(control).toContain(
    'process.env.TURE_LOGIN_RUNTIME_PROOF_ENABLED !== "true"',
  );
  expect(login).toContain("buildApplicationLoginRuntimeProof");
  expect(
    login.lastIndexOf("buildApplicationLoginRuntimeProof(request)"),
  ).toBeGreaterThan(login.indexOf("passwordsMatch(appPassword"));
  expect(login).not.toMatch(/console\.(log|info|warn|error)/);
  expect(control).not.toMatch(/console\.(log|info|warn|error)/);
  expect(login).not.toContain("x-nf-client-connection-ip");
});
