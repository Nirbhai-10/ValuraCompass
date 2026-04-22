import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Valura.Ai brand logo — stylized "V" with three curved strokes and a compass
 * needle, followed by the "alura.Ai" wordmark. Uses the brand gradient
 * (#0F5132 → #4CAF50).
 *
 * Three sizes:
 *   <CompassMark />          — just the icon (default 28x28)
 *   <CompassLogo />          — icon + wordmark
 *   <CompassLogo iconOnly /> — icon only, consistent with CompassMark
 */

export function CompassMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      role="img"
      aria-label="Valura.Ai"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="valuraV" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F5132" />
          <stop offset="50%" stopColor="#2C7A5A" />
          <stop offset="100%" stopColor="#4CAF50" />
        </linearGradient>
      </defs>
      {/* Three curved strokes forming the left side of the V */}
      <path
        d="M10 10 C 10 28, 18 48, 30 58"
        fill="none"
        stroke="url(#valuraV)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M18 10 C 20 28, 26 46, 34 56"
        fill="none"
        stroke="url(#valuraV)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M26 10 C 28 26, 32 42, 36 52"
        fill="none"
        stroke="url(#valuraV)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Right side of V + compass needle */}
      <path
        d="M38 46 L 48 14"
        fill="none"
        stroke="url(#valuraV)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M43 14 L 48 2 L 53 14 L 48 11 Z"
        fill="url(#valuraV)"
      />
    </svg>
  );
}

export function CompassLogo({
  iconOnly,
  className,
}: {
  iconOnly?: boolean;
  className?: string;
}) {
  if (iconOnly) return <CompassMark className={className} />;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <CompassMark size={28} />
      <span className="font-display text-[18px] leading-none">
        <span style={{ color: "#0F5132", fontWeight: 500 }}>alura</span>
        <span style={{ color: "#334155", fontWeight: 400 }}>.Ai</span>
      </span>
    </span>
  );
}
