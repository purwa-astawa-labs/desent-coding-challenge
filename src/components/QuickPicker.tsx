"use client";

import { useEffect, useRef } from "react";
import { type Group, MAX_MONITORS, formatPrice, groupMeta, isGarageGear, itemsInGroup } from "@/lib/catalog";
import { hasGarageSpace, tapProduct } from "@/lib/configurator";
import { useConfigurator } from "./ConfiguratorProvider";
import { useProductDetails } from "./ProductDetails";

/**
 * Centered modal of one group's products, opened from a preview hotspot. Uses a native
 * modal <dialog> so it sits in the top layer above everything. Mount it only while open.
 */
export function QuickPicker({ group, onClose }: { group: Group; onClose: () => void }) {
  const { selection, dispatch } = useConfigurator();
  const { openDetails } = useProductDetails();
  const ref = useRef<HTMLDialogElement>(null);
  const meta = groupMeta(group);
  const monitorsFull = selection.monitorIds.length >= MAX_MONITORS;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

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
      ref={ref}
      aria-labelledby="quick-pick-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-900/60"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex shrink-0 items-center justify-between gap-2 px-5 pb-3 pt-4">
          <h2 id="quick-pick-title" className="text-lg font-semibold">
            {meta.title} <span className="text-sm font-normal text-stone-500">· {meta.rule}</span>
            {group === "monitor" && (
              <span className="text-sm font-normal text-stone-500">
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
                className="rounded-lg px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Remove one
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg px-2 py-1 text-xl leading-none text-stone-500 hover:bg-stone-100 hover:text-stone-900"
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
                  className={[
                    "flex w-full flex-col rounded-xl border bg-white p-2 text-left transition",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
                    selected ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200 hover:border-stone-400",
                    disabled ? "cursor-not-allowed opacity-50" : "",
                  ].join(" ")}
                >
                  <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-contain p-2" draggable={false} />
                  </span>
                  <span className="mt-2 block text-sm font-medium leading-snug">{item.name}</span>
                  <span className="block text-sm text-stone-600">{formatPrice(item.weeklyPrice)}/week</span>
                  {isGarageGear(item.id) && !hasGarageSpace(selection) && (
                    <span className="text-xs text-stone-500">Adds garage space</span>
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
