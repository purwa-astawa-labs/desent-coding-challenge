import { describe, expect, it } from "vitest";
import { catalog, getItem, groups, hotspots, itemsInCategory, itemsInGroup } from "./catalog";
import {
  type Selection,
  emptySelection,
  hasDeskAndChair,
  isInSelection,
  lineItems,
  parseStoredSelection,
  removeProduct,
  rentalTotal,
  selectionReducer as reduce,
  tapProduct,
  weeklyTotal,
} from "./configurator";

const withMonitors = (...ids: string[]): Selection => ({ ...emptySelection, monitorIds: ids });

describe("catalog", () => {
  it("matches catalog.md items and prices", () => {
    const prices = Object.fromEntries(catalog.map((i) => [i.name, i.weeklyPrice]));
    expect(prices).toEqual({
      "Minimal White Desk": 30,
      "Oak Standing Desk": 45,
      "Lounge Task Chair": 20,
      "Ergo Mesh Chair": 25,
      "Gaming Chair": 30,
      '24" Full HD Monitor': 12,
      '27" 4K Monitor': 20,
      Plants: 5,
      "Desk Lamp": 6,
      Headphones: 8,
      Sofa: 35,
      "Bean Bag": 12,
      "Floor Plant": 7,
      "Coffee Station": 15,
      "Garage Space": 40,
      Motorbike: 60,
      Surfboard: 12,
      "Sport Gear": 10,
    });
    expect(itemsInCategory("desk")).toHaveLength(2);
    expect(itemsInCategory("chair")).toHaveLength(3);
    expect(itemsInCategory("monitor")).toHaveLength(2);
    expect(itemsInCategory("accessory")).toHaveLength(11);
    expect(itemsInGroup("desk-accessory").map((i) => i.id)).toEqual(["plants", "desk-lamp", "headphones"]);
    expect(itemsInGroup("lounge").map((i) => i.id)).toEqual(["sofa", "bean-bag", "floor-plant", "coffee-station"]);
    expect(itemsInGroup("garage").map((i) => i.id)).toEqual(["garage-space", "motorbike", "surfboard", "sport-gear"]);
  });

  it("has one on-scene hotspot per group", () => {
    expect(hotspots.map((h) => h.group).sort()).toEqual(groups.map((g) => g.group).sort());
    for (const h of hotspots) {
      expect(h.x).toBeGreaterThan(0);
      expect(h.x).toBeLessThan(100);
      expect(h.y).toBeGreaterThan(0);
      expect(h.y).toBeLessThan(100);
    }
  });

  it("thumbnails, when present, are item images", () => {
    for (const i of catalog) if (i.thumbnail) expect(i.thumbnail).toMatch(/^\/items\/.+\.(svg|webp|png)$/);
  });

  it("gives every item its own image", () => {
    const images = catalog.map((i) => i.image);
    expect(new Set(images).size).toBe(catalog.length);
    images.forEach((src) => expect(src).toMatch(/^\/items\/.+\.(svg|webp|png)$/));
  });

  it("places every item except the garage space in its scene", () => {
    expect(catalog.filter((i) => !i.layer).map((i) => i.id)).toEqual(["garage-space"]);
  });
});

describe("desk and chair", () => {
  it("swaps desk: White replaces Oak", () => {
    const s = reduce(reduce(emptySelection, { type: "selectDesk", id: "desk-oak-standing" }), {
      type: "selectDesk",
      id: "desk-minimal-white",
    });
    expect(s.deskId).toBe("desk-minimal-white");
    expect(lineItems(s).map((l) => l.item.id)).toEqual(["desk-minimal-white"]);
    expect(weeklyTotal(s)).toBe(30);
  });

  it("swaps chair and never holds two", () => {
    let s = reduce(emptySelection, { type: "selectChair", id: "chair-ergo-mesh" });
    s = reduce(s, { type: "selectChair", id: "chair-gaming" });
    expect(s.chairId).toBe("chair-gaming");
    expect(lineItems(s).filter((l) => l.item.category === "chair")).toHaveLength(1);
  });

  it("ignores ids from the wrong category", () => {
    const s = reduce(emptySelection, { type: "selectDesk", id: "chair-ergo-mesh" });
    expect(s).toBe(emptySelection);
  });

  it("requires desk and chair for checkout", () => {
    expect(hasDeskAndChair(emptySelection)).toBe(false);
    expect(hasDeskAndChair({ ...emptySelection, deskId: "desk-oak-standing" })).toBe(false);
    expect(hasDeskAndChair({ ...emptySelection, deskId: "desk-oak-standing", chairId: "chair-ergo-mesh" })).toBe(true);
  });
});

