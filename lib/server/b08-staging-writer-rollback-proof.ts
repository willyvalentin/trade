import "server-only";

import { timingSafeEqual } from "node:crypto";

import {
  executePositionVersionLineageV2WriterAuthenticatedServerCommandPort,
} from "./position-version-lineage-v2-writer-authenticated-server-command-port";
import {
  executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof,
} from "./position-version-lineage-v2-writer-private-postgresql-transport";

export const B08_STAGING_WRITER_ROLLBACK_PROOF_TOKEN_SECRET =
  "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_TOKEN" as const;

// These synthetic identifiers are fixed so the operator can create, inspect,
// and remove precisely one staging fixture around the one admitted proof call.
// They are not accepted from the HTTP request and do not identify a user.
export const B08_STAGING_WRITER_ROLLBACK_PROOF_FIXTURE_OWNER =
  "a8d3c8a4-7a65-4ac1-8ef4-0d54d6a570e7" as const;

export const B08_STAGING_WRITER_ROLLBACK_PROOF_FIXTURE_RECOMMENDATION =
  "b9e4d9b5-8b76-4bd2-9fa5-1e65e7b681f8" as const;

const CANONICAL_PROOF_TOKEN = /^[a-f0-9]{64}$/;

export type B08StagingWriterRollbackProofDependencies = Readonly<{
  executeCommand: (input: unknown) => Promise<unknown>;
}>;

export type B08StagingWriterRollbackProofOptions = Readonly<{
  environment?: Readonly<Record<string, string | undefined>>;
  dependencies?: B08StagingWriterRollbackProofDependencies;
}>;

export class B08StagingWriterRollbackProofAuthorizationError extends Error {
  constructor() {
    super("b08_staging_writer_rollback_proof_unauthorized");
    this.name = "B08StagingWriterRollbackProofAuthorizationError";
  }
}

export class B08StagingWriterRollbackProofConfigurationError extends Error {
  constructor() {
    super("b08_staging_writer_rollback_proof_unavailable");
    this.name = "B08StagingWriterRollbackProofConfigurationError";
  }
}

function isCanonicalProofToken(value: unknown): value is string {
  return typeof value === "string" && CANONICAL_PROOF_TOKEN.test(value);
}

function isAuthorized(suppliedToken: unknown, expectedToken: string): boolean {
  if (!isCanonicalProofToken(suppliedToken)) return false;

  return timingSafeEqual(
    Buffer.from(suppliedToken, "utf8"),
    Buffer.from(expectedToken, "utf8"),
  );
}

const DEFAULT_DEPENDENCIES: B08StagingWriterRollbackProofDependencies = Object.freeze({
  executeCommand: async (input) =>
    executePositionVersionLineageV2WriterAuthenticatedServerCommandPort(input, {
      resolveAuthenticatedServerOwnerContext: async () =>
        Object.freeze({
          authenticatedServerOwner: B08_STAGING_WRITER_ROLLBACK_PROOF_FIXTURE_OWNER,
        }),
      executePrivateTransport:
        executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof,
    }),
});

/**
 * Runs exactly one temporary, token-gated B-08 staging proof. The command is
 * bound to the fixed synthetic fixture and the private transport always rolls
 * its transaction back. No receipt, identifier, or database value is exposed
 * to the caller. This module and its branch-deploy secret are removed directly
 * after the proof.
 */
export async function executeB08StagingWriterRollbackProof(
  suppliedToken: unknown,
  options: B08StagingWriterRollbackProofOptions = {},
): Promise<Readonly<{ outcome: "rolled_back" }>> {
  const expectedToken = (options.environment ?? process.env)[
    B08_STAGING_WRITER_ROLLBACK_PROOF_TOKEN_SECRET
  ];

  if (!isCanonicalProofToken(expectedToken)) {
    throw new B08StagingWriterRollbackProofConfigurationError();
  }

  if (!isAuthorized(suppliedToken, expectedToken)) {
    throw new B08StagingWriterRollbackProofAuthorizationError();
  }

  await (options.dependencies ?? DEFAULT_DEPENDENCIES).executeCommand({
    opaqueRecommendationReference: B08_STAGING_WRITER_ROLLBACK_PROOF_FIXTURE_RECOMMENDATION,
  });

  return Object.freeze({ outcome: "rolled_back" as const });
}
