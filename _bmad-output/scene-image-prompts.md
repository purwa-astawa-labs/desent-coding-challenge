# Scene image prompts (Google Gemini)

Base scenes for the three visualizers. Product images are layered on top later, so every scene must be **empty**, **straight-on**, and keep the **wall–floor line** where the layout expects it.

Generation settings: aspect ratio **4:3**, largest size available (≥ 2048×1536). Save as `public/scene/room.jpg`, `lounge.jpg`, `garage.jpg` (or `.webp`) and update `image` in `zones` (`src/lib/catalog.ts`).

## Shared style block (already included in each prompt)

Photorealistic architectural interior photograph, Bali tropical-modern style. Camera exactly frontal and level, parallel to the back wall, eye level about 1.2 m, one-point perspective with the vanishing point in the center, very mild perspective (70 mm lens look), everything sharp. Soft, even natural daylight from the side, gentle soft shadows, no harsh highlights. Muted palette of warm white, light grey and natural wood that sits quietly behind a black-and-white interface. No people, no text, no logos, no watermark.

## 1. Workspace (`room`)

Layout: wall–floor line **perfectly horizontal at 2/3 of the image height**; plain wall across the middle (desk, monitors, chair go there); window only in the upper-center.

```
Photorealistic architectural interior photograph of an empty modern home-office room in a Bali tropical-modern villa. Camera exactly frontal and level, facing a flat back wall, parallel to it, eye level about 1.2 m, one-point perspective with the vanishing point in the exact center, very mild perspective like a 70 mm lens. The back wall is smooth warm-white plaster and fills the top two-thirds of the frame; the wall meets the floor in a perfectly straight horizontal line exactly two-thirds down the image, with a thin light-oak skirting board. The floor is light natural oak planks running left to right, visible only in the bottom third, with very little depth. One large rectangular window with thin black steel frames sits high on the wall, centered horizontally, spanning roughly the middle third of the width and the upper quarter of the height, showing soft blurred tropical greenery outside. The rest of the wall is completely bare and evenly lit. The room is completely empty: no furniture, no desk, no chair, no rug, no plants, no decor, no objects on the floor. Soft, even natural daylight from the left, gentle soft shadows, no harsh highlights, calm muted palette of warm white, light grey and natural wood. Sharp focus everywhere. No people, no text, no logos, no watermark. 4:3 aspect ratio.
```

## 2. Lounge (`lounge`)

Layout: wall–floor line **horizontal at 2/3 height**; sofa goes center, coffee cart left, floor plant right, bean bag front-left; artwork above center.

```
Photorealistic architectural interior photograph of an empty lounge corner in a Bali tropical-modern villa. Camera exactly frontal and level, facing a flat back wall, parallel to it, eye level about 1.2 m, one-point perspective with the vanishing point in the exact center, very mild perspective like a 70 mm lens. The back wall is warm light-grey lime-wash plaster with subtle texture and fills the top two-thirds of the frame; the wall meets the floor in a perfectly straight horizontal line exactly two-thirds down the image. The floor is honey-toned polished concrete, visible only in the bottom third, with a large low-pile natural jute rug centered on it. A single framed abstract artwork in beige and charcoal tones hangs centered on the wall in the upper third, occupying about a quarter of the width. The left and right thirds of the wall are bare. The space is completely empty apart from the rug and the artwork: no sofa, no chairs, no tables, no plants, no lamps, no objects on the floor. Soft, even natural daylight from the right, gentle soft shadows, warm calm atmosphere, muted palette of warm white, light grey, sand and natural fibre. Sharp focus everywhere. No people, no text, no logos, no watermark. 4:3 aspect ratio.
```

## 3. Garage (`garage`)

Layout: wall–floor line **horizontal at 70% height**; motorbike center, surfboard leaning left, sport gear right; closed roll-up door center-back, pegboard upper-right.

```
Photorealistic architectural interior photograph of an empty, clean, modern private garage in a Bali villa. Camera exactly frontal and level, facing the flat back wall, parallel to it, eye level about 1.2 m, one-point perspective with the vanishing point in the exact center, very mild perspective like a 70 mm lens. The back wall is smooth light-grey painted concrete and fills the top 70 percent of the frame; the wall meets the floor in a perfectly straight horizontal line at 70 percent of the image height. In the center of the back wall is a closed matte grey sectional garage door with horizontal panels, spanning roughly the middle 45 percent of the width and most of the wall height. On the upper right of the wall is an empty white pegboard panel with no tools. The left part of the wall is bare. The floor is sealed smooth light-grey epoxy concrete with a faint satin sheen, visible only in the bottom 30 percent, with a subtle control joint. The garage is completely empty: no vehicles, no motorbike, no surfboards, no bicycles, no shelves, no boxes, no tools, no objects on the floor. Soft, even overhead daylight mixed with gentle natural light, soft shadows, no harsh highlights, clean and calm, muted palette of light grey, white and concrete. Sharp focus everywhere. No people, no text, no logos, no watermark. 4:3 aspect ratio.
```

