import "server-only";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION_VERSION,
} from "@/lib/transactional-recommendation-position-writer-implementation-authority-decision";

// This is deliberately a server-only adapter around an injected command port.
// It does not create a database client or select a concrete persistence path.
export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_PRIVATE_ADAPTER_VERSION =
  "transactional_recommendation_position_writer_private_server_adapter_v1" as const;

export const TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_PRIVATE_COMMAND_VERSION =
  "application_open_owned_position_v1" as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TICKER_PATTERN = /^[A-Z][A-Z0-9.\-/]{0,14}$/;

export type AuthenticatedServerOwnerContext = Readonly<{
  ownerUserId: string;
  source: "authenticated_server_session";
}>;

export type TransactionalRecommendationPositionWriterCommand = Readonly<{
  recommendationId: string;
  ticker: string;
  companyName: string;
  entryPrice: number;
  positionSize: number;
  currentStop: number;
  target1: number;
  target2: number;
  executionMetadata?: Readonly<Record<string, unknown>> | null;
}>;

export type TransactionalRecommendationPositionWriterCommandResult = Readonly<{
  positionId: string;
  disposition: "created" | "reused";
  snapshotLinkCount: number;
}>;

export type OwnerBoundPositionCommandPort = Readonly<{
  openOwnedPosition(
    owner: AuthenticatedServerOwnerContext,
    command: TransactionalRecommendationPositionWriterCommand,
  ): Promise<TransactionalRecommendationPositionWriterCommandResult>;
}>;

export type TransactionalRecommendationPositionWriterResult =
  | Readonly<{
      status: "created" | "replayed";
      positionId: string;
      snapshotLinkCount: number;
    }>
  | Readonly<{ status: "invalid" | "failed" }>;

export type TransactionalRecommendationPositionWriter = Readonly<{
  adapterVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_PRIVATE_ADAPTER_VERSION;
  authorityDecisionVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION_VERSION;
  commandVersion: typeof TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_PRIVATE_COMMAND_VERSION;
  write(
    owner: AuthenticatedServerOwnerContext,
    command: TransactionalRecommendationPositionWriterCommand,
  ): Promise<TransactionalRecommendationPositionWriterResult>;
}>;

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAuthenticatedServerOwner(
  owner: unknown,
): owner is AuthenticatedServerOwnerContext {
  return (
    isRecord(owner) &&
    owner.source === "authenticated_server_session" &&
    typeof owner.ownerUserId === "string" &&
    UUID_PATTERN.test(owner.ownerUserId)
  );
}

function isValidCommand(
  command: unknown,
): command is TransactionalRecommendationPositionWriterCommand {
  if (!isRecord(command)) return false;
  const metadata = command.executionMetadata;
  return (
    typeof command.recommendationId === "string" &&
    UUID_PATTERN.test(command.recommendationId) &&
    typeof command.ticker === "string" &&
    TICKER_PATTERN.test(command.ticker) &&
    typeof command.companyName === "string" &&
    command.companyName.trim().length > 0 &&
    isFinitePositiveNumber(command.entryPrice) &&
    isFinitePositiveNumber(command.positionSize) &&
    isFinitePositiveNumber(command.currentStop) &&
    isFinitePositiveNumber(command.target1) &&
    isFinitePositiveNumber(command.target2) &&
    (metadata === undefined || metadata === null || isRecord(metadata))
  );
}

function isValidCommandResult(
  result: unknown,
): result is TransactionalRecommendationPositionWriterCommandResult {
  return (
    isRecord(result) &&
    typeof result.positionId === "string" &&
    UUID_PATTERN.test(result.positionId) &&
    (result.disposition === "created" || result.disposition === "reused") &&
    typeof result.snapshotLinkCount === "number" &&
    Number.isInteger(result.snapshotLinkCount) &&
    result.snapshotLinkCount > 0
  );
}

export function createTransactionalRecommendationPositionWriter(
  commandPort: OwnerBoundPositionCommandPort,
): TransactionalRecommendationPositionWriter {
  return Object.freeze({
    adapterVersion: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_PRIVATE_ADAPTER_VERSION,
    authorityDecisionVersion:
      TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION_VERSION,
    commandVersion: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_PRIVATE_COMMAND_VERSION,
    async write(owner, command) {
      if (!isAuthenticatedServerOwner(owner) || !isValidCommand(command)) {
        return { status: "invalid" };
      }

      try {
        const result = await commandPort.openOwnedPosition(owner, command);
        if (!isValidCommandResult(result)) return { status: "failed" };

        return result.disposition === "created"
          ? {
              status: "created",
              positionId: result.positionId,
              snapshotLinkCount: result.snapshotLinkCount,
            }
          : {
              status: "replayed",
              positionId: result.positionId,
              snapshotLinkCount: result.snapshotLinkCount,
            };
      } catch {
        return { status: "failed" };
      }
    },
  } as const satisfies TransactionalRecommendationPositionWriter);
}
