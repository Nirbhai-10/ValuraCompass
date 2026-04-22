import Link from "next/link";
import { CompassLogo } from "@/components/logo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-brand-canvas">
      <header className="border-b border-line-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CompassLogo />
            <span className="font-semibold">Valura Compass</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/signup" className="btn-primary">Get started</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 grid gap-10 md:grid-cols-[1.2fr_1fr] items-center">
        <div>
          <p className="section-title text-brand-deep mb-3">Financial Planning Compass · India · GCC · Global</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-ink-900">
            Household-native planning.
            <br />
            Advisor-grade in depth. Client-friendly in voice.
          </h1>
          <p className="mt-5 text-ink-700 text-lg leading-relaxed">
            Compass turns the lived complexity of a household — people, income, expenses, assets,
            insurance, goals, and tax context — into the clearest, most actionable, most defensible
            plan on either side of an advisor&apos;s desk. Basic in under 10 minutes. Advanced when
            it matters.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">Create a household</Link>
            <Link href="/login" className="btn-secondary">I already have an account</Link>
          </div>
          <p className="mt-6 text-xs text-ink-500">
            Demo credentials are seeded for quick exploration. See README.
          </p>
        </div>

        <div className="card p-6">
          <p className="section-title mb-3">What&apos;s inside</p>
          <ul className="space-y-3 text-sm">
            <li>• Basic and Advanced modes over one data model.</li>
            <li>• Household Intelligence Map as a first-class surface.</li>
            <li>• 20-score analytics engine with plain-English narratives.</li>
            <li>• Prioritized insights with owner-separated tasks.</li>
            <li>• Tax-aware observations (India regime-aware), never overreaching.</li>
            <li>• Risk and suitability engine with rationale logs.</li>
            <li>• Manual-first documents with a placeholder OCR interface.</li>
            <li>• Audit trail on everything that matters.</li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-line-200 bg-white mt-16">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-500 flex items-center justify-between">
          <div>© {new Date().getFullYear()} Valura.ai — Planning observation only. Not investment, tax, or legal advice.</div>
          <div>V1 · India-first</div>
        </div>
      </footer>
    </main>
  );
}
