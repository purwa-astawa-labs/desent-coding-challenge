"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { type CatalogItem, SCENE_ASPECT_RATIO, formatPrice, getItem, zoneOf, zones } from "@/lib/catalog";
import { type Selection, isInSelection, removeProduct } from "@/lib/configurator";
import { type GallerySlide, gallerySlides, getDetails } from "@/lib/productDetails";
import { useConfigurator } from "./ConfiguratorProvider";
import { SceneLayers } from "./WorkspacePreview";

interface ProductDetailsContextValue {
  /** Show the details sheet for a catalog item. Call it right after a selecting tap. */
  openDetails: (id: string) => void;
}

const ProductDetailsContext = createContext<ProductDetailsContextValue | null>(null);

/**
 * Owns which product's details sheet is open. Shared by the drawer picker and the hotspot
 * picker modal, so there is one sheet for both. The sheet only shows while its item is selected.
 */
export function ProductDetailsProvider({ children }: { children: ReactNode }) {
  const { selection } = useConfigurator();
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);
  const value = useMemo(() => ({ openDetails: (id: string) => setOpenId(id) }), []);

  // An item that left the selection no longer shows its details.
  if (openId && !isInSelection(selection, openId)) setOpenId(null);
  const item = openId ? getItem(openId) : undefined;

  return (
    <ProductDetailsContext.Provider value={value}>
      {children}
      {item && openId && isInSelection(selection, openId) && (
        <ProductDetailsSheet key={item.id} item={item} onClose={close} />
      )}
    </ProductDetailsContext.Provider>
  );
}

export function useProductDetails(): ProductDetailsContextValue {
  const ctx = useContext(ProductDetailsContext);
  if (!ctx) throw new Error("useProductDetails must be used inside <ProductDetailsProvider>");
  return ctx;
}

type Slide = GallerySlide;

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5">
      <path
        d={dir === "left" ? "M12 5l-5 5 5 5" : "M8 5l5 5-5 5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SlideView({ slide, item, selection }: { slide: Slide; item: CatalogItem; selection: Selection }) {
  if (slide.kind === "scene") {
    return (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="relative block h-full overflow-hidden" style={{ aspectRatio: SCENE_ASPECT_RATIO }}>
          <SceneLayers selection={selection} zone={zoneOf(item)} />
        </span>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- plain img keeps Vercel image optimization out of play
    <img src={slide.src} alt="" className="absolute inset-0 h-full w-full object-contain p-4" draggable={false} />
  );
}

function Gallery({ item }: { item: CatalogItem }) {
  const { selection } = useConfigurator();
  const zoneTitle = zones.find((z) => z.zone === zoneOf(item))!.title;
  const slides = gallerySlides(item, zoneTitle);
  const [index, setIndex] = useState(0);
  const current = slides[Math.min(index, slides.length - 1)];
  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`${item.name} gallery`}
      className="space-y-2"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        }
      }}
    >
      <div className="relative w-full overflow-hidden rounded-xl bg-stone-100" style={{ aspectRatio: SCENE_ASPECT_RATIO }}>
        <div role="img" aria-label={`${current.label} (${index + 1} of ${slides.length})`} className="absolute inset-0">
          <SlideView slide={current} item={item} selection={selection} />
          {current.kind === "scene" && (
            <span className="absolute left-2 top-2 rounded-md bg-stone-900/80 px-2 py-0.5 text-xs font-medium text-white">
              In your space
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-md hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          <Arrow dir="left" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next image"
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-md hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          <Arrow dir="right" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {`${current.label} (${index + 1} of ${slides.length})`}
      </p>
      <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Images">
        {slides.map((slide, i) => (
          <li key={i} className="shrink-0">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={slide.label}
              aria-current={i === index ? "true" : undefined}
              className={[
                "relative block h-12 w-16 overflow-hidden rounded-lg border bg-stone-100 transition",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
                i === index ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200 hover:border-stone-400",
              ].join(" ")}
            >
              <SlideView slide={slide} item={item} selection={selection} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Details of one selected product in a native modal <dialog> (top layer, so it sits above the
 * picker modal too): a bottom sheet on phones, centered from `md` up. Mount it only while open.
 */
function ProductDetailsSheet({ item, onClose }: { item: CatalogItem; onClose: () => void }) {
  const { selection, dispatch } = useConfigurator();
  const ref = useRef<HTMLDialogElement>(null);
  const details = getDetails(item.id);

  useEffect(() => {
    const dialog = ref.current;
    // The dialog is unmounted (not just closed), so return focus to the card that opened it ourselves.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Fallback if the opener can't take focus back (e.g. the monitor card is disabled at the cap).
    const scope = opener?.closest("dialog, section") ?? null;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      dialog?.close();
      if (opener?.isConnected && !opener.matches(":disabled")) {
        opener.focus({ preventScroll: true });
      } else if (scope?.isConnected) {
        scope.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
      }
    };
  }, []);

  // Remove: accessories toggle off (garage rule applies); monitors drop the last of this model.
  const removeAction = removeProduct(selection, item.id);
  const remove = removeAction ? () => dispatch(removeAction) : null;
  const monitorCount = item.category === "monitor" ? selection.monitorIds.filter((id) => id === item.id).length : 0;

  return (
    <dialog
      ref={ref}
      aria-labelledby="product-details-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={[
        "overflow-hidden bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-900/60",
        // Phones: bottom sheet across the full width.
        "mx-0 mb-0 mt-auto max-h-[calc(100dvh-2rem)] w-full max-w-none rounded-t-2xl",
        // md+: centered card.
        "md:m-auto md:w-[min(44rem,calc(100vw-2rem))] md:rounded-2xl",
      ].join(" ")}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-2 px-5 pb-2 pt-4">
          <div className="min-w-0">
            <h2 id="product-details-title" className="text-lg font-semibold leading-snug">
              {item.name}
            </h2>
            <p className="text-sm text-stone-600">
              {formatPrice(item.weeklyPrice)}/week
              {monitorCount > 1 && <span className="text-stone-500"> · {monitorCount} added</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 rounded-lg px-2 py-1 text-xl leading-none text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-stone-900"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pb-4 md:grid md:grid-cols-[1.1fr_1fr] md:items-start md:gap-5 md:space-y-0">
          <Gallery item={item} />
          {details && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-stone-700">{details.description}</p>
              <section aria-labelledby="product-specs-title">
                <h3 id="product-specs-title" className="text-sm font-semibold">
                  Specifications
                </h3>
                <dl className="mt-2 divide-y divide-stone-200 rounded-xl border border-stone-200 text-sm">
                  {details.specs.map((spec) => (
                    <div key={spec.label} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 px-3 py-2">
                      <dt className="text-stone-500">{spec.label}</dt>
                      <dd className="min-w-0 text-right font-medium text-stone-900">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          )}
        </div>

        <footer
          className="flex shrink-0 items-center justify-end gap-2 border-t border-stone-200 px-5 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {remove && (
            <button
              type="button"
              onClick={() => {
                remove();
                onClose();
              }}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700"
            >
              {item.category === "monitor" && monitorCount > 1 ? "Remove one" : "Remove"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            Select
          </button>
        </footer>
      </div>
    </dialog>
  );
}
