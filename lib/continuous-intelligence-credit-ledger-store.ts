import {
  applyContinuousIntelligenceProviderUsageEvidence,
  buildContinuousIntelligenceCreditLedgerEntry,
  type ContinuousIntelligenceCreditLedgerBuilderInput,
  type ContinuousIntelligenceCreditLedgerEntry,
  type ContinuousIntelligenceProviderUsageEvidence,
} from "@/lib/continuous-intelligence-credit-ledger";

export type ContinuousIntelligenceCreditLedgerDatabase = {
  insert: (entry: ContinuousIntelligenceCreditLedgerEntry) => Promise<{
    data: { ledger_entry_id: string } | null;
    error: { code?: string } | null;
  }>;
  update: (entry: ContinuousIntelligenceCreditLedgerEntry) => Promise<{
    data: { ledger_entry_id: string } | null;
    error: { code?: string } | null;
  }>;
  findBySourceReceiptId: (receiptId: string) => Promise<{
    data: ContinuousIntelligenceCreditLedgerEntry | null;
    error: { code?: string } | null;
  }>;
  findByLedgerEntryId: (entryId: string) => Promise<{
    data: ContinuousIntelligenceCreditLedgerEntry | null;
    error: { code?: string } | null;
  }>;
  latest: () => Promise<{
    data: ContinuousIntelligenceCreditLedgerEntry | null;
    error: { code?: string } | null;
  }>;
  listCanaryEntriesForUtcDay: (start: string, end: string) => Promise<{
    data: ContinuousIntelligenceCreditLedgerEntry[] | null;
    error: { code?: string } | null;
  }>;
};

export type ContinuousIntelligenceCreditLedgerPersistenceResult =
  | {
      status: "persisted" | "already_persisted" | "conflict_requires_review";
      source_receipt_id: string;
      ledger_entry_id: string;
      persisted: boolean;
      idempotent: boolean;
      reconciliation_status: ContinuousIntelligenceCreditLedgerEntry["reconciliation_status"];
      safe_blocker_category: "reconciliation_conflict" | null;
    }
  | {
      status: "validation_failed" | "schema_unavailable" | "persistence_failed";
      source_receipt_id: string | null;
      ledger_entry_id: string | null;
      persisted: false;
      idempotent: false;
      reconciliation_status: null;
      safe_blocker_category: "validation_failed" | "schema_unavailable" | "persistence_failed";
    };

export type ContinuousIntelligenceCreditLedgerReadResult =
  | { status: "found"; entry: ContinuousIntelligenceCreditLedgerEntry }
  | { status: "not_found"; entry: null }
  | { status: "schema_unavailable" | "persistence_failed"; entry: null };

const evidenceKeys = new Set([
  "evidence_source",
  "observed_at",
  "request_count_delta",
  "credit_delta",
  "verification_confidence",
]);
const prohibitedKeyPattern = /(?:token|secret|api[_-]?key|candles|ohlcv|raw|payload|url|stack|error)/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasProhibitedKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasProhibitedKey);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, nested]) => prohibitedKeyPattern.test(key) || hasProhibitedKey(nested),
  );
}

