"use client";

import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import {
  STORAGE_KEY,
  type Selection,
  type SelectionAction,
  emptySelection,
  parseStoredSelection,
  selectionReducer,
} from "@/lib/configurator";

interface ConfiguratorContextValue {
  selection: Selection;
  dispatch: Dispatch<SelectionAction>;
  /** False until the saved selection has been read from localStorage. */
  hydrated: boolean;
}

const ConfiguratorContext = createContext<ConfiguratorContextValue | null>(null);

interface ProviderState {
  selection: Selection;
  hydrated: boolean;
}

/** Wraps the pure selection reducer; the `hydrate` action also flips `hydrated`. */
function providerReducer(state: ProviderState, action: SelectionAction): ProviderState {
  const selection = selectionReducer(state.selection, action);
  const hydrated = state.hydrated || action.type === "hydrate";
  return selection === state.selection && hydrated === state.hydrated ? state : { selection, hydrated };
}

const initialState: ProviderState = { selection: emptySelection, hydrated: false };

export function ConfiguratorProvider({ children }: { children: ReactNode }) {
  const [{ selection, hydrated }, dispatch] = useReducer(providerReducer, initialState);

  // Load once on mount. Runs before the save effect below can write.
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (private mode, blocked site data): start empty.
    }
    dispatch({ type: "hydrate", selection: parseStoredSelection(raw) });
  }, []);

  // Save only after hydration so the initial empty state never overwrites a saved selection.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // Quota or access errors are non-fatal; the in-memory selection still works.
    }
  }, [selection, hydrated]);

  return (
    <ConfiguratorContext.Provider value={{ selection, dispatch, hydrated }}>{children}</ConfiguratorContext.Provider>
  );
}

export function useConfigurator(): ConfiguratorContextValue {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error("useConfigurator must be used inside <ConfiguratorProvider>");
  return ctx;
}
