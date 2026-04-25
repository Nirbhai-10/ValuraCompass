import * as React from "react";

interface Slice {
  key: string;
  label: string;
  value: number;
}

interface BreakdownProps {
  slices: Slice[];
  format: (n: number) => string;
  emptyMessage?: string;
  total?: number;
}

const PALETTE = [
  "#0F5132",
  "#2C7A5A",
  "#4CAF50",
  "#7BC097",
  "#A8D7B9",
  "#C9E4D2",
  "#E2EFE7",
  "#334155",
];

export function Breakdown({ slices, format, emptyMessage, total }: BreakdownProps) {
  const cleaned = slices.filter((s) => s.value > 0);
  if (cleaned.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        {emptyMessage ?? "Nothing to show yet."}
      </p>
    );
  }

  const sum = total ?? cleaned.reduce((s, x) => s + x.value, 0);
  const sorted = [...cleaned].sort((a, b) => b.value - a.value);

  return (
    <ul className="space-y-3">
      {sorted.map((s, i) => {
        const pct = sum > 0 ? (s.value / sum) * 100 : 0;
        return (
          <li key={s.key}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  aria-hidden
                  className="inline-block size-2.5 rounded-full shrink-0"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                />
                <span className="text-ink-700 truncate">{s.label}</span>
              </div>
              <div className="text-ink-900 font-medium tabular-nums whitespace-nowrap">
                {format(s.value)}{" "}
                <span className="text-ink-500 font-normal">{pct.toFixed(0)}%</span>
              </div>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-line-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(pct, 1)}%`,
                  background: PALETTE[i % PALETTE.length],
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
