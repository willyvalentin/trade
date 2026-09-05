import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import {
  resolveServerSupabaseServiceRole,
  serverSupabaseServiceRoleEnvironmentAliases,
} from "@/lib/server-supabase-service-role-resolution";
import { getServerSupabaseClient } from "@/lib/supabase-server";

const serverEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example-project.supabase.co",
};

test("server Supabase credential resolution accepts exactly one non-empty alias", () => {
  for (const alias of serverSupabaseServiceRoleEnvironmentAliases) {
    const environment = {
      ...serverEnvironment,
      [alias]: "redacted-service-role",
    };

    expect(resolveServerSupabaseServiceRole(environment)).toEqual({
      status: "ready",
      alias,
    });
  }
});

test("server Supabase credential resolution treats whitespace aliases as absent", () => {
  const environment = {
    ...serverEnvironment,
    SUPABASE_SERVICE_ROLE_KEY: "  ",
    SUPABASE_SERVICE_ROLE: "\n",
  };

  expect(resolveServerSupabaseServiceRole(environment)).toEqual({
    status: "missing",
    aliases: [],
  });
});

test("server Supabase credential resolution fails closed for alias ambiguity", () => {
  const environment = {
    ...serverEnvironment,
    SUPABASE_SERVICE_ROLE_KEY: "redacted-first-service-role",
    SUPABASE_SERVICE_ROLE_SECRET: "redacted-second-service-role",
  };

  expect(resolveServerSupabaseServiceRole(environment)).toEqual({
    status: "ambiguous",
    aliases: ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE_SECRET"],
  });

  expect(getServerSupabaseClient(environment)).toEqual({
    client: null,
    unavailable_reason: "supabase_service_role_ambiguous",
  });
});

test("server Supabase boundary remains server-only and never accepts an anon key", () => {
  const source = readFileSync("lib/supabase-server.ts", "utf8");

  expect(source.startsWith('import "server-only";')).toBe(true);
  expect(source).not.toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  expect(source).toContain("supabase_service_role_ambiguous");
  expect(source).toContain("resolveServerSupabaseServiceRole(environment)");
});
