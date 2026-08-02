from __future__ import annotations

import json
import re
import sys
from datetime import date
from typing import Any


PARSER_VERSION = "databento_explicit_nanosecond_instant_parser_v1"
POLICY = {
    "minimum_year": 1970,
    "maximum_year": 9999,
    "fractional_digits_minimum": 0,
    "fractional_digits_maximum": 9,
    "explicit_utc_z_allowed": True,
    "explicit_offset_allowed": True,
    "maximum_absolute_offset_minutes": 14 * 60,
    "lowercase_z_allowed": False,
    "leap_second_supported": False,
    "canonical_representation": (
        "signed_unix_nanosecond_decimal_string"
    ),
    "floating_point_conversion_allowed": False,
    "host_timezone_used": False,
}
EXPLICIT_INSTANT_PATTERN = re.compile(
    r"^(\d{4})-(\d{2})-(\d{2})"
    r"T(\d{2}):(\d{2}):(\d{2})"
    r"(?:\.(\d{1,9}))?"
    r"(Z|([+-])(\d{2}):(\d{2}))$"
)
UNSIGNED_INTEGER_PATTERN = re.compile(r"^(0|[1-9][0-9]*)$")
EPOCH_ORDINAL = date(1970, 1, 1).toordinal()
NANOSECONDS_PER_SECOND = 1_000_000_000


def _rejected(field: str, reason_code: str) -> dict[str, Any]:
    return {
        "ok": False,
        "parser_version": PARSER_VERSION,
        "error_code": (
            "databento_explicit_nanosecond_instant_rejected"
        ),
        "reason_code": reason_code,
        "field": field,
    }


def parse_databento_explicit_nanosecond_instant_v1(
    value: Any,
    field: str,
) -> dict[str, Any]:
    try:
        if not isinstance(value, str):
            return _rejected(field, "value_not_string")
        match = EXPLICIT_INSTANT_PATTERN.fullmatch(value)
        if match is None:
            return _rejected(
                field,
                "syntax_not_strict_explicit_instant",
            )

        year = int(match.group(1))
        month = int(match.group(2))
        day = int(match.group(3))
        hour = int(match.group(4))
        minute = int(match.group(5))
        second = int(match.group(6))
        if (
            year < POLICY["minimum_year"]
            or year > POLICY["maximum_year"]
        ):
            return _rejected(field, "year_out_of_policy")
        try:
            local_date = date(year, month, day)
        except ValueError:
            return _rejected(field, "calendar_date_invalid")
        if second == 60:
            return _rejected(field, "leap_second_unsupported")
        if (
            hour < 0
            or hour > 23
            or minute < 0
            or minute > 59
            or second < 0
            or second > 59
        ):
            return _rejected(field, "clock_time_invalid")

        offset_minutes = 0
        if match.group(8) != "Z":
            offset_hour = int(match.group(10))
            offset_minute = int(match.group(11))
            if (
                offset_minute > 59
                or offset_hour > 14
                or (offset_hour == 14 and offset_minute != 0)
            ):
                return _rejected(field, "offset_out_of_policy")
            absolute_offset = offset_hour * 60 + offset_minute
            offset_minutes = (
                absolute_offset
                if match.group(9) == "+"
                else -absolute_offset
            )

        days = local_date.toordinal() - EPOCH_ORDINAL
        local_seconds = (
            days * 86400
            + hour * 3600
            + minute * 60
            + second
        )
        utc_seconds = local_seconds - offset_minutes * 60
        fractional_digits = match.group(7) or ""
        fraction = int(fractional_digits.ljust(9, "0") or "0")
        unix_nanoseconds = (
            utc_seconds * NANOSECONDS_PER_SECOND + fraction
        )
        return {
            "ok": True,
            "parser_version": PARSER_VERSION,
            "unix_nanoseconds": str(unix_nanoseconds),
        }
    except Exception:
        return _rejected(
            field,
            "syntax_not_strict_explicit_instant",
        )


def compare_databento_explicit_instants_v1(
    left: Any,
    right: Any,
    left_field: str = "left",
    right_field: str = "right",
) -> dict[str, Any]:
    parsed_left = parse_databento_explicit_nanosecond_instant_v1(
        left, left_field
    )
    if not parsed_left["ok"]:
        return {
            "ok": False,
            "parser_version": PARSER_VERSION,
            "error_code": "databento_instant_comparison_rejected",
            "rejected_field": parsed_left["field"],
            "reason_code": parsed_left["reason_code"],
        }
    parsed_right = parse_databento_explicit_nanosecond_instant_v1(
        right, right_field
    )
    if not parsed_right["ok"]:
        return {
            "ok": False,
            "parser_version": PARSER_VERSION,
            "error_code": "databento_instant_comparison_rejected",
            "rejected_field": parsed_right["field"],
            "reason_code": parsed_right["reason_code"],
        }
    delta = int(parsed_left["unix_nanoseconds"]) - int(
        parsed_right["unix_nanoseconds"]
    )
    return {
        "ok": True,
        "parser_version": PARSER_VERSION,
        "relation": -1 if delta < 0 else 1 if delta > 0 else 0,
        "signed_delta_nanoseconds": str(delta),
    }


