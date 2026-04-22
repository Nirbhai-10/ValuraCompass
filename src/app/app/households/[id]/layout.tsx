import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { getRegion } from "@/lib/region";
import { HouseholdNav } from "@/components/household-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { RegionSwitcher } from "@/components/region-switcher";

export default async function HouseholdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const region = getRegion(h.region);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-ink-500">{region.displayName} · {h.currency} · {h.structure.replace(/_/g, " ")}</p>
          <h1 className="text-2xl font-semibold">{h.name}</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <RegionSwitcher householdId={h.id} currentRegion={h.region as "IN" | "GCC" | "GLOBAL"} currentCurrency={h.currency} />
          <ModeToggle householdId={h.id} currentMode={h.mode as "BASIC" | "ADVANCED"} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-4 h-fit">
          <HouseholdNav householdId={h.id} mode={h.mode as "BASIC" | "ADVANCED"} />
          <div className="mt-3 text-[11px] text-ink-500 px-2">
            <Link className="link" href={`/app/households/${h.id}/audit`}>Audit trail →</Link>
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
