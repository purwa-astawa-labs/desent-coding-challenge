"use client";

import { useState } from "react";
import { lineItems } from "@/lib/configurator";
import { CatalogPicker } from "./CatalogPicker";
import { useConfigurator } from "./ConfiguratorProvider";
import { PresetPicker } from "./PresetPicker";
import { SummaryBar } from "./SummaryBar";
import { WorkspacePreview } from "./WorkspacePreview";

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
 * a bottom sheet on phones, a right-hand panel from `md` up.
 */
export function Configurator() {
  const { selection, hydrated, dispatch } = useConfigurator();
  const [open, setOpen] = useState(true);
  const empty = hydrated && lineItems(selection).length === 0;

  return (
    <main
      className="fixed inset-0 flex flex-col overflow-hidden bg-stone-100 md:flex-row"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 px-4 pt-3 md:px-6 md:pt-5">
          <h1 className="text-lg font-bold tracking-tight text-stone-900 md:text-2xl">Design your workspace</h1>
          {hydrated && !empty && (
            <button
              type="button"
              onClick={() => dispatch({ type: "reset" })}
              className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-stone-600 hover:bg-stone-200 hover:text-stone-900"
            >
              Start over
            </button>
          )}
        </header>
        {/* Size container: the 4:3 preview grows to the largest box that fits the stage. */}
        <div className="flex min-h-0 flex-1 items-center justify-center p-3 [container-type:size] md:p-6">
          <div style={{ width: "min(100cqw, calc(100cqh * 4 / 3))" }}>
            <WorkspacePreview />
          </div>
        </div>

        {!open && (
          <div className="absolute bottom-6 right-6 hidden w-80 space-y-3 rounded-2xl bg-white p-4 shadow-xl md:block">
            <button
              type="button"
              aria-expanded={false}
              aria-controls="options-drawer-body"
              onClick={() => setOpen(true)}
              className="w-full rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-900 hover:border-stone-500"
            >
              Customize
            </button>
            <SummaryBar />
          </div>
        )}
      </section>

      <aside
        aria-label="Workspace options"
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
          onClick={() => setOpen((o) => !o)}
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
          {empty && <PresetPicker />}
          <CatalogPicker />
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
