---
id: SPEC-design-your-workspace
companions: [catalog.md, stack.md]
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Design Your Workspace

## Why

A vision to realize: people renting a workspace setup cannot see what their desk, chair, monitors, and accessories will look like together before they commit. A visual configurator lets them assemble their own setup and watch it take shape as they choose, so they rent with confidence in what they will get.

## Capabilities

- **CAP-1**
  - **intent:** User can browse the rentable catalog by category (desks, chairs, monitors, accessories), seeing each option's name, image, and weekly rental price.
  - **success:** Every category in `catalog.md` lists its options, each with a name, an image, and a weekly price.
- **CAP-2**
  - **intent:** User can pick exactly one desk and one chair for their workspace.
  - **success:** Choosing a different desk or chair replaces the current one; the selection never holds two desks or two chairs.
- **CAP-3**
  - **intent:** User can add up to three monitors to the workspace and remove them.
  - **success:** Adding a second monitor results in two monitors in the selection; removing one leaves one; a fourth cannot be added.
- **CAP-4**
  - **intent:** User can add and remove any number of accessories.
  - **success:** Each accessory in `catalog.md` toggles in and out of the selection independently of the others.
- **CAP-5**
  - **intent:** User sees a visual preview of their workspace that reflects the current selection.
  - **success:** Every add, swap, or remove from CAP-2 to CAP-4 is visible in the preview immediately, without a page reload; a removed item disappears from it.
- **CAP-6**
  - **intent:** User finishes at a checkout summary that itemizes the selection with its weekly total, enters name, email, start date, and number of weeks, and confirms the rental.
  - **success:** The summary lists every selected item with its weekly price; the weekly total equals the sum of those prices and the rental total equals weekly total × weeks after any change; confirming with valid details shows a confirmation, invalid details block it, and no payment is taken.
- **CAP-7**
  - **intent:** User's configuration survives a page reload in the same browser.
  - **success:** After selecting items and reloading, the same selection and preview are restored.

- **CAP-8**
  - **intent:** When the workspace is empty, user can start from a ready-made preset (Dual Monitor, Triple Monitor, Standing Desk, Gaming) and keep editing it.
  - **success:** With nothing selected, the presets are offered; picking one fills the selection and preview with that setup, and every item remains changeable.

## Constraints

- The preview fills the screen; the options live in a drawer (bottom sheet on phones, collapsible side panel on desktop) that keeps the weekly total and checkout reachable.

- Every selectable item must have its own image in the layered preview; an item without one cannot be offered, because changing the visual is the product's core promise.
- Prices are weekly rental prices, not purchase prices; every price and total is labelled per week.
- Must be fully usable on phone-width mobile screens as well as desktop, preview included.
- Must run on Vercel's free tier: no paid services or paid databases (see `stack.md`).

- Deliverables include a README (run and deploy instructions) and automated tests covering selection rules and pricing.

- The workspace, lounge zone, and garage are separate scenes (visualizers) switched by tabs; desk accessories show on the workspace scene.

## Non-goals

- Real payment processing, or sending/storing checkout details anywhere.
- Shareable configuration links.
- Compatibility rules between items, other than garage gear requiring the Garage Space.
- User accounts or authentication.
- Live inventory or availability tracking.
- Admin tooling for managing the catalog.
- 3D preview (2D layered images for now).

## Success signal

- On a phone, a user starting from an empty or default workspace picks a desk, a chair, two monitors, a plant, and a surfboard, sees each appear in the preview as chosen, swaps the chair and sees it change, then reaches checkout showing all six items and a correct total weekly price, and confirms. The same flow works on the deployed Vercel URL.

## Assumptions

- Catalog is static seed data shipped with the app; items and USD prices in `catalog.md` are sample values.
- Images are placeholders until the owner replaces them with their own files at the same paths.
- One workspace configuration per browser.
- The configurator starts from an empty or default setup.
- No deadline or judging criteria were given.
