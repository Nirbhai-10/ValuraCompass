import { cn } from "@/lib/utils";

export function SeverityChip({ severity }: { severity: string }) {
  const cls =
    severity === "CRITICAL"
      ? "chip-critical"
      : severity === "HIGH"
      ? "chip-high"
      : severity === "MEDIUM"
      ? "chip-warn"
      : "chip-low";
  return <span className={cls}>{severity}</span>;
}

export function InsightCard({
  title,
  body,
  severity,
  why,
  numbers,
  lever,
  affectedScores,
  children,
  className,
}: {
  title: string;
  body: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  why?: string;
  numbers?: { label: string; value: string }[];
  lever?: string;
  affectedScores?: string[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card p-5 flex flex-col gap-3", className)}>
      <div className="flex items-start gap-3 justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink-900 leading-snug">{title}</h3>
          <p className="text-sm text-ink-700 mt-1.5 leading-relaxed">{body}</p>
        </div>
        <SeverityChip severity={severity} />
      </div>

      {numbers && numbers.length > 0 ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border-t border-line-100 pt-3">
          {numbers.map((n, idx) => (
            <div key={idx} className="flex justify-between">
              <dt className="text-ink-500">{n.label}</dt>
              <dd className="font-medium text-ink-900 tabular-nums text-right">{n.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {lever ? (
        <p className="text-xs text-brand-deep bg-brand-mint/40 border border-brand-mint rounded-button px-3 py-2">
          <span className="font-semibold">Lever · </span>
          {lever}
        </p>
      ) : null}

      {affectedScores && affectedScores.length > 0 ? (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-ink-500 uppercase tracking-wide">Affects</span>
          {affectedScores.map((s) => (
            <span key={s} className="chip-default text-[11px]">{s}</span>
          ))}
        </div>
      ) : null}

      {why ? (
        <details>
          <summary className="text-xs text-ink-500 cursor-pointer hover:text-brand-deep">Why this?</summary>
          <p className="text-xs text-ink-500 mt-1">{why}</p>
        </details>
      ) : null}

      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
