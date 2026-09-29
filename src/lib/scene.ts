import { type CatalogItem, type LayerBox, type Zone, getItem, monitorSlots, zoneOf } from "./catalog";
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
  // Monitors: slot box by index, model only decides the image.
  selection.monitorIds.forEach((id, i) => add(`monitor-${i}-${id}`, id, monitorSlots[i]));
  selection.accessoryIds.forEach((id) => add(`accessory-${id}`, id));
  return layers.sort((a, b) => a.box.z - b.box.z);
}

/** Layer entry duration in seconds. */
export const LAYER_IN_DURATION = 0.24;

/** Total stagger (seconds) for `count` layers entering at once; the whole entry stays within 500 ms. */
export function layerStaggerAmount(count: number): number {
  return Math.min(0.04 * Math.max(count - 1, 0), 0.5 - LAYER_IN_DURATION);
}
