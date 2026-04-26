import Link from "next/link";
import { CompassLogo } from "@/components/logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-line-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/app" className="flex items-center">
            <CompassLogo />
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/app"
              className="hidden sm:inline-flex h-8 px-3 items-center rounded-button text-ink-700 hover:text-brand-deep hover:bg-brand-mint/40"
            >
              Households
            </Link>
            <Link
              href="/app/data"
              className="hidden sm:inline-flex h-8 px-3 items-center rounded-button text-ink-700 hover:text-brand-deep hover:bg-brand-mint/40"
            >
              Your data
            </Link>
            <Link
              href="/app/new"
              className="inline-flex h-8 px-3 items-center rounded-button bg-brand-deep text-white text-xs font-medium hover:bg-[#0A3E26]"
            >
              New household
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-3 text-[11px] text-ink-500 flex flex-wrap items-center justify-end gap-3">
          <Link href="/app/data" className="hover:text-brand-deep">
            Backup
          </Link>
          <span>·</span>
          <span>Valura.Ai</span>
        </div>
      </footer>
    </div>
  );
}
