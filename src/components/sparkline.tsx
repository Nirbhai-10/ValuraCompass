import * as React from "react";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
}

/**
 * Tiny SVG line/area sparkline. Pure presentational — no axes, no tooltips.
 */
export function Sparkline({
  values,
  width = 320,
  height = 64,
  stroke = "#0F5132",
  fill = "rgba(15, 81, 50, 0.12)",
  className,
}: SparklineProps) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return [x, y];
  });
  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    `M0,${height} ` +
    points
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ") +
    ` L${width},${height} Z`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      width="100%"
      height={height}
      preserveAspectRatio="none"
    >
      <path d={areaPath} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

interface BandChartProps {
  bands: { p10: number; p50: number; p90: number }[];
  height?: number;
  className?: string;
}

/**
 * Three-band area chart for Monte Carlo paths.
 */
export function BandChart({ bands, height = 180, className }: BandChartProps) {
  if (!bands || bands.length === 0) return null;
  const width = 600;
  const max = Math.max(...bands.map((b) => b.p90));
  const min = Math.min(0, ...bands.map((b) => b.p10));
  const range = max - min || 1;
  const stepX = width / Math.max(bands.length - 1, 1);

  const projectY = (v: number) => height - ((v - min) / range) * height;

  const upper = bands.map((b, i) => [i * stepX, projectY(b.p90)] as [number, number]);
  const lower = bands.map((b, i) => [i * stepX, projectY(b.p10)] as [number, number]);
  const median = bands.map((b, i) => [i * stepX, projectY(b.p50)] as [number, number]);

  const bandPath =
    upper.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    " " +
    [...lower].reverse().map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    " Z";
  const medianPath = median
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      width="100%"
      height={height}
      preserveAspectRatio="none"
    >
      <path d={bandPath} fill="rgba(15, 81, 50, 0.16)" />
      <path d={medianPath} fill="none" stroke="#0F5132" strokeWidth="1.8" />
    </svg>
  );
}
