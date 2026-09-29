---
title: 'UI polish — cohesive visual style and motion'
type: 'feature'
ticket: ''
created: '2026-09-29'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
baseline_revision: 'a6316c60df4acf45899e93a8fe6dd5d547d11a62'
context:
  - '{project-root}/_bmad-output/spec-design-your-workspace/spec-design-your-workspace.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The UI works but looks unfinished: ad-hoc stone greys, system font, no brand, five interchangeable radii, a plain "Selected" pill, and no motion — drawer and modals snap, items pop into the scene, totals jump.

**Approach:** Tailwind-first. Define design tokens in Tailwind v4 `@theme` so they become utilities, apply them everywhere (configurator, drawer, all modals, checkout), add a brand header, refine cards and selected states, and add motion that is disabled under reduced motion: Tailwind utilities/variants for state transitions (hover, dialogs, drawer), GSAP where choreography is needed (items entering the scene, preset stagger, total count-up). No behavior or data changes.

## Boundaries & Constraints

**Always:** Tailwind-first (installed: Tailwind 4.3.3). Tokens live only in `globals.css` `@theme` — colors (`--color-surface`, `-raised`, `-ink`, `-muted`, `-line`, `-accent`, `-accent-contrast`, `-danger`), radii (`--radius-control`, `-card`, `-sheet`), shadows (`--shadow-card`, `-float`, `-sheet`), and fonts (`--font-sans`, `--font-display`) — and are used as utilities (`bg-surface`, `rounded-card`, `shadow-float`, `font-display`). All styling and motion are Tailwind utilities/variants in `className`: `transition-*`, `duration-*`, `ease-*`, `starting:`, `open:`, `backdrop:`, `data-[closing]:`, `inert:`, `motion-safe:`/`motion-reduce:`, `transition-discrete`. GSAP (`gsap` + `@gsap/react`) only for choreography Tailwind can't express cleanly; always via `useGSAP` with a `scope` ref (auto cleanup), `contextSafe` for post-render callbacks, `gsap.matchMedia()` gated on `(prefers-reduced-motion: no-preference)`, client components only (no GSAP during SSR), `gsap.registerPlugin(useGSAP)` once. Motion ≤ 300 ms (stagger total ≤ 500 ms), transform/opacity only — except the drawer, which may animate height (phone) and width (desktop) so the preview resizes (human-approved at review); Tailwind-animated elements carry `motion-reduce:` overrides. AA contrast for text and focus rings. 375px and desktop layouts keep working; no horizontal scroll.

**Never:** Browser automation (the user forbids it — verify with CLI only). New runtime dependencies other than `gsap` and `@gsap/react`. GSAP for things Tailwind handles (hover, dialog enter/exit, drawer slide). Hand-written CSS rules/selectors in `globals.css` beyond `@import`, `@theme` (incl. its `@keyframes`), and the `body` base; inline `style` for anything Tailwind can express (layer positions from catalog % values stay inline). Arbitrary values where a token exists. Changing selection logic, catalog data, prices, routes, or storage. Removing any existing control or accessible name.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Swap desk | Oak → Walnut | New desk layer animates in (GSAP fade + settle); other layers don't re-animate | No error expected |
| Apply preset | Empty → Gaming preset | Layers enter with a short GSAP stagger (≤ 500 ms total) | No error expected |
| Add monitor | 1 → 2 monitors | Only the new slot animates | No error expected |
| Total change | $99 → $125/week | Total counts up (GSAP) to exactly $125 within ~300 ms | Final value always exact (snap + onComplete) |
| Reduced motion | OS reduce-motion on | No layer, drawer, modal, or count-up animation; totals update instantly | No error expected |
| Open modal | Hotspot → picker / preset / details | Dialog + backdrop fade/scale in | No error expected |
| Close modal | ×, Escape, backdrop, action | Dialog animates out, then unmounts; focus returns as today | Unmount even if no `transitionend` (timeout fallback) |
| Drawer toggle | Hide/Show (phone), Customize (desktop) | Sheet/panel slides; content keeps scroll position | No error expected |

</frozen-after-approval>

## Code Map

