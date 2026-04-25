import * as React from "react";
import { Button } from "./button";

interface EntityRowProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  trailing?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EntityRow({
  primary,
  secondary,
  trailing,
  onEdit,
  onDelete,
}: EntityRowProps) {
  return (
    <li className="px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink-900 truncate">{primary}</div>
        {secondary ? (
          <div className="text-xs text-ink-500 mt-0.5">{secondary}</div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {trailing ? (
          <div className="text-sm font-semibold text-ink-900 tabular-nums whitespace-nowrap">
            {trailing}
          </div>
        ) : null}
        {onEdit ? (
          <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit">
            Edit
          </Button>
        ) : null}
        {onDelete ? (
          <Button size="sm" variant="danger" onClick={onDelete} aria-label="Delete">
            Delete
          </Button>
        ) : null}
      </div>
    </li>
  );
}

export function EntityList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="bg-white border border-line-200 rounded-card divide-y divide-line-100">
      {children}
    </ul>
  );
}
