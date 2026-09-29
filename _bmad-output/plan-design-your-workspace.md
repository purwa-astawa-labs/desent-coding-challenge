---
title: 'Design Your Workspace — visual rental configurator'
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
baseline_revision: '4b825dc642cb6eb9a060e54bf8d69288fbee4904' # empty tree; repo had no commits at implementation start
context:
  - '{project-root}/_bmad-output/spec-design-your-workspace/spec-design-your-workspace.md'
  - '{project-root}/_bmad-output/spec-design-your-workspace/catalog.md'
  - '{project-root}/_bmad-output/spec-design-your-workspace/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Renters can't see how a desk, chair, monitors, and accessories look together before renting (SPEC CAP-1..7).

**Approach:** Greenfield Next.js app: a single-page configurator with a 2D layered preview driven by one selection state, persisted to localStorage, ending at a checkout page that confirms on screen. Deployable to Vercel free tier with no backend.

## Boundaries & Constraints

**Always:** Weekly prices labelled "/week" everywhere (USD). Exactly one desk and one chair once chosen; 0–3 monitors (repeatable); accessories toggle, one each. Every catalog item has its own image layer. Usable at 375px width, preview included. Selection and pricing logic are pure functions, unit-tested. Catalog and prices exactly as `catalog.md`.

**Never:** Payment, API routes, databases, auth, share links, compatibility rules, 3D, external image hosts, sending checkout data anywhere.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Swap desk | Oak desk selected, pick Walnut | Walnut replaces Oak in state, preview, total | No error expected |
| Add monitor | 2 monitors, add 27" | 3 monitors; add buttons disabled | 4th add is a no-op |
| Remove monitor | 3 monitors, remove middle | 2 remain, order kept, preview slots re-pack | No error expected |
| Toggle accessory | Plants on, toggle Plants | Plants removed; others unaffected | No error expected |
| Pricing | Oak 45 + Ergo 25 + 2×24" 12 + Plants 5, 4 weeks | weekly 99, rental total 396 | No error expected |
| Corrupt storage | localStorage holds invalid JSON / unknown ids | Loads empty or drops unknown ids | Never throws; storage access in try/catch |
| Checkout empty | No desk or chair selected | Confirm disabled with message to pick desk and chair | Inline message |
| Checkout invalid | Blank name, bad email, past start date, weeks < 1 | Confirm blocked, field errors shown | Inline per-field errors |
| Checkout valid | All fields valid | Confirmation view with summary; no network call; selection kept, "Start over" resets it | No error expected |
| Start date today | Start date = user's local today | Accepted (compared as local date, not UTC) | No error expected |

</frozen-after-approval>

## Code Map

Greenfield — repo holds only `.git/`, `_bmad/`, `_bmad-output/`; nothing to reuse. `create-next-app` 16.x refuses non-empty dirs and may prompt interactively, so scaffold in a temp dir and move files in. Node 24 available. Never touch `.git/`, `_bmad/`, `_bmad-output/` except this plan. Keep the scaffold's generated `lint` script (Next 16 runs `eslint` directly).

## Tasks & Acceptance

