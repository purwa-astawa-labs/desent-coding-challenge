/**
 * Static seed catalog (see _bmad-output/spec-design-your-workspace/catalog.md).
 *
 * Every item owns a layer box in the 2D preview. The preview scene is a fixed
 * 4:3 box (800×600 design units). `left` and `width` are percentages of the
 * scene width, `top` is a percentage of the scene height; the image height
 * follows from the image's own aspect ratio. To replace an image, edit `image`
 * and keep the new file's aspect ratio the same as the placeholder's viewBox.
 */

/** Selection behavior: one desk, one chair, 0–3 monitors, accessories toggle. */
export type Category = "desk" | "chair" | "monitor" | "accessory";

/** Each zone has its own scene (visualizer). */
export type Zone = "workspace" | "lounge" | "garage";

/** How items are grouped in pickers; each group belongs to one zone. */
export type Group = "desk" | "chair" | "monitor" | "desk-accessory" | "lounge" | "garage";

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
  group: Group;
  name: string;
  /** USD per week. */
  weeklyPrice: number;
  /** Path under /public. */
  image: string;
  /** Box in its zone's scene. Omitted for the garage space, which is shown as the garage scene itself. */
  layer?: LayerBox;
}

export const SCENE_ASPECT_RATIO = "4 / 3";

export const zones: readonly { zone: Zone; title: string; image: string }[] = [
  { zone: "workspace", title: "Workspace", image: "/scene/room.svg" },
  { zone: "lounge", title: "Lounge", image: "/scene/lounge.svg" },
  { zone: "garage", title: "Garage", image: "/scene/garage.svg" },
];

/** Renting the garage space is required for any garage gear. */
export const GARAGE_SPACE_ID = "garage-space";
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
  { id: "desk-minimal-white", category: "desk", group: "desk", name: "Minimal White Desk", weeklyPrice: 30, image: "/items/desk-minimal-white.svg", layer: DESK_LAYER },
  { id: "desk-oak-standing", category: "desk", group: "desk", name: "Oak Standing Desk", weeklyPrice: 45, image: "/items/desk-oak-standing.svg", layer: DESK_LAYER },
  { id: "desk-walnut-executive", category: "desk", group: "desk", name: "Walnut Executive Desk", weeklyPrice: 55, image: "/items/desk-walnut-executive.svg", layer: DESK_LAYER },

  // Chairs — exactly one
  { id: "chair-lounge-task", category: "chair", group: "chair", name: "Lounge Task Chair", weeklyPrice: 20, image: "/items/chair-lounge-task.svg", layer: CHAIR_LAYER },
  { id: "chair-ergo-mesh", category: "chair", group: "chair", name: "Ergo Mesh Chair", weeklyPrice: 25, image: "/items/chair-ergo-mesh.svg", layer: CHAIR_LAYER },
  { id: "chair-executive-leather", category: "chair", group: "chair", name: "Executive Leather Chair", weeklyPrice: 35, image: "/items/chair-executive-leather.svg", layer: CHAIR_LAYER },
  { id: "chair-gaming", category: "chair", group: "chair", name: "Gaming Chair", weeklyPrice: 30, image: "/items/chair-gaming.svg", layer: CHAIR_LAYER },

  // Monitors — 0–3, repeatable. Preview uses monitorSlots[i] for the box.
  { id: "monitor-24-fhd", category: "monitor", group: "monitor", name: '24" Full HD Monitor', weeklyPrice: 12, image: "/items/monitor-24-fhd.svg", layer: monitorSlots[0] },
  { id: "monitor-27-4k", category: "monitor", group: "monitor", name: '27" 4K Monitor', weeklyPrice: 20, image: "/items/monitor-27-4k.svg", layer: monitorSlots[0] },

  // Desk accessories — shown on the workspace scene
  { id: "plants", category: "accessory", group: "desk-accessory", name: "Plants", weeklyPrice: 5, image: "/items/plants.svg", layer: { z: 30, left: 76.75, top: 33, width: 5 } },
  { id: "desk-lamp", category: "accessory", group: "desk-accessory", name: "Desk Lamp", weeklyPrice: 6, image: "/items/desk-lamp.svg", layer: { z: 30, left: 30.3, top: 30.8, width: 6 } },
  { id: "headphones", category: "accessory", group: "desk-accessory", name: "Headphones", weeklyPrice: 8, image: "/items/headphones.svg", layer: { z: 35, left: 70, top: 41, width: 7 } },

  // Lounge zone — own scene
  { id: "sofa", category: "accessory", group: "lounge", name: "Sofa", weeklyPrice: 35, image: "/items/sofa.svg", layer: { z: 10, left: 30, top: 44, width: 40 } },
  { id: "bean-bag", category: "accessory", group: "lounge", name: "Bean Bag", weeklyPrice: 12, image: "/items/bean-bag.svg", layer: { z: 20, left: 14, top: 70, width: 16.25 } },
  { id: "floor-plant", category: "accessory", group: "lounge", name: "Floor Plant", weeklyPrice: 7, image: "/items/floor-plant.svg", layer: { z: 8, left: 78, top: 42, width: 10 } },
  { id: "coffee-station", category: "accessory", group: "lounge", name: "Coffee Station", weeklyPrice: 15, image: "/items/coffee-station.svg", layer: { z: 6, left: 8, top: 42, width: 15 } },

  // Garage — own scene; gear needs the garage space
  { id: GARAGE_SPACE_ID, category: "accessory", group: "garage", name: "Garage Space", weeklyPrice: 40, image: "/items/garage-space.svg" },
  { id: "motorbike", category: "accessory", group: "garage", name: "Motorbike", weeklyPrice: 60, image: "/items/motorbike.svg", layer: { z: 10, left: 32, top: 50, width: 36 } },
  { id: "surfboard", category: "accessory", group: "garage", name: "Surfboard", weeklyPrice: 12, image: "/items/surfboard.svg", layer: { z: 5, left: 6, top: 24, width: 10 } },
  { id: "sport-gear", category: "accessory", group: "garage", name: "Sport Gear", weeklyPrice: 10, image: "/items/sport-gear.svg", layer: { z: 12, left: 76, top: 60, width: 16 } },
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

