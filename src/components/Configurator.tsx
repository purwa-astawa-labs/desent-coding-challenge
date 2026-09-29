"use client";

import { useCallback, useState } from "react";
import { type Group, type Zone, zones } from "@/lib/catalog";
import { lineItems } from "@/lib/configurator";
import { Brand } from "./Brand";
import { CatalogPicker } from "./CatalogPicker";
import { useConfigurator } from "./ConfiguratorProvider";
import { PresetModal } from "./PresetPicker";
import { ProductDetailsProvider } from "./ProductDetails";
import { QuickPicker } from "./QuickPicker";
import { SummaryBar } from "./SummaryBar";
import { WorkspacePreview, zoneItemNames } from "./WorkspacePreview";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-4 w-4 transition-transform duration-300 ease-out motion-reduce:transition-none md:-rotate-90 ${open ? "rotate-180 md:rotate-90" : ""}`}
    >
      <path d="M5 12l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Secondary header actions: quiet ghost buttons. */
const ghostButton =
  "rounded-control px-2.5 py-1.5 text-sm font-medium text-muted transition hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";

/**
 * Full-screen configurator: the preview fills the stage and the options live in a drawer —
 * a bottom sheet on phones, a right-hand panel from `md` up. While the workspace is empty
 * (or on request) a preset modal is shown instead of the drawer.
 */
export function Configurator() {
  const { selection, hydrated, dispatch } = useConfigurator();
  const [open, setOpen] = useState(true);
  const empty = hydrated && lineItems(selection).length === 0;
  // Presets open automatically while empty until dismissed; the header button reopens them.
  const [presetsDismissed, setPresetsDismissed] = useState(false);
  const [presetsRequested, setPresetsRequested] = useState(false);
  const showPresets = hydrated && (presetsRequested || (empty && !presetsDismissed));

  const [zone, setZone] = useState<Zone>("workspace");
  const [quickPick, setQuickPick] = useState<Group | null>(null);
  const closeQuickPick = useCallback(() => setQuickPick(null), []);
  // Hotspot tap: with the drawer open, jump to that category in it; otherwise open the picker modal.
  const openQuickPick = (group: Group) => {
    const heading = open ? document.getElementById(`section-${group}`) : null;
    if (!heading) {
      setQuickPick(group);
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    heading.focus({ preventScroll: true });
    if (!reduceMotion) {
      heading.parentElement?.parentElement?.animate(
        [{ backgroundColor: "rgb(250 204 21 / 0.25)" }, { backgroundColor: "transparent" }],
        { duration: 1200, easing: "ease-out" },
      );
    }
  };

  const closePresets = () => {
    setPresetsRequested(false);
    setPresetsDismissed(true);
    setOpen(true);
    setZone("workspace");
  };

  const switchZone = (next: Zone) => {
    setZone(next);
    setQuickPick(null);
    document.getElementById("options-drawer-body")?.scrollTo({ top: 0 });
  };

  return (
    <main
      className="fixed inset-0 flex flex-col overflow-hidden bg-surface md:flex-row"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* One product-details sheet shared by the drawer picker and the hotspot picker modal. */}
      <ProductDetailsProvider>
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 px-4 pt-3 md:px-6 md:pt-5">
            <h1 className="min-w-0 text-lg md:text-2xl">
              <Brand>Design your workspace</Brand>
            </h1>
            {hydrated && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPresetsRequested(true)}
                  className={ghostButton}
                >
                  Presets
                </button>
                {!empty && (
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: "reset" });
                      setPresetsDismissed(false);
                      setZone("workspace");
                    }}
                    className={ghostButton}
                  >
                    Start over
                  </button>
                )}
              </div>
            )}
          </header>
          <div role="tablist" aria-label="Zones" className="mx-4 mt-3 flex self-start rounded-card bg-line/70 p-1 md:mx-6">
            {zones.map(({ zone: z, title }) => {
              const count = hydrated ? zoneItemNames(selection, z).length : 0;
              const selected = zone === z;
              return (
                <button
                  key={z}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => switchZone(z)}
                  className={[
                    "flex items-center gap-1.5 rounded-control px-3 py-1.5 text-sm font-medium",
                    "transition duration-200 ease-out motion-reduce:transition-none",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    selected ? "bg-raised font-semibold text-accent shadow-card" : "text-muted hover:bg-raised/50 hover:text-ink",
                  ].join(" ")}
                >
                  {title}
                  {count > 0 && (
                    <span
                      className={[
                        "rounded-full px-1.5 text-[11px] font-semibold leading-4 tabular-nums transition motion-reduce:transition-none",
                        selected ? "bg-accent text-accent-contrast" : "bg-ink/80 text-raised",
                      ].join(" ")}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Size container: the 4:3 preview grows to the largest box that fits the stage. */}
          <div className="flex min-h-0 flex-1 items-center justify-center p-3 [container-type:size] md:p-6">
            <div style={{ width: "min(100cqw, calc(100cqh * 4 / 3))" }}>
              <WorkspacePreview zone={zone} activeHotspot={quickPick} onHotspot={openQuickPick} />
            </div>
          </div>

          {quickPick && !showPresets && <QuickPicker key={quickPick} group={quickPick} onClose={closeQuickPick} />}

          {!open && !showPresets && (
            <div className="absolute bottom-6 right-6 hidden w-80 space-y-3 rounded-sheet border border-line bg-raised p-4 shadow-float transition duration-300 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none md:block">
              <button
                type="button"
                aria-expanded={false}
                aria-controls="options-drawer-body"
                onClick={() => {
                  setOpen(true);
                  setQuickPick(null);
                }}
                className="w-full rounded-control border border-line bg-raised px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/30 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
              >
                Customize
              </button>
              <SummaryBar />
            </div>
          )}
        </section>

        {showPresets && <PresetModal onPicked={closePresets} onScratch={closePresets} />}

        {/* Always mounted so it can slide and keep its scroll position; closed parts are `inert`. */}
        <aside
          aria-label="Workspace options"
          hidden={!hydrated || showPresets}
          className={[
            "z-10 flex min-h-0 shrink-0 flex-col border-line bg-raised",
            "rounded-t-sheet border-t shadow-sheet",
            // md+: a side panel that collapses to zero width (the floating card takes over).
            "md:h-full md:overflow-hidden md:rounded-none md:border-l md:border-t-0 md:shadow-none",
            "md:transition-[width,visibility] md:duration-300 md:ease-out md:motion-reduce:transition-none",
            open ? "md:w-[26rem]" : "md:invisible md:w-0",
          ].join(" ")}
        >
          {/* Fixed width on md+ so the content doesn't reflow while the panel animates. */}
          <div className="flex min-h-0 flex-1 flex-col md:w-[26rem]">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="options-drawer-body"
              onClick={() => {
                setOpen((o) => !o);
                setQuickPick(null);
              }}
              className="flex w-full shrink-0 flex-col items-center gap-2 rounded-t-sheet px-4 pb-3 pt-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent md:rounded-none md:pt-4"
            >
              <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-line md:hidden" />
              <span className="flex w-full items-center justify-between gap-3">
                <span className="font-display text-lg font-semibold tracking-tight text-ink">Customize your workspace</span>
                <span className="flex items-center gap-1 text-sm font-medium text-muted">
                  {open ? "Hide" : "Show"}
                  <Chevron open={open} />
                </span>
              </span>
            </button>

            {/* Phones: rows 1fr ↔ 0fr animates the sheet's height. md+: always full height. */}
            <div
              inert={!open}
              className={[
                "grid min-h-0 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                "md:flex-1 md:grid-rows-[1fr]",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ].join(" ")}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  id="options-drawer-body"
                  className="h-[calc(60dvh-8rem)] space-y-8 overflow-y-auto overscroll-contain px-4 pb-6 pt-1 transition-opacity duration-300 ease-out inert:opacity-0 motion-reduce:transition-none md:h-full"
                >
                  <CatalogPicker zone={zone} />
                </div>
              </div>
            </div>

            <div
              className="shrink-0 border-t border-line px-4 pt-3"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
            >
              <SummaryBar />
            </div>
          </div>
        </aside>
      </ProductDetailsProvider>
    </main>
  );
}
