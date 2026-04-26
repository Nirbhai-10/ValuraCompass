"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { HouseholdMode } from "@/lib/types";

interface NavItem {
  slug: string;
  label: string;
  basic?: boolean; // visible in BASIC mode
}

const SECTIONS: NavItem[] = [
  { slug: "", label: "Overview", basic: true },
  { slug: "people", label: "People", basic: true },
  { slug: "income", label: "Income", basic: true },
  { slug: "expenses", label: "Expenses", basic: true },
  { slug: "assets", label: "Assets", basic: true },
  { slug: "liabilities", label: "Liabilities", basic: true },
  { slug: "insurance", label: "Insurance", basic: true },
  { slug: "goals", label: "Goals", basic: true },
  { slug: "retirement", label: "Retirement" },
  { slug: "risk", label: "Risk profile" },
  { slug: "tax", label: "Tax" },
  { slug: "estate", label: "Estate" },
  { slug: "insights", label: "Insights", basic: true },
  { slug: "tasks", label: "Action center", basic: true },
  { slug: "assumptions", label: "Assumptions" },
];

export function HouseholdNav({
  householdId,
  mode,
}: {
  householdId: string;
  mode: HouseholdMode;
}) {
  const pathname = usePathname() ?? "";
  const base = `/app/households/${householdId}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const visible = SECTIONS.filter((s) => mode === "ADVANCED" || s.basic);

  function makeItem({ slug, label }: NavItem) {
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
    visible.find(({ slug }) => {
      const href = slug ? `${base}/${slug}` : base;
      return slug ? pathname.startsWith(href) : pathname === base;
    })?.label ?? (pathname.endsWith("/settings") ? "Settings" : "Overview");

  return (
    <>
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
        <ul className="flex flex-col">{visible.map(makeItem)}</ul>
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
        {mode === "BASIC" ? (
          <p className="text-[11px] text-ink-500 px-3 py-2 mt-1">
            <Link href={`${base}/settings`} className="link">
              Switch to Advanced
            </Link>{" "}
            for retirement Monte Carlo, risk profile, and more.
          </p>
        ) : null}
      </nav>
    </>
  );
}
