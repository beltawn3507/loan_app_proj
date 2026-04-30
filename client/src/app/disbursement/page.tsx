"use client";

import { useEffect, useState } from "react";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import { LoanStatusBadge } from "@/components/status-badge";
import {
  disburseLoan,
  getApiErrorMessage,
  getDisbursementLoans,
  getId,
} from "@/lib/api";
import type { Loan } from "@/types";

const disbursementNav = [{ href: "/disbursement", label: "Sanctioned Loans" }];

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeLoanId, setActiveLoanId] = useState("");

  async function loadLoans() {
    const list = await getDisbursementLoans();
    setLoans(list);
  }

  useEffect(() => {
    async function run() {
      try {
        await loadLoans();
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, []);

  async function handleDisburse(loanId: string) {
    setActiveLoanId(loanId);
    setError("");
    setMessage("");

    try {
      const response = await disburseLoan(loanId);
      setMessage(response.message);
      await loadLoans();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setActiveLoanId("");
    }
  }

  return (
    <PageGuard allowedRoles={["DISBURSEMENT", "ADMIN"]}>
      <AppShell title="Disbursement" navItems={disbursementNav}>
        {message ? <AlertBanner kind="success" message={message} /> : null}
        {error ? <AlertBanner message={error} /> : null}

        <SectionCard title="Sanctioned loans">
          {loading ? <LoadingState message="Loading sanctioned loans..." /> : null}

          {!loading ? (
            loans.length ? (
              <div className="space-y-3">
                {loans.map((loan) => (
                  <div
                    key={getId(loan)}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          Borrower ID: {loan.borrowerId}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Rs. {loan.amount.toLocaleString()} | Outstanding Rs.{" "}
                          {loan.repayment.outstanding.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <LoanStatusBadge status={loan.status} />
                        <button
                          type="button"
                          disabled={activeLoanId === getId(loan)}
                          onClick={() => void handleDisburse(getId(loan))}
                          className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          {activeLoanId === getId(loan) ? "Processing..." : "Mark disbursed"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No sanctioned loans"
              />
            )
          ) : null}
        </SectionCard>
      </AppShell>
    </PageGuard>
  );
}
