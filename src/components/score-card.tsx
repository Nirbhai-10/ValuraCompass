import { cn } from "@/lib/utils";
import type { Score } from "@/lib/analytics/types";

function bandClass(band: string): string {
  if (/strong|robust|comfortable|healthy|durable/i.test(band)) return "chip-positive";
  if (/adequate|solid|stable|manageable|moderate|on track/i.test(band)) return "chip-low";
  if (/building|tight|at risk|low|elevated|vulnerable/i.test(band)) return "chip-warn";
  return "chip-critical";
}

export function ScoreCard({ score, emphasis = false }: { score: Score; emphasis?: boolean }) {
  return (
    <div className={cn("kpi", emphasis && "ring-1 ring-brand-deep/20") }>
      <div className="flex items-center justify-between">
        <p className="kpi-title">{score.label}</p>
        <span className={bandClass(score.band)}>{score.band}</span>
      </div>
      <p className="kpi-value">{score.value}</p>
      <p className="kpi-sub">{score.narrative}</p>
    </div>
  );
}
