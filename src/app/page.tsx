import Link from "next/link";
import { CompassLogo } from "@/components/logo";

const FEATURES = [
  {
    title: "Household-shaped",
    body: "Track people, income, expenses, assets, liabilities, insurance, and goals — all anchored to a household, the way money actually works.",
  },
  {
    title: "Calm, not cluttered",
    body: "A small number of well-shaped surfaces. Add what you have, leave the rest blank. Edit anything in two clicks.",
  },
  {
    title: "Stays on your device",
    body: "All data is saved in your browser's localStorage. No accounts. Export a JSON backup at any time, or wipe everything in one click.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-line-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <CompassLogo />
          <Link
            href="/app"
            className="inline-flex h-8 px-3 items-center rounded-button text-sm text-ink-700 hover:text-brand-deep hover:bg-brand-mint/40"
          >
            Open app →
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-deep mb-5">
          Compass · Planning intelligence
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-medium leading-[1.08] text-ink-900">
          Household-native financial planning,
          <br />
          <span className="text-brand-deep">clear, calm, on your terms.</span>
        </h1>
        <p className="mt-6 text-lg text-ink-700 leading-relaxed max-w-2xl">
          Track the people, money, and goals that make up a household. Designed to be
          opened on a quiet evening, not stared at all day. Saved to your browser — no
          accounts, no servers, no compromises.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="inline-flex h-10 px-5 items-center rounded-button bg-brand-deep text-white text-sm font-medium hover:bg-[#0A3E26]"
          >
            Get started
          </Link>
          <Link
            href="/app/households/hh_demo_sharma"
            className="inline-flex h-10 px-5 items-center rounded-button bg-white text-ink-900 border border-line-200 text-sm font-medium hover:border-brand-deep hover:text-brand-deep"
          >
            See the demo →
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-500">
          First-time visitors see the Sharma-family demo loaded automatically. Reset it
          any time from <span className="font-medium">Your data</span>.
        </p>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-line-200 rounded-card p-5"
            >
              <p className="text-sm font-semibold text-ink-900">{f.title}</p>
              <p className="text-sm text-ink-500 mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line-200 bg-white mt-auto">
        <div className="mx-auto max-w-5xl px-6 py-5 text-xs text-ink-500 flex flex-wrap items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} Valura.Ai · Compass</div>
          <div>Built for households · India · GCC · Global</div>
        </div>
      </footer>
    </main>
  );
}
