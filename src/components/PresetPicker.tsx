"use client";

import { SCENE_ASPECT_RATIO, formatPrice } from "@/lib/catalog";
import { weeklyTotal } from "@/lib/configurator";
import { presets } from "@/lib/presets";
import { useConfigurator } from "./ConfiguratorProvider";
import { useModalDialog, dialogClass } from "./useModalDialog";
import { SceneLayers } from "./WorkspacePreview";

/**
 * Modal of ready-made setups. Picking one replaces the selection; "Build from scratch"
 * (or Escape) closes it without changes. Mount it only while it should be shown.
 */
export function PresetModal({ onPicked, onScratch }: { onPicked: () => void; onScratch: () => void }) {
  const { dispatch } = useConfigurator();
  // Escape builds from scratch; the backdrop does nothing (a choice is required).
  const { dialogProps, requestClose } = useModalDialog(onScratch, { closeOnBackdrop: false });

  return (
    <dialog
      {...dialogProps}
      aria-labelledby="presets-title"
      className={`${dialogClass} m-auto max-h-[calc(100dvh-2rem)] w-[min(56rem,calc(100vw-2rem))] rounded-sheet`}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="shrink-0 px-5 pb-3 pt-5">
          <h2 id="presets-title" className="font-display text-headline">
            Start from a preset
          </h2>
          <p className="mt-1 text-sm text-muted">Pick a ready-made setup and tweak it, or build your own from scratch.</p>
        </header>

        <ul className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto overscroll-contain px-5 pb-4 md:grid-cols-4">
          {presets.map((preset) => (
            <li key={preset.id} className="min-w-0">
              <button
                type="button"
                onClick={() => {
                  // Apply once the modal has animated out, so the scene's entry stagger is visible.
                  requestClose(() => {
                    dispatch({ type: "applyPreset", selection: preset.selection });
                    onPicked();
                  });
                }}
                className="group flex h-full w-full min-w-0 flex-col rounded-card border border-line bg-raised p-2 text-left shadow-card transition duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span
                  aria-hidden="true"
                  className="relative block w-full overflow-hidden rounded-control bg-surface"
                  style={{ aspectRatio: SCENE_ASPECT_RATIO }}
                >
                  <SceneLayers selection={preset.selection} />
                </span>
                <span className="mt-2 block text-sm font-medium">{preset.name}</span>
                <span className="block text-xs leading-snug text-muted">{preset.description}</span>
                <span className="mt-auto block pt-1 text-sm font-medium tabular-nums text-accent">
                  {formatPrice(weeklyTotal(preset.selection))}/week
                </span>
              </button>
            </li>
          ))}
        </ul>

        <footer
          className="flex shrink-0 justify-end border-t border-line px-5 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            onClick={() => requestClose()}
            className="rounded-control border border-line bg-raised px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/40 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
          >
            Build from scratch
          </button>
        </footer>
      </div>
    </dialog>
  );
}
