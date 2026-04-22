"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyBasicAction } from "./actions";

export interface BasicState {
  primaryName: string;
  dob: string;
  maritalStatus: string;
  employmentType: string;
  dependents: number;
  monthlyNetIncome: number;
  essentialMonthlyExpenses: number;
  discretionaryMonthlyExpenses: number;
  totalAssets: number;
  liquidCash: number;
  totalLiabilities: number;
  totalEMI: number;
  creditCardRevolve: boolean;
  termCover: number;
  healthCover: number;
  taxRegime: string;
  riskComfort: string;
  retirementAge: number;
  retirementTargetMonthly: number;
  childEducationCost: number;
  childEducationYear: number;
  homePurchaseCost: number;
  homePurchaseYear: number;
}

const steps = [
  "You",
  "Family",
  "Income",
  "Expenses",
  "Assets",
  "Liabilities",
  "Insurance",
  "Tax",
  "Goals",
  "Risk",
  "Review",
] as const;

export function BasicWizard({
  householdId,
  initial,
  region,
  currency,
}: {
  householdId: string;
  initial: BasicState;
  region: string;
  currency: string;
}) {
  const [state, setState] = useState<BasicState>(initial);
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const router = useRouter();

  function update<K extends keyof BasicState>(key: K, value: BasicState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  const progressPct = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  async function submit() {
    start(async () => {
      const res = await applyBasicAction(householdId, state);
      if (res.ok) {
        router.push(`/app/households/${householdId}/reports/basic`);
      } else {
        alert(res.error ?? "Could not save");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>Step {step + 1} of {steps.length} · {steps[step]}</span>
        <span>{Math.round(progressPct)}% · ~{Math.max(1, Math.round((10 * (steps.length - step - 1)) / steps.length))} min left</span>
      </div>
      <div className="h-1 bg-line-200 rounded-full overflow-hidden">
        <div className="h-full bg-brand-deep" style={{ width: `${progressPct}%` }} />
      </div>

      {step === 0 && (
        <Section title="A little about you">
          <Field label="Preferred name" value={state.primaryName} onChange={(v) => update("primaryName", v)} />
          <Field label="Date of birth" type="date" value={state.dob} onChange={(v) => update("dob", v)} />
          <Choice
            label="Relationship status"
            value={state.maritalStatus}
            onChange={(v) => update("maritalStatus", v)}
            options={["SINGLE", "MARRIED", "PARTNERED", "DIVORCED", "WIDOWED"]}
          />
          <Choice
            label="How you earn"
            value={state.employmentType}
            onChange={(v) => update("employmentType", v)}
            options={["SALARIED", "BUSINESS", "PROFESSIONAL", "RETIRED", "STUDENT", "OTHER"]}
          />
        </Section>
      )}

      {step === 1 && (
        <Section title="Family snapshot">
          <Number label="How many people financially depend on you (or your partner)?" value={state.dependents} onChange={(v) => update("dependents", v)} />
        </Section>
      )}

      {step === 2 && (
        <Section title="Income snapshot">
          <Number label={`Total household net monthly income (${currency})`} value={state.monthlyNetIncome} onChange={(v) => update("monthlyNetIncome", v)} />
        </Section>
      )}

      {step === 3 && (
        <Section title="Expenses snapshot">
          <Number label={`Essential monthly expenses (${currency})`} value={state.essentialMonthlyExpenses} onChange={(v) => update("essentialMonthlyExpenses", v)} />
          <Number label={`Discretionary monthly expenses (${currency})`} value={state.discretionaryMonthlyExpenses} onChange={(v) => update("discretionaryMonthlyExpenses", v)} />
        </Section>
      )}

      {step === 4 && (
        <Section title="Assets snapshot (approximate)">
          <Number label={`Total investable assets including retirement (${currency})`} value={state.totalAssets} onChange={(v) => update("totalAssets", v)} />
          <Number label={`Of which, cash you can access in a week (${currency})`} value={state.liquidCash} onChange={(v) => update("liquidCash", v)} />
        </Section>
      )}

      {step === 5 && (
        <Section title="Liabilities snapshot">
          <Number label={`Total outstanding loans (${currency})`} value={state.totalLiabilities} onChange={(v) => update("totalLiabilities", v)} />
          <Number label={`Total monthly EMIs (${currency})`} value={state.totalEMI} onChange={(v) => update("totalEMI", v)} />
          <Toggle label="Do you carry a credit card balance month to month?" value={state.creditCardRevolve} onChange={(v) => update("creditCardRevolve", v)} />
        </Section>
      )}

      {step === 6 && (
        <Section title="Insurance snapshot">
          <Number label={`Term insurance cover (${currency})`} value={state.termCover} onChange={(v) => update("termCover", v)} />
          <Number label={`Health insurance cover (${currency})`} value={state.healthCover} onChange={(v) => update("healthCover", v)} />
        </Section>
      )}

      {step === 7 && (
        <Section title="Tax snapshot">
          {region === "IN" ? (
            <Choice
              label="India tax regime (if known)"
              value={state.taxRegime}
              onChange={(v) => update("taxRegime", v)}
              options={["", "OLD", "NEW"]}
            />
          ) : (
            <p className="text-sm text-ink-500">Tax observations for your region run in the Tax module. Skip unless you want to note residency details now.</p>
          )}
        </Section>
      )}

      {step === 8 && (
        <Section title="Goals snapshot">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-4 space-y-3">
              <p className="text-sm font-medium">Retirement</p>
              <Number label="Intended retirement age" value={state.retirementAge} onChange={(v) => update("retirementAge", v)} />
              <Number label={`Target monthly expense at retirement (today's ${currency})`} value={state.retirementTargetMonthly} onChange={(v) => update("retirementTargetMonthly", v)} />
            </div>
            <div className="card p-4 space-y-3">
              <p className="text-sm font-medium">Child education (optional)</p>
              <Number label={`Target today's cost (${currency})`} value={state.childEducationCost} onChange={(v) => update("childEducationCost", v)} />
              <Number label="Target year" value={state.childEducationYear} onChange={(v) => update("childEducationYear", v)} />
            </div>
            <div className="card p-4 space-y-3">
              <p className="text-sm font-medium">Home purchase (optional)</p>
              <Number label={`Target today's cost (${currency})`} value={state.homePurchaseCost} onChange={(v) => update("homePurchaseCost", v)} />
              <Number label="Target year" value={state.homePurchaseYear} onChange={(v) => update("homePurchaseYear", v)} />
            </div>
          </div>
        </Section>
      )}

      {step === 9 && (
        <Section title="Risk comfort">
          <Choice
            label="If your investments dropped 25% in a year, you would:"
            value={state.riskComfort}
            onChange={(v) => update("riskComfort", v)}
            options={["CONSERVATIVE", "MOD_CONSERVATIVE", "BALANCED", "GROWTH", "AGGRESSIVE"]}
            labels={{
              CONSERVATIVE: "Sell most — I'd be very uncomfortable",
              MOD_CONSERVATIVE: "Sell some — reduce risk",
              BALANCED: "Hold steady",
              GROWTH: "Hold and buy a little more",
              AGGRESSIVE: "Buy a lot more — it's a sale",
            }}
          />
        </Section>
      )}

      {step === 10 && (
        <Section title="Review & save">
          <div className="text-sm text-ink-700 leading-relaxed">
            We&apos;ll save these answers to your household, compute scores and insights, and take you to the Basic one-pager.
            Everything is editable later in Advanced.
          </div>
          <div className="card p-4 text-xs text-ink-500">
            <ul className="space-y-1">
              <li>• You: {state.primaryName || "—"}, {state.maritalStatus}, {state.employmentType}, {state.dependents} dependent(s)</li>
              <li>• Income: {state.monthlyNetIncome.toLocaleString()}/mo {currency}</li>
              <li>• Essentials: {state.essentialMonthlyExpenses.toLocaleString()}, Discretionary: {state.discretionaryMonthlyExpenses.toLocaleString()}</li>
              <li>• Assets: {state.totalAssets.toLocaleString()} · Liquid: {state.liquidCash.toLocaleString()} · Liabilities: {state.totalLiabilities.toLocaleString()} (EMI {state.totalEMI.toLocaleString()})</li>
              <li>• Term cover: {state.termCover.toLocaleString()} · Health: {state.healthCover.toLocaleString()}</li>
              <li>• Tax regime: {state.taxRegime || "—"} · Risk comfort: {state.riskComfort}</li>
            </ul>
          </div>
        </Section>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          className="btn-secondary"
          disabled={step === 0 || pending}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button type="button" className="btn-primary" onClick={() => setStep((s) => s + 1)}>
            Next
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={submit} disabled={pending}>
            {pending ? "Saving…" : "Save & see my plan"}
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} type={type} />
    </label>
  );
}

function Number({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="input tabular-nums"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9.]/g, "");
          onChange(v === "" ? 0 : parseFloat(v));
        }}
        inputMode="decimal"
      />
    </label>
  );
}

function Choice({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{labels?.[o] ?? o.replace(/_/g, " ")}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 card p-3 cursor-pointer">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
      <span className="text-sm">{label}</span>
    </label>
  );
}
