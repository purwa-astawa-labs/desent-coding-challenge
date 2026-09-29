"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { lineItems, weeklyTotal } from "@/lib/configurator";
import { useConfigurator } from "./ConfiguratorProvider";

/** Live weekly total and the checkout entry. Rendered as the options drawer's footer. */
export function SummaryBar() {
  const { selection, hydrated } = useConfigurator();
  const count = lineItems(selection).length;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0" aria-live="polite">
        <p className="text-xs text-stone-500">{hydrated ? `${count} item${count === 1 ? "" : "s"}` : " "}</p>
        <p className="text-lg font-semibold text-stone-900">
          {hydrated ? `${formatPrice(weeklyTotal(selection))}/week` : " "}
        </p>
      </div>
      <Link
        href="/checkout"
        className="shrink-0 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        Checkout
      </Link>
    </div>
  );
}
