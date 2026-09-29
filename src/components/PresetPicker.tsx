"use client";

import { SCENE_ASPECT_RATIO, formatPrice } from "@/lib/catalog";
import { weeklyTotal } from "@/lib/configurator";
import { presets } from "@/lib/presets";
import { useConfigurator } from "./ConfiguratorProvider";
import { SceneLayers } from "./WorkspacePreview";

/** Ready-made setups, shown while the workspace is empty. Picking one fills the selection. */
export function PresetPicker() {
  const { dispatch } = useConfigurator();
  return (
    <section aria-labelledby="section-presets" className="space-y-3">
      <div>
        <h2 id="section-presets" className="text-lg font-semibold text-stone-900">
          Start from a preset
        </h2>
        <p className="text-sm text-stone-600">Pick a ready-made setup, then tweak it — or build from scratch below.</p>
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {presets.map((preset) => (
          <li key={preset.id} className="min-w-0">
            <button
              type="button"
              onClick={() => dispatch({ type: "applyPreset", selection: preset.selection })}
              className="flex w-full min-w-0 flex-col rounded-xl border border-stone-200 bg-white p-2 text-left transition hover:border-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              <span
                aria-hidden="true"
                className="relative block w-full overflow-hidden rounded-lg bg-stone-100"
                style={{ aspectRatio: SCENE_ASPECT_RATIO }}
              >
                <SceneLayers selection={preset.selection} />
              </span>
              <span className="mt-2 block text-sm font-medium text-stone-900">{preset.name}</span>
              <span className="block text-xs leading-snug text-stone-600">{preset.description}</span>
              <span className="mt-1 block text-sm font-semibold text-stone-900">
                {formatPrice(weeklyTotal(preset.selection))}/week
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
