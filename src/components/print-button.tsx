"use client";

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
    >
      {label}
    </button>
  );
}
