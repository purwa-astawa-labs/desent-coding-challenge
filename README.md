# Design Your Workspace

A visual rental configurator. The 2D layered preview of the workspace fills the screen; the options live in a drawer (a bottom sheet on phones, a side panel on desktop). When the workspace is empty, a modal offers presets (Dual Monitor, Triple Monitor, Standing Desk, Gaming) and hides the drawer; the Presets button reopens it. Tabs switch between three scenes — Workspace (desk, chair, monitors, desk accessories), Lounge and Garage — and the drawer follows the active tab. Tap a + hotspot on the preview to swap or add products from that group (with the drawer open it scrolls to that section; otherwise a picker modal opens), or pick a desk, a chair, up to three monitors and any accessories, watch the preview update as you go, then finish at a checkout summary with weekly and rental totals.

- All prices are weekly rental prices in USD.
- The selection is saved in the browser (`localStorage`) and survives reloads.
- Checkout only validates and confirms on screen. No payment is taken and nothing is sent anywhere.
- No backend: no API routes, database or auth. Every page is static, so it runs on Vercel's free (Hobby) tier.

Built with Next.js (App Router), TypeScript, Tailwind CSS and Vitest.

## Run locally

Requires Node.js 22.12+ (developed on Node 24).

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # ESLint
npm test           # Vitest in watch mode (use `npx vitest run` for a single run)
```

## Tests

Selection and pricing rules are pure functions with unit tests:

- `src/lib/configurator.test.ts`: one desk and one chair (swaps replace), 0–3 monitors (repeatable, removal keeps order), accessory toggles, weekly and rental totals, and recovery from corrupt saved data.
- `src/lib/checkout.test.ts`: checkout validation (name, email, start date not in the past using the local date, whole number of weeks ≥ 1).

## Deploy to Vercel

1. Push this repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the defaults (Framework preset: Next.js, build command `next build`) and click **Deploy**.

You don't need any environment variables or paid add-ons. Images are served as plain `<img>` tags from `public/`, so Vercel image optimization (and its quota) isn't used.

## Project layout

```
public/scene/*.svg           zone scenes: room (workspace), lounge, garage (800×600, 4:3)
public/items/*.svg           one image per catalog item
src/lib/catalog.ts           catalog: items, prices, images, preview layer boxes
src/lib/configurator.ts      selection reducer, totals, storage parsing (pure)
src/lib/presets.ts           ready-made setups offered when the workspace is empty
src/lib/checkout.ts          checkout validation (pure)
src/components/              provider (state + localStorage), full-screen configurator + drawer, preview, presets, picker, summary bar
src/app/page.tsx             configurator page
src/app/checkout/page.tsx    checkout page
```

## Replacing the images

Each item's image path is the `image` field of its entry in `src/lib/catalog.ts`. To use your own artwork, either:

- overwrite the file at the same path in `public/items/` (for example `public/items/desk-oak-standing.svg`), or
- add a new file under `public/` and change that item's `image` to point to it (PNG, JPG, WebP and SVG all work).

**Keep each image's aspect ratio the same as the placeholder it replaces.** Every item sits in a fixed layer box on the 4:3 scene. The box sets `left`, `top` and `width` as percentages, and the height follows from the image's own proportions. The placeholder SVGs' `viewBox` sizes give the intended ratios, in scene units where the scene is 800×600:

| Image | Size (w×h) |
|---|---|
| Desks | 416×200 |
| Chairs | 160×230 |
| Monitors | 100×92 |
| Plants | 40×72 |
| Coffee Station | 36×48 |
| Sport Gear | 104×90 |
| Surfboard | 80×300 |
| Motorbike | 200×130 |
| Garage Space | 208×260 |
| Scene (`public/scene/room.svg`) | 800×600 |

Use transparent backgrounds so the layers show through one another. If an image has a different shape, adjust its `layer` box (`left`, `top`, `width`, `z`) in `catalog.ts`. `z` sets the stacking order, and higher values draw in front. Monitors use the three `monitorSlots` boxes instead of their own `layer`.

## Editing the catalog and prices

Everything lives in `src/lib/catalog.ts`:

- Change `name` or `weeklyPrice` (USD per week) on any item.
- To add an item, add an entry with a unique `id`, a `category` (`desk`, `chair`, `monitor` or `accessory`), an `image` and a `layer` box. Every item needs its own image.
- Presets live in `src/lib/presets.ts`; each is a full selection (ids must exist in the catalog — a unit test checks this).
- Selection rules are fixed by category: exactly one desk and one chair, 0–3 monitors (`MAX_MONITORS`), and each accessory at most once.
- Accessories belong to a `group` (`desk-accessory`, `lounge`, `garage`); each group's `zone` decides which scene it appears in. Garage gear requires the Garage Space: adding gear adds it, removing it removes the gear.

The unit test `catalog › matches catalog.md items and prices` pins the seed catalog. Update it when you change items or prices on purpose.

Saved selections that refer to removed items are cleaned up automatically on load.