**Execution:**
- [x] repo root -- run `npx create-next-app@latest <scratch>/app --yes --ts --tailwind --eslint --app --src-dir --use-npm --no-import-alias`, then copy its contents (incl. dotfiles, excluding `.git`) into the repo root without overwriting `_bmad*`; `npm install` -- create-next-app rejects non-empty dirs.
- [x] `package.json`, `vitest.config.mts` -- add devDeps `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`; script `"test": "vitest"`; node environment; include `src/**/*.test.ts` -- logic-only tests, no Testing Library.
- [x] `public/scene/room.svg`, `public/items/*.svg` -- simple distinct placeholder SVG per catalog item, transparent background, viewBox matching its layer box proportions -- catalog references these.
- [x] `src/lib/catalog.ts` -- typed catalog from `catalog.md` (id, category, name, weeklyPrice, image, layer: z + left/top/width in % of scene) plus `monitorSlots[0..2]` boxes -- single source of items.
- [x] `src/lib/configurator.ts` -- pure `Selection` (deskId?, chairId?, monitorIds[] ordered, accessoryIds[]), reducer (selectDesk, selectChair, addMonitor, removeMonitor(index), toggleAccessory, reset, hydrate), `weeklyTotal`, `rentalTotal(weeks)`, `lineItems`, `parseStoredSelection` (never throws; drops unknown ids, caps monitors at 3) -- testable core.
- [x] `src/lib/configurator.test.ts` -- unit tests for every non-UI I/O matrix row -- locks rules.
- [x] `src/lib/checkout.ts`, `src/lib/checkout.test.ts` -- pure `validateCheckout(input, today)` where `today` is a local `YYYY-MM-DD` string compared as strings (name required, email format, startDate ≥ today, weeks integer ≥ 1); tests pin `today` -- avoids UTC off-by-one.
- [x] `src/components/ConfiguratorProvider.tsx` -- client context over the reducer with `hydrated` flag: load localStorage in a mount effect, then dispatch `hydrate`; save only when `hydrated` is true; all storage access in try/catch -- prevents initial empty state overwriting saved selection.
- [x] `src/app/layout.tsx` -- wrap `children` in `ConfiguratorProvider` so `/` and `/checkout` share state; metadata title -- shared state.
- [x] `src/components/WorkspacePreview.tsx` -- fixed aspect-ratio (4/3) box: base scene + one absolutely-positioned plain `<img>` per selected item using its layer box (% units); monitors use `monitorSlots[i]` for box and model only for `src`, keyed by index; `aria-label` listing items -- CAP-5.
- [x] `src/components/CatalogPicker.tsx` -- category sections, item cards (image, name, "$X/week"), selected state, monitor add/remove controls disabled at 3 -- CAP-1..4.
- [x] `src/components/SummaryBar.tsx` -- live weekly total and "Checkout" link; sticky bottom on mobile with `env(safe-area-inset-bottom)` padding; page gets matching bottom padding -- CAP-6 entry.
- [x] `src/app/page.tsx` -- preview above picker on mobile, side-by-side ≥ md; no `100vw` widths; neutral skeleton until hydrated -- CAP-1..5, 7.
- [x] `src/app/checkout/page.tsx` -- line items, weekly total, form, rental total, validation errors; confirm disabled without desk+chair; confirmation view (no network call) with "Start over" (reset) and "Back to edit"; neutral state until hydrated -- CAP-6.
- [x] `README.md` -- overview, run, test, deploy to Vercel (import repo, defaults), replacing images by editing `image` in `src/lib/catalog.ts` (keep each layer's aspect ratio), editing catalog/prices -- deliverable.

**Acceptance Criteria:**
- Given a 375px viewport and an empty workspace, when the user picks a desk, chair, two monitors, plants, and surfboard, swaps the chair, and opens checkout, then each item appeared in the preview as picked, the chair visibly changed, checkout lists all six items with a correct weekly total, confirming valid details shows the confirmation, and no horizontal page scroll occurs at any point.
- Given three monitors are selected, when the user tries to add another, then the add controls are disabled and the selection still holds three.
- Given a configured workspace, when the page reloads (on `/` or `/checkout`), then the same selection and preview are restored with no flash of an empty checkout.
- Given invalid checkout details, when the user confirms, then field errors show and no confirmation appears; given valid details, when confirmed, then the confirmation shows and no network request is made.
- Given any selection, when viewing the summary bar or checkout, then totals equal the sum of listed weekly prices (× weeks for rental total).
- Given the repo, when `npm run build` runs, then it succeeds and no `src/app/api` routes exist.

## Implementation Notes

- `@types/node` bumped `^20` → `^24` (matches Node 24): vitest 5 peer range rejects `^20` on install.
- `vite-tsconfig-paths` kept per plan; Vite 8 logs a notice that native `resolve.tsconfigPaths` can replace it (harmless).
- Scaffold's `next/font/google` (Geist) dropped for a system font stack so builds need no network; `LayoutProps` global replaced with an explicit `{ children: ReactNode }` type so `tsc` works before Next typegen.
- `hydrated` lives in a provider-level reducer wrapper (the `hydrate` action flips it) rather than `useState`, because `react-hooks/set-state-in-effect` (eslint-config-next 16) rejects setState in the mount effect.
- `rentalTotal(selection, weeks)` takes the selection explicitly; returns 0 for invalid weeks.
- Preview is sticky at every width (on mobile too) so picks lower in the list stay visible; uses `env(safe-area-inset-top)`.
- Verified in Chrome (prod build, 375×740 mobile emulation + 1280 desktop): success-signal flow, chair swap, 3-monitor cap, middle-monitor removal re-pack, reload persistence, corrupt/over-cap storage sanitized, empty-checkout gate, invalid/valid checkout, no network requests on confirm, Start over resets, `scrollWidth === innerWidth` throughout.

## Plan Change Log

## Review Triage Log

**Pass 1 (quick lens)** — high 0, medium 2, low 4, false 1, maybe-false 0. All real findings route to patch; no intent_gap/bad_plan.

| # | Finding | Verdict | Route | Evidence / action |
|---|---|---|---|---|
| 1 | `CatalogPicker` not gated on `hydrated`; reload of `/` shows all cards unselected until mount effect | medium | patch | Confirmed: only Preview/SummaryBar check `hydrated`; plan asks for neutral skeleton on page. Lost-click sub-claim not reachable (hydrate dispatch runs in the first post-commit effect). Fix: render skeleton cards until hydrated. |
| 2 | Sticky preview + fixed SummaryBar leave no room for picker on short (landscape phone) viewports | medium | patch | Confirmed: `sticky` applies at all heights below md; preview up to ~356px + bar ~72px > 375px. Fix: only sticky when viewport is tall enough, cap preview height. |
| 3 | Long email/name in confirmation text overflows 375px width | low | patch | Confirmed: no wrapping utility on the `<p>`; violates "no horizontal scroll" AC. Fix: allow breaking anywhere. |
| 4 | README says Node 20.9+, but vitest 5 requires ^22.12 / ^24 | low | patch | Confirmed in `node_modules/vitest/package.json` engines. Fix: README states Node 22.12+. |
| 5 | Monitor button `aria-label` hides cap and added count | low | patch | Confirmed: aria-label overrides visible "Max 3 monitors" / "(N added)". Fix: include cap/count in label. |
| 6 | Diff lacks `public/` SVGs and `package-lock.json`, so images would 404 | false | reject | Files exist untracked in working tree; orchestrator excluded them from the review diff by pathspec. Nothing committed. |
| 7 | (orchestrator) Confirmation says "We'll email {email}" though nothing is sent | low | patch | Spec/plan: confirm on screen only, nothing sent; copy promises an email. Fix: reword to not promise contact. |

## Design Notes

Layering: each catalog item owns `layer: { z, left, top, width }` in percent of the scene box (aspect-ratio fixed, e.g. 4/3). Order floor → garage/motorbike (back) → desk → monitors (on desk, slot offsets) → accessories on desk (plants, coffee) → chair (front). Swapping an item only swaps the `src`; the box stays, so owner images should keep the layer's aspect ratio — say so in README. Plain `<img>` (not `next/image` optimization) keeps Vercel's image-optimization quota out of play.

## Verification

**Commands:**
- `npm run lint` -- expected: no errors
- `npx vitest run` -- expected: all tests pass
- `npm run build` -- expected: build succeeds

**Manual checks (if no CLI):**
- `npm run dev`, check at 375px and desktop: selecting/removing items updates the preview instantly; checkout validates and confirms.
- After the user deploys to Vercel (needs their account): repeat the success-signal flow on the deployed URL on a phone.