export function itemsInGroup(group: Group): CatalogItem[] {
  return catalog.filter((item) => item.group === group);
}

/** Garage gear (not the space itself). */
export function isGarageGear(id: string): boolean {
  return id !== GARAGE_SPACE_ID && byId.get(id)?.group === "garage";
}

export const groups: readonly { group: Group; zone: Zone; title: string; rule: string }[] = [
  { group: "desk", zone: "workspace", title: "Desks", rule: "Pick one" },
  { group: "chair", zone: "workspace", title: "Chairs", rule: "Pick one" },
  { group: "monitor", zone: "workspace", title: "Monitors", rule: "Up to 3" },
  { group: "desk-accessory", zone: "workspace", title: "Desk accessories", rule: "Add any" },
  { group: "lounge", zone: "lounge", title: "Lounge zone", rule: "Add any" },
  { group: "garage", zone: "garage", title: "Garage", rule: "Gear needs garage space" },
];

export function groupMeta(group: Group) {
  return groups.find((g) => g.group === group)!;
}

export function zoneOf(item: CatalogItem): Zone {
  return groupMeta(item.group).zone;
}

/** Tap targets on each zone's scene, one per group; `x`/`y` are % of the scene width/height. */
export const hotspots: readonly { group: Group; x: number; y: number }[] = [
  { group: "monitor", x: 56, y: 36 },
  { group: "desk", x: 37, y: 55 },
  { group: "chair", x: 52, y: 68 },
  { group: "desk-accessory", x: 79, y: 39 },
  { group: "lounge", x: 50, y: 58 },
  { group: "garage", x: 50, y: 64 },
];

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
