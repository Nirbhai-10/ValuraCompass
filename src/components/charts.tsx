import * as React from "react";

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

interface DonutSlice {
  key: string;
  label: string;
  value: number;
}

interface DonutProps {
  slices: DonutSlice[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  /** stroke width (ring thickness) in viewbox units */
  thickness?: number;
}

/**
 * SVG donut chart. Pass slices with positive `value`. Renders a circular
 * stack with a configurable hole; the longest slice gets the brand-deep
 * fill, lighter mints fall behind.
 */
export function Donut({
  slices,
  centerLabel,
  centerValue,
  size = 160,
  thickness = 22,
}: DonutProps) {
  const cleaned = slices.filter((s) => s.value > 0);
  const total = cleaned.reduce((s, x) => s + x.value, 0);
  const r = 50 - thickness / 2; // viewBox is 100x100
  const c = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-label="No data">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#E2EFE7"
          strokeWidth={thickness}
        />
        <text
          x="50"
          y="54"
          textAnchor="middle"
          className="fill-ink-500"
          fontSize="6"
        >
          No data
        </text>
      </svg>
    );
  }

  let offset = 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Allocation"
    >
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="#F1F5F9"
        strokeWidth={thickness}
      />
      <g transform="rotate(-90 50 50)">
        {cleaned
          .sort((a, b) => b.value - a.value)
          .map((s, i) => {
            const fraction = s.value / total;
            const dash = c * fraction;
            const gap = c - dash;
            const dashOffset = -offset * c;
            offset += fraction;
            return (
              <circle
                key={s.key}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={dashOffset}
              >
                <title>
                  {s.label} — {Math.round((fraction * 100) * 10) / 10}%
                </title>
              </circle>
            );
          })}
      </g>
      {centerValue ? (
        <>
          {centerLabel ? (
            <text
              x="50"
              y="44"
              textAnchor="middle"
              className="fill-ink-500"
              fontSize="5.5"
            >
              {centerLabel}
            </text>
          ) : null}
          <text
            x="50"
            y="56"
            textAnchor="middle"
            className="fill-ink-900"
            fontSize="9"
            fontWeight="600"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {centerValue}
          </text>
        </>
      ) : null}
    </svg>
  );
}

interface DonutLegendProps {
  slices: DonutSlice[];
  format: (n: number) => string;
  /** Optional second formatter used when the row is tight (e.g. compact). */
  formatCompact?: (n: number) => string;
}

export function DonutLegend({ slices, format, formatCompact }: DonutLegendProps) {
  const cleaned = slices.filter((s) => s.value > 0);
  const total = cleaned.reduce((s, x) => s + x.value, 0);
  const fmt = formatCompact ?? format;
  return (
    <ul className="grid gap-1.5 text-sm min-w-0">
      {cleaned
        .sort((a, b) => b.value - a.value)
        .map((s, i) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <li
              key={s.key}
              className="flex items-center justify-between gap-3 min-w-0"
            >
              <span className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="inline-block size-2.5 rounded-full shrink-0"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                />
                <span className="text-ink-700 truncate">{s.label}</span>
              </span>
              <span className="text-ink-700 font-medium tabular-nums whitespace-nowrap shrink-0">
                {fmt(s.value)}
                <span className="text-ink-500 font-normal ml-1.5">
                  {pct.toFixed(0)}%
                </span>
              </span>
            </li>
          );
        })}
    </ul>
  );
}

interface ScoreRingProps {
  value: number; // 0..100
  label: string;
  band: string;
  tone?: "positive" | "default" | "warn" | "danger";
  size?: number;
}

const TONE_STROKE: Record<NonNullable<ScoreRingProps["tone"]>, string> = {
  positive: "#0F5132",
  default: "#334155",
  warn: "#A16207",
  danger: "#B91C1C",
};

/**
 * Single-arc progress ring used to display a score. Positive tone =
 * brand-deep, warn = amber, danger = red.
 */
export function ScoreRing({
  value,
  label,
  band,
  tone = "default",
  size = 96,
}: ScoreRingProps) {
  const safe = Math.max(0, Math.min(100, value));
  const r = 42; // viewBox 100x100
  const c = 2 * Math.PI * r;
  const dash = (safe / 100) * c;
  const stroke = TONE_STROKE[tone];

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#E2EFE7"
          strokeWidth="10"
        />
        <g transform="rotate(-90 50 50)">
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeLinecap="round"
          />
        </g>
        <text
          x="50"
          y="54"
          textAnchor="middle"
          className="fill-ink-900"
          fontSize="20"
          fontWeight="600"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(safe)}
        </text>
      </svg>
      <p className="text-xs text-ink-500 text-center">{label}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink-700 font-semibold text-center">
        {band}
      </p>
    </div>
  );
}

interface CashFlowBarProps {
  income: number;
  expense: number;
  format: (n: number) => string;
}

/**
 * Horizontal stacked bar comparing income to expense. Surplus/deficit
 * shown to the right.
 */
export function CashFlowBar({ income, expense, format }: CashFlowBarProps) {
  if (income === 0 && expense === 0) {
    return (
      <p className="text-sm text-ink-500">Add income and expenses to see your cash flow.</p>
    );
  }
  const max = Math.max(income, expense, 1);
  const incomePct = (income / max) * 100;
  const expensePct = (expense / max) * 100;
  const surplus = income - expense;
  return (
    <div className="space-y-3">
      <Row title="Income" pct={incomePct} value={format(income)} color="#0F5132" />
      <Row title="Expense" pct={expensePct} value={format(expense)} color="#A16207" />
      <p className="text-xs text-ink-500 pt-2 border-t border-line-100">
        Monthly surplus:{" "}
        <span
          className={
            surplus >= 0
              ? "font-semibold text-brand-deep"
              : "font-semibold text-severity-critical"
          }
        >
          {format(surplus)}
        </span>
      </p>
    </div>
  );
}

function Row({
  title,
  pct,
  value,
  color,
}: {
  title: string;
  pct: number;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-ink-500">{title}</span>
        <span className="font-medium text-ink-900 tabular-nums">{value}</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-line-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(pct, 1)}%`,
            background: color,
            transition: "width 240ms ease-out",
          }}
        />
      </div>
    </div>
  );
}
