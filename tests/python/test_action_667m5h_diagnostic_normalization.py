import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from market_context_diagnostic_normalize_1m_v1 import (  # noqa: E402
    DUPLICATE_POLICY,
    WATERMARK_NS,
    candle_row,
    empty_bucket,
    update_aggregate,
)


class DiagnosticNormalizationV1Tests(unittest.TestCase):
    def test_event_time_order_controls_open_and_close(self):
        bucket = empty_bucket()
        update_aggregate(
            bucket,
            (200, "b" * 64, 1),
            2000,
            3,
            200,
            210,
            f"{'b' * 64}:1",
            False,
        )
        update_aggregate(
            bucket,
            (100, "a" * 64, 9),
            1000,
            2,
            100,
            120,
            f"{'a' * 64}:9",
            False,
        )
        row = candle_row("2026-07-20", "SPY", 0, bucket)
        self.assertEqual(row["open_price_scaled"], "1000")
        self.assertEqual(row["close_price_scaled"], "2000")
        self.assertEqual(row["high_price_scaled"], "2000")
        self.assertEqual(row["low_price_scaled"], "1000")
        self.assertEqual(row["volume"], "5")
        self.assertEqual(row["trade_count"], 2)

    def test_duplicate_is_included_but_counterfactual_is_separate(self):
        bucket = empty_bucket()
        identity = f"{'a' * 64}:0"
        update_aggregate(
            bucket,
            (100, "a" * 64, 0),
            1000,
            7,
            100,
            101,
            identity,
            False,
        )
        update_aggregate(
            bucket,
            (100, "a" * 64, 1),
            1000,
            7,
            100,
            101,
            f"{'a' * 64}:1",
            True,
        )
        row = candle_row("2026-07-20", "SPY", 0, bucket)
        self.assertEqual(DUPLICATE_POLICY, "include_each_unique_raw_identity_no_deduplication_v1")
        self.assertEqual(row["trade_count"], 2)
        self.assertEqual(row["volume"], "14")
        self.assertEqual(row["included_duplicate_occurrence_count"], 1)
        self.assertEqual(row["included_duplicate_volume"], "7")
        self.assertEqual(bucket["dedup_trade_count"], 1)
        self.assertEqual(bucket["dedup_volume"], 7)

    def test_gap_is_explicit_and_never_filled(self):
        row = candle_row("2026-07-20", "SPY", 0, None)
        self.assertEqual(row["type"], "gap")
        self.assertFalse(row["forward_filled"])
        self.assertFalse(row["interpolated"])
        self.assertEqual(row["reason_code"], "no_eligible_reported_trade_in_core_minute")

    def test_watermark_remains_two_seconds(self):
        self.assertEqual(WATERMARK_NS, 2_000_000_000)


if __name__ == "__main__":
    unittest.main()
