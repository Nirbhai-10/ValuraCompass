import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listHouseholdsForUser } from "@/lib/household";
import { prisma } from "@/lib/prisma";

export default async function AppHome() {
  const session = await getSession();
  if (!session) redirect("/login");
  const households = await listHouseholdsForUser(session.userId);

  if (households.length === 0) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-semibold">Welcome to Compass</h1>
          <p className="text-ink-700 mt-2">
            Create your first household to start planning. It takes under a minute.
          </p>
          <Link href="/app/onboarding" className="btn-primary mt-6 inline-flex">
            Create a household
          </Link>
        </div>
      </div>
    );
  }

  const totals = await Promise.all(
    households.map(async (h) => {
      const [persons, incomes, assets, liabilities, tasksOpen] = await Promise.all([
        prisma.person.count({ where: { householdId: h.id } }),
        prisma.income.aggregate({ _sum: { amountMonthly: true }, where: { householdId: h.id } }),
        prisma.asset.aggregate({ _sum: { currentValue: true }, where: { householdId: h.id } }),
        prisma.liability.aggregate({ _sum: { outstanding: true }, where: { householdId: h.id } }),
        prisma.task.count({ where: { householdId: h.id, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      ]);
      return {
        hh: h,
        persons,
        income: incomes._sum.amountMonthly ?? 0,
        assets: assets._sum.currentValue ?? 0,
        liabilities: liabilities._sum.outstanding ?? 0,
        tasksOpen,
      };
    }),
  );

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Households</h1>
          <p className="text-sm text-ink-500">{households.length} household{households.length === 1 ? "" : "s"} you have access to.</p>
        </div>
        <Link href="/app/onboarding" className="btn-primary">New household</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {totals.map(({ hh, persons, income, assets, liabilities, tasksOpen }) => (
          <Link key={hh.id} href={`/app/households/${hh.id}`} className="card p-5 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-ink-500">{hh.region} · {hh.currency} · {hh.structure.replace(/_/g, " ")}</p>
                <h3 className="text-lg font-semibold mt-1">{hh.name}</h3>
              </div>
              <span className={`chip-${hh.mode === "ADVANCED" ? "positive" : "default"}`}>{hh.mode}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-ink-500">People</p>
                <p className="font-semibold tabular-nums">{persons}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Income/mo</p>
                <p className="font-semibold tabular-nums">{Math.round(income).toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Assets</p>
                <p className="font-semibold tabular-nums">{Math.round(assets).toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Liabilities</p>
                <p className="font-semibold tabular-nums">{Math.round(liabilities).toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-ink-500">{tasksOpen} open task{tasksOpen === 1 ? "" : "s"}</span>
              <span className="text-brand-deep text-sm font-medium">Open →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
