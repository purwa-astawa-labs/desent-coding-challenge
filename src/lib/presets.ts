import type { Selection } from "./configurator";

/** Ready-made setups offered when the workspace is empty. Applying one replaces the selection. */
export interface Preset {
  id: string;
  name: string;
  description: string;
  selection: Selection;
}

export const presets: readonly Preset[] = [
  {
    id: "dual-monitor",
    name: "Dual Monitor",
    description: 'Two 24" screens on a clean white desk',
    selection: {
      deskId: "desk-minimal-white",
      chairId: "chair-ergo-mesh",
      monitorIds: ["monitor-24-fhd", "monitor-24-fhd"],
      accessoryIds: ["plants"],
    },
  },
  {
    id: "triple-monitor",
    name: "Triple Monitor",
    description: 'Three 27" 4K screens for maximum screen space',
    selection: {
      deskId: "desk-walnut-executive",
      chairId: "chair-executive-leather",
      monitorIds: ["monitor-27-4k", "monitor-27-4k", "monitor-27-4k"],
      accessoryIds: [],
    },
  },
  {
    id: "standing-desk",
    name: "Standing Desk",
    description: "Oak standing desk, a 4K screen and a desk lamp",
    selection: {
      deskId: "desk-oak-standing",
      chairId: "chair-ergo-mesh",
      monitorIds: ["monitor-27-4k"],
      accessoryIds: ["desk-lamp", "plants"],
    },
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Gaming chair with dual 4K screens",
    selection: {
      deskId: "desk-walnut-executive",
      chairId: "chair-gaming",
      monitorIds: ["monitor-27-4k", "monitor-27-4k"],
      accessoryIds: [],
    },
  },
];
