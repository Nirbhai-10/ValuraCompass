import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";

export default async function ReportsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const base = `/app/households/${h.id}`;
  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="font-semibold">Reports</h2>
        <p className="text-sm text-ink-500 mt-1">Premium, print-friendly outputs generated from your current plan.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Basic one-pager" body="Top KPIs, top insights, top actions. Best for prospects and quick reviews." href={`${base}/reports/basic`} />
        <Card title="Full plan" body="Household snapshot, scores, insights, goals, retirement, tax observations, and suitability." href={`${base}/reports/full`} />
      </div>
    </div>
  );
}

function Card({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link href={href} className="card p-5 hover:-translate-y-0.5 transition-transform">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-ink-700 mt-1">{body}</p>
      <p className="mt-3 text-brand-deep text-sm font-medium">Open →</p>
    </Link>
  );
}
