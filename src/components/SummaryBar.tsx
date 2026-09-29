"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { lineItems, weeklyTotal } from "@/lib/configurator";
import { useConfigurator } from "./ConfiguratorProvider";

/** Bottom-of-screen bar with the live weekly total and the checkout entry. Pair with `SUMMARY_BAR_PADDING` on the page. */
export function SummaryBar() {
  const { selection, hydrated } = useConfigurator();
  const count = lineItems(selection).length;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-stone-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0" aria-live="polite">
          <p className="text-xs text-stone-500">{hydrated ? `${count} item${count === 1 ? "" : "s"}` : " "}</p>
          <p className="text-lg font-semibold text-stone-900">
            {hydrated ? `${formatPrice(weeklyTotal(selection))}/week` : " "}
          </p>
        </div>
        <Link
          href="/checkout"
          className="shrink-0 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}

/** Bottom padding that keeps page content clear of the fixed SummaryBar. */
export const SUMMARY_BAR_PADDING = "calc(6rem + env(safe-area-inset-bottom, 0px))";
