"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { slug: "", label: "Overview" },
  { slug: "people", label: "People" },
  { slug: "income", label: "Income" },
  { slug: "expenses", label: "Expenses" },
  { slug: "assets", label: "Assets" },
  { slug: "liabilities", label: "Liabilities" },
  { slug: "insurance", label: "Insurance" },
  { slug: "goals", label: "Goals" },
];

export function HouseholdNav({ householdId }: { householdId: string }) {
  const pathname = usePathname() ?? "";
  const base = `/app/households/${householdId}`;
  const [open, setOpen] = useState(false);

  // Close drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function makeItem({ slug, label }: { slug: string; label: string }) {
    const href = slug ? `${base}/${slug}` : base;
    const active = slug ? pathname.startsWith(href) : pathname === base;
    return (
      <li key={slug || "overview"}>
        <Link
          href={href}
          className={cn(
            "block px-3 py-2 rounded-button text-sm text-ink-700 hover:bg-brand-mint/40",
            active && "bg-brand-mint/60 text-brand-deep font-medium",
          )}
        >
          {label}
        </Link>
      </li>
    );
  }

  const currentLabel =
    SECTIONS.find(({ slug }) => {
      const href = slug ? `${base}/${slug}` : base;
      return slug ? pathname.startsWith(href) : pathname === base;
    })?.label ?? (pathname.endsWith("/settings") ? "Settings" : "Overview");

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        className="lg:hidden inline-flex w-full items-center justify-between gap-2 px-4 h-10 rounded-button bg-white border border-line-200 text-sm font-medium text-ink-900 hover:border-brand-deep"
        aria-expanded={open}
        aria-controls="household-nav-list"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{currentLabel}</span>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn(
            "size-3 text-ink-500 transition-transform",
            open && "rotate-180",
          )}
        >
          <path
            d="M2 4 L6 8 L10 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <nav
        id="household-nav-list"
        className={cn(
          "bg-white border border-line-200 rounded-card p-2 mt-2 lg:mt-0",
          !open && "hidden lg:block",
        )}
      >
        <ul className="flex flex-col">{SECTIONS.map(makeItem)}</ul>
        <div className="my-2 h-px bg-line-100" />
        <ul className="flex flex-col">
          {makeItem({ slug: "settings", label: "Settings" })}
          <li>
            <Link
              href={`/print/${householdId}`}
              className="flex items-center justify-between px-3 py-2 rounded-button text-sm text-ink-700 hover:bg-brand-mint/40"
            >
              <span>Report</span>
              <span className="text-[11px] text-ink-500">↗</span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
