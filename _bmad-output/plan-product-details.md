---
title: 'Product details — specs and gallery on selection'
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
baseline_revision: '9d4ea1d9c439b47e8a80e506a8167aed0b7d2ef0'
context:
  - '{project-root}/_bmad-output/spec-design-your-workspace/spec-design-your-workspace.md'
  - '{project-root}/_bmad-output/spec-design-your-workspace/catalog.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Cards show only name, one image, and weekly price, so a renter can't judge what they're picking (size, material, features) or see the product from other angles.

**Approach:** Give every catalog item sample specs and a gallery, and open a product-details sheet when the user selects a product in the drawer picker or the hotspot picker modal.

**Decisions:**
- Trigger: tapping a card selects it exactly as today and then opens that product's details sheet. Tapping to deselect (accessory off), or a no-op tap (monitor cap), does not open it. An info button that opens details without selecting is out of scope (deferred).
- Placement: a modal sheet on top of everything, including the picker modal (bottom sheet on phones, centered on desktop). It shows the gallery, name, weekly price, description, a specs list, and actions. Closing it (Done, ×, Escape, backdrop) returns to the drawer or picker with the selection kept.
- Gallery: the main image, an auto-rendered "In your space" view of the item's zone scene with the current selection, then any extra `images[]` from the catalog (empty for now; the owner adds photos later). No new placeholder image files.
- Specs: plausible sample specs per item (e.g. dimensions, material, colour, key features) stored with the catalog; the README says they are samples to replace.

## Boundaries & Constraints

**Always:** Details come from static data (no backend). Every catalog item has details (a test enforces it). Works at 375px and desktop; keyboard and screen-reader operable. Selection rules (one desk/chair, ≤3 monitors, garage rule) unchanged. Prices shown per week.

**Never:** Fetching specs or images from external hosts; next/image optimization; changing checkout; opening details without a selection (deferred info button).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Select desk | Tap Oak Standing Desk (drawer) | Desk selected; its details (specs + gallery) shown | No error expected |
| Select in modal | Tap Gaming Chair in picker modal | Chair selected; its details shown in the modal | No error expected |
| Deselect accessory | Tap selected Plants | Plants removed; its details no longer shown | No error expected |
| Monitor at cap | 3 monitors, tap a model | No add; no details change | Disabled as today |
| Garage gear | Tap Motorbike, garage not rented | Motorbike + Garage Space added; Motorbike details shown | No error expected |
| Item without extra images | `images` empty | Gallery shows main image + in-scene view only, no empty slots | No error expected |
| Close details | Done / × / Escape / backdrop | Sheet closes; drawer or picker modal still open; selection kept | No error expected |
| Remove from sheet | Sheet for a selected accessory → Remove | Item removed (garage rule applies to Garage Space); sheet closes | No error expected |

</frozen-after-approval>

## Code Map

