"use client";

import {
  type CatalogItem,
  type Group,
  type LayerBox,
  type Zone,
  GARAGE_SPACE_ID,
  SCENE_ASPECT_RATIO,
  formatPrice,
  getItem,
  groupMeta,
  hotspots,
  monitorSlots,
  zoneOf,
  zones,
} from "@/lib/catalog";
import { type Selection, hasGarageSpace, lineItems } from "@/lib/configurator";
import { useConfigurator } from "./ConfiguratorProvider";

interface Layer {
  key: string;
  item: CatalogItem;
  box: LayerBox;
}

function layersFor(selection: Selection, zone: Zone): Layer[] {
  const layers: Layer[] = [];
  const add = (key: string, id: string | undefined, box?: LayerBox) => {
    const item = id ? getItem(id) : undefined;
    const layer = box ?? item?.layer;
    if (item && layer && zoneOf(item) === zone) layers.push({ key, item, box: layer });
  };
  add("desk", selection.deskId);
  add("chair", selection.chairId);
  // Monitors: slot box by index, model only decides the image.
  selection.monitorIds.forEach((id, i) => add(`monitor-${i}`, id, monitorSlots[i]));
  selection.accessoryIds.forEach((id) => add(`accessory-${id}`, id));
  return layers.sort((a, b) => a.box.z - b.box.z);
}

/** Names of the selected items that belong to a zone (the garage space counts for the garage). */
export function zoneItemNames(selection: Selection, zone: Zone): string[] {
  return lineItems(selection)
    .filter(({ item }) => zoneOf(item) === zone)
    .map(({ item }) => item.name);
}

/** A zone's scene layers only (base scene + one image per selected item in it). Sized by its parent. */
export function SceneLayers({ selection, zone = "workspace" }: { selection: Selection; zone?: Zone }) {
  const scene = zones.find((z) => z.zone === zone)!;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- plain img keeps Vercel image optimization out of play */}
      <img src={scene.image} alt="" className="absolute inset-0 h-full w-full select-none" draggable={false} />
      {layersFor(selection, zone).map(({ key, item, box }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={item.image}
          alt=""
          draggable={false}
          className="absolute h-auto select-none"
          style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, zIndex: box.z }}
        />
      ))}
    </>
  );
}

/** Pulsing tap targets over a zone's scene, one per group. */
function Hotspots({
  zone,
  active,
  onSelect,
}: {
  zone: Zone;
  active?: Group | null;
  onSelect: (group: Group) => void;
}) {
  return (
    <>
      {hotspots
        .filter(({ group }) => groupMeta(group).zone === zone)
        .map(({ group, x, y }) => {
          const title = groupMeta(group).title;
          const isActive = active === group;
          return (
            <button
              key={group}
              type="button"
              aria-label={`Change ${title.toLowerCase()}`}
              aria-expanded={isActive}
              onClick={() => onSelect(group)}
              className="group absolute z-[60] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {!isActive && (
                <span aria-hidden="true" className="absolute h-6 w-6 animate-ping rounded-full bg-white/70 motion-reduce:hidden" />
              )}
              <span
                aria-hidden="true"
                className={[
                  "relative flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold shadow-md ring-2 transition",
                  isActive ? "bg-stone-900 text-white ring-white" : "bg-white text-stone-900 ring-stone-900/80 group-hover:scale-110",
                ].join(" ")}
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-full mt-0.5 whitespace-nowrap rounded-md bg-stone-900/85 px-1.5 py-0.5 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {title}
              </span>
            </button>
          );
        })}
    </>
  );
}

/** Dims the garage scene until the garage space is rented; offers to rent it when interactive. */
function GarageLocked({ interactive }: { interactive: boolean }) {
  const { dispatch } = useConfigurator();
  const price = getItem(GARAGE_SPACE_ID)!.weeklyPrice;
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-stone-900/45 p-4">
      <div className="max-w-xs rounded-2xl bg-white p-4 text-center shadow-xl">
        <p className="font-semibold text-stone-900">Garage space not rented</p>
        <p className="mt-1 text-sm text-stone-600">Rent it to store a motorbike, surfboard or sport gear.</p>
        {interactive && (
          <button
            type="button"
            onClick={() => dispatch({ type: "toggleAccessory", id: GARAGE_SPACE_ID })}
            className="mt-3 w-full rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700"
          >
            Rent garage space · {formatPrice(price)}/week
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The live preview of one zone of the current selection. Pass `onHotspot` to show tap
 * targets that open a picker for that group (the configurator does; checkout does not).
 */
export function WorkspacePreview({
  zone = "workspace",
  activeHotspot,
  onHotspot,
}: { zone?: Zone; activeHotspot?: Group | null; onHotspot?: (group: Group) => void } = {}) {
  const { selection, hydrated } = useConfigurator();
  const names = zoneItemNames(selection, zone);
  const zoneTitle = zones.find((z) => z.zone === zone)!.title;
  const garageLocked = zone === "garage" && !hasGarageSpace(selection);
  const label = !hydrated
    ? `${zoneTitle} preview loading`
    : names.length
      ? `${zoneTitle} preview: ${names.join(", ")}`
      : `${zoneTitle} preview: empty`;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm"
      style={{ aspectRatio: SCENE_ASPECT_RATIO }}
    >
      <div role="img" aria-label={label} className="absolute inset-0">
        {hydrated ? (
          <>
            <SceneLayers selection={selection} zone={zone} />
            {names.length === 0 && !garageLocked && (
              <p className="absolute inset-x-0 bottom-3 text-center text-sm text-stone-500">
                {onHotspot ? "Tap a + to add items" : "Nothing here yet"}
              </p>
            )}
          </>
        ) : (
          <div className="absolute inset-0 animate-pulse bg-stone-200" />
        )}
      </div>
      {hydrated && garageLocked && <GarageLocked interactive={Boolean(onHotspot)} />}
      {hydrated && onHotspot && !garageLocked && <Hotspots zone={zone} active={activeHotspot} onSelect={onHotspot} />}
    </div>
  );
}

/** Read-only previews of every zone that has something in it (workspace always). Used on checkout. */
export function SelectionPreviews() {
  const { selection } = useConfigurator();
  const shown = zones.filter(({ zone }) =>
    zone === "workspace" ? true : zone === "garage" ? hasGarageSpace(selection) : zoneItemNames(selection, zone).length > 0,
  );
  return (
    <div className="space-y-3">
      {shown.map(({ zone, title }) => (
        <figure key={zone} className="space-y-1">
          {shown.length > 1 && <figcaption className="text-sm font-medium text-stone-600">{title}</figcaption>}
          <WorkspacePreview zone={zone} />
        </figure>
      ))}
    </div>
  );
}
