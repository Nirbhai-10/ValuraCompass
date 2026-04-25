import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  padded = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div
      className={cn(
        "bg-white border border-line-200 rounded-card",
        padded && "p-5 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