- `src/lib/catalog.ts` -- `CatalogItem` (id, category, group, name, weeklyPrice, image, layer?), `catalog`, `getItem`, `groupMeta`, `zoneOf`. Specs/gallery go in a sibling file (`productDetails.ts`), not on `CatalogItem`.
- `src/components/CatalogPicker.tsx` -- drawer: `SingleChoice` (desk/chair), `Monitors`, `ToggleGroup` (accessory groups); cards dispatch selection on click.
- `src/components/QuickPicker.tsx` -- hotspot picker `<dialog>` modal; same dispatch logic keyed by `group`.
- `src/components/WorkspacePreview.tsx` -- `SceneLayers({ selection, zone })` can render an item "in scene" for a gallery view.
- `src/components/Configurator.tsx` -- owns drawer open state, zone tabs, quick-pick state.
- `src/lib/configurator.test.ts`, `src/lib/presets.test.ts` -- existing logic tests (37 passing).
- Reuse: `formatPrice`, `cardClass`/`ItemVisual` patterns, native `<dialog>` modal pattern from `PresetPicker.tsx`/`QuickPicker.tsx`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/productDetails.ts` -- `ProductDetails { description; specs: { label; value }[]; images: string[] }` keyed by catalog id, with sample content for all 20 catalog items (≥3 specs each; `images: []`); `getDetails(id)` -- specs live beside, not inside, the layout-focused catalog.
- [x] `src/lib/productDetails.test.ts` -- every catalog id has details with ≥3 specs and non-empty description; no orphan ids; any `images` path starts with `/` -- keeps data complete.
- [x] `src/components/ProductDetails.tsx` -- `ProductDetailsProvider` (context `openDetails(id)`) and the sheet: native modal `<dialog>` (top layer), bottom-sheet on phones / centered ≥ md; gallery with main image, "In your space" (`SceneLayers` of the item's zone with the current selection), extra images; thumbnails + prev/next; name, `$X/week`, description, specs `<dl>`; actions: Remove (accessory: toggle off; monitor: remove the last of that model; desk/chair: none) + Done -- one sheet for both pickers.
- [x] `src/components/Configurator.tsx` -- wrap stage + drawer in `ProductDetailsProvider` -- shared by drawer and picker modal.
- [x] `src/components/CatalogPicker.tsx` -- after a selecting tap (not a deselect, not a no-op at the monitor cap) call `openDetails(id)` -- drawer trigger.
- [x] `src/components/QuickPicker.tsx` -- same trigger in the picker modal -- modal trigger.
- [x] `README.md` -- document details, sample specs in `src/lib/productDetails.ts`, adding photos via `images` -- deliverable.

**Acceptance Criteria:**
- Given the drawer on a 375px screen, when the user taps an unselected desk, then it becomes the selected desk and a details sheet shows its gallery, weekly price and specs, with no horizontal scroll.
- Given the picker modal is open, when the user selects a chair, then the details sheet opens above the picker modal and closing it returns to the picker with the chair selected.
- Given a selected accessory, when the user taps it again to deselect, then it is removed and no details sheet opens.
- Given the details sheet is open, when the user uses only the keyboard, then focus stays in the sheet, the gallery can be navigated, and Escape closes it.

## Implementation Notes

- Re-tapping the already-selected desk or chair is treated as a selecting tap and opens its details (the item stays selected).
- The sheet is unmounted on close, so it returns focus to the card that opened it itself (native focus restore does not run for a removed dialog).
- The provider only shows the sheet while its item is in the selection, so a removed item never keeps a stale sheet.
- From `md` up the sheet lays the gallery and the description/specs side by side so specs are visible without scrolling.

- Orchestrator (matrix audit): extracted `tapProduct`, `removeProduct`, `isInSelection` (`src/lib/configurator.ts`) and `gallerySlides` (`src/lib/productDetails.ts`) so matrix rows are unit-tested; drawer and picker modal now share `tapProduct`. "Close details" row is UI-only (close clears the open id, never touches selection) — verified manually, not unit-tested.

## Plan Change Log

## Review Triage Log

**Pass 1 (quick lens)** — high 0, medium 1, low 1, false 0, maybe-false 0. Both route to patch.

| # | Finding | Verdict | Route | Evidence / action |
|---|---|---|---|---|
| 1 | Adding the 3rd monitor opens the sheet but disables the opener card; closing focuses a disabled button, so focus falls to `<body>` | low | patch | Confirmed: `tapProduct` opens on the cap-reaching add; cards get `disabled={full}` in the same render; cleanup calls `opener.focus()`. Fix: fall back to the first enabled button in the opener's section/dialog. |
| 2 | Gallery prev/next buttons live inside `role="img"` (presentational children), and `aria-live` on an attribute change isn't announced | medium | patch | Confirmed in `Gallery`. Fix: move buttons outside the `role="img"` element; add a visually hidden live region with the slide text. |

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: no errors
- `npm run lint` -- expected: no errors
- `npx vitest run` -- expected: all tests pass
- `npm run build` -- expected: succeeds, `/` and `/checkout` static

