import * as React from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface KpiProps {
  title: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "default" | "positive" | "warn" | "danger";
}

const TONES: Record<NonNullable<KpiProps["tone"]>, string> = {
  default: "text-ink-900",
  positive: "text-brand-deep",
  warn: "text-severity-medium",
  danger: "text-severity-critical",
};

export function Kpi({ title, value, sub, tone = "default" }: KpiProps) {
  return (
    <Card>
      <p className="text-xs text-ink-500">{title}</p>
      <p className={cn("text-2xl font-semibold tabular-nums mt-1", TONES[tone])}>{value}</p>
      {sub ? <p className="text-xs text-ink-500 mt-1">{sub}</p> : null}
    </Card>
  );
}
