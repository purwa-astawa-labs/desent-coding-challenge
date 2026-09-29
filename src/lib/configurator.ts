import { type CatalogItem, MAX_MONITORS, getItem, isItemInCategory } from "./catalog";

/** The user's workspace. Pure data; no UI concerns. */
export interface Selection {
  deskId?: string;
  chairId?: string;
  /** Ordered; the same model may repeat. Max MAX_MONITORS. */
  monitorIds: string[];
  /** Each accessory at most once, in the order added. */
  accessoryIds: string[];
}

export const emptySelection: Selection = { monitorIds: [], accessoryIds: [] };

export type SelectionAction =
  | { type: "selectDesk"; id: string }
  | { type: "selectChair"; id: string }
  | { type: "addMonitor"; id: string }
  | { type: "removeMonitor"; index: number }
  | { type: "toggleAccessory"; id: string }
  | { type: "reset" }
  | { type: "applyPreset"; selection: Selection }
  | { type: "hydrate"; selection: Selection };

export function selectionReducer(state: Selection, action: SelectionAction): Selection {
  switch (action.type) {
    case "selectDesk":
      if (!isItemInCategory(action.id, "desk") || state.deskId === action.id) return state;
      return { ...state, deskId: action.id };
    case "selectChair":
      if (!isItemInCategory(action.id, "chair") || state.chairId === action.id) return state;
      return { ...state, chairId: action.id };
    case "addMonitor":
      if (!isItemInCategory(action.id, "monitor") || state.monitorIds.length >= MAX_MONITORS) return state;
      return { ...state, monitorIds: [...state.monitorIds, action.id] };
    case "removeMonitor":
      if (!Number.isInteger(action.index) || action.index < 0 || action.index >= state.monitorIds.length) return state;
      return { ...state, monitorIds: state.monitorIds.filter((_, i) => i !== action.index) };
    case "toggleAccessory":
      if (!isItemInCategory(action.id, "accessory")) return state;
      return {
        ...state,
        accessoryIds: state.accessoryIds.includes(action.id)
          ? state.accessoryIds.filter((id) => id !== action.id)
          : [...state.accessoryIds, action.id],
      };
    case "reset":
      return emptySelection;
    case "applyPreset":
    case "hydrate":
      return sanitizeSelection(action.selection);
    default:
      return state;
  }
}

export interface LineItem {
  /** Stable React key (monitors repeat, so index is included). */
  key: string;
  item: CatalogItem;
}

/** Desk, chair, monitors (in order), then accessories (in order added). */
export function lineItems(selection: Selection): LineItem[] {
  const out: LineItem[] = [];
  const push = (id: string | undefined, key: string) => {
    const item = id ? getItem(id) : undefined;
    if (item) out.push({ key, item });
  };
  push(selection.deskId, "desk");
  push(selection.chairId, "chair");
  selection.monitorIds.forEach((id, i) => push(id, `monitor-${i}`));
  selection.accessoryIds.forEach((id) => push(id, `accessory-${id}`));
  return out;
}

export function weeklyTotal(selection: Selection): number {
  return lineItems(selection).reduce((sum, { item }) => sum + item.weeklyPrice, 0);
}

export function rentalTotal(selection: Selection, weeks: number): number {
  if (!Number.isInteger(weeks) || weeks < 1) return 0;
  return weeklyTotal(selection) * weeks;
}

export function hasDeskAndChair(selection: Selection): boolean {
  return Boolean(selection.deskId && selection.chairId);
}

/** Coerce any value into a valid Selection: unknown ids dropped, monitors capped, accessories de-duplicated. */
export function sanitizeSelection(value: unknown): Selection {
  if (typeof value !== "object" || value === null) return emptySelection;
  const v = value as Record<string, unknown>;
  const monitors = Array.isArray(v.monitorIds) ? v.monitorIds : [];
  const accessories = Array.isArray(v.accessoryIds) ? v.accessoryIds : [];
  const selection: Selection = {
    monitorIds: monitors.filter((id): id is string => isItemInCategory(id, "monitor")).slice(0, MAX_MONITORS),
    accessoryIds: [...new Set(accessories.filter((id): id is string => isItemInCategory(id, "accessory")))],
  };
  if (isItemInCategory(v.deskId, "desk")) selection.deskId = v.deskId;
  if (isItemInCategory(v.chairId, "chair")) selection.chairId = v.chairId;
  return selection;
}

/** Parse the localStorage payload. Never throws. */
export function parseStoredSelection(raw: string | null | undefined): Selection {
  if (!raw) return emptySelection;
  try {
    return sanitizeSelection(JSON.parse(raw));
  } catch {
    return emptySelection;
  }
}

export const STORAGE_KEY = "design-your-workspace:selection:v1";
