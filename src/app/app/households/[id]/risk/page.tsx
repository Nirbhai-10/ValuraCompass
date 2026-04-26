"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectRiskProfile } from "@/lib/selectors";
import { upsertRiskProfile } from "@/lib/mutations";
import {
  RISK_QUESTIONS,
  bandFromScore,
  bandRationale,
  scoreAnswers,
} from "@/lib/risk";
import { RISK_BAND_LABELS } from "@/lib/types";
import { Button, Card, Kpi, PageHeader, useToast } from "@/components/ui";

export default function RiskProfilePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const profile = selectRiskProfile(db, householdId);

  const [answers, setAnswers] = useState<Record<string, number>>(
    profile?.answers ?? {},
  );

  const live = useMemo(() => {
    const rps = scoreAnswers(answers);
    const band = bandFromScore(rps);
    return { rps, band };
  }, [answers]);

  function pickAnswer(qId: string, score: number) {
    setAnswers((a) => ({ ...a, [qId]: score }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    update(
      upsertRiskProfile(householdId, {
        rps: live.rps,
        band: live.band,
        answers,
      }),
    );
    toast.success(`Saved · ${RISK_BAND_LABELS[live.band]}`);
  }

  const allAnswered = RISK_QUESTIONS.every((q) => q.id in answers);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk profile"
        subtitle="Six questions covering horizon, drawdown tolerance, knowledge, dependents, income stability, and reaction. The score sits between 0 and 100."
      />

      {profile ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Kpi
            title="Current score"
            value={`${profile.rps}`}
            sub={`Saved · ${RISK_BAND_LABELS[profile.band]}`}
            tone="positive"
          />
          <Kpi
            title="Live score"
            value={`${live.rps}`}
            sub={`Now · ${RISK_BAND_LABELS[live.band]}`}
          />
          <Kpi
            title="Updated"
            value={new Date(profile.updatedAt).toLocaleDateString()}
            sub="Last saved"
          />
        </div>
      ) : (
        <Card>
          <p className="text-sm text-ink-700">
            <span className="font-semibold">Live score: {live.rps}</span> ·{" "}
            {RISK_BAND_LABELS[live.band]}.
          </p>
          <p className="text-xs text-ink-500 mt-1">
            Answer all six questions and save to lock the band in.
          </p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {RISK_QUESTIONS.map((q) => (
          <Card key={q.id}>
            <p className="text-sm font-semibold">{q.prompt}</p>
            {q.hint ? (
              <p className="text-xs text-ink-500 mt-1">{q.hint}</p>
            ) : null}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((o) => {
                const selected = answers[q.id] === o.score;
                return (
                  <label
                    key={o.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-button border text-sm cursor-pointer transition-colors ${
                      selected
                        ? "border-brand-deep bg-brand-mint/40 text-brand-deep"
                        : "border-line-200 hover:border-brand-deep"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      className="size-4 accent-brand-deep"
                      checked={selected}
                      onChange={() => pickAnswer(q.id, o.score)}
                    />
                    <span>{o.label}</span>
                  </label>
                );
              })}
            </div>
          </Card>
        ))}

        <Card>
          <p className="text-sm font-semibold">{RISK_BAND_LABELS[live.band]}</p>
          <p className="text-sm text-ink-700 mt-1 leading-relaxed">
            {bandRationale(live.band)}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="primary" type="submit" disabled={!allAnswered}>
              Save risk profile
            </Button>
            {!allAnswered ? (
              <span className="text-xs text-ink-500">
                {RISK_QUESTIONS.length - Object.keys(answers).length} question
                {RISK_QUESTIONS.length - Object.keys(answers).length === 1 ? "" : "s"}{" "}
                left.
              </span>
            ) : null}
          </div>
        </Card>
      </form>
    </div>
  );
}
