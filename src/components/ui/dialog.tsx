"use client";

import * as React from "react";
import { useEffect } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-t-card sm:rounded-card border border-line-200 shadow-xl mx-0 sm:mx-4 max-h-[92vh] flex flex-col">
        <div className="px-5 sm:px-6 py-4 border-b border-line-200">
          <h2 id="dialog-title" className="text-base font-semibold text-ink-900">
            {title}
          </h2>
          {description ? (
            <p className="text-xs text-ink-500 mt-0.5">{description}</p>
          ) : null}
        </div>
        <div className="overflow-y-auto px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

interface DialogState<T> {
  open: boolean;
  item: T | null;
  openFor: (item: T | null) => void;
  close: () => void;
}

export function useDialog<T>(): DialogState<T> {
  const [open, setOpen] = React.useState(false);
  const [item, setItem] = React.useState<T | null>(null);

  return React.useMemo(
    () => ({
      open,
      item,
      openFor: (x: T | null) => {
        setItem(x);
        setOpen(true);
      },
      close: () => {
        setOpen(false);
        setItem(null);
      },
    }),
    [open, item],
  );
}
