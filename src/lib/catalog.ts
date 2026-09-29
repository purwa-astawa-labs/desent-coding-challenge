/**
 * Static seed catalog (see _bmad-output/spec-design-your-workspace/catalog.md).
 *
 * Every item owns a layer box in the 2D preview. The preview scene is a fixed
 * 4:3 box (800×600 design units). `left` and `width` are percentages of the
 * scene width, `top` is a percentage of the scene height; the image height
 * follows from the image's own aspect ratio. To replace an image, edit `image`
 * and keep the new file's aspect ratio the same as the placeholder's viewBox.
 */

export type Category = "desk" | "chair" | "monitor" | "accessory";

export interface LayerBox {
  /** Stacking order; higher draws in front. */
  z: number;
  /** % of scene width. */
  left: number;
  /** % of scene height. */
  top: number;
  /** % of scene width. */
  width: number;
}

export interface CatalogItem {
  id: string;
  category: Category;
  name: string;
  /** USD per week. */
  weeklyPrice: number;
  /** Path under /public. */
  image: string;
  layer: LayerBox;
}

export const SCENE_IMAGE = "/scene/room.svg";
export const SCENE_ASPECT_RATIO = "4 / 3";
export const MAX_MONITORS = 3;

/** Monitor boxes on the desk surface; slot i holds the i-th selected monitor. */
export const monitorSlots: readonly [LayerBox, LayerBox, LayerBox] = [
  { z: 20, left: 36, top: 29.6667, width: 12.5 },
  { z: 20, left: 49.75, top: 29.6667, width: 12.5 },
  { z: 20, left: 63.5, top: 29.6667, width: 12.5 },
];

const DESK_LAYER: LayerBox = { z: 10, left: 30, top: 45, width: 52 };
const CHAIR_LAYER: LayerBox = { z: 50, left: 42, top: 55, width: 20 };

export const catalog: readonly CatalogItem[] = [
  // Desks — exactly one
  { id: "desk-minimal-white", category: "desk", name: "Minimal White Desk", weeklyPrice: 30, image: "/items/desk-minimal-white.svg", layer: DESK_LAYER },
  { id: "desk-oak-standing", category: "desk", name: "Oak Standing Desk", weeklyPrice: 45, image: "/items/desk-oak-standing.svg", layer: DESK_LAYER },
  { id: "desk-walnut-executive", category: "desk", name: "Walnut Executive Desk", weeklyPrice: 55, image: "/items/desk-walnut-executive.svg", layer: DESK_LAYER },

  // Chairs — exactly one
  { id: "chair-lounge-task", category: "chair", name: "Lounge Task Chair", weeklyPrice: 20, image: "/items/chair-lounge-task.svg", layer: CHAIR_LAYER },
  { id: "chair-ergo-mesh", category: "chair", name: "Ergo Mesh Chair", weeklyPrice: 25, image: "/items/chair-ergo-mesh.svg", layer: CHAIR_LAYER },
  { id: "chair-executive-leather", category: "chair", name: "Executive Leather Chair", weeklyPrice: 35, image: "/items/chair-executive-leather.svg", layer: CHAIR_LAYER },
  { id: "chair-gaming", category: "chair", name: "Gaming Chair", weeklyPrice: 30, image: "/items/chair-gaming.svg", layer: CHAIR_LAYER },

  // Monitors — 0–3, repeatable. Preview uses monitorSlots[i] for the box.
  { id: "monitor-24-fhd", category: "monitor", name: '24" Full HD Monitor', weeklyPrice: 12, image: "/items/monitor-24-fhd.svg", layer: monitorSlots[0] },
  { id: "monitor-27-4k", category: "monitor", name: '27" 4K Monitor', weeklyPrice: 20, image: "/items/monitor-27-4k.svg", layer: monitorSlots[0] },

  // Accessories — zero or more, one of each
  { id: "plants", category: "accessory", name: "Plants", weeklyPrice: 5, image: "/items/plants.svg", layer: { z: 30, left: 76.75, top: 33, width: 5 } },
  { id: "coffee-station", category: "accessory", name: "Coffee Station", weeklyPrice: 15, image: "/items/coffee-station.svg", layer: { z: 30, left: 30.75, top: 37, width: 4.5 } },
  { id: "sport-gear", category: "accessory", name: "Sport Gear", weeklyPrice: 10, image: "/items/sport-gear.svg", layer: { z: 40, left: 84, top: 73.3333, width: 13 } },
  { id: "surfboard", category: "accessory", name: "Surfboard", weeklyPrice: 12, image: "/items/surfboard.svg", layer: { z: 3, left: 86, top: 20, width: 10 } },
  { id: "motorbike", category: "accessory", name: "Motorbike", weeklyPrice: 60, image: "/items/motorbike.svg", layer: { z: 5, left: 3, top: 66.6667, width: 25 } },
  { id: "garage-space", category: "accessory", name: "Garage Space", weeklyPrice: 40, image: "/items/garage-space.svg", layer: { z: 1, left: 2, top: 23.3333, width: 26 } },
];

const byId = new Map(catalog.map((item) => [item.id, item]));

export function getItem(id: string): CatalogItem | undefined {
  return byId.get(id);
}

export function isItemInCategory(id: unknown, category: Category): id is string {
  return typeof id === "string" && byId.get(id)?.category === category;
}

export function itemsInCategory(category: Category): CatalogItem[] {
  return catalog.filter((item) => item.category === category);
}

export const categories: readonly { category: Category; title: string; rule: string }[] = [
  { category: "desk", title: "Desks", rule: "Pick one" },
  { category: "chair", title: "Chairs", rule: "Pick one" },
  { category: "monitor", title: "Monitors", rule: "Up to 3" },
  { category: "accessory", title: "Accessories", rule: "Add any" },
];

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
