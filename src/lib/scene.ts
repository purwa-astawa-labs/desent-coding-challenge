import { type CatalogItem, type LayerBox, type Zone, DESK_CENTER, MONITOR_BASE, getItem, zoneOf } from "./catalog";
import type { Selection } from "./configurator";

/** One image layer in a zone's scene. */
export interface Layer {
  key: string;
  item: CatalogItem;
  box: LayerBox;
}

/**
 * The layers a zone's scene shows for a selection, back to front. Keys combine slot and item,
 * so a swap mounts a fresh layer (which then animates in) while untouched layers keep theirs.
 */
export function layersFor(selection: Selection, zone: Zone): Layer[] {
  const layers: Layer[] = [];
  const add = (key: string, id: string | undefined, box?: LayerBox) => {
    const item = id ? getItem(id) : undefined;
    const layer = box ?? item?.layer;
    if (item && layer && zoneOf(item) === zone) layers.push({ key, item, box: layer });
  };
  add(`desk-${selection.deskId}`, selection.deskId);
  add(`chair-${selection.chairId}`, selection.chairId);
  // Monitors: laid out by count (see monitorBoxes); the model decides the image and width.
  const boxes = monitorBoxes(selection.monitorIds);
  selection.monitorIds.forEach((id, i) => add(`monitor-${i}-${id}`, id, boxes[i]));
  selection.accessoryIds.forEach((id) => add(`accessory-${id}`, id));
  return layers.sort((a, b) => a.box.z - b.box.z);
}

/** Gap between two side-by-side monitors, % of scene width. */
const MONITOR_GAP = 0.5;
/** In a triple setup, how much of each outer monitor tucks behind the center one (at least). */
const MONITOR_OVERLAP = 0.15;
/** Widest a monitor bank may be so it stays on the desk top, % of scene width. */
const MONITOR_BANK_MAX = 50;

/**
 * Monitor boxes for the selected monitors, standing on the desk around its center: one centered,
 * two side by side, three as a bank with the middle one in front and the outer two tucked behind it.
 */
export function monitorBoxes(ids: readonly string[]): LayerBox[] {
  const widths = ids.map((id) => getItem(id)?.layer?.width ?? 18);
  if (widths.length === 3) {
    const [l, c, r] = widths;
    // Tuck the outer monitors further behind when three wide ones would overhang the desk.
    const overlap = Math.max(MONITOR_OVERLAP, 1 - (MONITOR_BANK_MAX - c) / (l + r));
    const centerLeft = DESK_CENTER - c / 2;
    return [
      { z: 19, left: centerLeft - l * (1 - overlap), bottom: MONITOR_BASE, width: l },
      { z: 21, left: centerLeft, bottom: MONITOR_BASE, width: c },
      { z: 19, left: centerLeft + c - r * overlap, bottom: MONITOR_BASE, width: r },
    ];
  }
  const total = widths.reduce((sum, w) => sum + w, 0) + MONITOR_GAP * Math.max(widths.length - 1, 0);
  let left = DESK_CENTER - total / 2;
  return widths.map((width) => {
    const box: LayerBox = { z: 20, left, bottom: MONITOR_BASE, width };
    left += width + MONITOR_GAP;
    return box;
  });
}

/** Layer entry duration in seconds. */
export const LAYER_IN_DURATION = 0.24;

/** Total stagger (seconds) for `count` layers entering at once; the whole entry stays within 500 ms. */
export function layerStaggerAmount(count: number): number {
  return Math.min(0.04 * Math.max(count - 1, 0), 0.5 - LAYER_IN_DURATION);
}
