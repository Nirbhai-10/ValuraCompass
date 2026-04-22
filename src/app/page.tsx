import Link from "next/link";
import { CompassLogo } from "@/components/logo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-brand-canvas">
      <header className="border-b border-line-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CompassLogo />
            <span className="text-xs text-ink-500 border-l border-line-200 pl-3 hidden md:inline">
              Compass · Planning intelligence
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/signup" className="btn-primary">Get started</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 grid gap-10 md:grid-cols-[1.15fr_1fr] items-center">
        <div>
          <p className="section-title text-brand-deep mb-3">
            India · GCC · Global · Advisor and self-serve
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium leading-[1.1] text-ink-900">
            Household-native planning,
            <br />
            <span className="text-brand-deep">advisor-grade in depth,</span>
            <br />
            client-friendly in voice.
          </h1>
          <p className="mt-5 text-ink-700 text-lg leading-relaxed max-w-2xl">
            Compass turns the lived complexity of a household &mdash; people, income, expenses,
            assets, insurance, goals, and tax context &mdash; into a clear, actionable,
            auditable plan. Basic in under ten minutes. Advanced when it matters.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">Create a household</Link>
            <Link href="/login" className="btn-secondary">Sign in</Link>
          </div>
          <p className="mt-6 text-xs text-ink-500">
            Demo logins are pre-seeded. See <code className="px-1 py-0.5 bg-brand-mint/40 rounded">README.md</code> or use
            the hint on the sign-in page.
          </p>
        </div>

        <div className="card p-6">
          <p className="section-title mb-3">What ships out of the box</p>
          <ul className="space-y-2.5 text-sm text-ink-700">
            <li>• Basic and Advanced modes over one data model.</li>
            <li>• Household Intelligence Map as a first-class surface.</li>
            <li>• 20-score analytics engine with plain-English narratives.</li>
            <li>• Prioritized insights with owner-separated tasks.</li>
            <li>• Tax-aware observations (India regime-aware), never overreaching.</li>
            <li>• Risk and suitability engine with rationale logs.</li>
            <li>• Manual-first documents with a stable OCR integration interface.</li>
            <li>• Immutable audit trail on everything that matters.</li>
          </ul>
          <p className="text-[11px] text-ink-500 mt-4 pt-3 border-t border-line-100">
            Planning observation only. Not investment, tax, or legal advice.
          </p>
        </div>
      </section>

      <footer className="border-t border-line-200 bg-white mt-16">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-500 flex items-center justify-between">
          <div>© {new Date().getFullYear()} Valura.Ai · Compass V1</div>
          <div>India-first · GCC · Global</div>
        </div>
      </footer>
    </main>
  );
}
