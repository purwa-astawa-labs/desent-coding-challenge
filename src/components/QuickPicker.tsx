"use client";

import { type Group, MAX_MONITORS, groupMeta, isGarageGear, itemsInGroup } from "@/lib/catalog";
import { hasGarageSpace, tapProduct } from "@/lib/configurator";
import { ItemText, ItemVisual, cardClass } from "./CatalogPicker";
import { useConfigurator } from "./ConfiguratorProvider";
import { useProductDetails } from "./ProductDetails";
import { dialogClass, useModalDialog } from "./useModalDialog";

/**
 * Centered modal of one group's products, opened from a preview hotspot. Uses a native
 * modal <dialog> so it sits in the top layer above everything. Mount it only while open.
 */
export function QuickPicker({ group, onClose }: { group: Group; onClose: () => void }) {
  const { selection, dispatch } = useConfigurator();
  const { openDetails } = useProductDetails();
  const { dialogProps, requestClose } = useModalDialog(onClose);
  const meta = groupMeta(group);
  const monitorsFull = selection.monitorIds.length >= MAX_MONITORS;

  const isSelected = (id: string) =>
    group === "desk"
      ? selection.deskId === id
      : group === "chair"
        ? selection.chairId === id
        : group === "monitor"
          ? selection.monitorIds.includes(id)
          : selection.accessoryIds.includes(id);

  // Selecting taps open the product's details above this modal; a deselect or a no-op at the monitor cap does not.
  const choose = (id: string) => {
    const tap = tapProduct(selection, id);
    if (tap.action) dispatch(tap.action);
    if (tap.openDetails) openDetails(id);
  };

  return (
    <dialog
      {...dialogProps}
      aria-labelledby="quick-pick-title"
      className={`${dialogClass} m-auto max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100vw-2rem))] rounded-sheet`}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex shrink-0 items-center justify-between gap-2 px-5 pb-3 pt-4">
          <h2 id="quick-pick-title" className="font-display text-title">
            {meta.title} <span className="font-sans text-sm font-normal text-muted">· {meta.rule}</span>
            {group === "monitor" && (
              <span className="font-sans text-sm font-normal text-muted">
                {" "}
                ({selection.monitorIds.length}/{MAX_MONITORS})
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            {group === "monitor" && selection.monitorIds.length > 0 && (
              <button
                type="button"
                onClick={() => dispatch({ type: "removeMonitor", index: selection.monitorIds.length - 1 })}
                className="rounded-control px-2 py-1 text-sm font-medium text-danger transition hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-danger motion-reduce:transition-none"
              >
                Remove one
              </button>
            )}
            <button
              type="button"
              onClick={() => requestClose()}
              aria-label="Close"
              className="rounded-control px-2 py-1 text-xl leading-none text-muted transition hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none"
            >
              ×
            </button>
          </div>
        </header>

        <ul className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto overscroll-contain px-5 pb-5 sm:grid-cols-3">
          {itemsInGroup(group).map((item) => {
            const selected = isSelected(item.id);
            const disabled = group === "monitor" && monitorsFull;
            return (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  aria-pressed={group === "monitor" ? undefined : selected}
                  disabled={disabled}
                  onClick={() => choose(item.id)}
                  className={cardClass(selected, disabled)}
                >
                  <ItemVisual item={item} selected={selected} />
                  <ItemText item={item} />
                  {isGarageGear(item.id) && !hasGarageSpace(selection) && (
                    <span className="text-xs text-muted">Adds garage space</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}
