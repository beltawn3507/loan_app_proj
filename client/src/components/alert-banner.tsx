export function AlertBanner({
  kind = "error",
  message,
}: {
  kind?: "error" | "success" | "info";
  message: string;
}) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  } as const;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[kind]}`}>
      {message}
    </div>
  );
}
