"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { LoadingState } from "@/components/loading-state";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import { BreStatusBadge, LoanStatusBadge } from "@/components/status-badge";
import {
  getApiErrorMessage,
  getSanctionLoan,
  updateSanctionDecision,
} from "@/lib/api";
import type { BorrowerProfile, Loan } from "@/types";

const sanctionNav = [{ href: "/sanction", label: "Applied Loans" }];

export default function SanctionDetailPage() {
  const params = useParams<{ loanId: string }>();
  const loanId = params.loanId;

  const [loan, setLoan] = useState<Loan | null>(null);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function run() {
      try {
        const response = await getSanctionLoan(loanId);
        setLoan(response.loan);
        setProfile(response.borrowerProfile);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    if (loanId) {
      void run();
    }
  }, [loanId]);

  async function handleAction(event: FormEvent<HTMLFormElement>, action: "APPROVE" | "REJECT") {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await updateSanctionDecision(
        loanId,
        action,
        action === "REJECT" ? reason : undefined,
      );
      setLoan(response.loan);
      setMessage(response.message);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageGuard allowedRoles={["SANCTION", "ADMIN"]}>
      <AppShell title="Sanction Decision" navItems={sanctionNav}>
        {loading ? <LoadingState message="Loading loan details..." /> : null}
        {message ? <AlertBanner kind="success" message={message} /> : null}
        {error ? <AlertBanner message={error} /> : null}

        {loan ? (
          <>
            <SectionCard title="Loan details">
              <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                  <div className="mt-2">
                    <LoanStatusBadge status={loan.status} />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Borrower ID</p>
                  <p className="mt-1 font-medium text-slate-900">{loan.borrowerId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Amount</p>
                  <p className="mt-1 font-medium text-slate-900">Rs. {loan.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Tenure</p>
                  <p className="mt-1 font-medium text-slate-900">{loan.tenureDays} days</p>
                </div>
              </div>
            </SectionCard>

            {profile ? (
              <SectionCard title="Borrower profile">
                <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Full name</p>
                    <p className="mt-1 font-medium text-slate-900">{profile.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">BRE status</p>
                    <div className="mt-2">
                      <BreStatusBadge status={profile.breStatus} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Eligibility</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {profile.isEligible ? "Eligible" : "Not eligible"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Salary slip</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {profile.salarySlipUrl ? "Uploaded" : "Missing"}
                    </p>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard title="Decision">
              <form className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Rejection reason
                  </label>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                    placeholder="Optional for approve. Recommended for reject."
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(event) =>
                      void handleAction(
                        event as unknown as FormEvent<HTMLFormElement>,
                        "APPROVE",
                      )
                    }
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {submitting ? "Submitting..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(event) =>
                      void handleAction(
                        event as unknown as FormEvent<HTMLFormElement>,
                        "REJECT",
                      )
                    }
                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    {submitting ? "Submitting..." : "Reject"}
                  </button>
                </div>
              </form>
            </SectionCard>
          </>
        ) : null}
      </AppShell>
    </PageGuard>
  );
}
