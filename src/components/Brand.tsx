import type { ReactNode } from "react";

/** The product mark: a desk with a monitor, on an accent tile. Decorative. */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="9" className="fill-accent" />
      <g fill="none" className="stroke-accent-contrast" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="7.5" width="12" height="8" rx="1.5" />
        <path d="M16 15.5v3.5M6.5 19h19M9 19v6M23 19v6" />
      </g>
    </svg>
  );
}

/** Mark + wordmark. The wordmark text is passed in so pages can make it a heading or a link label. */
export function Brand({ children }: { children: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <BrandMark />
      <span className="min-w-0 truncate font-display font-bold tracking-tight text-ink">{children}</span>
    </span>
  );
}
