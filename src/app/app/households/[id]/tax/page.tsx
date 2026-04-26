"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectHousehold, selectTaxProfile } from "@/lib/selectors";
import { upsertTaxProfile } from "@/lib/mutations";
import { TaxRegime, TaxInputs } from "@/lib/types";
import {
  EMPTY_TAX_INPUTS,
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS,
  Regime,
  SECTION_HINTS,
  TaxBreakdown,
  compareRegimes,
} from "@/lib/india-tax";
import { formatMoney, parseAmount } from "@/lib/format";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const SECTION_GROUPS: {
  title: string;
  hint?: string;
  fields: { key: keyof TaxInputs; label: string; section?: string; placeholder?: string }[];
}[] = [
  {
    title: "Income (annual)",
    fields: [
      { key: "salary", label: "Gross salary (₹)", placeholder: "e.g. 1,200,000" },
      { key: "businessIncome", label: "Business / professional (₹)" },
      {
        key: "housePropertyIncome",
        label: "House property — net of 30% (₹)",
      },
      { key: "otherIncome", label: "Other income — interest, dividends (₹)" },
    ],
  },
  {
    title: "Salary carve-outs",
    hint: "Available only under the Old regime.",
    fields: [
      { key: "hraExempt", label: "HRA exempt (₹)", section: "HRA" },
      { key: "ltaExempt", label: "LTA exempt (₹)", section: "LTA" },
      { key: "professionalTax", label: "Professional tax (₹)", section: "PT" },
    ],
  },
  {
    title: "Old-regime deductions",
    hint: "Chapter VI-A. Caps applied automatically.",
    fields: [
      { key: "d80C", label: "80C — PPF/EPF/ELSS/LIC (cap ₹1.5L)", section: "80C" },
      { key: "d80CCD1B", label: "80CCD(1B) — NPS additional (cap ₹50K)", section: "80CCD(1B)" },
      { key: "d80D", label: "80D — Health insurance (₹)", section: "80D" },
      { key: "d24bHomeLoan", label: "24(b) — Home loan interest (cap ₹2L)", section: "24(b)" },
      { key: "d80E", label: "80E — Education loan interest (₹)", section: "80E" },
      { key: "d80G", label: "80G — Donations (qualifying)", section: "80G" },
      { key: "d80TTA", label: "80TTA — Savings interest (cap ₹10K)", section: "80TTA" },
    ],
  },
  {
    title: "Both regimes",
    fields: [
      {
        key: "employerNPS80CCD2",
        label: "Employer NPS — 80CCD(2)",
        section: "80CCD(2)",
      },
    ],
  },
];

