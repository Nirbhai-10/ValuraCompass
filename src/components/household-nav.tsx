"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  basic?: boolean; // visible in Basic
}

export function HouseholdNav({ householdId, mode }: { householdId: string; mode: "BASIC" | "ADVANCED" }) {
  const pathname = usePathname();
  const base = `/app/households/${householdId}`;

  const items: NavItem[] = [
    { href: base, label: "Overview", basic: true },
    { href: `${base}/basic`, label: "Basic Mode", basic: true },
    { href: `${base}/people`, label: "People & Map", basic: true },
    { href: `${base}/income`, label: "Income", basic: true },
    { href: `${base}/expenses`, label: "Expenses", basic: true },
    { href: `${base}/assets`, label: "Assets", basic: true },
    { href: `${base}/liabilities`, label: "Liabilities", basic: true },
    { href: `${base}/insurance`, label: "Insurance", basic: true },
    { href: `${base}/goals`, label: "Goals", basic: true },
    { href: `${base}/retirement`, label: "Retirement" },
    { href: `${base}/risk`, label: "Risk & Suitability", basic: true },
    { href: `${base}/tax`, label: "Tax observations" },
    { href: `${base}/estate`, label: "Estate" },
    { href: `${base}/insights`, label: "Insights", basic: true },
    { href: `${base}/tasks`, label: "Action Center", basic: true },
    { href: `${base}/documents`, label: "Documents", basic: true },
    { href: `${base}/reports`, label: "Reports", basic: true },
    { href: `${base}/assumptions`, label: "Assumptions" },
  ];

  const visible = items.filter((i) => (mode === "ADVANCED" ? true : i.basic));

  return (
    <nav className="card p-2 text-sm">
      <ul className="flex flex-col">
        {visible.map((i) => {
          const active = pathname === i.href || (i.href !== base && pathname.startsWith(i.href));
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={cn(
                  "block px-3 py-2 rounded-button text-ink-700 hover:bg-brand-mint/40",
                  active && "bg-brand-mint/60 text-brand-deep font-medium",
                )}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
