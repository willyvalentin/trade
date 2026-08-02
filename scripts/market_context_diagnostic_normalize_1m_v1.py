#!/usr/bin/env python3
"""Deterministic diagnostic-only normalization of the admitted M.5F raw set.

This module has no provider, network, database, replay, or live integration.
It consumes only explicitly admitted local DBN files and writes diagnostic
artifacts beneath a caller-supplied encrypted output root.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
import stat
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, BinaryIO

import databento_dbn
import zstandard
from databento import DBNStore


NORMALIZER_VERSION = "market_context_diagnostic_trade_to_candle_normalization_v1"
CANDLE_SCHEMA = "market_context_diagnostic_all_reported_trades_1m_candle_v1"
DISPOSITION_SCHEMA = "market_context_diagnostic_raw_record_disposition_v1"
GAP_COVERAGE_SCHEMA = "market_context_diagnostic_gap_coverage_report_v1"
DUPLICATE_IMPACT_SCHEMA = "market_context_diagnostic_duplicate_impact_report_v1"
BREADTH_SCHEMA = "market_context_diagnostic_eleven_sector_etf_breadth_v1"
DATASET_MANIFEST_SCHEMA = "market_context_diagnostic_normalized_dataset_manifest_v1"
DUPLICATE_POLICY = "include_each_unique_raw_identity_no_deduplication_v1"
NAMESPACE = "shadow.diagnostic.all_reported_trades.candles.v1"
WATERMARK_IDENTITY = "market_context_provisional_diagnostic_watermark_2s_v1"
WATERMARK_NS = 2_000_000_000
MINUTE_NS = 60_000_000_000
PRICE_SCALE = 1_000_000_000

EXPECTED_RAW_ROOT = (
    "7b9d1bdc9e9f75df2424f31da1e194a80f7ec875a34f38cd8782e6a72c09ac51"
)
EXPECTED_CALENDAR_ROOT = (
    "1858e43c4e1992cb68c840209e0c2f5a098ab3a01798b85ab3b3bbef587df109"
)
EXPECTED_M5F_EVIDENCE = (
    "169ea4defec513ea2c661f14408974ab5632be106d4727911a8e1ddc5cd282db"
)
EXPECTED_M5F_REPORT = (
    "f89ba8123f48c0553e3aa03a361edde1c5f593c8a953d44e385983ca7dc5abe4"
)
EXPECTED_M5G_EVIDENCE = (
    "aba25a4bdc5f1844678b40172e0f7caede1c4dae94625981ef2eae05b6c5dfd4"
)
EXPECTED_RECORD_COUNT = 2_420_049
EXPECTED_CORE_RECORD_COUNT = 2_411_730
EXPECTED_EXACT_DUPLICATE_COUNT = 3_399
EXPECTED_ACTIONS = {"T": EXPECTED_RECORD_COUNT}
EXPECTED_FLAGS = {"0": 597_734, "128": 1_822_315}
SYMBOLS = (
    "QQQ",
    "SPY",
    "XLB",
    "XLC",
    "XLE",
    "XLF",
    "XLI",
    "XLK",
    "XLP",
    "XLRE",
    "XLU",
    "XLV",
    "XLY",
)
SECTOR_ETFS = (
    "XLB",
    "XLC",
    "XLE",
    "XLF",
    "XLI",
    "XLK",
    "XLP",
    "XLRE",
    "XLU",
    "XLV",
    "XLY",
)
MARKERS = {
    "diagnostic_all_reported_trades": True,
    "official_ohlcv_claimed": False,
    "canonical_performance_eligible": False,
    "sale_condition_semantics_available": False,
    "raw_unadjusted": True,
    "corporate_actions_applied": False,
    "watermark_status": "empirically_unvalidated",
    "live_ranking_effect": False,
}


class AdmissionError(RuntimeError):
    """Fail-closed normalization admission error."""


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, value: Any) -> dict[str, Any]:
    payload = canonical_bytes(value) + b"\n"
    with path.open("xb") as stream:
        stream.write(payload)
    os.chmod(path, 0o600)
    return {
        "path": path,
        "size_bytes": len(payload),
        "sha256": sha256_bytes(payload),
    }


def normalized_inventory_entry(root: Path, item: dict[str, Any]) -> dict[str, Any]:
    return {
        "relative_path": item["path"].relative_to(root).as_posix(),
        "size_bytes": item["size_bytes"],
        "sha256": item["sha256"],
    }


class DeterministicZstdNdjsonWriter:
    def __init__(self, path: Path):
        self.path = path
        self.raw: BinaryIO = path.open("xb")
        os.chmod(path, 0o600)
        compressor = zstandard.ZstdCompressor(
            level=10,
            threads=0,
            write_checksum=True,
            write_content_size=False,
        )
        self.writer = compressor.stream_writer(
            self.raw,
            closefd=False,
        )
        self.count = 0

    def write(self, value: Any) -> None:
        self.writer.write(canonical_bytes(value) + b"\n")
        self.count += 1

    def close(self) -> dict[str, Any]:
        self.writer.flush(zstandard.FLUSH_FRAME)
        self.writer.close()
        self.raw.close()
        return {
            "path": self.path,
            "size_bytes": self.path.stat().st_size,
            "sha256": sha256_file(self.path),
            "row_count": self.count,
        }


def evidence_digest(path: Path, material_key: str) -> tuple[dict[str, Any], str]:
    value = json.loads(path.read_text(encoding="utf-8"))
    actual = sha256_bytes(canonical_bytes(value[material_key]))
    if actual != value["evidence_digest"]:
        raise AdmissionError(f"evidence_digest_mismatch:{path.name}")
    return value, actual


def report_digest(path: Path) -> tuple[dict[str, Any], str]:
    value = json.loads(path.read_text(encoding="utf-8"))
    actual = sha256_bytes(canonical_bytes(value["report"]))
    if actual != value["report_digest"]:
        raise AdmissionError(f"report_digest_mismatch:{path.name}")
    return value, actual


def calendar_sessions(
    repo: Path,
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    sessions: list[dict[str, Any]] = []
    calendar_digests: list[dict[str, str]] = []
    paths = (
        repo / "docs/evidence/market-context-xnys-calibration-calendar-2026-v1.json",
        repo / "docs/evidence/market-context-xnys-acquisition-calendar-2026-v1.json",
    )
    for path in paths:
        value = json.loads(path.read_text(encoding="utf-8"))
        material = value["canonical_json_material"]
        digest = sha256_bytes(canonical_bytes(material))
        if digest != value["canonical_json_sha256"]:
            raise AdmissionError(f"calendar_digest_mismatch:{path.name}")
        calendar_digests.append(
            {
                "artifact_version": value["artifact_version"],
                "sha256": digest,
            }
        )
        for session in material["sessions"]:
            if (
                session["early_close"] is not False
                or session["session_type"] != "regular"
            ):
                raise AdmissionError("non_regular_or_early_close_session")
            sessions.append(
                {
                    "date": session["date"],
                    "open_unix_ns": int(session["open_unix_ns"]),
                    "close_unix_ns": int(session["close_unix_ns"]),
                }
            )
    sessions.sort(key=lambda item: item["date"])
    if len(sessions) != 20 or len({item["date"] for item in sessions}) != 20:
        raise AdmissionError("calendar_not_exactly_twenty_unique_sessions")
    calendar_digests.sort(key=lambda item: item["artifact_version"])
    return sessions, calendar_digests


def preflight(
    repo: Path,
    pilot_dir: Path,
    calibration_dir: Path,
    output_dir: Path,
    allowed_output_root: Path,
) -> dict[str, Any]:
    if repo.resolve() == allowed_output_root.resolve() or repo.resolve() in output_dir.resolve().parents:
        raise AdmissionError("output_must_be_outside_git")
    resolved_output = output_dir.resolve()
    resolved_allowed = allowed_output_root.resolve()
    if resolved_output == resolved_allowed or resolved_allowed not in resolved_output.parents:
        raise AdmissionError("output_outside_encrypted_normalization_root")
    if output_dir.exists():
        raise AdmissionError("output_directory_already_exists")

    m5f_evidence, m5f_digest = evidence_digest(
        repo / "docs/evidence/action-667m5f-twenty-session-raw-admission.json",
        "decision_material",
    )
    if m5f_digest != EXPECTED_M5F_EVIDENCE:
        raise AdmissionError("m5f_evidence_drift")
    m5f_report, m5f_report_digest = report_digest(
        repo / "docs/evidence/action-667m5f-twenty-session-receive-lag-report.json"
    )
    if m5f_report_digest != EXPECTED_M5F_REPORT:
        raise AdmissionError("m5f_report_drift")
    _, m5g_digest = evidence_digest(
        repo / "docs/evidence/action-667m5g-sale-condition-gap-decision.json",
        "decision_material",
    )
    if m5g_digest != EXPECTED_M5G_EVIDENCE:
        raise AdmissionError("m5g_evidence_drift")

    admitted = m5f_evidence["decision_material"]["combined_record_reconciliation"]
    if (
        admitted["decoded_record_count"] != EXPECTED_RECORD_COUNT
        or admitted["core_session_record_count"] != EXPECTED_CORE_RECORD_COUNT
        or admitted["publisher_ids"] != {"95": EXPECTED_RECORD_COUNT}
        or admitted["actions"] != EXPECTED_ACTIONS
        or admitted["flags"] != EXPECTED_FLAGS
        or admitted["sequence_nonzero_count"] != 0
        or admitted["undefined_or_sentinel_count"] != 0
        or admitted["event_outside_dataset_range_count"] != 0
        or admitted["receive_outside_dataset_range_count"] != 0
        or admitted["event_outside_source_file_date_count"] != 0
        or admitted["exact_duplicate_record_count"] != EXPECTED_EXACT_DUPLICATE_COUNT
    ):
        raise AdmissionError("m5f_record_or_scope_admission_drift")
    calibration = m5f_evidence["decision_material"]["calibration_raw_admission"]
    if (
        calibration["unknown_action_count"] != 0
        or calibration["unknown_flag_bit_count"] != 0
        or calibration["negative_receive_lag_count"] != 0
        or calibration["fallback_identity_collision_count"] != 0
    ):
        raise AdmissionError("m5f_unknown_or_unsafe_record_semantics")

    sessions, calendar_components = calendar_sessions(repo)
    metadata_evidence = m5f_report["report"]["dbn_metadata"]
    expected_components = [
        {
            "artifact_version": version,
            "sha256": digest,
        }
        for version, digest in zip(
            metadata_evidence["calendar_artifact_versions"],
            metadata_evidence["calendar_component_sha256"],
        )
    ]
    expected_components.sort(key=lambda item: item["artifact_version"])
    if (
        calendar_components != expected_components
        or metadata_evidence["combined_calendar_sha256"]
        != EXPECTED_CALENDAR_ROOT
    ):
        raise AdmissionError("calendar_component_or_combined_digest_drift")
    expected_raw = m5f_report["report"]["input"]["raw_files"]
    actual_raw: list[dict[str, Any]] = []
    input_paths: list[dict[str, Any]] = []
    for item in expected_raw:
        base = calibration_dir if item["source_group"] == "calibration" else pilot_dir
        path = base / item["filename"]
        if not path.is_file() or path.is_symlink():
            raise AdmissionError(f"raw_file_missing_or_symlink:{item['filename']}")
        if stat.S_IMODE(path.stat().st_mode) != 0o600:
            raise AdmissionError(f"raw_file_mode_invalid:{item['filename']}")
        actual = {
            "filename": item["filename"],
            "sha256": sha256_file(path),
            "size_bytes": path.stat().st_size,
            "source_group": item["source_group"],
        }
        if actual != item:
            raise AdmissionError(f"raw_file_identity_drift:{item['filename']}")
        actual_raw.append(actual)
        input_paths.append({**actual, "path": path})
    actual_names = {
        child.name
        for directory in (pilot_dir, calibration_dir)
        for child in directory.iterdir()
        if child.is_file()
    }
    if actual_names != {item["filename"] for item in expected_raw}:
        raise AdmissionError("raw_file_inventory_extra_or_missing")
    if any(
        stat.S_IMODE(directory.stat().st_mode) != 0o700
        for directory in (pilot_dir, calibration_dir)
    ):
        raise AdmissionError("raw_directory_mode_invalid")
    raw_root = sha256_bytes(canonical_bytes(actual_raw))
    if raw_root != EXPECTED_RAW_ROOT:
        raise AdmissionError("combined_raw_file_digest_root_drift")

    provenance = m5f_evidence["decision_material"]["decoder_provenance"]
    native_path = Path(databento_dbn._lib.__file__)
    module_path = Path(databento_dbn.__file__)
    if (
        importlib.metadata.version("databento-dbn") != provenance["decoder_version"]
        or importlib.metadata.version("databento") != provenance["client_version"]
        or sha256_file(native_path) != provenance["decoder_native_build_sha256"]
        or sha256_file(module_path) != provenance["decoder_python_module_sha256"]
    ):
        raise AdmissionError("decoder_version_or_build_drift")

    return {
        "sessions": sessions,
        "input_paths": sorted(input_paths, key=lambda item: item["filename"]),
        "raw_files": actual_raw,
        "raw_root": raw_root,
        "calendar_digest": EXPECTED_CALENDAR_ROOT,
        "calendar_components": calendar_components,
        "m5f_evidence_digest": m5f_digest,
        "m5f_report_digest": m5f_report_digest,
        "m5g_evidence_digest": m5g_digest,
        "decoder": provenance,
    }


def instrument_map(store: DBNStore, session_date: str) -> dict[int, str]:
    if (
        str(store.schema) != "trades"
        or str(store.compression) != "zstd"
        or store.metadata.dataset != "EQUS.MINI"
        or sorted(store.metadata.symbols) != sorted(SYMBOLS)
        or store.metadata.partial
        or store.metadata.not_found
    ):
        raise AdmissionError(f"dbn_metadata_scope_drift:{session_date}")
    result: dict[int, str] = {}
    for raw_symbol, intervals in store.metadata.mappings.items():
        if raw_symbol not in SYMBOLS:
            raise AdmissionError(f"unexpected_mapped_symbol:{raw_symbol}")
        matching = [
            interval
            for interval in intervals
            if str(interval["start_date"]) <= session_date < str(interval["end_date"])
        ]
        if len(matching) != 1:
            raise AdmissionError(f"ambiguous_instrument_mapping:{raw_symbol}:{session_date}")
        instrument_id = int(matching[0]["symbol"])
        if instrument_id in result:
            raise AdmissionError(f"duplicate_instrument_mapping:{instrument_id}")
        result[instrument_id] = raw_symbol
    if set(result.values()) != set(SYMBOLS):
        raise AdmissionError(f"incomplete_instrument_mapping:{session_date}")
    return result


def empty_bucket() -> dict[str, Any]:
    return {
        "records": [],
        "open_key": None,
        "open_price": None,
        "close_key": None,
        "close_price": None,
        "high": None,
        "low": None,
        "volume": 0,
        "trade_count": 0,
        "first_event": None,
        "last_event": None,
        "first_receive": None,
        "last_receive": None,
        "after_watermark_count": 0,
        "duplicate_count": 0,
        "duplicate_volume": 0,
        "dedup_open_key": None,
        "dedup_open_price": None,
        "dedup_close_key": None,
        "dedup_close_price": None,
        "dedup_high": None,
        "dedup_low": None,
        "dedup_volume": 0,
        "dedup_trade_count": 0,
    }


def update_aggregate(
    bucket: dict[str, Any],
    order_key: tuple[int, str, int],
    price: int,
    size: int,
    ts_event: int,
    ts_recv: int,
    record_identity: str,
    duplicate: bool,
) -> None:
    bucket["records"].append((order_key, record_identity))
    if bucket["open_key"] is None or order_key < bucket["open_key"]:
        bucket["open_key"] = order_key
        bucket["open_price"] = price
    if bucket["close_key"] is None or order_key > bucket["close_key"]:
        bucket["close_key"] = order_key
        bucket["close_price"] = price
    bucket["high"] = price if bucket["high"] is None else max(bucket["high"], price)
    bucket["low"] = price if bucket["low"] is None else min(bucket["low"], price)
    bucket["volume"] += size
    bucket["trade_count"] += 1
    bucket["first_event"] = (
        ts_event if bucket["first_event"] is None else min(bucket["first_event"], ts_event)
    )
    bucket["last_event"] = (
        ts_event if bucket["last_event"] is None else max(bucket["last_event"], ts_event)
    )
    bucket["first_receive"] = (
        ts_recv if bucket["first_receive"] is None else min(bucket["first_receive"], ts_recv)
    )
    bucket["last_receive"] = (
        ts_recv if bucket["last_receive"] is None else max(bucket["last_receive"], ts_recv)
    )
    if duplicate:
        bucket["duplicate_count"] += 1
        bucket["duplicate_volume"] += size
        return
    if bucket["dedup_open_key"] is None or order_key < bucket["dedup_open_key"]:
        bucket["dedup_open_key"] = order_key
        bucket["dedup_open_price"] = price
    if bucket["dedup_close_key"] is None or order_key > bucket["dedup_close_key"]:
        bucket["dedup_close_key"] = order_key
        bucket["dedup_close_price"] = price
    bucket["dedup_high"] = (
        price if bucket["dedup_high"] is None else max(bucket["dedup_high"], price)
    )
    bucket["dedup_low"] = (
        price if bucket["dedup_low"] is None else min(bucket["dedup_low"], price)
    )
    bucket["dedup_volume"] += size
    bucket["dedup_trade_count"] += 1


def row_bytes(row: Any) -> bytes:
    return row.tobytes()


def action_string(value: Any) -> str:
    raw = bytes(value)
    return raw.decode("ascii")


def process_file(
    output_root: Path,
    item: dict[str, Any],
    session: dict[str, Any],
    seen_records: dict[bytes, str],
    global_counters: dict[str, Any],
) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, dict[int, dict[str, Any]]]]:
    session_date = session["date"]
    raw_path: Path = item["path"]
    file_sha = item["sha256"]
    store = DBNStore.from_file(raw_path)
    mapping = instrument_map(store, session_date)
    if (
        int(store.metadata.start) > session["open_unix_ns"]
        or int(store.metadata.end) < session["close_unix_ns"]
    ):
        raise AdmissionError(f"dbn_metadata_time_scope_invalid:{session_date}")

    disposition_dir = output_root / "record-dispositions"
    disposition_dir.mkdir(exist_ok=True)
    os.chmod(disposition_dir, 0o700)
    disposition_writer = DeterministicZstdNdjsonWriter(
        disposition_dir / f"{session_date}.record-dispositions.ndjson.zst"
    )
    buckets: dict[str, dict[int, dict[str, Any]]] = {
        symbol: {} for symbol in SYMBOLS
    }
    ordinal = 0
    local_actions: Counter[str] = Counter()
    local_flags: Counter[str] = Counter()
    local_included = 0
    local_excluded_before = 0
    local_excluded_after = 0
    local_duplicates = 0
    local_duplicate_core = 0
    local_duplicate_core_volume = 0
    try:
        for chunk in store.to_ndarray(count=100_000):
            for row in chunk:
                record_identity = f"{file_sha}:{ordinal}"
                raw_record_bytes = row_bytes(row)
                first_identity = seen_records.get(raw_record_bytes)
                duplicate = first_identity is not None
                if not duplicate:
                    seen_records[raw_record_bytes] = record_identity
                else:
                    local_duplicates += 1

                publisher = int(row["publisher_id"])
                instrument_id = int(row["instrument_id"])
                action = action_string(row["action"])
                flags = int(row["flags"])
                ts_event = int(row["ts_event"])
                ts_recv = int(row["ts_recv"])
                price = int(row["price"])
                size = int(row["size"])
                sequence = int(row["sequence"])
                local_actions[action] += 1
                local_flags[str(flags)] += 1

                if publisher != 95:
                    raise AdmissionError(f"publisher_drift:{session_date}:{ordinal}")
                if instrument_id not in mapping:
                    raise AdmissionError(f"unknown_instrument:{session_date}:{ordinal}")
                if action != "T":
                    raise AdmissionError(f"unknown_action:{session_date}:{ordinal}:{action}")
                if flags not in (0, 128):
                    raise AdmissionError(f"unknown_flag:{session_date}:{ordinal}:{flags}")
                if sequence != 0:
                    raise AdmissionError(f"sequence_drift:{session_date}:{ordinal}")
                if price <= 0 or size <= 0:
                    raise AdmissionError(f"invalid_price_or_size:{session_date}:{ordinal}")
                if ts_recv < ts_event:
                    raise AdmissionError(f"negative_receive_lag:{session_date}:{ordinal}")

                symbol = mapping[instrument_id]
                if ts_event < session["open_unix_ns"]:
                    disposition = "excluded"
                    reason = "before_core_session"
                    bucket_identity = None
                    local_excluded_before += 1
                elif ts_event >= session["close_unix_ns"]:
                    disposition = "excluded"
                    reason = "after_core_session"
                    bucket_identity = None
                    local_excluded_after += 1
                else:
                    bucket_start = (
                        session["open_unix_ns"]
                        + (
                            (ts_event - session["open_unix_ns"])
                            // MINUTE_NS
                        )
                        * MINUTE_NS
                    )
                    bucket_identity = f"{symbol}:{session_date}:{bucket_start}"
                    disposition = "included"
                    reason = "diagnostic_all_reported_trade"
                    local_included += 1
                    bucket = buckets[symbol].setdefault(
                        bucket_start,
                        empty_bucket(),
                    )
                    if ts_recv > bucket_start + MINUTE_NS + WATERMARK_NS:
                        bucket["after_watermark_count"] += 1
                        global_counters["after_watermark_count"] += 1
                    order_key = (ts_event, file_sha, ordinal)
                    update_aggregate(
                        bucket,
                        order_key,
                        price,
                        size,
                        ts_event,
                        ts_recv,
                        record_identity,
                        duplicate,
                    )
                    if duplicate:
                        local_duplicate_core += 1
                        local_duplicate_core_volume += size

                disposition_writer.write(
                    {
                        "schema_version": DISPOSITION_SCHEMA,
                        "record_identity": record_identity,
                        "source_file_sha256": file_sha,
                        "zero_based_record_ordinal": ordinal,
                        "disposition": disposition,
                        "reason_code": reason,
                        "bucket_identity": bucket_identity,
                        "duplicate_of_prior_raw_record": duplicate,
                        "duplicate_of_record_identity": first_identity,
                    }
                )
                ordinal += 1
    except Exception:
        disposition_writer.close()
        raise
    disposition_artifact = disposition_writer.close()

    global_counters["record_count"] += ordinal
    global_counters["core_record_count"] += local_included
    global_counters["before_core_count"] += local_excluded_before
    global_counters["after_core_count"] += local_excluded_after
    global_counters["duplicate_count"] += local_duplicates
    global_counters["duplicate_core_count"] += local_duplicate_core
    global_counters["duplicate_core_volume"] += local_duplicate_core_volume
    global_counters["actions"].update(local_actions)
    global_counters["flags"].update(local_flags)

    per_file = {
        "filename": item["filename"],
        "session_date": session_date,
        "source_file_sha256": file_sha,
        "record_count": ordinal,
        "core_included_record_count": local_included,
        "before_core_excluded_record_count": local_excluded_before,
        "after_core_excluded_record_count": local_excluded_after,
        "exact_duplicate_occurrence_count": local_duplicates,
        "included_duplicate_occurrence_count": local_duplicate_core,
        "included_duplicate_volume": str(local_duplicate_core_volume),
        "actions": dict(sorted(local_actions.items())),
        "flags": dict(sorted(local_flags.items())),
        "record_disposition_artifact": {
            "relative_path": disposition_artifact["path"]
            .relative_to(output_root)
            .as_posix(),
            "size_bytes": disposition_artifact["size_bytes"],
            "sha256": disposition_artifact["sha256"],
            "row_count": disposition_artifact["row_count"],
        },
    }
    return [disposition_artifact], per_file, buckets


def candle_row(
    session_date: str,
    symbol: str,
    bucket_start: int,
    bucket: dict[str, Any] | None,
) -> dict[str, Any]:
    bucket_end = bucket_start + MINUTE_NS
    bucket_identity = f"{symbol}:{session_date}:{bucket_start}"
    if bucket is None:
        return {
            "type": "gap",
            "bucket_identity": bucket_identity,
            "bucket_start_unix_ns": str(bucket_start),
            "bucket_end_unix_ns": str(bucket_end),
            "reason_code": "no_eligible_reported_trade_in_core_minute",
            "forward_filled": False,
            "interpolated": False,
        }
    ordered_identities = [
        identity for _, identity in sorted(bucket["records"])
    ]
    lineage_root = sha256_bytes(canonical_bytes(ordered_identities))
    return {
        "type": "candle",
        "bucket_identity": bucket_identity,
        "bucket_start_unix_ns": str(bucket_start),
        "bucket_end_unix_ns": str(bucket_end),
        "finalization_watermark_unix_ns": str(
            bucket_end + WATERMARK_NS
        ),
        "open_price_scaled": str(bucket["open_price"]),
        "high_price_scaled": str(bucket["high"]),
        "low_price_scaled": str(bucket["low"]),
        "close_price_scaled": str(bucket["close_price"]),
        "price_scale": str(PRICE_SCALE),
        "volume": str(bucket["volume"]),
        "trade_count": bucket["trade_count"],
        "first_ts_event_unix_ns": str(bucket["first_event"]),
        "last_ts_event_unix_ns": str(bucket["last_event"]),
        "first_ts_recv_unix_ns": str(bucket["first_receive"]),
        "last_ts_recv_unix_ns": str(bucket["last_receive"]),
        "records_after_provisional_watermark": bucket[
            "after_watermark_count"
        ],
        "included_duplicate_occurrence_count": bucket[
            "duplicate_count"
        ],
        "included_duplicate_volume": str(bucket["duplicate_volume"]),
        "raw_record_identity_count": len(ordered_identities),
        "raw_record_identity_root_sha256": lineage_root,
        "forward_filled": False,
        "interpolated": False,
    }


def write_session_artifacts(
    output_root: Path,
    session: dict[str, Any],
    buckets: dict[str, dict[int, dict[str, Any]]],
) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    session_date = session["date"]
    candle_dir = output_root / "candles" / session_date
    candle_dir.mkdir(parents=True, exist_ok=False)
    os.chmod(candle_dir.parent, 0o700)
    os.chmod(candle_dir, 0o700)
    artifacts: list[dict[str, Any]] = []
    coverage_rows: list[dict[str, Any]] = []
    rows_by_symbol: dict[str, list[dict[str, Any]]] = {}
    duplicate_changed_candles = 0
    duplicate_affected_candles = 0

    for symbol in SYMBOLS:
        rows: list[dict[str, Any]] = []
        observed = 0
        gaps = 0
        symbol_duplicate_count = 0
        symbol_duplicate_volume = 0
        for bucket_start in range(
            session["open_unix_ns"],
            session["close_unix_ns"],
            MINUTE_NS,
        ):
            bucket = buckets[symbol].get(bucket_start)
            row = candle_row(session_date, symbol, bucket_start, bucket)
            rows.append(row)
            if bucket is None:
                gaps += 1
                continue
            observed += 1
            symbol_duplicate_count += bucket["duplicate_count"]
            symbol_duplicate_volume += bucket["duplicate_volume"]
            if bucket["duplicate_count"]:
                duplicate_affected_candles += 1
                actual = (
                    bucket["open_price"],
                    bucket["high"],
                    bucket["low"],
                    bucket["close_price"],
                )
                dedup = (
                    bucket["dedup_open_price"],
                    bucket["dedup_high"],
                    bucket["dedup_low"],
                    bucket["dedup_close_price"],
                )
                if actual != dedup:
                    duplicate_changed_candles += 1
        rows_by_symbol[symbol] = rows
        partition = {
            "schema_version": CANDLE_SCHEMA,
            "normalizer_version": NORMALIZER_VERSION,
            "namespace": NAMESPACE,
            "partition": {
                "session_date": session_date,
                "symbol": symbol,
                "exchange": "XNYS",
                "interval": "1min",
                "row_count": 390,
            },
            "markers": MARKERS,
            "duplicate_policy": DUPLICATE_POLICY,
            "watermark": {
                "identity": WATERMARK_IDENTITY,
                "value_ns": str(WATERMARK_NS),
                "status": "empirically_unvalidated",
                "provider_certified": False,
                "production_ready": False,
            },
            "rows": rows,
            "summary": {
                "candle_count": observed,
                "gap_count": gaps,
                "coverage_ratio": f"{observed / 390:.12f}",
                "included_duplicate_occurrence_count": symbol_duplicate_count,
                "included_duplicate_volume": str(symbol_duplicate_volume),
            },
        }
        artifact = write_json(
            candle_dir / f"{symbol}.diagnostic-1m.json",
            partition,
        )
        artifacts.append(artifact)
        coverage_rows.append(
            {
                "session_date": session_date,
                "symbol": symbol,
                "expected_minutes": 390,
                "candle_count": observed,
                "gap_count": gaps,
                "coverage_ratio": f"{observed / 390:.12f}",
            }
        )

    breadth_rows: list[dict[str, Any]] = []
    for minute_index in range(390):
        advancing = 0
        declining = 0
        unchanged = 0
        unavailable = 0
        comparable = 0
        for symbol in SECTOR_ETFS:
            current = rows_by_symbol[symbol][minute_index]
            previous = (
                rows_by_symbol[symbol][minute_index - 1]
                if minute_index > 0
                else None
            )
            if (
                current["type"] != "candle"
                or previous is None
                or previous["type"] != "candle"
            ):
                unavailable += 1
                continue
            comparable += 1
            current_close = int(current["close_price_scaled"])
            previous_close = int(previous["close_price_scaled"])
            if current_close > previous_close:
                advancing += 1
            elif current_close < previous_close:
                declining += 1
            else:
                unchanged += 1
        bucket_start = session["open_unix_ns"] + minute_index * MINUTE_NS
        breadth_rows.append(
            {
                "bucket_start_unix_ns": str(bucket_start),
                "bucket_end_unix_ns": str(bucket_start + MINUTE_NS),
                "advancing_sector_etfs": advancing,
                "declining_sector_etfs": declining,
                "unchanged_sector_etfs": unchanged,
                "comparable_sector_etfs": comparable,
                "unavailable_sector_etfs": unavailable,
                "declared_sector_etf_count": 11,
                "net_advancing_minus_declining": advancing - declining,
                "not_full_market_breadth": True,
                "comparison": "current_minute_close_vs_immediately_previous_minute_close",
                "forward_fill_used": False,
            }
        )
    breadth_dir = output_root / "breadth"
    breadth_dir.mkdir(exist_ok=True)
    os.chmod(breadth_dir, 0o700)
    breadth_artifact = write_json(
        breadth_dir / f"{session_date}.eleven-sector-etf-breadth.json",
        {
            "schema_version": BREADTH_SCHEMA,
            "normalizer_version": NORMALIZER_VERSION,
            "session_date": session_date,
            "sector_etfs": list(SECTOR_ETFS),
            "not_full_market_breadth": True,
            "rows": breadth_rows,
        },
    )
    artifacts.append(breadth_artifact)
    return (
        artifacts,
        {
            "session_date": session_date,
            "rows": coverage_rows,
        },
        {
            "session_date": session_date,
            "duplicate_affected_candle_count": duplicate_affected_candles,
            "duplicate_changed_ohlc_candle_count": duplicate_changed_candles,
        },
    )


def artifact_root(root: Path, artifacts: list[dict[str, Any]]) -> tuple[str, list[dict[str, Any]]]:
    inventory = sorted(
        (normalized_inventory_entry(root, item) for item in artifacts),
        key=lambda item: item["relative_path"],
    )
    return sha256_bytes(canonical_bytes(inventory)), inventory


def run_normalization(
    repo: Path,
    pilot_dir: Path,
    calibration_dir: Path,
    output_dir: Path,
    allowed_output_root: Path,
) -> dict[str, Any]:
    admitted = preflight(
        repo,
        pilot_dir,
        calibration_dir,
        output_dir,
        allowed_output_root,
    )
    output_dir.mkdir(parents=True, exist_ok=False)
    os.chmod(output_dir, 0o700)

    session_by_date = {
        session["date"]: session for session in admitted["sessions"]
    }
    seen_records: dict[bytes, str] = {}
    counters: dict[str, Any] = {
        "record_count": 0,
        "core_record_count": 0,
        "before_core_count": 0,
        "after_core_count": 0,
        "duplicate_count": 0,
        "duplicate_core_count": 0,
        "duplicate_core_volume": 0,
        "after_watermark_count": 0,
        "actions": Counter(),
        "flags": Counter(),
    }
    artifacts: list[dict[str, Any]] = []
    per_file: list[dict[str, Any]] = []
    coverage_sessions: list[dict[str, Any]] = []
    duplicate_sessions: list[dict[str, Any]] = []

    for item in admitted["input_paths"]:
        session_date = (
            item["filename"].split("-")[2].split(".")[0]
        )
        session_date = (
            f"{session_date[0:4]}-{session_date[4:6]}-{session_date[6:8]}"
        )
        session = session_by_date.get(session_date)
        if session is None:
            raise AdmissionError(f"raw_file_without_admitted_session:{item['filename']}")
        disposition_artifacts, file_report, buckets = process_file(
            output_dir,
            item,
            session,
            seen_records,
            counters,
        )
        artifacts.extend(disposition_artifacts)
        per_file.append(file_report)
        session_artifacts, coverage, duplicate = write_session_artifacts(
            output_dir,
            session,
            buckets,
        )
        artifacts.extend(session_artifacts)
        coverage_sessions.append(coverage)
        duplicate_sessions.append(duplicate)

    if (
        counters["record_count"] != EXPECTED_RECORD_COUNT
        or counters["core_record_count"] != EXPECTED_CORE_RECORD_COUNT
        or counters["before_core_count"] + counters["after_core_count"]
        != EXPECTED_RECORD_COUNT - EXPECTED_CORE_RECORD_COUNT
        or counters["duplicate_count"] != EXPECTED_EXACT_DUPLICATE_COUNT
        or dict(sorted(counters["actions"].items())) != EXPECTED_ACTIONS
        or dict(sorted(counters["flags"].items())) != EXPECTED_FLAGS
        or counters["after_watermark_count"] != 0
    ):
        raise AdmissionError("post_decode_record_reconciliation_failed")

    total_candles = sum(
        row["candle_count"]
        for session in coverage_sessions
        for row in session["rows"]
    )
    total_gaps = sum(
        row["gap_count"]
        for session in coverage_sessions
        for row in session["rows"]
    )
    if total_candles + total_gaps != 20 * 13 * 390:
        raise AdmissionError("candle_gap_partition_reconciliation_failed")

    report_dir = output_dir / "reports"
    report_dir.mkdir(exist_ok=True)
    os.chmod(report_dir, 0o700)
    gap_report = write_json(
        report_dir / "gap-coverage-report.json",
        {
            "schema_version": GAP_COVERAGE_SCHEMA,
            "normalizer_version": NORMALIZER_VERSION,
            "expected_session_count": 20,
            "expected_symbol_count": 13,
            "expected_minutes_per_partition": 390,
            "partition_count": 260,
            "candle_count": total_candles,
            "gap_count": total_gaps,
            "expected_row_count": 101_400,
            "coverage_ratio": f"{total_candles / 101_400:.12f}",
            "forward_fill_used": False,
            "interpolation_used": False,
            "sessions": sorted(
                coverage_sessions,
                key=lambda item: item["session_date"],
            ),
        },
    )
    artifacts.append(gap_report)
    duplicate_report = write_json(
        report_dir / "duplicate-impact-report.json",
        {
            "schema_version": DUPLICATE_IMPACT_SCHEMA,
            "normalizer_version": NORMALIZER_VERSION,
            "duplicate_policy": DUPLICATE_POLICY,
            "all_unique_raw_identities_included": True,
            "silent_deduplication_performed": False,
            "exact_duplicate_occurrence_count": counters[
                "duplicate_count"
            ],
            "included_core_duplicate_occurrence_count": counters[
                "duplicate_core_count"
            ],
            "included_core_duplicate_volume": str(
                counters["duplicate_core_volume"]
            ),
            "duplicate_affected_candle_count": sum(
                item["duplicate_affected_candle_count"]
                for item in duplicate_sessions
            ),
            "duplicate_changed_ohlc_candle_count": sum(
                item["duplicate_changed_ohlc_candle_count"]
                for item in duplicate_sessions
            ),
            "counterfactual_definition": (
                "exclude occurrences after the first byte-identical raw record "
                "in canonical source-file and zero-based ordinal order"
            ),
            "sessions": sorted(
                duplicate_sessions,
                key=lambda item: item["session_date"],
            ),
        },
    )
    artifacts.append(duplicate_report)
    lineage_material = [
        {
            "filename": item["filename"],
            "source_file_sha256": item["source_file_sha256"],
            "record_count": item["record_count"],
            "record_disposition_artifact": item[
                "record_disposition_artifact"
            ],
        }
        for item in sorted(per_file, key=lambda entry: entry["filename"])
    ]
    raw_to_record_lineage_root = sha256_bytes(
        canonical_bytes(lineage_material)
    )

    normalized_dataset_digest, inventory = artifact_root(
        output_dir,
        artifacts,
    )
    raw_hashes_after = [
        {
            "filename": item["filename"],
            "sha256": sha256_file(item["path"]),
            "size_bytes": item["path"].stat().st_size,
            "source_group": item["source_group"],
        }
        for item in admitted["input_paths"]
    ]
    if raw_hashes_after != admitted["raw_files"]:
        raise AdmissionError("raw_input_mutated_during_normalization")

    manifest = {
        "schema_version": DATASET_MANIFEST_SCHEMA,
        "normalizer_version": NORMALIZER_VERSION,
        "namespace": NAMESPACE,
        "markers": MARKERS,
        "source": {
            "dataset": "EQUS.MINI",
            "schema": "trades",
            "encoding": "dbn",
            "compression": "zstd",
            "publisher_id": 95,
            "raw_file_count": 20,
            "raw_record_count": counters["record_count"],
            "core_included_record_count": counters[
                "core_record_count"
            ],
            "before_core_excluded_record_count": counters[
                "before_core_count"
            ],
            "after_core_excluded_record_count": counters[
                "after_core_count"
            ],
            "combined_raw_file_digest_root": admitted["raw_root"],
            "raw_files_unchanged": True,
        },
        "policy": {
            "m5f_evidence_digest": admitted["m5f_evidence_digest"],
            "m5f_report_digest": admitted["m5f_report_digest"],
            "m5g_evidence_digest": admitted["m5g_evidence_digest"],
            "calendar_digest": admitted["calendar_digest"],
            "duplicate_policy": DUPLICATE_POLICY,
            "watermark_identity": WATERMARK_IDENTITY,
            "watermark_value_ns": str(WATERMARK_NS),
            "watermark_status": "empirically_unvalidated",
        },
        "decoder": admitted["decoder"],
        "partitions": {
            "candle_partition_count": 260,
            "breadth_partition_count": 20,
            "record_disposition_partition_count": 20,
            "candle_count": total_candles,
            "gap_count": total_gaps,
            "breadth_semantics": "eleven_sector_etfs_only",
            "not_full_market_breadth": True,
        },
        "lineage": {
            "record_identity": (
                "source_file_sha256_plus_zero_based_record_ordinal"
            ),
            "raw_to_record_disposition_root_sha256": (
                raw_to_record_lineage_root
            ),
            "record_disposition_count": counters["record_count"],
            "lineage_gap_count": 0,
        },
        "duplicate_impact": {
            "exact_duplicate_occurrence_count": counters[
                "duplicate_count"
            ],
            "included_core_duplicate_occurrence_count": counters[
                "duplicate_core_count"
            ],
            "included_core_duplicate_volume": str(
                counters["duplicate_core_volume"]
            ),
            "silent_deduplication_performed": False,
        },
        "artifact_inventory_excluding_manifest": inventory,
        "normalized_dataset_digest": normalized_dataset_digest,
        "authorization": {
            "normalization_completed": True,
            "replay_authorized": False,
            "canonical_binding_ready": False,
            "live_ranking_effect": False,
        },
    }
    manifest_artifact = write_json(
        output_dir / "normalized-dataset-manifest.json",
        manifest,
    )
    return {
        "normalizer_version": NORMALIZER_VERSION,
        "normalized_dataset_digest": normalized_dataset_digest,
        "raw_to_record_disposition_root_sha256": raw_to_record_lineage_root,
        "manifest_sha256": manifest_artifact["sha256"],
        "manifest_size_bytes": manifest_artifact["size_bytes"],
        "artifact_count_excluding_manifest": len(inventory),
        "artifact_count_including_manifest": len(inventory) + 1,
        "record_count": counters["record_count"],
        "core_included_record_count": counters["core_record_count"],
        "candle_count": total_candles,
        "gap_count": total_gaps,
        "coverage_ratio": f"{total_candles / 101_400:.12f}",
        "exact_duplicate_occurrence_count": counters[
            "duplicate_count"
        ],
        "included_core_duplicate_occurrence_count": counters[
            "duplicate_core_count"
        ],
        "included_core_duplicate_volume": str(
            counters["duplicate_core_volume"]
        ),
        "records_after_provisional_watermark": counters[
            "after_watermark_count"
        ],
        "raw_file_digest_root_before": admitted["raw_root"],
        "raw_file_digest_root_after": sha256_bytes(
            canonical_bytes(raw_hashes_after)
        ),
        "markers": MARKERS,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True, type=Path)
    parser.add_argument("--pilot-dir", required=True, type=Path)
    parser.add_argument("--calibration-dir", required=True, type=Path)
    parser.add_argument("--allowed-output-root", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--result-path", required=True, type=Path)
    args = parser.parse_args()
    try:
        result = run_normalization(
            args.repo,
            args.pilot_dir,
            args.calibration_dir,
            args.output_dir,
            args.allowed_output_root,
        )
        result_payload = canonical_bytes(
            {"status": "completed", "result": result}
        ) + b"\n"
        args.result_path.parent.mkdir(parents=True, exist_ok=True)
        os.chmod(args.result_path.parent, 0o700)
        with args.result_path.open("xb") as stream:
            stream.write(result_payload)
        os.chmod(args.result_path, 0o600)
        print(
            json.dumps(
                {
                    "status": "completed",
                    "normalized_dataset_digest": result[
                        "normalized_dataset_digest"
                    ],
                    "record_count": result["record_count"],
                    "candle_count": result["candle_count"],
                    "gap_count": result["gap_count"],
                },
                sort_keys=True,
            )
        )
        return 0
    except Exception as error:
        print(
            json.dumps(
                {
                    "status": "rejected",
                    "error_type": type(error).__name__,
                    "error_code": str(error),
                },
                sort_keys=True,
            ),
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
