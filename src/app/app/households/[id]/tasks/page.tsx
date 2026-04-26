"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectTasks } from "@/lib/selectors";
import { addTask, removeTask, updateTask } from "@/lib/mutations";
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

const STATUSES: TaskStatus[] = ["OPEN", "IN_PROGRESS", "DONE", "SNOOZED"];

export default function TasksPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const tasks = selectTasks(db, householdId);
  const dialog = useDialog<Task>();
  const [error, setError] = useState<string | null>(null);

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
      toast.success(`Updated.`);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Action center"
        subtitle="A small, intentional list of things you've decided to do next."
        action={
          <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
            New task
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Pin observations from Insights or add your own here."
          action={
            <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
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
                      <p className="text-xs text-ink-500 mt-1 leading-relaxed">
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
                    <Button size="sm" variant="ghost" onClick={() => { setError(null); dialog.openFor(t); }}>
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
