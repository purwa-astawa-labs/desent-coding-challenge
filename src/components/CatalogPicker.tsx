"use client";

import {
  type CatalogItem,
  type Group,
  type Zone,
  GARAGE_SPACE_ID,
  MAX_MONITORS,
  formatPrice,
  getItem,
  groupMeta,
  groups,
  isGarageGear,
  itemsInCategory,
  itemsInGroup,
} from "@/lib/catalog";
import { hasGarageSpace } from "@/lib/configurator";
import { useConfigurator } from "./ConfiguratorProvider";

function ItemVisual({ item }: { item: CatalogItem }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-stone-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-contain p-2" draggable={false} />
    </div>
  );
}

function ItemText({ item }: { item: CatalogItem }) {
  return (
    <span className="mt-2 block text-left">
      <span className="block text-sm font-medium leading-snug text-stone-900">{item.name}</span>
      <span className="block text-sm text-stone-600">{formatPrice(item.weeklyPrice)}/week</span>
    </span>
  );
}

function cardClass(selected: boolean, disabled = false) {
  return [
    "flex w-full min-w-0 flex-col rounded-xl border bg-white p-2 text-left transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
    selected ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200 hover:border-stone-400",
    disabled ? "cursor-not-allowed opacity-50" : "",
  ].join(" ");
}

function SelectedBadge() {
  return (
    <span className="mt-1 self-start rounded-full bg-stone-900 px-2 py-0.5 text-xs font-medium text-white">Selected</span>
  );
}

function SingleChoice({ category }: { category: "desk" | "chair" }) {
  const { selection, dispatch } = useConfigurator();
  const current = category === "desk" ? selection.deskId : selection.chairId;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2">
      {itemsInCategory(category).map((item) => {
        const selected = current === item.id;
        return (
          <li key={item.id} className="min-w-0">
            <button
              type="button"
              aria-pressed={selected}
              className={cardClass(selected)}
              onClick={() => dispatch({ type: category === "desk" ? "selectDesk" : "selectChair", id: item.id })}
            >
              <ItemVisual item={item} />
              <ItemText item={item} />
              {selected && <SelectedBadge />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Monitors() {
  const { selection, dispatch } = useConfigurator();
  const full = selection.monitorIds.length >= MAX_MONITORS;
  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2">
        {itemsInCategory("monitor").map((item) => {
          const count = selection.monitorIds.filter((id) => id === item.id).length;
          return (
            <li key={item.id} className="min-w-0">
              <button
                type="button"
                disabled={full}
                aria-label={
                  full
                    ? `${item.name}, ${count} added. Maximum of ${MAX_MONITORS} monitors reached`
                    : `Add ${item.name}${count > 0 ? `, ${count} added` : ""}`
                }
                className={cardClass(count > 0, full)}
                onClick={() => dispatch({ type: "addMonitor", id: item.id })}
              >
                <ItemVisual item={item} />
                <ItemText item={item} />
                <span className="mt-1 text-sm font-medium text-stone-900">
                  {full ? "Max 3 monitors" : "+ Add"}
                  {count > 0 && <span className="ml-1 text-stone-500">({count} added)</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-stone-600" aria-live="polite">
        {selection.monitorIds.length} of {MAX_MONITORS} monitors
      </p>
      {selection.monitorIds.length > 0 && (
        <ol className="space-y-2">
          {selection.monitorIds.map((id, i) => {
            const item = getItem(id);
            if (!item) return null;
            return (
              <li
                key={`${i}-${id}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate">
                  <span className="text-stone-500">Slot {i + 1}:</span> {item.name}
                </span>
                <button
                  type="button"
                  className="shrink-0 rounded-md px-2 py-1 font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700"
                  aria-label={`Remove ${item.name} from slot ${i + 1}`}
                  onClick={() => dispatch({ type: "removeMonitor", index: i })}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/** Toggle cards for an accessory group (desk accessories, lounge, garage). */
function ToggleGroup({ group }: { group: Group }) {
  const { selection, dispatch } = useConfigurator();
  const garageRented = hasGarageSpace(selection);
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2">
      {itemsInGroup(group).map((item) => {
        const selected = selection.accessoryIds.includes(item.id);
        const note =
          item.id === GARAGE_SPACE_ID
            ? "Required for garage gear"
            : isGarageGear(item.id) && !garageRented
              ? "Adds garage space"
              : null;
        return (
          <li key={item.id} className="min-w-0">
            <button
              type="button"
              aria-pressed={selected}
              className={cardClass(selected)}
              onClick={() => dispatch({ type: "toggleAccessory", id: item.id })}
            >
              <ItemVisual item={item} />
              <ItemText item={item} />
              {note && <span className="text-xs text-stone-500">{note}</span>}
              {selected ? <SelectedBadge /> : <span className="mt-1 text-sm font-medium text-stone-900">+ Add</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Section({ group }: { group: Group }) {
  const meta = groupMeta(group);
  return (
    <section aria-labelledby={`section-${group}`} className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id={`section-${group}`} tabIndex={-1} className="scroll-mt-2 text-lg font-semibold text-stone-900 outline-none">
          {meta.title}
        </h2>
        <span className="text-sm text-stone-500">{meta.rule}</span>
      </div>
      {group === "desk" || group === "chair" ? (
        <SingleChoice category={group} />
      ) : group === "monitor" ? (
        <Monitors />
      ) : (
        <ToggleGroup group={group} />
      )}
    </section>
  );
}

/** Picker sections for the groups in one zone. */
export function CatalogPicker({ zone }: { zone: Zone }) {
  const { hydrated } = useConfigurator();
  const zoneGroups = groups.filter((g) => g.zone === zone);
  if (!hydrated) {
    // Neutral skeleton: no selected states until the saved selection is loaded.
    return (
      <div className="space-y-8" aria-busy="true">
        {zoneGroups.map(({ group, title }) => (
          <section key={group} className="space-y-3">
            <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2">
              {itemsInGroup(group).map((item) => (
                <div key={item.id} className="aspect-[4/5] animate-pulse rounded-xl bg-stone-200" />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {zoneGroups.map(({ group }) => (
        <Section key={group} group={group} />
      ))}
    </div>
  );
}
