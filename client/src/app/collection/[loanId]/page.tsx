"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import { LoanStatusBadge } from "@/components/status-badge";
import { getApiErrorMessage, getCollectionLoan, recordPayment } from "@/lib/api";
import type { Loan, Payment } from "@/types";

const collectionNav = [{ href: "/collection", label: "Disbursed Loans" }];

export default function CollectionDetailPage() {
  const params = useParams<{ loanId: string }>();
  const loanId = params.loanId;

  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [utr, setUtr] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadLoan() {
    const response = await getCollectionLoan(loanId);
    setLoan(response.loan);
    setPayments(response.payments);
  }

  useEffect(() => {
    async function run() {
      try {
        const response = await getCollectionLoan(loanId);
        setLoan(response.loan);
        setPayments(response.payments);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await recordPayment(loanId, { utr, amount });
      setMessage(response.message);
      setUtr("");
      setAmount(0);
      await loadLoan();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageGuard allowedRoles={["COLLECTION", "ADMIN"]}>
      <AppShell title="Collection Detail" navItems={collectionNav}>
        {loading ? <LoadingState message="Loading collection detail..." /> : null}
        {message ? <AlertBanner kind="success" message={message} /> : null}
        {error ? <AlertBanner message={error} /> : null}

        {loan ? (
          <>
            <SectionCard title="Loan summary">
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
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total paid</p>
                  <p className="mt-1 font-medium text-slate-900">
                    Rs. {loan.repayment.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p>
                  <p className="mt-1 font-medium text-slate-900">
                    Rs. {loan.repayment.outstanding.toLocaleString()}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Add payment">
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">UTR</label>
                  <input
                    value={utr}
                    onChange={(event) => setUtr(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={amount || ""}
                    onChange={(event) => setAmount(Number(event.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submitting ? "Saving..." : "Record payment"}
                  </button>
                </div>
              </form>
            </SectionCard>

            <SectionCard title="Payment history">
              {payments.length ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id ?? payment._id ?? payment.utr}
                      className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-medium text-slate-900">UTR: {payment.utr}</span>
                        <span>Rs. {payment.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No payments yet"
                />
              )}
            </SectionCard>
          </>
        ) : null}
      </AppShell>
    </PageGuard>
  );
}
