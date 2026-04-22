import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CompassLogo } from "@/components/logo";
import { prisma } from "@/lib/prisma";
import { listHouseholdsForUser } from "@/lib/household";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const households = await listHouseholdsForUser(session.userId);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-line-200 no-print">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/app" className="flex items-center gap-3">
              <CompassLogo />
              <span className="text-xs text-ink-500 border-l border-line-200 pl-3 hidden md:inline">
                Compass · Planning intelligence
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-sm text-ink-700 hover:text-brand-deep">Dashboard</Link>
            {households.length > 0 ? (
              <Link
                href={`/app/households/${households[0].id}`}
                className="text-sm text-ink-700 hover:text-brand-deep"
              >
                Household
              </Link>
            ) : null}
            <Link href="/app/onboarding" className="btn-ghost hidden md:inline-flex">New household</Link>
            <div className="text-xs text-ink-500 hidden md:flex items-center gap-2">
              <span className="chip-default">{session.role}</span>
              <span>{session.name}</span>
            </div>
            <form action="/logout" method="get">
              <button className="btn-ghost text-xs">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line-200 bg-white no-print">
        <div className="mx-auto max-w-7xl px-6 py-3 text-[11px] text-ink-500 flex items-center justify-between">
          <div>Compass — Planning observation only. Not investment, tax, or legal advice.</div>
          <div>V1 · India-first</div>
        </div>
      </footer>
    </div>
  );
}
