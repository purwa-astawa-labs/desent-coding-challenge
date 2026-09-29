import { CatalogPicker } from "@/components/CatalogPicker";
import { SUMMARY_BAR_PADDING, SummaryBar } from "@/components/SummaryBar";
import { WorkspacePreview } from "@/components/WorkspacePreview";

export default function Home() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 pt-6" style={{ paddingBottom: SUMMARY_BAR_PADDING }}>
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Design your workspace</h1>
          <p className="mt-1 text-stone-600">Pick a desk, a chair, monitors and extras — watch your setup come together.</p>
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <div
            className="relative z-10 -mx-4 [@media(min-height:640px)]:sticky min-w-0 bg-background px-4 pb-3 pt-2 md:mx-0 md:self-start md:px-0 md:pt-0"
            style={{ top: "env(safe-area-inset-top, 0px)" }}
          >
            <div className="mx-auto max-w-md md:max-w-none">
              <WorkspacePreview />
            </div>
          </div>
          <div className="min-w-0">
            <CatalogPicker />
          </div>
        </div>
      </main>
      <SummaryBar />
    </>
  );
}
