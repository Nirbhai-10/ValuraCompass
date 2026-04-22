import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { saveEstateAction } from "./actions";
import { computeScores } from "@/lib/analytics/engine";
import { ScoreCard } from "@/components/score-card";

export default async function EstatePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const scores = computeScores(h as any);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ScoreCard score={scores.ESS} emphasis />
        <ScoreCard score={scores.DCS} />
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Estate & continuity</h2></div>
        <form action={saveEstateAction} className="card-body grid gap-3 md:grid-cols-2">
          <input type="hidden" name="householdId" value={h.id} />
          <Select name="willStatus" label="Will status" options={["NONE", "DRAFT", "REGISTERED", "UPDATED", "OUTDATED"]} defaultValue={h.estateProfile?.willStatus ?? "NONE"} />
          <Select name="trustStatus" label="Trust status" options={["NONE", "DRAFT", "ACTIVE"]} defaultValue={h.estateProfile?.trustStatus ?? "NONE"} />
          <Select name="poaStatus" label="Power of attorney" options={["NONE", "DRAFT", "EXECUTED"]} defaultValue={h.estateProfile?.poaStatus ?? "NONE"} />
          <div className="md:col-span-2">
            <label className="label">Guardianship notes</label>
            <textarea className="textarea" name="guardianshipNotes" rows={2} defaultValue={h.estateProfile?.guardianshipNotes ?? ""}></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="label">Legacy intent</label>
            <textarea className="textarea" name="legacyIntentNotes" rows={2} defaultValue={h.estateProfile?.legacyIntentNotes ?? ""}></textarea>
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary">Save estate profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Select({ name, label, options, defaultValue }: { name: string; label: string; options: string[]; defaultValue?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" name={name} defaultValue={defaultValue}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
