import json
from functools import lru_cache
from pathlib import Path

CONTENT_PATH = Path(__file__).resolve().parent.parent / "content" / "units.json"


@lru_cache
def _load_units() -> dict[str, dict]:
    with open(CONTENT_PATH, encoding="utf-8") as f:
        units = json.load(f)
    return {unit["unit_id"]: unit for unit in units}


def get_unit(unit_id: str) -> dict | None:
    return _load_units().get(unit_id)


def is_checkpoint(unit_id: str) -> bool:
    unit = get_unit(unit_id)
    if unit:
        return unit.get("type") == "checkpoint"
    # Content not authored yet for this unit — fall back to the naming
    # convention from PRD section 5 (e.g. "dg-1-cp1").
    return "-cp" in unit_id