describe("monitors", () => {
  it("adds a third monitor, then a fourth is a no-op", () => {
    const two = withMonitors("monitor-24-fhd", "monitor-24-fhd");
    const three = reduce(two, { type: "addMonitor", id: "monitor-27-4k" });
    expect(three.monitorIds).toEqual(["monitor-24-fhd", "monitor-24-fhd", "monitor-27-4k"]);
    const four = reduce(three, { type: "addMonitor", id: "monitor-24-fhd" });
    expect(four).toBe(three);
    expect(four.monitorIds).toHaveLength(3);
  });

  it("removes the middle monitor and keeps order", () => {
    const s = reduce(withMonitors("monitor-24-fhd", "monitor-27-4k", "monitor-24-fhd"), {
      type: "removeMonitor",
      index: 1,
    });
    expect(s.monitorIds).toEqual(["monitor-24-fhd", "monitor-24-fhd"]);
  });

  it("ignores out-of-range removals", () => {
    const s = withMonitors("monitor-24-fhd");
    expect(reduce(s, { type: "removeMonitor", index: 5 })).toBe(s);
    expect(reduce(s, { type: "removeMonitor", index: -1 })).toBe(s);
  });
});

describe("accessories", () => {
  it("toggles Plants off without affecting others", () => {
    const s: Selection = { ...emptySelection, accessoryIds: ["plants", "sofa"] };
    const next = reduce(s, { type: "toggleAccessory", id: "plants" });
    expect(next.accessoryIds).toEqual(["sofa"]);
    expect(reduce(next, { type: "toggleAccessory", id: "plants" }).accessoryIds).toEqual(["sofa", "plants"]);
  });
});

describe("garage rule", () => {
  it("adding gear adds the garage space once", () => {
    let s = reduce(emptySelection, { type: "toggleAccessory", id: "motorbike" });
    expect(s.accessoryIds).toEqual(["motorbike", "garage-space"]);
    s = reduce(s, { type: "toggleAccessory", id: "surfboard" });
    expect(s.accessoryIds).toEqual(["motorbike", "garage-space", "surfboard"]);
  });

  it("removing gear keeps the garage space", () => {
    const s: Selection = { ...emptySelection, accessoryIds: ["motorbike", "garage-space"] };
    expect(reduce(s, { type: "toggleAccessory", id: "motorbike" }).accessoryIds).toEqual(["garage-space"]);
  });

  it("removing the garage space removes all gear but nothing else", () => {
    const s: Selection = { ...emptySelection, accessoryIds: ["plants", "motorbike", "garage-space", "sport-gear", "sofa"] };
    expect(reduce(s, { type: "toggleAccessory", id: "garage-space" }).accessoryIds).toEqual(["plants", "sofa"]);
  });

  it("garage space alone is allowed", () => {
    expect(reduce(emptySelection, { type: "toggleAccessory", id: "garage-space" }).accessoryIds).toEqual(["garage-space"]);
  });
});

describe("pricing", () => {
  const s: Selection = {
    deskId: "desk-oak-standing",
    chairId: "chair-ergo-mesh",
    monitorIds: ["monitor-24-fhd", "monitor-24-fhd"],
    accessoryIds: ["plants"],
  };

  it("weekly 99, 4-week rental 396", () => {
    expect(weeklyTotal(s)).toBe(99);
    expect(rentalTotal(s, 4)).toBe(396);
  });

  it("weekly total equals the sum of listed line items", () => {
    const sum = lineItems(s).reduce((acc, l) => acc + l.item.weeklyPrice, 0);
    expect(lineItems(s)).toHaveLength(5);
    expect(weeklyTotal(s)).toBe(sum);
  });

  it("rental total is 0 for invalid weeks", () => {
    expect(rentalTotal(s, 0)).toBe(0);
    expect(rentalTotal(s, 1.5)).toBe(0);
  });

  it("empty selection totals 0", () => {
    expect(weeklyTotal(emptySelection)).toBe(0);
  });
});

describe("reset and hydrate", () => {
  it("reset empties the selection", () => {
    const s: Selection = { deskId: "desk-oak-standing", monitorIds: ["monitor-24-fhd"], accessoryIds: ["plants"] };
    expect(reduce(s, { type: "reset" })).toEqual(emptySelection);
  });

  it("hydrate sanitizes its payload", () => {
    const s = reduce(emptySelection, {
      type: "hydrate",
      selection: { deskId: "nope", monitorIds: ["monitor-27-4k"], accessoryIds: [] },
    });
    expect(s).toEqual({ monitorIds: ["monitor-27-4k"], accessoryIds: [] });
  });
});

