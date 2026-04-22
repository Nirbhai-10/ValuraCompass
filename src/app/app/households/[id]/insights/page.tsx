import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { computeScores } from "@/lib/analytics/engine";
import { generateInsights } from "@/lib/analytics/insights";
import { InsightCard } from "@/components/insight-card";
import { createTaskFromInsightAction } from "./actions";

export default async function InsightsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");

  const scores = computeScores(h as any);
  const insights = generateInsights(h as any, scores);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="font-semibold">Insights</h2>
        <p className="text-sm text-ink-500 mt-1">
          Observations generated from your current data and assumption set. Each insight cites its
          numbers behind a &quot;Why this?&quot; drawer, and you can turn any into a task in one click.
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="card p-8 text-center text-sm text-ink-500">No insights yet — add more data to unlock targeted observations.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((i) => (
            <InsightCard key={i.ruleId} title={i.title} body={i.body} severity={i.severity} why={i.why}>
              {i.actions.map((a, idx) => (
                a.type === "CREATE_TASK" ? (
                  <form key={idx} action={createTaskFromInsightAction}>
                    <input type="hidden" name="householdId" value={h.id} />
                    <input type="hidden" name="title" value={i.title} />
                    <input type="hidden" name="body" value={i.body} />
                    <input type="hidden" name="taskType" value={a.taskType ?? "RECOMMENDATION"} />
                    <input type="hidden" name="ownerType" value={a.ownerType ?? "CLIENT"} />
                    <input type="hidden" name="priority" value={a.priority ?? i.severity} />
                    <button className="btn-secondary text-xs">+ {a.label}</button>
                  </form>
                ) : (
                  <a key={idx} href={`/app/households/${h.id}/${a.moduleHref ?? ""}`} className="btn-ghost text-xs">{a.label} →</a>
                )
              ))}
            </InsightCard>
          ))}
        </div>
      )}
    </div>
  );
}
