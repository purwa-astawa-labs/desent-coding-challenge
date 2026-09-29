import { describe, expect, it } from "vitest";
import { type Selection, emptySelection, selectionReducer as reduce } from "./configurator";
import { presets } from "./presets";
import { LAYER_IN_DURATION, layerStaggerAmount, layersFor } from "./scene";

const keys = (s: Selection) => layersFor(s, "workspace").map((l) => l.key);
const newKeys = (before: Selection, after: Selection) => keys(after).filter((k) => !keys(before).includes(k));

describe("scene layer keys (what animates in)", () => {
  const base: Selection = { ...emptySelection, deskId: "desk-oak-standing", chairId: "chair-ergo-mesh", monitorIds: ["monitor-24-fhd"] };

  it("swapping the desk mounts only a new desk layer", () => {
    const after = reduce(base, { type: "selectDesk", id: "desk-walnut-executive" });
    expect(newKeys(base, after)).toEqual(["desk-desk-walnut-executive"]);
  });

  it("adding a monitor mounts only the new slot", () => {
    const after = reduce(base, { type: "addMonitor", id: "monitor-27-4k" });
    expect(newKeys(base, after)).toEqual(["monitor-1-monitor-27-4k"]);
  });

  it("applying a preset to an empty workspace mounts all its layers at once", () => {
    const gaming = presets.find((p) => p.id === "gaming")!.selection;
    expect(newKeys(emptySelection, gaming)).toHaveLength(keys(gaming).length);
    expect(keys(gaming).length).toBeGreaterThan(1);
  });
});

describe("layerStaggerAmount", () => {
  it("is zero for a single layer", () => {
    expect(layerStaggerAmount(1)).toBe(0);
    expect(layerStaggerAmount(0)).toBe(0);
  });

  it("keeps the whole entry within 500 ms however many layers enter", () => {
    for (const n of [2, 5, 10, 50]) expect(layerStaggerAmount(n) + LAYER_IN_DURATION).toBeLessThanOrEqual(0.5 + 1e-9);
  });
});
