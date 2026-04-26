import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Valura brand logo. Two variants ship in /public:
 *   - /valura-logo.svg       — gradient (primary)
 *   - /valura-logo-green.svg — solid brand green (for light/coloured backgrounds)
 *
 * <CompassLogo />          → full lockup (icon + wordmark)
 * <CompassLogo iconOnly /> → just the V-mark, sized 28×28
 * <CompassMark />          → standalone mark (alias of iconOnly)
 */

interface LogoProps {
  variant?: "gradient" | "green";
  iconOnly?: boolean;
  className?: string;
  height?: number;
}

const SOURCES: Record<NonNullable<LogoProps["variant"]>, string> = {
  gradient: "/valura-logo.svg",
  green: "/valura-logo-green.svg",
};

export function CompassLogo({
  variant = "gradient",
  iconOnly,
  className,
  height = 38,
}: LogoProps) {
  if (iconOnly) {
    return <CompassMark className={className} size={height} variant={variant} />;
  }
  // Native aspect from the source SVG is 385×145 (≈ 2.66:1).
  const width = Math.round(height * (385 / 145));
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={SOURCES[variant]}
      alt="Valura"
      width={width}
      height={height}
      className={cn("block shrink-0", className)}
      style={{ height, width: "auto" }}
    />
  );
}

/**
 * Just the V-mark (icon, no wordmark), drawn inline so it can be sized and
 * coloured without depending on /public assets.
 */
export function CompassMark({
  size = 28,
  className,
  variant = "gradient",
}: {
  size?: number;
  className?: string;
  variant?: "gradient" | "green";
}) {
  return (
    <svg
      role="img"
      aria-label="Valura"
      width={size}
      height={size}
      viewBox="60 40 60 70"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="valura-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#245782" />
          <stop offset="100%" stopColor="#54AC94" />
        </linearGradient>
      </defs>
      {(() => {
        const stroke =
          variant === "gradient" ? "url(#valura-mark-grad)" : "#05A049";
        const fill =
          variant === "gradient" ? "url(#valura-mark-grad)" : "#05A049";
        return (
          <g fill="none" stroke={stroke} strokeWidth="2.7">
            <path d="M79.4 46.9C79.4 74.3 88.7 95.6 97.0 95.6C105.4 95.6 109.7 82.9 109.7 61.1" />
            <path d="M74.6 46.9C74.6 73.6 82.0 99.5 98.8 100.5" />
            <path d="M70 46.9C70 77.0 79.3 102.0 95.0 105.0" />
            <path d="M100.3 61.1C100.3 74.5 98.0 86.5 94.8 95.2" />
            <path d="M105.0 61.1C105.0 72.8 103.5 85.1 100.3 95.0" />
            <path d="M105 48 L111 58.6 H99 Z" stroke="none" fill={fill} />
          </g>
        );
      })()}
    </svg>
  );
}
