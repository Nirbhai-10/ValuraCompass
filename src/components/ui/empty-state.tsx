import * as React from "react";
import { Card } from "./card";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <p className="text-base font-medium text-ink-900">{title}</p>
      {description ? (
        <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto">{description}</p>
      ) : null}
      {action ? <div className="mt-5 inline-flex">{action}</div> : null}
    </Card>
  );
}
