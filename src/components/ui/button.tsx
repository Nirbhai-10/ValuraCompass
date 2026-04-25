import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-deep text-white hover:bg-[#0A3E26] disabled:bg-ink-300",
  secondary:
    "bg-white text-ink-900 border border-line-200 hover:border-brand-deep hover:text-brand-deep",
  ghost: "text-ink-700 hover:text-brand-deep hover:bg-brand-mint/40",
  danger: "text-severity-critical hover:bg-red-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-button",
  md: "h-10 px-4 text-sm rounded-button",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "secondary", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
