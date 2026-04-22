import Link from "next/link";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-ink-500 mt-2">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary mt-4 inline-flex">{actionLabel}</Link>
      ) : null}
    </div>
  );
}
