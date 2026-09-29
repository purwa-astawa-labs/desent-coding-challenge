# Design Your Workspace

**Live demo:** https://desent-coding-challenge-one.vercel.app

## Approach and notes

**Approach.** I built this with **Claude** (Claude Code) as a pair programmer, driven by the **BMad Method**: a short spec first (capabilities, constraints, non-goals), then for each feature a written plan with acceptance criteria and edge cases, an implementation, and an independent code review whose findings were verified and fixed before committing. The spec, plans, review logs and image prompts are in `_bmad-output/`. That loop took it from a working configurator with placeholder art, to the full-screen layout, zones and product details, to the visual polish. The realistic scene and product photos were generated with **Google Gemini** from prompts written to share one straight-on camera and lighting setup. The preview is a stack of 2D layers over a scene photo rather than 3D: every product is a transparent cut-out placed by a percentage box, so swapping an item is just swapping an image, and it stays fast on phones.

**Tech choices.** Next.js static pages on Vercel's free tier (no backend needed for a configurator), TypeScript, and a Tailwind v4 `@theme` as the single source of design tokens. GSAP handles only the choreography CSS can't (items settling into the scene, the preset stagger, the total counting up); everything else is Tailwind transitions, and all motion switches off under reduced motion. All the rules (one desk and chair, up to three monitors, the garage-space requirement, pricing, the monitor layout) are pure functions with unit tests, so the UI stays thin. The Gemini images are processed with a small script pipeline (`rembg` cut-outs, contact shadows from the alpha mask).

**With more time I would:**
- Add a 3D view with Three.js alongside the 2D preview, so renters can orbit around their setup and see it from any angle, using 3D models of the same products.
- Replace the generated images with real product photography shot from one fixed camera, and add perspective-aware shadows and lighting so the layers blend in even better.
- Add component and end-to-end tests (Playwright) for the drawer, modals and checkout, plus a real screen-reader pass; today the UI is covered by typed pure logic and manual checks.
- Build the real rental flow: availability by date, IDR pricing, delivery to the villa, payment, and a shareable link for a saved setup.
- Ship the deferred info button (view a product's details without selecting it), serve responsive image sizes for phones, and let the rental team edit the catalog without touching code.

## More

See **[GUIDE.md](GUIDE.md)** for what the app does, how to run, test and deploy it, the project layout, and how the scene and product images are made and placed.
