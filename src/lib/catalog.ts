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

/**
 * An image's box in a scene. Placed by its top edge (`top`) or, for things that stand on a surface
 * (monitors on the desk), by its bottom edge (`bottom`); the height follows from the image's ratio.
 */
export type LayerBox = {
  /** Stacking order; higher draws in front. */
  z: number;
  /** % of scene width. */
  left: number;
  /** % of scene width. */
  width: number;
} & (
  | { /** % of scene height. */ top: number; bottom?: never }
  | { /** % of scene height where the bottom edge sits. */ bottom: number; top?: never }
);

export interface CatalogItem {
  id: string;
  category: Category;
  group: Group;
  name: string;
  /** USD per week. */
  weeklyPrice: number;
  /** Path under /public. The image layered into the scene (for chairs, the rear view). */
  image: string;
  /** Optional path under /public for cards, pickers and the details gallery (e.g. a chair's front view). Falls back to `image`. */
  thumbnail?: string;
  /** Box in its zone's scene. Omitted for the garage space, which is shown as the garage scene itself. */
  layer?: LayerBox;
}

export const SCENE_ASPECT_RATIO = "4 / 3";

export const zones: readonly { zone: Zone; title: string; image: string }[] = [
  { zone: "workspace", title: "Workspace", image: "/scene/room.webp" },
  { zone: "lounge", title: "Lounge", image: "/scene/lounge.webp" },
  { zone: "garage", title: "Garage", image: "/scene/garage.webp" },
];

/** Renting the garage space is required for any garage gear. */
export const GARAGE_SPACE_ID = "garage-space";
export const MAX_MONITORS = 3;

/** Horizontal center of the desks, % of scene width. */
export const DESK_CENTER = 56;
/** Where things placed against the lounge wall stand: just in front of the wall–floor line (76.8%), % of scene height. */
export const LOUNGE_FLOOR = 79.5;
/** Where monitor bases stand on the desk surface, % of scene height. */
export const MONITOR_BASE = 46;

const DESK_LAYER: LayerBox = { z: 10, left: 30, top: 45, width: 52 };
// Photo chairs (rear view): ~65 cm wide against the 140 cm desk, centered on the desk, castors in front of its feet.
const CHAIR_LAYER: LayerBox = { z: 50, left: 44, top: 47, width: 24 };
// Taller chairs share the width and castor line (93.7% of the scene); their extra height goes upward.
const TALL_CHAIR_LAYER: LayerBox = { z: 50, left: 44, top: 30.75, width: 24 };
const GAMING_CHAIR_LAYER: LayerBox = { z: 50, left: 44, top: 31.85, width: 24 };

export const catalog: readonly CatalogItem[] = [
  // Desks — exactly one
  { id: "desk-minimal-white", category: "desk", group: "desk", name: "Minimal White Desk", weeklyPrice: 30, image: "/items/desk-minimal-white.webp", layer: DESK_LAYER },
  { id: "desk-oak-standing", category: "desk", group: "desk", name: "Oak Standing Desk", weeklyPrice: 45, image: "/items/desk-oak-standing.webp", layer: DESK_LAYER },

  // Chairs — exactly one
  { id: "chair-lounge-task", category: "chair", group: "chair", name: "Lounge Task Chair", weeklyPrice: 20, image: "/items/chair-lounge-task.webp", thumbnail: "/items/chair-lounge-task-front.webp", layer: CHAIR_LAYER },
  { id: "chair-ergo-mesh", category: "chair", group: "chair", name: "Ergo Mesh Chair", weeklyPrice: 25, image: "/items/chair-ergo-mesh.webp", thumbnail: "/items/chair-ergo-mesh-front.webp", layer: TALL_CHAIR_LAYER },
  { id: "chair-gaming", category: "chair", group: "chair", name: "Gaming Chair", weeklyPrice: 30, image: "/items/chair-gaming.webp", thumbnail: "/items/chair-gaming-front.webp", layer: GAMING_CHAIR_LAYER },

  // Monitors — 0–3, repeatable. Only `width` is used: the preview lays them out by count (see monitorBoxes).
  { id: "monitor-24-fhd", category: "monitor", group: "monitor", name: '24" Full HD Monitor', weeklyPrice: 12, image: "/items/monitor-24-fhd.webp", layer: { z: 20, left: DESK_CENTER - 9, bottom: MONITOR_BASE, width: 18 } },
  { id: "monitor-27-4k", category: "monitor", group: "monitor", name: '27" 4K Monitor', weeklyPrice: 20, image: "/items/monitor-27-4k.webp", layer: { z: 20, left: DESK_CENTER - 10.25, bottom: MONITOR_BASE, width: 20.5 } },

  // Desk accessories — shown on the workspace scene
  { id: "plants", category: "accessory", group: "desk-accessory", name: "Desk Plant", weeklyPrice: 5, image: "/items/plants.webp", layer: { z: 30, left: 75.5, bottom: MONITOR_BASE, width: 6.5 } },
  // Behind the monitors (z 15): in a 3-monitor bank only its head shows above the left screen.
  { id: "desk-lamp", category: "accessory", group: "desk-accessory", name: "Desk Lamp", weeklyPrice: 6, image: "/items/desk-lamp.webp", layer: { z: 15, left: 31, bottom: MONITOR_BASE, width: 5.4 } },

  // Lounge zone — own scene
  { id: "bean-bag", category: "accessory", group: "lounge", name: "Bean Bag", weeklyPrice: 12, image: "/items/bean-bag.webp", layer: { z: 20, left: 21, bottom: 96, width: 24 } },
  { id: "coffee-station", category: "accessory", group: "lounge", name: "Coffee Station", weeklyPrice: 15, image: "/items/coffee-station.webp", layer: { z: 6, left: 8, bottom: LOUNGE_FLOOR, width: 18 } },

  // Garage — own scene; gear needs the garage space
  { id: GARAGE_SPACE_ID, category: "accessory", group: "garage", name: "Garage Space", weeklyPrice: 40, image: "/items/garage-space.webp" },
  { id: "motorbike", category: "accessory", group: "garage", name: "Yamaha NMAX", weeklyPrice: 60, image: "/items/motorbike.webp", layer: { z: 10, left: 25, bottom: 97, width: 52 } },
  { id: "surfboard", category: "accessory", group: "garage", name: "Surfboard", weeklyPrice: 12, image: "/items/surfboard.webp", layer: { z: 5, left: 12, bottom: 83, width: 11.2 } },
];

const byId = new Map(catalog.map((item) => [item.id, item]));

/** The image to show on product cards and as the first details photo. */
export function cardImage(item: Pick<CatalogItem, "image" | "thumbnail">): string {
  return item.thumbnail ?? item.image;
}

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
  { group: "chair", x: 56, y: 62 },
  { group: "desk-accessory", x: 79, y: 39 },
  { group: "lounge", x: 22, y: 64 },
  { group: "garage", x: 50, y: 72 },
];

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
