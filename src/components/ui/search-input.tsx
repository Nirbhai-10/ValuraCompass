"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ className, ...props }, ref) {
    return (
      <div className={cn("relative w-full max-w-xs", className)}>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-300 pointer-events-none"
        >
          <circle
            cx="7"
            cy="7"
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="10.5"
            y1="10.5"
            x2="13.5"
            y2="13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          ref={ref}
          type="search"
          className="h-9 pl-9 pr-3 rounded-button border border-line-200 bg-white text-sm w-full outline-none transition-colors focus:border-brand-deep placeholder:text-ink-300"
          {...props}
        />
      </div>
    );
  },
);

export function matchesQuery(query: string, ...fields: (string | number | undefined)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) =>
    f != null && String(f).toLowerCase().includes(q),
  );
}
