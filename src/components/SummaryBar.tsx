"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { lineItems, weeklyTotal } from "@/lib/configurator";
import { useConfigurator } from "./ConfiguratorProvider";
import { useAnimatedNumber } from "./useAnimatedNumber";

/** Live weekly total and the checkout entry. Rendered as the options drawer's footer. */
export function SummaryBar() {
  const { selection, hydrated } = useConfigurator();
  const count = lineItems(selection).length;
  const total = weeklyTotal(selection);
  // Counts up visually; screen readers get the exact total only.
  const shown = useAnimatedNumber(total, hydrated);
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0" aria-live="polite">
        <p className="text-xs text-muted">{hydrated ? `${count} item${count === 1 ? "" : "s"}` : " "}</p>
        <p className="font-display text-xl font-semibold tabular-nums text-ink">
          {hydrated ? (
            <>
              <span aria-hidden="true">
                {formatPrice(shown)}
                <span className="font-sans text-sm font-medium text-muted">/week</span>
              </span>
              <span className="sr-only">{`${formatPrice(total)}/week`}</span>
            </>
          ) : (
            " "
          )}
        </p>
      </div>
      <Link
        href="/checkout"
        className="shrink-0 rounded-control bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast shadow-card transition hover:bg-accent/90 hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
      >
        Checkout
      </Link>
    </div>
  );
}
