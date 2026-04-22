import * as React from "react";
import { cn } from "@/lib/utils";

/** Valura Compass mark — stylized "V" with compass needle, in brand deep green. */
export function CompassLogo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-7 w-7", className)}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Valura Compass"
    >
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F5132" />
          <stop offset="100%" stopColor="#4CAF50" />
        </linearGradient>
      </defs>
      <path
        d="M5 4 L10 4 L16 24 L22 4 L27 4 L18 28 L14 28 Z"
        fill="url(#vg)"
      />
      <path d="M16 2 L18 8 L16 7 L14 8 Z" fill="#0F5132" />
    </svg>
  );
}
