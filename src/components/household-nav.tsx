"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const FOOTER = [{ slug: "settings", label: "Settings" }];

export function HouseholdNav({ householdId }: { householdId: string }) {
  const pathname = usePathname() ?? "";
  const base = `/app/households/${householdId}`;

  function renderItem({ slug, label }: { slug: string; label: string }) {
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

  return (
    <nav className="bg-white border border-line-200 rounded-card p-2">
      <ul className="flex flex-col">{SECTIONS.map(renderItem)}</ul>
      <div className="my-2 h-px bg-line-100" />
      <ul className="flex flex-col">{FOOTER.map(renderItem)}</ul>
    </nav>
  );
}
