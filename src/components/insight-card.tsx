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
  children,
  className,
}: {
  title: string;
  body: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  why?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card p-5", className)}>
      <div className="flex items-start gap-3 justify-between">
        <div>
          <h3 className="font-semibold text-ink-900">{title}</h3>
          <p className="text-sm text-ink-700 mt-1.5 leading-relaxed">{body}</p>
        </div>
        <SeverityChip severity={severity} />
      </div>
      {why ? (
        <details className="mt-3">
          <summary className="text-xs text-ink-500 cursor-pointer">Why this?</summary>
          <p className="text-xs text-ink-500 mt-1">{why}</p>
        </details>
      ) : null}
      {children ? <div className="mt-3 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
