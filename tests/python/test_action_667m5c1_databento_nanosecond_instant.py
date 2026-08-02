from __future__ import annotations

import importlib.util
import pathlib
import unittest


REPOSITORY = pathlib.Path(__file__).resolve().parents[2]
MODULE_PATH = (
    REPOSITORY
    / "scripts/databento_explicit_nanosecond_instant_v1.py"
)
SPEC = importlib.util.spec_from_file_location(
    "databento_explicit_nanosecond_instant_v1",
    MODULE_PATH,
)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("parser_module_not_loadable")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class DatabentoNanosecondInstantTest(unittest.TestCase):
    def test_observed_entitlement_format(self) -> None:
        self.assertEqual(
            MODULE.parse_databento_explicit_nanosecond_instant_v1(
                "2023-03-28T00:00:00.000000000Z",
                "entitlement_start",
            ),
            {
                "ok": True,
                "parser_version": (
                    "databento_explicit_nanosecond_instant_parser_v1"
                ),
                "unix_nanoseconds": "1679961600000000000",
            },
        )

    def test_one_nanosecond_ordering(self) -> None:
        self.assertEqual(
            MODULE.compare_databento_explicit_instants_v1(
                "2026-07-27T00:00:00.000000001Z",
                "2026-07-27T00:00:00.000000000Z",
            )["signed_delta_nanoseconds"],
            "1",
        )

    def test_freshness_boundary(self) -> None:
        maximum = "900000000000"
        exact = MODULE.evaluate_databento_freshness_v1(
            {
                "current_instant": (
                    "2026-07-27T00:15:00.000000000Z"
                ),
                "observed_instant": "2026-07-27T00:00:00Z",
                "maximum_age_nanoseconds": maximum,
            }
        )
        over = MODULE.evaluate_databento_freshness_v1(
            {
                "current_instant": (
                    "2026-07-27T00:15:00.000000001Z"
                ),
                "observed_instant": "2026-07-27T00:00:00Z",
                "maximum_age_nanoseconds": maximum,
            }
        )
        self.assertEqual(exact["freshness_state"], "fresh")
        self.assertTrue(exact["within_maximum_age"])
        self.assertEqual(over["freshness_state"], "stale")
        self.assertFalse(over["within_maximum_age"])

    def test_invalid_inputs_never_escape(self) -> None:
        for value in (
            None,
            "2026-07-27T00:00:00",
            "2026-07-27T00:00:00.1234567890Z",
            "2026-07-27T00:00:60Z",
            "NaN",
        ):
            result = (
                MODULE.parse_databento_explicit_nanosecond_instant_v1(
                    value,
                    "timestamp",
                )
            )
            self.assertFalse(result["ok"])
            self.assertEqual(
                result["error_code"],
                "databento_explicit_nanosecond_instant_rejected",
            )


if __name__ == "__main__":
    unittest.main()
