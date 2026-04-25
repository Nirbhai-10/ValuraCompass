"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ToastTone = "info" | "success" | "error";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TIMEOUT = 3500;

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = ++nextId;
      setToasts((curr) => [...curr, { id, tone, message }]);
      window.setTimeout(() => dismiss(id), TIMEOUT);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    show,
    success: (msg) => show(msg, "success"),
    error: (msg) => show(msg, "error"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Tolerate calls outside the provider (e.g. server components, tests).
    return {
      show: () => {},
      success: () => {},
      error: () => {},
    };
  }
  return ctx;
}

const TONE_CLASSES: Record<ToastTone, string> = {
  info: "bg-white text-ink-900 border-line-200",
  success: "bg-brand-mint/70 text-brand-deep border-transparent",
  error: "bg-red-50 text-severity-critical border-red-100",
};

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: number) => void;
}) {
  // Avoid SSR mismatch — only render once mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4"
      aria-live="polite"
      role="status"
    >
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={cn(
              "pointer-events-auto text-sm border rounded-card shadow-sm px-4 py-3 text-left transition-all",
              TONE_CLASSES[t.tone],
            )}
          >
            {t.message}
          </button>
        ))}
      </div>
    </div>
  );
}
