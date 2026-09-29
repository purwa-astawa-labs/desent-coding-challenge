"use client";

import { useCallback, useState } from "react";
import { type Group, type Zone, zones } from "@/lib/catalog";
import { lineItems } from "@/lib/configurator";
import { CatalogPicker } from "./CatalogPicker";
import { useConfigurator } from "./ConfiguratorProvider";
import { PresetModal } from "./PresetPicker";
import { QuickPicker } from "./QuickPicker";
import { SummaryBar } from "./SummaryBar";
import { WorkspacePreview, zoneItemNames } from "./WorkspacePreview";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-4 w-4 transition-transform md:-rotate-90 ${open ? "rotate-180 md:rotate-90" : ""}`}
    >
      <path d="M5 12l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

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
      className="fixed inset-0 flex flex-col overflow-hidden bg-stone-100 md:flex-row"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 px-4 pt-3 md:px-6 md:pt-5">
          <h1 className="text-lg font-bold tracking-tight text-stone-900 md:text-2xl">Design your workspace</h1>
          {hydrated && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setPresetsRequested(true)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-stone-600 hover:bg-stone-200 hover:text-stone-900"
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
                  className="rounded-lg px-2 py-1 text-sm font-medium text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                >
                  Start over
                </button>
              )}
            </div>
          )}
        </header>
        <div role="tablist" aria-label="Zones" className="mx-4 mt-3 flex self-start rounded-xl bg-stone-200 p-1 md:mx-6">
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
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
                  selected ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900",
                ].join(" ")}
              >
                {title}
                {count > 0 && (
                  <span className="rounded-full bg-stone-900 px-1.5 text-[11px] font-semibold leading-4 text-white">{count}</span>
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
          <div className="absolute bottom-6 right-6 hidden w-80 space-y-3 rounded-2xl bg-white p-4 shadow-xl md:block">
            <button
              type="button"
              aria-expanded={false}
              aria-controls="options-drawer-body"
              onClick={() => {
                setOpen(true);
                setQuickPick(null);
              }}
              className="w-full rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-900 hover:border-stone-500"
            >
              Customize
            </button>
            <SummaryBar />
          </div>
        )}
      </section>

      {showPresets && <PresetModal onPicked={closePresets} onScratch={closePresets} />}

      <aside
        aria-label="Workspace options"
        hidden={!hydrated || showPresets}
        className={[
          "z-10 flex min-h-0 shrink-0 flex-col border-stone-200 bg-white",
          "rounded-t-2xl border-t shadow-[0_-8px_30px_rgba(0,0,0,0.12)]",
          "md:h-full md:w-[26rem] md:rounded-none md:border-l md:border-t-0 md:shadow-none",
          open ? "h-[60dvh]" : "md:hidden",
        ].join(" ")}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls="options-drawer-body"
          onClick={() => {
            setOpen((o) => !o);
            setQuickPick(null);
          }}
          className="flex w-full shrink-0 flex-col items-center gap-2 px-4 pb-3 pt-2 md:pt-4"
        >
          <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-stone-300 md:hidden" />
          <span className="flex w-full items-center justify-between gap-3">
            <span className="text-base font-semibold text-stone-900">Customize your workspace</span>
            <span className="flex items-center gap-1 text-sm font-medium text-stone-600">
              {open ? "Hide" : "Show"}
              <Chevron open={open} />
            </span>
          </span>
        </button>

        <div
          id="options-drawer-body"
          hidden={!open}
          className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain px-4 pb-6 pt-1"
        >
          <CatalogPicker zone={zone} />
        </div>

        <div
          className="shrink-0 border-t border-stone-200 px-4 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <SummaryBar />
        </div>
      </aside>
    </main>
  );
}