export default function TaxPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);
  const profile = selectTaxProfile(db, householdId);

  const initialInputs: TaxInputs = profile?.inputs ?? EMPTY_TAX_INPUTS;
  const [inputs, setInputs] = useState<TaxInputs>(initialInputs);
  const [regime, setRegime] = useState<TaxRegime>(profile?.regime ?? "NEW");

  const compare = useMemo(() => compareRegimes(inputs), [inputs]);

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const isIN = household.region === "IN";

  function setField(key: keyof TaxInputs, value: number | boolean) {
    setInputs((curr) => ({ ...curr, [key]: value }));
  }

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const notes = String(fd.get("notes") ?? "").trim() || undefined;
    update(
      upsertTaxProfile(householdId, {
        regime,
        inputs,
        notes,
      }),
    );
    toast.success("Tax profile saved.");
  }

  function autoFillFromHousehold() {
    // Pull conservative defaults from current household data.
    const firstSalary =
      db.incomes
        .filter((i) => i.householdId === householdId && i.type === "Salary")
        .reduce((s, i) => s + i.amountMonthly, 0) * 12;
    const businessOther =
      db.incomes
        .filter(
          (i) =>
            i.householdId === householdId &&
            (i.type === "Business" ||
              i.type === "Consulting" ||
              i.type === "Other"),
        )
        .reduce((s, i) => s + i.amountMonthly, 0) * 12;
    const rental =
      db.incomes
        .filter((i) => i.householdId === householdId && i.type === "Rental")
        .reduce((s, i) => s + i.amountMonthly * 0.7, 0) * 12;
    const other =
      db.incomes
        .filter(
          (i) =>
            i.householdId === householdId &&
            (i.type === "Dividends" ||
              i.type === "Interest" ||
              i.type === "Pension"),
        )
        .reduce((s, i) => s + i.amountMonthly, 0) * 12;
    const homeLoanInterest =
      db.liabilities
        .filter(
          (l) => l.householdId === householdId && l.type === "Home loan",
        )
        .reduce((s, l) => s + (l.outstanding * (l.interestRate ?? 8)) / 100, 0) ||
      0;
    const healthPremiums =
      db.policies
        .filter(
          (p) =>
            p.householdId === householdId &&
            (p.type === "Health (family)" || p.type === "Health (individual)"),
        )
        .reduce((s, p) => s + (p.premiumAnnual ?? 0), 0);

    setInputs((curr) => ({
      ...curr,
      salary: Math.round(firstSalary),
      businessIncome: Math.round(businessOther),
      housePropertyIncome: Math.round(rental),
      otherIncome: Math.round(other),
      d24bHomeLoan: Math.min(homeLoanInterest, 200000),
      d80D: Math.min(healthPremiums, 75000),
    }));
    toast.success("Pre-filled from your household data. Adjust as needed.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax"
        subtitle={
          isIN ? (
            <>
              Indian income tax — FY 2024-25 / AY 2025-26. Side-by-side Old vs New
              regime, all major deductions and the 4% cess accounted for.
            </>
          ) : (
            "Region is non-Indian; the regime selector below is informational only."
          )
        }
        action={
          isIN ? (
            <Button variant="ghost" onClick={autoFillFromHousehold}>
              Auto-fill from data
            </Button>
          ) : undefined
        }
      />

      {isIN ? (
        <RegimeComparison compare={compare} fmt={fmt} regime={regime} />
      ) : null}

      {isIN ? (
        <Card>
          <h3 className="text-sm font-semibold mb-1">Slab visualizer</h3>
          <p className="text-xs text-ink-500 mb-4">
            Where each rupee of taxable income lands under each regime.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <SlabBars
              title="Old regime"
              breakdown={compare.old}
              total={compare.old.taxableIncome}
              fmt={fmt}
            />
            <SlabBars
              title="New regime"
              breakdown={compare.newR}
              total={compare.newR.taxableIncome}
              fmt={fmt}
            />
          </div>
        </Card>
      ) : null}

      <form onSubmit={handleSave} className="space-y-6">
        {isIN
          ? SECTION_GROUPS.map((group) => (
              <Card key={group.title}>
                <p className="text-sm font-semibold">{group.title}</p>
                {group.hint ? (
                  <p className="text-xs text-ink-500 mt-0.5">{group.hint}</p>
                ) : null}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {group.fields.map((f) => (
                    <Field
                      key={f.key}
                      label={f.label}
                      htmlFor={f.key}
                      hint={f.section ? SECTION_HINTS[f.section] : undefined}
                    >
                      <Input
                        id={f.key}
                        name={f.key}
                        inputMode="decimal"
                        placeholder={f.placeholder ?? "0"}
                        value={(inputs[f.key] as number) || ""}
                        onChange={(e) =>
                          setField(f.key, parseAmount(e.target.value))
                        }
                      />
                    </Field>
                  ))}
                </div>
                {group.title === "Income (annual)" ? (
                  <label className="mt-4 flex items-center gap-2 text-sm text-ink-700">
                    <input
                      type="checkbox"
                      checked={inputs.isSalaried}
                      onChange={(e) => setField("isSalaried", e.target.checked)}
                      className="size-4 accent-brand-deep"
                    />
                    Filer is salaried (eligible for the standard deduction)
                  </label>
                ) : null}
              </Card>
            ))
          : null}

        <Card>
          <p className="text-sm font-semibold">Filing</p>
          <p className="text-xs text-ink-500 mt-0.5">
            What this household intends to file under.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Selected regime" htmlFor="regime">
              <Select
                id="regime"
                value={regime}
                onChange={(e) => setRegime(e.target.value as TaxRegime)}
              >
                <option value="OLD">India · Old regime</option>
                <option value="NEW">India · New regime</option>
                <option value="NA">Non-resident / not applicable</option>
              </Select>
            </Field>
            {isIN ? (
              <div className="flex items-end">
                <p className="text-xs text-ink-500">
                  Compass recommends:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      compare.betterRegime === "OLD"
                        ? "text-brand-deep"
                        : "text-brand-deep",
                    )}
                  >
                    {compare.betterRegime === "OLD" ? "Old regime" : "New regime"}
                  </span>{" "}
                  · saves about{" "}
                  <span className="font-semibold tabular-nums">{fmt(compare.savings)}</span>{" "}
                  this year.
                </p>
              </div>
            ) : null}
          </div>
          <Field label="Notes" htmlFor="notes" className="mt-4">
            <Textarea
              id="notes"
              name="notes"
              defaultValue={profile?.notes ?? ""}
              placeholder="Anything special — presumptive scheme, capital-gains pending, foreign income, etc."
            />
          </Field>
          <div className="mt-4">
            <Button variant="primary" type="submit">
              Save tax profile
            </Button>
          </div>
        </Card>
      </form>

      {isIN ? (
        <Card>
          <p className="text-sm font-semibold">Why this recommendation</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-700 leading-relaxed list-disc pl-4">
            {compare.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="text-[11px] text-ink-500 mt-4 pt-3 border-t border-line-100">
            Capital gains (LTCG / STCG) are not modeled here — they're taxed under
            special rates and shouldn't be added to the income inputs. Marginal relief
            on surcharge thresholds is not modeled either; comparison is for planning,
            not filing.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

function RegimeComparison({
  compare,
  fmt,
  regime,
}: {
  compare: ReturnType<typeof compareRegimes>;
  fmt: (n: number) => string;
  regime: TaxRegime;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <RegimeCard
        regime="OLD"
        breakdown={compare.old}
        better={compare.betterRegime === "OLD"}
        selected={regime === "OLD"}
        fmt={fmt}
      />
      <RegimeCard
        regime="NEW"
        breakdown={compare.newR}
        better={compare.betterRegime === "NEW"}
        selected={regime === "NEW"}
        fmt={fmt}
      />
    </div>
  );
}

function RegimeCard({
  regime,
  breakdown,
  better,
  selected,
  fmt,
}: {
  regime: Regime;
  breakdown: TaxBreakdown;
  better: boolean;
  selected: boolean;
  fmt: (n: number) => string;
}) {
  return (
    <Card
      className={cn(
        better && "ring-2 ring-brand-deep/40 border-brand-deep",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-ink-500">
            {regime === "OLD" ? "Old regime" : "New regime"}
          </p>
          <p className="text-2xl font-semibold tabular-nums mt-1">
            {fmt(breakdown.totalTax)}
          </p>
          <p className="text-xs text-ink-500">
            Total tax · {(breakdown.effectiveRate * 100).toFixed(1)}% effective
          </p>
        </div>
        <div className="text-right space-y-1">
          {better ? (
            <span className="inline-flex items-center px-2 h-5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-brand-mint text-brand-deep border border-transparent">
              Lower
            </span>
          ) : null}
          {selected ? (
            <p className="text-[10px] uppercase tracking-wide text-ink-500">
              Selected
            </p>
          ) : null}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
        <Row label="Gross income" value={fmt(breakdown.grossTotalIncome)} />
        <Row
          label="Standard deduction"
          value={fmt(breakdown.standardDeduction)}
        />
        {regime === "OLD" ? (
          <>
            <Row label="HRA + LTA" value={fmt(breakdown.hraLtaExemption)} />
            <Row label="Professional tax" value={fmt(breakdown.professionalTax)} />
          </>
        ) : null}
        <Row label="Chapter VI-A total" value={fmt(
          breakdown.chapterVIA
            .filter((c) => !["HRA", "LTA", "PT"].includes(c.section))
            .reduce((s, c) => s + c.allowed, 0),
        )} />
        <Row label="Taxable income" value={fmt(breakdown.taxableIncome)} bold />
        <Row label="Slab tax" value={fmt(breakdown.baseTax)} />
        <Row
          label="87A rebate"
          value={breakdown.rebate87A > 0 ? `−${fmt(breakdown.rebate87A)}` : "—"}
        />
        <Row
          label={`Surcharge${breakdown.surchargeRate > 0 ? ` (${(breakdown.surchargeRate * 100).toFixed(0)}%)` : ""}`}
          value={fmt(breakdown.surcharge)}
        />
        <Row label="Cess (4%)" value={fmt(breakdown.cess)} />
        <Row
          label="Take-home"
          value={fmt(breakdown.takeHome)}
          bold
        />
      </dl>
    </Card>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <>
      <dt className="text-ink-500">{label}</dt>
      <dd
        className={cn(
          "text-right tabular-nums",
          bold ? "text-ink-900 font-semibold" : "text-ink-700",
        )}
      >
        {value}
      </dd>
    </>
  );
}

function SlabBars({
  title,
  breakdown,
  total,
  fmt,
}: {
  title: string;
  breakdown: TaxBreakdown;
  total: number;
  fmt: (n: number) => string;
}) {
  const slabs = breakdown.regime === "OLD" ? OLD_REGIME_SLABS : NEW_REGIME_SLABS;
  const palette = ["#E2EFE7", "#A8D7B9", "#54AC94", "#2C7A5A", "#0F5132", "#0A3E26"];
  const safeTotal = total > 0 ? total : 1;

  return (
    <div>
      <p className="text-sm font-semibold mb-2">{title}</p>
      <div className="h-3 w-full rounded-full overflow-hidden bg-line-100 flex">
        {breakdown.slabFills.map((fill, i) => {
          const pct = (fill.amount / safeTotal) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={`${i}-${fill.label}`}
              style={{ width: `${pct}%`, background: palette[i % palette.length] }}
              title={`${slabs[i].label} (${(fill.rate * 100).toFixed(0)}%) — ${fmt(fill.amount)}`}
            />
          );
        })}
      </div>
      <ul className="mt-3 space-y-1 text-xs">
        {breakdown.slabFills.map((fill, i) => {
          if (fill.amount === 0) return null;
          return (
            <li key={i} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-ink-700">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ background: palette[i % palette.length] }}
                />
                {slabs[i].label} · {(fill.rate * 100).toFixed(0)}%
              </span>
              <span className="text-ink-700 tabular-nums">
                {fmt(fill.amount)} → {fmt(fill.tax)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-ink-500 pt-2 border-t border-line-100">
        Taxable income {fmt(breakdown.taxableIncome)} · Slab tax {fmt(breakdown.baseTax)}
      </p>
    </div>
  );
}
