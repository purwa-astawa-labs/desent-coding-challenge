"use client";

import { useEffect, useRef } from "react";
import { SCENE_ASPECT_RATIO, formatPrice } from "@/lib/catalog";
import { weeklyTotal } from "@/lib/configurator";
import { presets } from "@/lib/presets";
import { useConfigurator } from "./ConfiguratorProvider";
import { SceneLayers } from "./WorkspacePreview";

/**
 * Modal of ready-made setups. Picking one replaces the selection; "Build from scratch"
 * (or Escape) closes it without changes. Mount it only while it should be shown.
 */
export function PresetModal({ onPicked, onScratch }: { onPicked: () => void; onScratch: () => void }) {
  const { dispatch } = useConfigurator();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="presets-title"
      onCancel={(e) => {
        e.preventDefault();
        onScratch();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(56rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-900/60"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="shrink-0 px-5 pb-3 pt-5">
          <h2 id="presets-title" className="text-xl font-bold tracking-tight">
            Start from a preset
          </h2>
          <p className="mt-1 text-sm text-stone-600">Pick a ready-made setup and tweak it, or build your own from scratch.</p>
        </header>

        <ul className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto overscroll-contain px-5 pb-4 md:grid-cols-4">
          {presets.map((preset) => (
            <li key={preset.id} className="min-w-0">
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "applyPreset", selection: preset.selection });
                  onPicked();
                }}
                className="flex h-full w-full min-w-0 flex-col rounded-xl border border-stone-200 bg-white p-2 text-left transition hover:border-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              >
                <span
                  aria-hidden="true"
                  className="relative block w-full overflow-hidden rounded-lg bg-stone-100"
                  style={{ aspectRatio: SCENE_ASPECT_RATIO }}
                >
                  <SceneLayers selection={preset.selection} />
                </span>
                <span className="mt-2 block text-sm font-medium">{preset.name}</span>
                <span className="block text-xs leading-snug text-stone-600">{preset.description}</span>
                <span className="mt-auto block pt-1 text-sm font-semibold">
                  {formatPrice(weeklyTotal(preset.selection))}/week
                </span>
              </button>
            </li>
          ))}
        </ul>

        <footer
          className="flex shrink-0 justify-end border-t border-stone-200 px-5 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            onClick={onScratch}
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold hover:border-stone-500"
          >
            Build from scratch
          </button>
        </footer>
      </div>
    </dialog>
  );
}