- `src/app/globals.css` -- Tailwind v4 (`@import "tailwindcss"` + `@theme inline` with only background/foreground); becomes the single `@theme` token block.
- `src/app/layout.tsx` -- fonts come from a system stack in `globals.css`. Add `next/font/google` (Inter body, a display face for headings) exposed as CSS variables that `@theme` maps to `--font-sans`/`--font-display`; if the font fetch fails at build, fall back to the system stack and note it.
- `src/components/Configurator.tsx` -- header (title, Presets, Start over), zone tabs, drawer `<aside>` toggled with `hidden`/`md:hidden` (no transition possible), desktop floating card.
- `src/components/CatalogPicker.tsx` -- `cardClass`, `ItemVisual`, `ItemText`, `SelectedBadge`; used by desk/chair/monitor/toggle groups.
- `src/components/PresetPicker.tsx`, `QuickPicker.tsx`, `ProductDetails.tsx` -- three `<dialog>`s, each with its own `showModal` effect, `onCancel`, backdrop-click, and (details) focus return. Duplicated logic → shared hook.
- `src/components/WorkspacePreview.tsx` -- `SceneLayers` keys layers by slot (`desk`, `monitor-${i}`, `accessory-${id}`), so swaps don't remount; `Hotspots`.
- `src/components/SummaryBar.tsx` -- renders `formatPrice(weeklyTotal)` directly.
- `src/app/checkout/page.tsx` -- older page styling (27 `stone-*` uses); align with tokens.
- Keep: all ids used by tests/scroll (`section-${group}`, `options-drawer-body`), aria attributes, and dialog-in-top-layer behavior.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- add `gsap` and `@gsap/react` -- GSAP for choreography.
- [x] `src/app/globals.css` -- one `@theme` block: warm neutral surfaces, ink, muted, line, one accent + contrast text, danger; radii; shadows; font vars. Nothing else besides `@import` and `body` base -- tokens become utilities.
- [x] `src/app/layout.tsx` -- load Inter + display font with `next/font/google`, expose as CSS vars used by `globals.css` -- typography.
- [x] `src/lib/motion.ts` + `src/lib/motion.test.ts` -- `gsap.registerPlugin(useGSAP)` in one client module; `countUp(target, from, to, onUpdate)` returning a GSAP tween (300 ms, `snap` to integers, `onComplete` sets exact `to`); tests drive it with `tween.progress(1)` in node to assert exact end value and integer steps -- testable count-up.
- [x] `src/components/useAnimatedNumber.ts` -- `useGSAP`-based hook using `countUp`, keyed on value; instant on first render and under reduced motion (`gsap.matchMedia`) -- total count-up.
- [x] `src/components/useModalDialog.ts` -- shared hook: `showModal` on mount, `requestClose()` sets `data-closing`, waits `transitionend` or 250 ms, then `close()` + `onClose`; handles Escape (`cancel`) and backdrop click; returns focus to opener (keep the disabled-opener fallback from `ProductDetails`); exports a shared `dialogClass` string of Tailwind utilities (`transition-discrete duration-200 ease-out starting:open:opacity-0 starting:open:scale-98 data-[closing]:opacity-0 backdrop:transition-discrete backdrop:bg-ink/60 starting:open:backdrop:bg-transparent data-[closing]:backdrop:bg-transparent motion-reduce:transition-none …`) -- one behavior and look for all modals.
- [x] `src/components/PresetPicker.tsx`, `QuickPicker.tsx`, `ProductDetails.tsx` -- use `useModalDialog` + `dialogClass`; token utilities for sheet radius/shadow, header, footer; details sheet slides from the bottom on phones (`starting:open:translate-y-4`) -- consistent modals with exit animation.
- [x] `src/components/Configurator.tsx` -- brand header (inline SVG mark + wordmark, secondary actions as ghost buttons); tabs restyled as a segmented control with accent indicator; drawer always mounted and animated with Tailwind transitions (phone: `translate-y-*`/height; desktop: `translate-x-*`/width), closed state via the `inert` attribute + `inert:` utilities instead of `hidden`; floating card restyled -- brand + drawer motion.
- [x] `src/components/CatalogPicker.tsx` -- token-based cards: hover lift (`shadow-card` → raised), selected = accent ring + check badge over image corner (replaces "Selected" pill, keeps `aria-pressed`), price emphasis, consistent `+ Add` affordance -- card polish.
- [x] `src/components/WorkspacePreview.tsx` -- key layers by slot + item id so swaps remount; `useGSAP` scoped to the preview animates newly mounted layers (`from` opacity 0, y 6, scale 0.97) and staggers when several appear at once (preset); nothing under reduced motion; soften hotspot ping (`motion-safe:animate-ping`, smaller) -- scene motion.
- [x] `src/components/SummaryBar.tsx` -- use `useAnimatedNumber` for the weekly total; `tabular-nums` -- total count-up.
- [x] `src/app/checkout/page.tsx` -- replace `stone-*`/ad-hoc styles with tokens and shared card styles; add the brand header -- consistent checkout.

**Acceptance Criteria:**
- Given the repo, when grepping `src/` for `stone-[0-9]`, then no matches remain (tokens only).
- Given any of the three modals, when it opens and closes, then it animates in and out and is unmounted after close, with focus returned as before.
- Given reduced motion, when interacting anywhere, then nothing animates and totals are exact immediately.
- Given the existing suite, when `npx vitest run` runs, then all prior tests plus the new motion tests pass unchanged.

## Implementation Notes

