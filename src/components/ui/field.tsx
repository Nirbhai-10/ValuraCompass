import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, htmlFor, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink-500 block mb-1.5">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-ink-500">{hint}</p> : null}
    </div>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 px-3 rounded-button border border-line-200 bg-white text-sm w-full outline-none transition-colors focus:border-brand-deep placeholder:text-ink-300",
        className,
      )}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 px-3 rounded-button border border-line-200 bg-white text-sm w-full outline-none transition-colors focus:border-brand-deep",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "px-3 py-2 rounded-button border border-line-200 bg-white text-sm w-full outline-none transition-colors focus:border-brand-deep placeholder:text-ink-300 min-h-[5rem]",
        className,
      )}
      {...props}
    />
  );
});
