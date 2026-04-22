import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getHouseholdForUser } from "@/lib/household";
import { createTaskAction, updateTaskStatusAction, deleteTaskAction } from "./actions";

const TASK_TYPES = [
  "MISSING_DATA", "MISSING_DOC", "RECOMMENDATION", "TAX_REVIEW", "INSURANCE_REVIEW",
  "DEBT_OPT", "GOAL_FUND", "ANNUAL_REVIEW", "LIFE_EVENT", "ESTATE", "NOMINEE_FIX",
  "RISK_REVIEW", "SUITABILITY", "REGION_UPDATE", "ASSUMPTION_CONFIRM",
  "SPECIALIST_REFERRAL", "COMPLIANCE", "MEETING_PREP", "COMMUNICATION",
];

const OWNERS = ["ADVISOR", "CLIENT", "SPOUSE", "SPECIALIST", "COMPLIANCE"];

function sev(priority: string) {
  return priority === "CRITICAL" ? "chip-critical" : priority === "HIGH" ? "chip-high" : priority === "MEDIUM" ? "chip-warn" : "chip-low";
}

export default async function TasksPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");

  const tasks = await prisma.task.findMany({
    where: { householdId: h.id },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  const open = tasks.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="kpi"><p className="kpi-title">Open tasks</p><p className="kpi-value">{open.length}</p></div>
        <div className="kpi"><p className="kpi-title">Completed</p><p className="kpi-value">{done.length}</p></div>
        <div className="kpi"><p className="kpi-title">Critical</p><p className="kpi-value">{open.filter((t) => t.priority === "CRITICAL").length}</p></div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">Action Center</h2>
          <span className="text-xs text-ink-500">{tasks.length} total</span>
        </div>
        <div className="card-body">
          {tasks.length === 0 ? (
            <p className="text-sm text-ink-500">No tasks yet. The system will create some based on your data; you can also add your own below.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t) => (
                <li key={t.id} className="border border-line-200 rounded-button p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{t.title}</p>
                        <span className={sev(t.priority)}>{t.priority}</span>
                        <span className="chip-default">{t.ownerType}</span>
                        <span className="chip-default">{t.type.replace(/_/g, " ")}</span>
                        <span className={t.status === "DONE" ? "chip-positive" : "chip-default"}>{t.status}</span>
                      </div>
                      {t.body ? <p className="text-sm text-ink-700 mt-1">{t.body}</p> : null}
                      {t.dueDate ? <p className="text-xs text-ink-500 mt-1">Due: {new Date(t.dueDate).toLocaleDateString()}</p> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={updateTaskStatusAction}>
                        <input type="hidden" name="householdId" value={h.id} />
                        <input type="hidden" name="id" value={t.id} />
                        <select name="status" className="input h-8 text-xs" defaultValue={t.status}>
                          {["OPEN", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button className="btn-ghost text-xs mt-1">Update</button>
                      </form>
                      <form action={deleteTaskAction}>
                        <input type="hidden" name="householdId" value={h.id} />
                        <input type="hidden" name="id" value={t.id} />
                        <button className="btn-ghost text-xs">Remove</button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Add task</h2></div>
        <form action={createTaskAction} className="card-body grid gap-3 md:grid-cols-2">
          <input type="hidden" name="householdId" value={h.id} />
          <div className="md:col-span-2">
            <label className="label">Title</label>
            <input className="input" name="title" required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Details</label>
            <textarea className="textarea" name="body" rows={2}></textarea>
          </div>
          <div>
            <label className="label">Type</label>
            <select name="type" className="input" defaultValue="RECOMMENDATION">
              {TASK_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Owner</label>
            <select name="ownerType" className="input" defaultValue="CLIENT">
              {OWNERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select name="priority" className="input" defaultValue="MEDIUM">
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Due date</label>
            <input className="input" name="dueDate" type="date" />
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary">Add task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
