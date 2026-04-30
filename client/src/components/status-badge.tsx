import type { BreStatus, LoanStatus } from "@/types";

const loanColors: Record<LoanStatus, string> = {
  APPLIED: "bg-amber-100 text-amber-800",
  SANCTIONED: "bg-indigo-100 text-indigo-800",
  REJECTED: "bg-red-100 text-red-700",
  DISBURSED: "bg-sky-100 text-sky-800",
  CLOSED: "bg-emerald-100 text-emerald-800",
};

const breColors: Record<BreStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  PASSED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-700",
};

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${loanColors[status]}`}>
      {status}
    </span>
  );
}

export function BreStatusBadge({ status }: { status: BreStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${breColors[status]}`}>
      {status}
    </span>
  );
}
