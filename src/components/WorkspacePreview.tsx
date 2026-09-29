"use client";

import {
  type Group,
  type Zone,
  GARAGE_SPACE_ID,
  SCENE_ASPECT_RATIO,
  formatPrice,
  getItem,
  groupMeta,
  hotspots,
  zoneOf,
  zones,
} from "@/lib/catalog";
import { type Selection, hasGarageSpace, lineItems } from "@/lib/configurator";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { LAYER_IN_DURATION, layerStaggerAmount, layersFor } from "@/lib/scene";
import { useRef } from "react";
import { useConfigurator } from "./ConfiguratorProvider";

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
      <img src={scene.image} alt="" className="absolute inset-0 h-full w-full select-none object-cover" draggable={false} />
      {layersFor(selection, zone).map(({ key, item, box }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={item.image}
          alt=""
          draggable={false}
          // Marks a freshly mounted layer; WorkspacePreview animates it in once and clears the mark.
          data-new=""
          className="absolute h-auto select-none transition-[left] duration-300 ease-out motion-reduce:transition-none"
          style={{
            left: `${box.left}%`,
            ...(box.bottom !== undefined ? { bottom: `${100 - box.bottom}%` } : { top: `${box.top}%` }),
            width: `${box.width}%`,
            zIndex: box.z,
          }}
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
              className="group absolute z-[60] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {!isActive && (
                <span aria-hidden="true" className="absolute h-5 w-5 rounded-full bg-raised/60 motion-safe:animate-ping" />
              )}
              <span
                aria-hidden="true"
                className={[
                  "relative flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium shadow-float ring-2 transition duration-200 ease-out motion-reduce:transition-none",
                  isActive
                    ? "bg-accent text-accent-contrast ring-raised"
                    : "bg-raised text-ink ring-ink/70 group-hover:scale-110 motion-reduce:group-hover:scale-100",
                ].join(" ")}
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-full mt-0.5 whitespace-nowrap rounded-control bg-ink/85 px-1.5 py-0.5 text-[11px] font-medium text-raised opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
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
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-ink/45 p-4">
      <div className="max-w-xs rounded-card bg-raised p-4 text-center shadow-float">
        <p className="font-display text-title text-ink">Garage space not rented</p>
        <p className="mt-1 text-sm text-muted">Rent it to store a motorbike, surfboard or sport gear.</p>
        {interactive && (
          <button
            type="button"
            onClick={() => dispatch({ type: "toggleAccessory", id: GARAGE_SPACE_ID })}
            className="mt-3 w-full rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
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
  const previewRef = useRef<HTMLDivElement>(null);
  // Changes whenever a layer mounts or unmounts (swap, add, remove, preset, zone switch).
  const layerKeys = hydrated ? layersFor(selection, zone).map((l) => l.key).join("|") : "";

  // Newly mounted layers fade and settle in; several at once (a preset) enter with a short stagger.
  useGSAP(
    () => {
      const fresh = gsap.utils.toArray<HTMLElement>("[data-new]", previewRef.current);
      if (!fresh.length) return;
      fresh.forEach((el) => el.removeAttribute("data-new"));
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(fresh, {
          opacity: 0,
          y: 6,
          scale: 0.97,
          transformOrigin: "50% 100%",
          duration: LAYER_IN_DURATION,
          ease: "power2.out",
          // Whole stagger (incl. the last layer's own 240 ms) stays within 500 ms.
          stagger: { amount: layerStaggerAmount(fresh.length) },
        });
      });
    },
    { scope: previewRef, dependencies: [layerKeys], revertOnUpdate: true },
  );

  const label = !hydrated
    ? `${zoneTitle} preview loading`
    : names.length
      ? `${zoneTitle} preview: ${names.join(", ")}`
      : `${zoneTitle} preview: empty`;

  return (
    <div
      ref={previewRef}
      className="relative w-full overflow-hidden rounded-card border border-line bg-raised shadow-float"
      style={{ aspectRatio: SCENE_ASPECT_RATIO }}
    >
      <div role="img" aria-label={label} className="absolute inset-0">
        {hydrated ? (
          <>
            <SceneLayers selection={selection} zone={zone} />
            {names.length === 0 && !garageLocked && (
              <p className="absolute inset-x-0 bottom-3 text-center text-sm text-muted">
                {onHotspot ? "Tap a + to add items" : "Nothing here yet"}
              </p>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-line motion-safe:animate-pulse" />
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
          {shown.length > 1 && <figcaption className="text-sm font-medium text-muted">{title}</figcaption>}
          <WorkspacePreview zone={zone} />
        </figure>
      ))}
    </div>
  );
}
