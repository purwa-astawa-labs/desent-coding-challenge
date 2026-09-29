"use client";

import {
  type CatalogItem,
  type Group,
  type Zone,
  GARAGE_SPACE_ID,
  MAX_MONITORS,
  cardImage,
  formatPrice,
  getItem,
  groupMeta,
  groups,
  isGarageGear,
  itemsInCategory,
  itemsInGroup,
} from "@/lib/catalog";
import { hasGarageSpace, tapProduct } from "@/lib/configurator";
import { useConfigurator } from "./ConfiguratorProvider";
import { useProductDetails } from "./ProductDetails";

/** Card tap: apply the selection rule, then open details for a selecting tap. */
function useProductTap() {
  const { selection, dispatch } = useConfigurator();
  const { openDetails } = useProductDetails();
  return (id: string) => {
    const result = tapProduct(selection, id);
    if (result.action) dispatch(result.action);
    if (result.openDetails) openDetails(id);
  };
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
      <path d="M5 10.5l3.2 3L15 6.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Product image well; a selected product gets an accent check badge in its corner. */
export function ItemVisual({ item, selected = false }: { item: CatalogItem; selected?: boolean }) {
  return (
    <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-control bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cardImage(item)}
        alt=""
        className="absolute inset-0 h-full w-full object-contain p-3 transition duration-300 ease-out group-enabled:group-hover:scale-103 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        draggable={false}
      />
      {selected && (
        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-card ring-2 ring-raised transition duration-200 ease-out starting:scale-50 starting:opacity-0 motion-reduce:transition-none">
          <CheckIcon />
          <span className="sr-only">Selected</span>
        </span>
      )}
    </span>
  );
}

/** Name and weekly price under a product image. */
export function ItemText({ item }: { item: CatalogItem }) {
  return (
    <span className="mt-3 block text-left">
      <span className="block text-sm font-bold leading-5 text-ink">{item.name}</span>
      <span className="mt-1 block text-xs tabular-nums text-muted">
        <span className="text-sm font-semibold text-ink">{formatPrice(item.weeklyPrice)}</span> /week
      </span>
    </span>
  );
}

/** Product card button: hover lift, accent ring when selected, dimmed when disabled. */
export function cardClass(selected: boolean, disabled = false) {
  return [
    "group flex w-full min-w-0 flex-col rounded-card border bg-raised p-3 text-left shadow-card",
    "transition duration-200 ease-out motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    selected
      ? "border-ink ring-1 ring-ink"
      : "border-line enabled:hover:-translate-y-0.5 enabled:hover:border-ink/40 enabled:hover:shadow-float motion-reduce:enabled:hover:translate-y-0",
    disabled ? "cursor-not-allowed opacity-50" : "",
  ].join(" ");
}

/** The "+ Add" affordance under an unselected card. */
function AddHint() {
  return <span className="mt-2 self-start text-xs font-semibold text-ink">+ Add</span>;
}

function SingleChoice({ category }: { category: "desk" | "chair" }) {
  const { selection } = useConfigurator();
  const tap = useProductTap();
  const current = category === "desk" ? selection.deskId : selection.chairId;
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2">
      {itemsInCategory(category).map((item) => {
        const selected = current === item.id;
        return (
          <li key={item.id} className="min-w-0">
            <button
              type="button"
              aria-pressed={selected}
              className={cardClass(selected)}
              onClick={() => tap(item.id)}
            >
              <ItemVisual item={item} selected={selected} />
              <ItemText item={item} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Monitors() {
  const { selection, dispatch } = useConfigurator();
  const tap = useProductTap();
  const full = selection.monitorIds.length >= MAX_MONITORS;
  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2">
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
                onClick={() => tap(item.id)}
              >
                <ItemVisual item={item} selected={count > 0} />
                <ItemText item={item} />
                <span className={`mt-2 self-start text-xs font-semibold ${full ? "text-muted" : "text-accent"}`}>
                  {full ? "Max 3 monitors" : "+ Add"}
                  {count > 0 && <span className="ml-1 font-normal text-muted">({count} added)</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-muted" aria-live="polite">
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
                className="flex items-center justify-between gap-2 rounded-control border border-line bg-raised px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate">
                  <span className="text-muted">Slot {i + 1}:</span> {item.name}
                </span>
                <button
                  type="button"
                  className="shrink-0 rounded-control px-2 py-1 font-medium text-danger transition hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-danger motion-reduce:transition-none"
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
  const { selection } = useConfigurator();
  const tap = useProductTap();
  const garageRented = hasGarageSpace(selection);
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2">
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
              onClick={() => tap(item.id)}
            >
              <ItemVisual item={item} selected={selected} />
              <ItemText item={item} />
              {note && <span className="text-xs text-muted">{note}</span>}
              {!selected && <AddHint />}
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
    <section aria-labelledby={`section-${group}`} className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id={`section-${group}`} tabIndex={-1} className="scroll-mt-2 font-display text-title text-ink outline-none">
          {meta.title}
        </h2>
        <span className="text-eyebrow uppercase text-muted">{meta.rule}</span>
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
      <div className="space-y-12" aria-busy="true">
        {zoneGroups.map(({ group, title }) => (
          <section key={group} className="space-y-3">
            <h2 className="font-display text-title text-ink">{title}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2">
              {itemsInGroup(group).map((item) => (
                <div key={item.id} className="aspect-[4/5] rounded-card bg-line motion-safe:animate-pulse" />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-12">
      {zoneGroups.map(({ group }) => (
        <Section key={group} group={group} />
      ))}
    </div>
  );
}