def evaluate_databento_freshness_v1(
    input_value: Any,
) -> dict[str, Any]:
    value = input_value if isinstance(input_value, dict) else {}
    current = parse_databento_explicit_nanosecond_instant_v1(
        value.get("current_instant"), "current_instant"
    )
    if not current["ok"]:
        return {
            "ok": False,
            "parser_version": PARSER_VERSION,
            "error_code": "databento_freshness_evaluation_rejected",
            "rejected_field": current["field"],
            "reason_code": current["reason_code"],
        }
    observed = parse_databento_explicit_nanosecond_instant_v1(
        value.get("observed_instant"), "observed_instant"
    )
    if not observed["ok"]:
        return {
            "ok": False,
            "parser_version": PARSER_VERSION,
            "error_code": "databento_freshness_evaluation_rejected",
            "rejected_field": observed["field"],
            "reason_code": observed["reason_code"],
        }
    maximum_raw = value.get("maximum_age_nanoseconds")
    if (
        not isinstance(maximum_raw, str)
        or UNSIGNED_INTEGER_PATTERN.fullmatch(maximum_raw) is None
    ):
        return {
            "ok": False,
            "parser_version": PARSER_VERSION,
            "error_code": "databento_freshness_evaluation_rejected",
            "rejected_field": "maximum_age_nanoseconds",
            "reason_code": "maximum_age_nanoseconds_invalid",
        }
    maximum_age = int(maximum_raw)
    age = int(current["unix_nanoseconds"]) - int(
        observed["unix_nanoseconds"]
    )
    future = age < 0
    fresh = not future and age <= maximum_age
    return {
        "ok": True,
        "parser_version": PARSER_VERSION,
        "freshness_state": (
            "future" if future else "fresh" if fresh else "stale"
        ),
        "age_nanoseconds": str(age),
        "maximum_age_nanoseconds": str(maximum_age),
        "within_maximum_age": fresh,
    }


def evaluate_databento_interval_membership_v1(
    input_value: Any,
) -> dict[str, Any]:
    value = input_value if isinstance(input_value, dict) else {}
    parsed: list[dict[str, Any]] = []
    for field in (
        "value_instant",
        "start_inclusive",
        "end_exclusive",
    ):
        result = parse_databento_explicit_nanosecond_instant_v1(
            value.get(field), field
        )
        if not result["ok"]:
            return {
                "ok": False,
                "parser_version": PARSER_VERSION,
                "error_code": (
                    "databento_interval_membership_rejected"
                ),
                "rejected_field": result["field"],
                "reason_code": result["reason_code"],
            }
        parsed.append(result)
    instant, start, end = [
        int(item["unix_nanoseconds"]) for item in parsed
    ]
    if start >= end:
        return {
            "ok": False,
            "parser_version": PARSER_VERSION,
            "error_code": "databento_interval_membership_rejected",
            "rejected_field": "interval",
            "reason_code": "interval_not_increasing",
        }
    return {
        "ok": True,
        "parser_version": PARSER_VERSION,
        "interval_semantics": "inclusive_start_exclusive_end",
        "is_member": instant >= start and instant < end,
    }


def evaluate_operation(operation: Any) -> dict[str, Any]:
    if not isinstance(operation, dict):
        return {
            "ok": False,
            "parser_version": PARSER_VERSION,
            "error_code": "databento_operation_rejected",
            "reason_code": "operation_not_object",
        }
    kind = operation.get("operation")
    if kind == "parse":
        return parse_databento_explicit_nanosecond_instant_v1(
            operation.get("value"),
            str(operation.get("field", "timestamp")),
        )
    if kind == "compare":
        return compare_databento_explicit_instants_v1(
            operation.get("left"),
            operation.get("right"),
            str(operation.get("left_field", "left")),
            str(operation.get("right_field", "right")),
        )
    if kind == "freshness":
        return evaluate_databento_freshness_v1(operation.get("input"))
    if kind == "interval":
        return evaluate_databento_interval_membership_v1(
            operation.get("input")
        )
    return {
        "ok": False,
        "parser_version": PARSER_VERSION,
        "error_code": "databento_operation_rejected",
        "reason_code": "operation_unknown",
    }


def _main() -> int:
    if sys.argv[1:] != ["--evaluate-json"]:
        return 2
    try:
        request = json.load(sys.stdin)
        if not isinstance(request, list):
            return 2
        response = [evaluate_operation(item) for item in request]
        json.dump(
            response,
            sys.stdout,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        )
        sys.stdout.write("\n")
        return 0
    except Exception:
        return 2


if __name__ == "__main__":
    raise SystemExit(_main())