function sameEntry(
  left: ContinuousIntelligenceCreditLedgerEntry,
  right: ContinuousIntelligenceCreditLedgerEntry,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function safeFailure(
  status: "validation_failed" | "schema_unavailable" | "persistence_failed",
  sourceReceiptId: string | null = null,
  ledgerEntryId: string | null = null,
): ContinuousIntelligenceCreditLedgerPersistenceResult {
  return {
    status,
    source_receipt_id: sourceReceiptId,
    ledger_entry_id: ledgerEntryId,
    persisted: false,
    idempotent: false,
    reconciliation_status: null,
    safe_blocker_category: status,
  };
}

function success(
  entry: ContinuousIntelligenceCreditLedgerEntry,
  status: "persisted" | "already_persisted",
  idempotent: boolean,
): ContinuousIntelligenceCreditLedgerPersistenceResult {
  if (entry.reconciliation_status === "conflict_requires_review") {
    return {
      status: "conflict_requires_review",
      source_receipt_id: entry.source_receipt_id,
      ledger_entry_id: entry.ledger_entry_id,
      persisted: true,
      idempotent,
      reconciliation_status: entry.reconciliation_status,
      safe_blocker_category: "reconciliation_conflict",
    };
  }
  return {
    status,
    source_receipt_id: entry.source_receipt_id,
    ledger_entry_id: entry.ledger_entry_id,
    persisted: true,
    idempotent,
    reconciliation_status: entry.reconciliation_status,
    safe_blocker_category: null,
  };
}

function isSchemaError(error: { code?: string } | null) {
  return error?.code === "42P01";
}

export function parseContinuousIntelligenceProviderUsageEvidence(
  value: unknown,
): ContinuousIntelligenceProviderUsageEvidence | null {
  if (!isRecord(value) || hasProhibitedKey(value)) return null;
  const keys = Object.keys(value);
  if (keys.length !== evidenceKeys.size || keys.some((key) => !evidenceKeys.has(key))) return null;
  if (
    value.evidence_source !== "provider_usage_snapshot" ||
    value.verification_confidence !== "verified" ||
    typeof value.observed_at !== "string" ||
    !Number.isFinite(Date.parse(value.observed_at)) ||
    (value.request_count_delta !== 0 && value.request_count_delta !== 1) ||
    (value.credit_delta !== 0 && value.credit_delta !== 1)
  ) {
    return null;
  }
  return value as ContinuousIntelligenceProviderUsageEvidence;
}

export function createContinuousIntelligenceCreditLedgerStore(
  database: ContinuousIntelligenceCreditLedgerDatabase | null,
) {
  return {
    async persist(
      input: ContinuousIntelligenceCreditLedgerBuilderInput,
    ): Promise<ContinuousIntelligenceCreditLedgerPersistenceResult> {
      const entry = buildContinuousIntelligenceCreditLedgerEntry(input);
      if (!entry) return safeFailure("validation_failed");
      if (!database) return safeFailure("schema_unavailable", entry.source_receipt_id, entry.ledger_entry_id);
      try {
        const inserted = await database.insert(entry);
        if (!inserted.error) return success(entry, "persisted", false);
        if (inserted.error.code !== "23505") {
          return safeFailure(
            isSchemaError(inserted.error) ? "schema_unavailable" : "persistence_failed",
            entry.source_receipt_id,
            entry.ledger_entry_id,
          );
        }
        const existing = await database.findBySourceReceiptId(entry.source_receipt_id);
        if (existing.error || !existing.data) {
          return safeFailure("persistence_failed", entry.source_receipt_id, entry.ledger_entry_id);
        }
        return sameEntry(existing.data, entry)
          ? success(existing.data, "already_persisted", true)
          : safeFailure("validation_failed", entry.source_receipt_id, entry.ledger_entry_id);
      } catch {
        return safeFailure("persistence_failed", entry.source_receipt_id, entry.ledger_entry_id);
      }
    },
    async reconcile(
      sourceReceiptId: string,
      evidence: ContinuousIntelligenceProviderUsageEvidence,
      now = new Date(),
    ): Promise<ContinuousIntelligenceCreditLedgerPersistenceResult> {
      if (!database || !sourceReceiptId || sourceReceiptId.length > 128) {
        return safeFailure(database ? "validation_failed" : "schema_unavailable", sourceReceiptId || null);
      }
      try {
        const existing = await database.findBySourceReceiptId(sourceReceiptId);
        if (existing.error) {
          return safeFailure(isSchemaError(existing.error) ? "schema_unavailable" : "persistence_failed", sourceReceiptId);
        }
        if (!existing.data) return safeFailure("validation_failed", sourceReceiptId);
        const updated = applyContinuousIntelligenceProviderUsageEvidence(existing.data, evidence, now);
        if (!updated || updated.reconciliation_status === "conflict_requires_review") {
          return {
            status: "conflict_requires_review",
            source_receipt_id: existing.data.source_receipt_id,
            ledger_entry_id: existing.data.ledger_entry_id,
            persisted: false,
            idempotent: false,
            reconciliation_status: "conflict_requires_review",
            safe_blocker_category: "reconciliation_conflict",
          };
        }
        if (sameEntry(existing.data, updated)) return success(existing.data, "already_persisted", true);
        const write = await database.update(updated);
        if (write.error) {
          return safeFailure(isSchemaError(write.error) ? "schema_unavailable" : "persistence_failed", sourceReceiptId, existing.data.ledger_entry_id);
        }
        return success(updated, "persisted", false);
      } catch {
        return safeFailure("persistence_failed", sourceReceiptId);
      }
    },
    async findBySourceReceiptId(sourceReceiptId: string): Promise<ContinuousIntelligenceCreditLedgerReadResult> {
      if (!database) return { status: "schema_unavailable", entry: null };
      try {
        const result = await database.findBySourceReceiptId(sourceReceiptId);
        if (result.error) return { status: isSchemaError(result.error) ? "schema_unavailable" : "persistence_failed", entry: null };
        return result.data ? { status: "found", entry: result.data } : { status: "not_found", entry: null };
      } catch {
        return { status: "persistence_failed", entry: null };
      }
    },
    async findByLedgerEntryId(ledgerEntryId: string): Promise<ContinuousIntelligenceCreditLedgerReadResult> {
      if (!database) return { status: "schema_unavailable", entry: null };
      try {
        const result = await database.findByLedgerEntryId(ledgerEntryId);
        if (result.error) return { status: isSchemaError(result.error) ? "schema_unavailable" : "persistence_failed", entry: null };
        return result.data ? { status: "found", entry: result.data } : { status: "not_found", entry: null };
      } catch {
        return { status: "persistence_failed", entry: null };
      }
    },
    async latest(): Promise<ContinuousIntelligenceCreditLedgerReadResult> {
      if (!database) return { status: "schema_unavailable", entry: null };
      try {
        const result = await database.latest();
        if (result.error) return { status: isSchemaError(result.error) ? "schema_unavailable" : "persistence_failed", entry: null };
        return result.data ? { status: "found", entry: result.data } : { status: "not_found", entry: null };
      } catch {
        return { status: "persistence_failed", entry: null };
      }
    },
    async canaryUsageForUtcDay(start: string, end: string) {
      if (!database) return { status: "schema_unavailable" as const, run_count: null, estimated_credits: null };
      try {
        const result = await database.listCanaryEntriesForUtcDay(start, end);
        if (result.error || !result.data) {
          return { status: isSchemaError(result.error) ? "schema_unavailable" as const : "persistence_failed" as const, run_count: null, estimated_credits: null };
        }
        return {
          status: "available" as const,
          run_count: result.data.length,
          estimated_credits: result.data.reduce(
            (total, entry) => total + (entry.provider_estimated_credits ?? 0),
            0,
          ),
        };
      } catch {
        return { status: "persistence_failed" as const, run_count: null, estimated_credits: null };
      }
    },
  };
}
