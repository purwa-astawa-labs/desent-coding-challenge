# Design Your Workspace — Guide

How the app works and how to run, extend and maintain it. For the approach, tech choices and next steps, see the [README](README.md).

## What it does

A visual rental configurator. The 2D layered preview of the workspace fills the screen; the options live in a drawer (a bottom sheet on phones, a side panel on desktop). When the workspace is empty, a modal offers presets (Dual Monitor, Triple Monitor, Standing Desk, Gaming) and hides the drawer; the Presets button reopens it. Tabs switch between three scenes — Workspace (desk, chair, monitors, desk accessories), Lounge and Garage — and the drawer follows the active tab. Tap a + hotspot on the preview to swap or add products from that group (with the drawer open it scrolls to that section; otherwise a picker modal opens), or pick a desk, a chair, up to three monitors and any accessories, watch the preview update as you go, then finish at a checkout summary with weekly and rental totals.

Selecting a product (in the drawer or the picker modal) opens its details sheet: a gallery (the product image, an "In your space" view of its scene with your current selection, and any extra photos), the weekly price, a description and a specs list. Close it with Select, ×, Escape or a click outside; the selection is kept. Accessories and monitors can also be removed from the sheet. Tapping a selected accessory to remove it doesn't open the sheet.

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
- `src/lib/presets.test.ts`: presets only reference catalog items and replace the selection.
- `src/lib/productDetails.test.ts`: every catalog item has a description and at least 3 specs, no details for unknown ids, and extra image paths start with `/`.
- `src/lib/checkout.test.ts`: checkout validation (name, email, start date not in the past using the local date, whole number of weeks ≥ 1).

## Deploy to Vercel

1. Push this repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the defaults (Framework preset: Next.js, build command `next build`) and click **Deploy**.

You don't need any environment variables or paid add-ons. Images are served as plain `<img>` tags from `public/`, so Vercel image optimization (and its quota) isn't used.

## Project layout

```
public/scene/*.webp          zone scenes: room (workspace), lounge, garage (photos, 1600×1200 WebP)
public/items/*.webp          one image per catalog item (+ *-front.webp chair thumbnails)
src/lib/catalog.ts           catalog: items, prices, images, preview layer boxes
src/lib/configurator.ts      selection reducer, totals, storage parsing (pure)
src/lib/presets.ts           ready-made setups offered when the workspace is empty
src/lib/productDetails.ts    product descriptions, specs and extra gallery photos (sample content)
src/lib/checkout.ts          checkout validation (pure)
src/components/              provider (state + localStorage), full-screen configurator + drawer, preview, presets, picker, product details sheet, summary bar
src/app/page.tsx             configurator page
src/app/checkout/page.tsx    checkout page
scripts/                     image pipeline: cutout.sh (background removal), add_shadow.py (contact shadows)
```

## Images: scenes and products

All images are photos generated with Google Gemini. The prompts are in `_bmad-output/scene-image-prompts.md`; each asks for a straight-on, level camera (70 mm look) and soft daylight so products line up with their scene. Full-size originals are kept locally in `design/scene-originals/` and `design/item-originals/` (git-ignored); only compressed WebP files are served.

**Scenes** (`public/scene/{room,lounge,garage}.webp`): 1600×1200 (4:3), empty except for fixed decor (the lounge's sofa and plant, the garage's door and shelf). Convert a new one with:

```bash
magick original.jpeg -resize 1600x1200^ -gravity center -extent 1600x1200 -strip -quality 80 public/scene/room.webp
```

**Products** (`public/items/*.webp`), cut out on a plain contrasting background:

```bash
scripts/cutout.sh design/item-originals/desk-oak-standing.jpeg /tmp/desk.png          # remove background, crop tight, clean edges
python3 scripts/add_shadow.py /tmp/desk.png public/items/desk-oak-standing.webp 1300x 0.012   # floor items: resize + contact shadows
magick /tmp/monitor.png -resize 700x -quality 85 -define webp:alpha-quality=100 public/items/monitor-24-fhd.webp  # items on the desk: resize only
```

`cutout.sh` uses [rembg](https://github.com/danielgatis/rembg) through `uv` (the model downloads on first run) and ImageMagick. It works best when the product contrasts with its background; for black-on-black edges (a lamp base on a dark ledge) patch the mask by hand. `add_shadow.py` finds the feet, castors or tyres from the transparency mask and bakes a soft shadow under each; use a tolerance of about `0.012` for desks and `0.06` for chairs.

**Placing a product** is its `layer` box in `src/lib/catalog.ts`, in percent of the scene: `left`, `width`, and either `top` (desks, chairs) or `bottom` (things that stand on a surface: monitors, desk plant and lamp on the desk top at `MONITOR_BASE`, lounge and garage items on the floor). The height follows from the image's proportions, so a new image can keep its box as long as it has a similar shape. `z` sets the stacking order (higher draws in front; the desk lamp sits behind the monitors). Size products from something of known size in the scene (a desk, the sofa, a door) and check with a composite before wiring them in:

```bash
magick public/scene/garage.webp \( public/items/motorbike.webp -resize 832x \) -geometry +400+580 -composite /tmp/check.png
```

Monitors only use their `width`: `monitorBoxes()` in `src/lib/scene.ts` stands them on the desk by count (one centered, two side by side, three as a bank that stays on the desk). Chairs show their back in the scene and use `thumbnail` for a front view on cards and in the details gallery.

## Product details, specs and photos

Descriptions and specs live in `src/lib/productDetails.ts`, keyed by catalog `id`. **They are sample values** — replace them with your real product data. Each entry has:

- `description`: one or two sentences.
- `specs`: a list of `{ label, value }` rows (for example Dimensions, Material, Colour, key features).
- `images`: extra gallery photos, empty for now. To add photos, put the files under `public/` (for example `public/photos/desk-oak-standing-1.jpg`) and list their paths, starting with `/`: `images: ["/photos/desk-oak-standing-1.jpg"]`. They appear in the gallery after the main image and the "In your space" view. Any aspect ratio works; photos are fitted inside the frame.

When you add a catalog item, add its details too: the unit test fails for any item without a description and at least 3 specs.

## Editing the catalog and prices

Everything lives in `src/lib/catalog.ts`:

- Change `name` or `weeklyPrice` (USD per week) on any item.
- To add an item, add an entry with a unique `id`, a `category` (`desk`, `chair`, `monitor` or `accessory`), an `image` and a `layer` box. Every item needs its own image.
- Presets live in `src/lib/presets.ts`; each is a full selection (ids must exist in the catalog — a unit test checks this).
- Selection rules are fixed by category: exactly one desk and one chair, 0–3 monitors (`MAX_MONITORS`), and each accessory at most once.
- Accessories belong to a `group` (`desk-accessory`, `lounge`, `garage`); each group's `zone` decides which scene it appears in. Garage gear requires the Garage Space: adding gear adds it, removing it removes the gear.

The unit test `catalog › matches catalog.md items and prices` pins the seed catalog. Update it when you change items or prices on purpose.

Saved selections that refer to removed items are cleaned up automatically on load.