## Tips

- If the wall–floor line lands off, add: "the horizon line where wall meets floor is at exactly 66 percent (or 70 percent) of the image height". Then crop/scale to 4:3 so the line lands at 66.7% / 70%.
- If Gemini adds furniture anyway, regenerate or use its edit mode: "remove all furniture and objects, keep the empty room exactly as is".
- Keep the three results consistent (same light direction and color temperature) before generating product cut-outs; products need the same camera angle and light, on a transparent background.

---

# Product cut-out prompts

Products are layered on top of the scenes, so they must match the scene camera and light, and be easy to cut out.

Generation settings: aspect ratio **16:9** (widest subject), largest size available. Then:

1. Remove the background (macOS Preview/Photos "Remove Background", or any background remover) and export **PNG or WebP with transparency**.
2. **Crop tight** to the product: no empty margin on any side.
3. Save to `public/items/<id>.webp` (e.g. `desk-oak-standing.webp`) and update `image` in `src/lib/catalog.ts`.

## Shared product block (already included in each prompt)

Photorealistic studio product photograph, the entire product fully in frame, camera exactly frontal and level at about 1.2 m eye height, 70 mm lens look, very mild perspective, so the top surface is seen as only a thin sliver. Soft, even natural daylight from the left, soft realistic shading, a faint contact shadow under the feet only. Seamless solid plain background, no floor line, no props, no people, no text, no logos, no watermark.

## Desks

Layout: desks share one layer box (52% of the scene width, top edge at 45% of the scene height). The **top edge of the tabletop must be the top edge of the cropped image** (monitors sit on it), and the feet touch the bottom edge.

### Minimal White Desk (`desk-minimal-white`)

```
Photorealistic studio product photograph of a minimal modern writing desk, seen exactly from the front. The desk is 120 cm wide and 74 cm tall with a thin 18 mm matte white laminate tabletop and a slim white powder-coated steel frame with four straight square legs and a thin apron. Scandinavian, clean and understated, no drawers, nothing on the desk. Camera exactly frontal and level at about 1.2 m eye height, 70 mm lens look, very mild perspective, so the tabletop surface is seen only as a thin sliver. The entire desk fully in frame, centered, filling most of the width. Soft, even natural daylight from the left, soft realistic shading on the legs, a faint contact shadow under the feet only. Seamless solid light-grey (#D9D9D9) background so the white desk stays distinct, no floor line, no props, no people, no text, no logos, no watermark. 16:9 aspect ratio.
```

### Oak Standing Desk (`desk-oak-standing`)

```
Photorealistic studio product photograph of a modern electric sit-stand desk at seated height, seen exactly from the front. The desk is 140 cm wide and 74 cm tall with a solid oak tabletop with an oiled natural finish and visible fine grain, on a matte black steel dual-motor frame: two telescopic column legs with T-shaped feet, a black crossbar, and a small black control keypad under the front right edge. Clean and premium, nothing on the desk. Camera exactly frontal and level at about 1.2 m eye height, 70 mm lens look, very mild perspective, so the tabletop surface is seen only as a thin sliver. The entire desk fully in frame, centered, filling most of the width. Soft, even natural daylight from the left, soft realistic shading, a faint contact shadow under the feet only. Seamless solid pure white background, no floor line, no props, no people, no text, no logos, no watermark. 16:9 aspect ratio.
```

### Walnut Executive Desk (`desk-walnut-executive`)

```
Photorealistic studio product photograph of a generous modern executive desk, seen exactly from the front. The desk is 160 cm wide and 75 cm tall with a rich walnut veneer tabletop in a satin lacquer, solid walnut waterfall panel legs on both sides, and one slim soft-close drawer centered under the tabletop with a discreet recessed pull. Warm, elegant and substantial, cable grommet hidden, nothing on the desk. Camera exactly frontal and level at about 1.2 m eye height, 70 mm lens look, very mild perspective, so the tabletop surface is seen only as a thin sliver. The entire desk fully in frame, centered, filling most of the width. Soft, even natural daylight from the left, soft realistic shading, a faint contact shadow under the panel legs only. Seamless solid pure white background, no floor line, no props, no people, no text, no logos, no watermark. 16:9 aspect ratio.
```

Tip: generate all three in the same session and ask Gemini to "keep the exact same camera angle, lighting and framing as the previous desk" so they line up when swapped.
