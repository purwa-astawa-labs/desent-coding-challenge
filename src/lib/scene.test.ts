import { describe, expect, it } from "vitest";
import { type Selection, emptySelection, selectionReducer as reduce } from "./configurator";
import { presets } from "./presets";
import { DESK_CENTER, MONITOR_BASE } from "./catalog";
import { LAYER_IN_DURATION, layerStaggerAmount, layersFor, monitorBoxes } from "./scene";

const keys = (s: Selection) => layersFor(s, "workspace").map((l) => l.key);
const newKeys = (before: Selection, after: Selection) => keys(after).filter((k) => !keys(before).includes(k));

describe("scene layer keys (what animates in)", () => {
  const base: Selection = { ...emptySelection, deskId: "desk-oak-standing", chairId: "chair-ergo-mesh", monitorIds: ["monitor-24-fhd"] };

  it("swapping the desk mounts only a new desk layer", () => {
    const after = reduce(base, { type: "selectDesk", id: "desk-minimal-white" });
    expect(newKeys(base, after)).toEqual(["desk-desk-minimal-white"]);
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

describe("monitorBoxes", () => {
  const right = (b: { left: number; width: number }) => b.left + b.width;

  it("centers a single monitor on the desk", () => {
    const [b] = monitorBoxes(["monitor-24-fhd"]);
    expect(b.left + b.width / 2).toBeCloseTo(DESK_CENTER);
    expect(b.bottom).toBe(MONITOR_BASE);
  });

  it("places two monitors side by side, centered, without overlap", () => {
    const [a, b] = monitorBoxes(["monitor-24-fhd", "monitor-27-4k"]);
    expect(right(a)).toBeLessThanOrEqual(b.left);
    expect((a.left + right(b)) / 2).toBeCloseTo(DESK_CENTER);
  });

  it("puts the middle of three in front and keeps the bank on the desk (30–82%)", () => {
    const [l, c, r] = monitorBoxes(["monitor-27-4k", "monitor-27-4k", "monitor-27-4k"]);
    expect(c.z).toBeGreaterThan(l.z);
    expect(c.z).toBeGreaterThan(r.z);
    expect(c.left + c.width / 2).toBeCloseTo(DESK_CENTER);
    expect(l.left).toBeGreaterThanOrEqual(30);
    expect(right(r)).toBeLessThanOrEqual(82);
  });

  it("returns nothing for no monitors", () => {
    expect(monitorBoxes([])).toEqual([]);
  });
});
