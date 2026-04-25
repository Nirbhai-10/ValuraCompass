import Link from "next/link";
import { CompassLogo } from "@/components/logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-line-200">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link href="/app" className="flex items-center">
            <CompassLogo />
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/app" className="btn-ghost">
              Households
            </Link>
            <Link href="/app/new" className="btn-secondary text-sm">
              New household
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-3 text-[11px] text-ink-500 flex items-center justify-between">
          <div>Compass — saved locally in your browser. Not investment, tax, or legal advice.</div>
          <div>Valura.Ai</div>
        </div>
      </footer>
    </div>
  );
}
