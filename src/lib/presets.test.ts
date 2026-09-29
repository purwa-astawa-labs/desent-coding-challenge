import { describe, expect, it } from "vitest";
import { emptySelection, sanitizeSelection, selectionReducer as reduce, weeklyTotal } from "./configurator";
import { presets } from "./presets";

const byId = (id: string) => presets.find((p) => p.id === id)!;

describe("presets", () => {
  it("only reference valid catalog items", () => {
    for (const p of presets) expect(sanitizeSelection(p.selection)).toEqual(p.selection);
  });

  it("cover 2 monitors, 3 monitors, standing desk and gaming chair", () => {
    expect(byId("dual-monitor").selection.monitorIds).toHaveLength(2);
    expect(byId("triple-monitor").selection.monitorIds).toHaveLength(3);
    expect(byId("standing-desk").selection.deskId).toBe("desk-oak-standing");
    expect(byId("gaming").selection.chairId).toBe("chair-gaming");
  });

  it("each includes a desk and a chair", () => {
    for (const p of presets) {
      expect(p.selection.deskId).toBeDefined();
      expect(p.selection.chairId).toBeDefined();
    }
  });

  it("applying a preset replaces the current selection", () => {
    const current = reduce(emptySelection, { type: "toggleAccessory", id: "motorbike" });
    const next = reduce(current, { type: "applyPreset", selection: byId("dual-monitor").selection });
    expect(next).toEqual(byId("dual-monitor").selection);
    expect(weeklyTotal(next)).toBe(30 + 25 + 12 + 12 + 5);
  });
});
