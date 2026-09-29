"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type SyntheticEvent } from "react";

/** Longest exit transition; the dialog closes after it even if no `transitionend` arrives. */
const EXIT_FALLBACK_MS = 250;

/**
 * Shared look for every modal <dialog>: fades/scales in via `@starting-style` (`starting:`) and out
 * via `data-closing`, with the backdrop fading along. Reduced motion turns all transitions off.
 */
export const dialogClass = [
  "overflow-hidden bg-raised p-0 text-ink shadow-sheet",
  "transition transition-discrete duration-200 ease-out",
  "starting:open:opacity-0 starting:open:scale-98 data-[closing]:opacity-0 data-[closing]:scale-98",
  "backdrop:bg-ink/60 backdrop:transition backdrop:transition-discrete backdrop:duration-200 backdrop:ease-out",
  "starting:open:backdrop:bg-transparent data-[closing]:backdrop:bg-transparent",
  "motion-reduce:transition-none motion-reduce:backdrop:transition-none",
].join(" ");

interface Options {
  /** Close when the backdrop is clicked (default true). */
  closeOnBackdrop?: boolean;
}

/**
 * Native modal <dialog> behavior shared by all modals. Mount the component only while it should
 * be shown: the dialog opens with `showModal()` on mount. `requestClose()` plays the exit
 * transition, then closes the dialog and calls `onClose` (or the given callback) so the owner
 * unmounts it. Escape and (optionally) backdrop clicks go through `requestClose()`. On unmount,
 * focus returns to the element that opened the dialog, or to the first enabled button near it.
 */
export function useModalDialog(onClose: () => void, { closeOnBackdrop = true }: Options = {}) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const closing = useRef(false);
  const done = useRef(false);
  const cleanup = useRef<(() => void) | null>(null);
  // A close in progress; run to completion if the owner unmounts the dialog first.
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    // The dialog is unmounted (not just closed), so return focus to whatever opened it ourselves.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Fallback if the opener can't take focus back (e.g. a monitor card disabled at the cap).
    const scope = opener?.closest("dialog, section") ?? null;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      pending.current?.();
      dialog?.close();
      if (opener?.isConnected && !opener.matches(":disabled")) {
        opener.focus({ preventScroll: true });
      } else if (scope?.isConnected) {
        scope.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
      }
    };
  }, []);

  const requestClose = useCallback((then?: () => void) => {
    const dialog = ref.current;
    if (!dialog || closing.current) return;
    closing.current = true;
    const finish = () => {
      pending.current = null;
      if (done.current) return;
      done.current = true;
      cleanup.current?.();
      dialog.close();
      (then ?? onCloseRef.current)();
    };
    pending.current = finish;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.target === dialog) finish();
    };
    const timer = window.setTimeout(finish, EXIT_FALLBACK_MS);
    dialog.addEventListener("transitionend", onEnd);
    cleanup.current = () => {
      window.clearTimeout(timer);
      dialog.removeEventListener("transitionend", onEnd);
      cleanup.current = null;
    };
    dialog.setAttribute("data-closing", "");
  }, []);

  const dialogProps = {
    ref,
    onCancel: (e: SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      requestClose();
    },
    // The browser may still close the dialog itself (e.g. repeated Escape); keep the owner in sync.
    onClose: () => {
      // Strict Mode's remount reopens the dialog before the old close event arrives; ignore it.
      if (ref.current?.open) return;
      // Closed natively mid-exit: finish that close, including its callback (e.g. apply a preset).
      if (pending.current) {
        pending.current();
        return;
      }
      if (!done.current) {
        done.current = true;
        cleanup.current?.();
        onCloseRef.current();
      }
    },
    // A click on the dialog element itself (not its content) is a click on the backdrop.
    onClick: (e: MouseEvent<HTMLDialogElement>) => {
      if (closeOnBackdrop && e.target === e.currentTarget) requestClose();
    },
  };

  return { dialogProps, requestClose };
}
