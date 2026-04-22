import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createHouseholdAction } from "./actions";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="card">
        <div className="card-header">
          <h1 className="text-lg font-semibold">Create a household</h1>
          <p className="text-sm text-ink-500">Set region, currency, and structure. You can edit everything later.</p>
        </div>
        <form action={createHouseholdAction} className="card-body grid gap-4">
          <div>
            <label className="label">Household name</label>
            <input className="input" name="name" required placeholder="The Sharma family" defaultValue="My household" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Region</label>
              <select name="region" className="input" defaultValue="IN">
                <option value="IN">India (default)</option>
                <option value="GCC">GCC</option>
                <option value="GLOBAL">Global</option>
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select name="currency" className="input" defaultValue="INR">
                <option>INR</option>
                <option>AED</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>SAR</option>
                <option>QAR</option>
                <option>OMR</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Structure</label>
              <select name="structure" className="input" defaultValue="NUCLEAR">
                <option value="SINGLE">Single</option>
                <option value="DINK">Couple, no kids</option>
                <option value="NUCLEAR">Nuclear (you + spouse + kids)</option>
                <option value="NUCLEAR_WITH_PARENTS">Nuclear with parents supported</option>
                <option value="JOINT">Joint family</option>
                <option value="SINGLE_PARENT">Single parent</option>
                <option value="MULTI_GEN">Multi-generational</option>
                <option value="CROSS_BORDER">Cross-border</option>
              </select>
            </div>
            <div>
              <label className="label">Mode</label>
              <select name="mode" className="input" defaultValue="BASIC">
                <option value="BASIC">Basic (≤ 10 min)</option>
                <option value="ADVANCED">Advanced workspace</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Primary person&apos;s name</label>
            <input className="input" name="primaryName" required defaultValue={session.name} />
          </div>
          <button className="btn-primary" type="submit">Create household</button>
          <p className="text-xs text-ink-500">
            Compass creates a minimal starting household, sets you as a full-access member, and opens
            the next step based on your chosen mode.
          </p>
        </form>
      </div>
    </div>
  );
}