- Fonts: Inter + Bricolage Grotesque via `next/font/google` (fetched fine at build); system stack stays as the fallback in `--font-sans`/`--font-display`.
- `useModalDialog(onClose, { closeOnBackdrop })`: `requestClose(then?)` runs an optional callback instead of `onClose`; the preset modal passes `closeOnBackdrop: false` (it never closed on backdrop before) and applies the preset in that callback, after the exit animation, so the scene stagger is visible. If the owner unmounts the dialog mid-exit, the pending close completes on unmount. A native close (e.g. forced Escape) also calls `onClose`.
- Shared card pieces (`cardClass`, `ItemVisual`, `ItemText`) are exported from `CatalogPicker` and reused by `QuickPicker`. The check badge carries sr-only "Selected", so card accessible names keep that word.
- `useAnimatedNumber(value, ready)`: no count-up on the hydration change (restored total shows exact). Reduced motion is probed with `gsap.matchMedia()` and the probe reverted, so a later media change cannot revert a finished count to a stale value. The visible total is `aria-hidden`; an sr-only exact total sits in the live region so screen readers don't hear intermediate steps.
- Drawer: phone height animates with `grid-rows-[1fr]`↔`[0fr]` (body `inert` when closed); desktop panel animates `width` + `visibility` to zero with fixed-width content. `hidden` remains only for pre-hydration and while the preset modal is shown (unchanged behavior).
- Brand: `Brand`/`BrandMark` in `src/components/Brand.tsx`; wordmark is the existing title "Design your workspace".

- Orchestrator (matrix audit): moved `layersFor` and the stagger cap into `src/lib/scene.ts` (`layerStaggerAmount`, `LAYER_IN_DURATION`) with `scene.test.ts` covering swap/add-monitor/preset rows; count-up row covered by `motion.test.ts`. Reduced-motion, modal open/close and drawer rows are visual-only — left to the user's manual check (no browser allowed).

## Plan Change Log

## Review Triage Log

**Pass 1 (quick lens)** — high 1, medium 2, low 5, false 0, maybe-false 0. Patches: 1, 2, 3, 5, 9. Rejected: 4, 6. Deferred: 8. Intent gap 7 resolved by the human (frozen constraint amended), no loopback.

| # | Finding | Verdict | Route | Evidence / action |
|---|---|---|---|---|
| 1 | Desktop drawer `md:transition-[width,visibility]` wins over `motion-reduce:transition-none` (later in CSS, same specificity) | medium | patch | Built CSS order confirmed by reviewer; add `md:motion-reduce:transition-none`. |
| 2 | Strict Mode (dev) mount→cleanup→mount: cleanup's `dialog.close()` queues a native `close` that fires after remount and closes every modal | high | patch | `useModalDialog` `onClose` has no guard; ignore `close` events while `dialog.open` is true. Dev-only (prod single mount). |
| 3 | Native close during an exit transition calls `onClose` instead of the pending `then` (preset not applied) | low | patch | Run `pending.current` in the `onClose` handler when present. |
| 4 | `useAnimatedNumber` `useGSAP` has no `scope` | low | reject | Tweens a plain object, no DOM selectors; a scope changes nothing. |
| 5 | Scene `useGSAP` with `revertOnUpdate: false` accumulates matchMedia/tweens per layer change | medium | patch | Confirmed; use `revertOnUpdate: true` so each change reverts the previous run. |
| 6 | Scene stagger and badge `starting:` animate on hydration/page load | low | reject | Cosmetic entrance; fix adds branching; not forbidden by intent. |
| 7 | Drawer animates height/width vs frozen "transform/opacity only" | medium | intent_gap → resolved | Human chose to allow the drawer exception; frozen constraint amended. |
| 8 | Hotspot section highlight: hard-coded yellow, 1200 ms WAAPI | low | defer | Pre-existing code, not introduced by this change. |
| 9 | Details Remove runs before the exit animation, so the sheet re-renders (button vanishes/relabels, focus drops) | low | patch | `remove(); requestClose();` — run removal in the close callback instead. |

## Design Notes

Everything is Tailwind utilities. Dialog enter: `starting:open:opacity-0 starting:open:scale-98` (Tailwind's `starting:` = `@starting-style`) with `transition-discrete`. Exit without unmount-first: `requestClose()` sets `data-closing` → `data-[closing]:opacity-0` (+ `data-[closing]:backdrop:bg-transparent`) transitions → on `transitionend` (or 250 ms timeout) `dialog.close()` then `onClose()` so React unmounts. Under `motion-reduce:` durations are zero and the timeout path closes immediately.

Scene entry with GSAP (new layers carry `data-new`, set on mount):

```tsx
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.from("[data-new]", { opacity: 0, y: 6, scale: 0.97, duration: 0.24, ease: "power2.out", stagger: 0.04 });
  });
}, { scope: previewRef, dependencies: [layerKeys], revertOnUpdate: false });
```

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: no errors
- `npm run lint` -- expected: no errors
- `npx vitest run` -- expected: all tests pass
- `npm run build` -- expected: succeeds, `/` and `/checkout` static
- `grep -rn "stone-[0-9]" src` -- expected: no output
- `grep -cvE '^\s*$' src/app/globals.css` sanity: file holds only `@import`, `@theme` (incl. keyframes) and `body` base -- expected: no other selectors

**Manual checks (user, in their browser):**
- Phone and desktop: swap desk, add monitor, apply a preset (stagger), toggle drawer, open/close each modal, watch the total count up; then enable reduced motion and confirm everything is instant.
