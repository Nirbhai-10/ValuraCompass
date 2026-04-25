import Link from "next/link";
import { CompassLogo } from "@/components/logo";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-line-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <CompassLogo />
          <Link href="/app" className="btn-ghost text-sm">
            Open app
          </Link>
        </div>
      </header>

      <section className="flex-1 mx-auto w-full max-w-3xl px-6 py-20 flex flex-col items-start">
        <p className="section-title text-brand-deep mb-4">Compass · Planning intelligence</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium leading-[1.1] text-ink-900">
          Household-native financial planning,
          <br />
          <span className="text-brand-deep">clear, calm, on your terms.</span>
        </h1>
        <p className="mt-6 text-ink-700 text-lg leading-relaxed max-w-2xl">
          Track the people, money, and goals that make up a household. Everything is saved
          locally in your browser — no signup, no servers.
        </p>
        <div className="mt-10 flex gap-3">
          <Link href="/app" className="btn-primary">
            Get started
          </Link>
          <Link href="/app" className="btn-secondary">
            Open my households
          </Link>
        </div>
        <p className="mt-8 text-xs text-ink-500">
          Planning observation only. Not investment, tax, or legal advice.
        </p>
      </section>

      <footer className="border-t border-line-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5 text-xs text-ink-500 flex items-center justify-between">
          <div>© {new Date().getFullYear()} Valura.Ai · Compass</div>
          <div>India · GCC · Global</div>
        </div>
      </footer>
    </main>
  );
}
