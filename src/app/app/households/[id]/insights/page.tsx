"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { addTask } from "@/lib/mutations";
import { Insight, Severity, buildInsights } from "@/lib/insights";
import { Button, Card, EmptyState, PageHeader, useToast } from "@/components/ui";

const SEVERITY_CLASSES: Record<Severity, string> = {
  CRITICAL: "bg-red-50 text-severity-critical border-red-100",
  HIGH: "bg-orange-50 text-severity-high border-orange-100",
  MEDIUM: "bg-amber-50 text-severity-medium border-amber-100",
  LOW: "bg-cyan-50 text-severity-low border-cyan-100",
  INFO: "bg-line-100 text-ink-700 border-line-200",
};

export default function InsightsPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();

  const insights = useMemo(
    () => buildInsights(db, householdId),
    [db, householdId],
  );

  function pinToActions(insight: Insight) {
    update(
      addTask(householdId, {
        title: insight.action ?? insight.title,
        body: insight.body,
        status: "OPEN",
        source: "INSIGHT",
        insightRuleId: insight.ruleId,
      }),
    );
    toast.success("Added to action center.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        subtitle="Plain-English observations from the rules engine. Pin any of them to your action center."
      />

      {insights.length === 0 ? (
        <EmptyState
          title="Nothing flagged right now"
          description="Add more details across People, Income, Expenses, Assets, Liabilities, Insurance, Goals — and observations will start to appear."
        />
      ) : (
        <ul className="grid gap-3">
          {insights.map((i) => (
            <li key={i.ruleId}>
              <Card>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <span
                      className={`inline-flex items-center px-2 h-5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${SEVERITY_CLASSES[i.severity]}`}
                    >
                      {i.severity}
                    </span>
                    <span className="ml-2 text-[11px] text-ink-500">
                      {i.category}
                    </span>
                    <p className="text-sm font-semibold mt-1.5">{i.title}</p>
                  </div>
                  {i.action ? (
                    <Button size="sm" onClick={() => pinToActions(i)}>
                      Add to actions
                    </Button>
                  ) : null}
                </div>
                <p className="text-sm text-ink-700 leading-relaxed">{i.body}</p>
                {i.action ? (
                  <p className="text-sm text-ink-900 mt-2">
                    <span className="font-medium">Suggested:</span> {i.action}
                  </p>
                ) : null}
                <p className="text-[11px] text-ink-500 mt-3 pt-3 border-t border-line-100">
                  {i.why}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
