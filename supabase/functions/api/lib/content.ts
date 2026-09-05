// Port of backend/app/services/content_service.py — same units.json,
// bundled alongside this function (Edge Functions ship the whole function
// directory, so a local copy is the simplest way to bring it along).
import units from "../content/units.json" with { type: "json" };

// deno-lint-ignore no-explicit-any
type Unit = Record<string, any>;

const UNITS_BY_ID: Record<string, Unit> = Object.fromEntries(
  (units as Unit[]).map((unit) => [unit.unit_id, unit]),
);

export function getUnit(unitId: string): Unit | null {
  return UNITS_BY_ID[unitId] ?? null;
}

export function isCheckpoint(unitId: string): boolean {
  const unit = getUnit(unitId);
  if (unit) return unit.type === "checkpoint";
  // Content not authored yet for this unit — fall back to the naming
  // convention from PRD section 5 (e.g. "dg-1-cp1").
  return unitId.includes("-cp");
}
