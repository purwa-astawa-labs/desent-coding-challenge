- source_plan: `_bmad-output/plan-product-details.md`
  summary: Add an ⓘ button on each product card (drawer and picker modal) that opens the product-details sheet without selecting, with an "In your space" preview of the unselected item and an Add/Select action.
  evidence: Split at plan checkpoint to keep plan-product-details within scope; the user chose to ship details-on-select first.
- source_plan: `_bmad-output/plan-ui-polish.md`
  summary: Restyle the hotspot "jump to drawer section" highlight in `Configurator.tsx` to use the accent token and a ≤300 ms motion-safe animation instead of hard-coded yellow over 1200 ms.
  evidence: Review finding 8 — pre-existing WAAPI highlight `rgb(250 204 21 / 0.25)` for 1200 ms predates the UI polish change.