describe("parseStoredSelection (corrupt storage)", () => {
  it("returns empty for missing or invalid JSON", () => {
    expect(parseStoredSelection(null)).toEqual(emptySelection);
    expect(parseStoredSelection("")).toEqual(emptySelection);
    expect(parseStoredSelection("{not json")).toEqual(emptySelection);
    expect(parseStoredSelection("42")).toEqual(emptySelection);
    expect(parseStoredSelection("null")).toEqual(emptySelection);
    expect(parseStoredSelection('{"monitorIds":"x","accessoryIds":{}}')).toEqual(emptySelection);
  });

  it("drops unknown ids, caps monitors at 3, dedupes accessories", () => {
    const raw = JSON.stringify({
      deskId: "desk-oak-standing",
      chairId: "ghost-chair",
      monitorIds: ["monitor-24-fhd", "bogus", "monitor-27-4k", "monitor-24-fhd", "monitor-27-4k", 7],
      accessoryIds: ["plants", "plants", "unicorn", "surfboard", "desk-oak-standing"],
    });
    expect(parseStoredSelection(raw)).toEqual({
      deskId: "desk-oak-standing",
      monitorIds: ["monitor-24-fhd", "monitor-27-4k", "monitor-24-fhd"],
      accessoryIds: ["plants", "surfboard", "garage-space"],
    });
  });

  it("round-trips a valid selection", () => {
    const s: Selection = {
      deskId: "desk-minimal-white",
      chairId: "chair-lounge-task",
      monitorIds: ["monitor-27-4k"],
      accessoryIds: ["motorbike", "garage-space"],
    };
    expect(parseStoredSelection(JSON.stringify(s))).toEqual(s);
    expect(getItem("motorbike")?.weeklyPrice).toBe(60);
  });
});

describe("product taps (details trigger)", () => {
  it("selecting a desk or chair opens details", () => {
    expect(tapProduct(emptySelection, "desk-oak-standing")).toEqual({ action: { type: "selectDesk", id: "desk-oak-standing" }, openDetails: true });
    expect(tapProduct(emptySelection, "chair-gaming")).toEqual({ action: { type: "selectChair", id: "chair-gaming" }, openDetails: true });
  });

  it("deselecting an accessory does not open details", () => {
    const s: Selection = { ...emptySelection, accessoryIds: ["plants"] };
    expect(tapProduct(s, "plants")).toEqual({ action: { type: "toggleAccessory", id: "plants" }, openDetails: false });
    expect(isInSelection(reduce(s, tapProduct(s, "plants").action!), "plants")).toBe(false);
  });

  it("a monitor tap at the cap is a no-op", () => {
    expect(tapProduct(withMonitors("monitor-24-fhd", "monitor-24-fhd", "monitor-27-4k"), "monitor-24-fhd")).toEqual({ action: null, openDetails: false });
  });

  it("garage gear adds itself and the garage space, and opens its details", () => {
    const tap = tapProduct(emptySelection, "motorbike");
    expect(tap.openDetails).toBe(true);
    expect(reduce(emptySelection, tap.action!).accessoryIds).toEqual(["motorbike", "garage-space"]);
  });

  it("unknown ids do nothing", () => {
    expect(tapProduct(emptySelection, "nope")).toEqual({ action: null, openDetails: false });
  });
});

describe("removeProduct (details sheet)", () => {
  it("accessory removal toggles it off; garage space takes its gear with it", () => {
    const s: Selection = { ...emptySelection, accessoryIds: ["motorbike", "garage-space", "plants"] };
    expect(reduce(s, removeProduct(s, "garage-space")!).accessoryIds).toEqual(["plants"]);
    expect(reduce(s, removeProduct(s, "plants")!).accessoryIds).toEqual(["motorbike", "garage-space"]);
  });

  it("monitor removal drops the last of that model", () => {
    const s = withMonitors("monitor-24-fhd", "monitor-27-4k", "monitor-24-fhd");
    expect(reduce(s, removeProduct(s, "monitor-24-fhd")!).monitorIds).toEqual(["monitor-24-fhd", "monitor-27-4k"]);
  });

  it("desks, chairs and unselected items have no remove", () => {
    const s: Selection = { ...emptySelection, deskId: "desk-oak-standing", chairId: "chair-gaming" };
    expect(removeProduct(s, "desk-oak-standing")).toBeNull();
    expect(removeProduct(s, "chair-gaming")).toBeNull();
    expect(removeProduct(s, "sofa")).toBeNull();
  });
});
