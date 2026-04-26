"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectHousehold, selectTasks } from "@/lib/selectors";
import { addTask, removeTask, updateTask } from "@/lib/mutations";
import {
  Action,
  ActionSeverity,
  CATEGORY_LABEL,
  generateActions,
} from "@/lib/actions";
import { formatMoneyCompact } from "@/lib/format";
import { TASK_STATUS_LABELS, Task, TaskStatus } from "@/lib/types";
import {
  Button,
  Card,
  Dialog,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
  useDialog,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const STATUSES: TaskStatus[] = ["OPEN", "IN_PROGRESS", "DONE", "SNOOZED"];

const SEVERITY_CLASSES: Record<ActionSeverity, string> = {
  CRITICAL: "bg-red-50 text-severity-critical border-red-100",
  HIGH: "bg-orange-50 text-severity-high border-orange-100",
  MEDIUM: "bg-amber-50 text-severity-medium border-amber-100",
  LOW: "bg-cyan-50 text-severity-low border-cyan-100",
  INFO: "bg-line-100 text-ink-700 border-line-200",
};

export default function TasksPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);
  const tasks = selectTasks(db, householdId);
  const dialog = useDialog<Task>();
  const [error, setError] = useState<string | null>(null);

  const fmt = (n: number) =>
    household
      ? formatMoneyCompact(n, household.currency, household.region)
      : `${n.toLocaleString("en-IN")}`;

  const actions = useMemo(
    () => generateActions(db, householdId),
    [db, householdId],
  );

  const pinnedSourceIds = useMemo(() => {
    const ids = new Set<string>();
    for (const t of tasks) {
      if (t.insightRuleId) ids.add(t.insightRuleId);
    }
    return ids;
  }, [tasks]);

  const sorted = [...tasks].sort((a, b) => {
    const order: Record<TaskStatus, number> = {
      OPEN: 0,
      IN_PROGRESS: 1,
      SNOOZED: 2,
      DONE: 3,
    };
    return order[a.status] - order[b.status] || a.createdAt.localeCompare(b.createdAt);
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const body = String(fd.get("body") ?? "").trim();
    const status = String(fd.get("status") ?? "OPEN") as TaskStatus;
    const dueDate = String(fd.get("dueDate") ?? "").trim() || undefined;
    if (!title) {
      setError("Give the task a title.");
      return;
    }
    if (dialog.item) {
      update(updateTask(dialog.item.id, { title, body: body || undefined, status, dueDate }));
      toast.success("Updated.");
    } else {
      update(
        addTask(householdId, {
          title,
          body: body || undefined,
          status,
          source: "USER",
          dueDate,
        }),
      );
      toast.success("Task added.");
    }
    dialog.close();
  }

  function setStatus(t: Task, status: TaskStatus) {
    update(updateTask(t.id, { status }));
  }

  function remove(t: Task) {
    if (!window.confirm(`Remove "${t.title}"?`)) return;
    update(removeTask(t.id));
    toast.success("Removed.");
  }

  function pinAction(a: Action) {
    update(
      addTask(householdId, {
        title: a.title,
        body: [
          a.body,
          a.expectedSaving ? `Estimated tax saving: ${fmt(a.expectedSaving)}.` : null,
          a.whereToAct ? `Where: ${a.whereToAct}` : null,
        ]
          .filter(Boolean)
          .join("\n\n"),
        status: "OPEN",
        source: "INSIGHT",
        insightRuleId: a.id,
        dueDate: a.deadline,
      }),
    );
    toast.success("Pinned to your action list.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Action center"
        subtitle="Specific next-best-actions generated from your data, plus your own running list."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setError(null);
              dialog.openFor(null);
            }}
          >
            New task
          </Button>
        }
      />

      {actions.length > 0 ? (
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Suggested next actions</h3>
            <p className="text-xs text-ink-500 mt-0.5">
              Computed from insights, your tax inputs, score gaps, and data hygiene.
              Pin any of them to your action list.
            </p>
          </div>
          <ul className="grid gap-3">
            {actions.map((a) => {
              const pinned = pinnedSourceIds.has(a.id);
              return (
                <li
                  key={a.id}
                  className="border border-line-200 rounded-button px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 h-5 rounded-full text-[10px] font-semibold uppercase tracking-wide border",
                            SEVERITY_CLASSES[a.severity],
                          )}
                        >
                          {a.severity}
                        </span>
                        <span className="text-[11px] text-ink-500">
                          {CATEGORY_LABEL[a.category]} · {ownerLabel(a.owner)}
                        </span>
                        {a.deadline ? (
                          <span className="text-[11px] text-ink-500">
                            · by {a.deadline}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm font-semibold mt-1.5">{a.title}</p>
                      <p className="text-sm text-ink-700 mt-1 leading-relaxed">
                        {a.body}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        {a.whereToAct ? (
                          <Link href={a.whereToAct} className="link">
                            Open the relevant page →
                          </Link>
                        ) : null}
                        {a.expectedSaving ? (
                          <span className="text-ink-500">
                            Approx tax saving:{" "}
                            <span className="font-semibold text-brand-deep tabular-nums">
                              {fmt(a.expectedSaving)}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {pinned ? (
                        <span className="inline-flex items-center px-2 h-7 rounded-button text-[11px] text-ink-500 border border-line-200">
                          Pinned
                        </span>
                      ) : (
                        <Button size="sm" onClick={() => pinAction(a)}>
                          Pin
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold mb-3">Your action list</h3>
        {sorted.length === 0 ? (
          <EmptyState
            title="No tasks pinned yet"
            description="Pin any of the suggested actions above, or add your own."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setError(null);
                  dialog.openFor(null);
                }}
              >
                Add the first task
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3">
            {sorted.map((t) => (
              <li key={t.id}>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{t.title}</p>
                      {t.body ? (
                        <p className="text-xs text-ink-500 mt-1 leading-relaxed whitespace-pre-line">
                          {t.body}
                        </p>
                      ) : null}
                      <p className="text-[11px] text-ink-500 mt-2">
                        {TASK_STATUS_LABELS[t.status]}
                        {t.dueDate ? ` · due ${t.dueDate}` : ""}
                        {t.source === "INSIGHT" ? " · from insights" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        className="h-8 text-xs w-32"
                        value={t.status}
                        onChange={(e) => setStatus(t, e.target.value as TaskStatus)}
                        aria-label="Status"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {TASK_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setError(null);
                          dialog.openFor(t);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(t)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit task" : "New task"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error ? (
            <div className="text-xs text-severity-critical bg-red-50 px-3 py-2 rounded-button">
              {error}
            </div>
          ) : null}
          <Field label="Title" htmlFor="title">
            <Input
              id="title"
              name="title"
              required
              autoFocus
              defaultValue={dialog.item?.title ?? ""}
            />
          </Field>
          <Field label="Notes" htmlFor="body">
            <Textarea id="body" name="body" defaultValue={dialog.item?.body ?? ""} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" defaultValue={dialog.item?.status ?? "OPEN"}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Due date" htmlFor="dueDate">
              <Input id="dueDate" name="dueDate" type="date" defaultValue={dialog.item?.dueDate ?? ""} />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={dialog.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {dialog.item ? "Save changes" : "Add task"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function ownerLabel(owner: Action["owner"]): string {
  switch (owner) {
    case "Primary":
      return "Primary";
    case "Spouse":
      return "Spouse";
    case "Advisor":
      return "Advisor";
    case "Either":
      return "Either spouse";
  }
}
