"use client";

import { type CatalogItem, type LayerBox, SCENE_ASPECT_RATIO, SCENE_IMAGE, getItem, monitorSlots } from "@/lib/catalog";
import { type Selection, lineItems } from "@/lib/configurator";
import { useConfigurator } from "./ConfiguratorProvider";

interface Layer {
  key: string;
  item: CatalogItem;
  box: LayerBox;
}

function layersFor(selection: Selection): Layer[] {
  const layers: Layer[] = [];
  const add = (key: string, id: string | undefined, box?: LayerBox) => {
    const item = id ? getItem(id) : undefined;
    if (item) layers.push({ key, item, box: box ?? item.layer });
  };
  add("desk", selection.deskId);
  add("chair", selection.chairId);
  // Monitors: slot box by index, model only decides the image.
  selection.monitorIds.forEach((id, i) => add(`monitor-${i}`, id, monitorSlots[i]));
  selection.accessoryIds.forEach((id) => add(`accessory-${id}`, id));
  return layers.sort((a, b) => a.box.z - b.box.z);
}

export function WorkspacePreview() {
  const { selection, hydrated } = useConfigurator();
  const layers = hydrated ? layersFor(selection) : [];
  const names = lineItems(selection).map((l) => l.item.name);
  const label = !hydrated
    ? "Workspace preview loading"
    : names.length
      ? `Workspace preview: ${names.join(", ")}`
      : "Workspace preview: empty room";

  return (
    <div
      role="img"
      aria-label={label}
      className="relative w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm"
      style={{ aspectRatio: SCENE_ASPECT_RATIO }}
    >
      {hydrated ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- plain img keeps Vercel image optimization out of play */}
          <img src={SCENE_IMAGE} alt="" className="absolute inset-0 h-full w-full select-none" draggable={false} />
          {layers.map(({ key, item, box }) => (
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
          {layers.length === 0 && (
            <p className="absolute inset-x-0 bottom-3 text-center text-sm text-stone-500">
              Pick a desk to start building
            </p>
          )}
        </>
      ) : (
        <div className="absolute inset-0 animate-pulse bg-stone-200" />
      )}
    </div>
  );
}
