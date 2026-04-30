export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
      <p className="font-medium text-slate-900">{title}</p>
      {description ? <p className="mt-1">{description}</p> : null}
    </div>
  );
}
