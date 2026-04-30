"use client";

import { FormEvent, useEffect, useState } from "react";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import { LoanStatusBadge } from "@/components/status-badge";
import {
  getApiErrorMessage,
  getBorrowerLoans,
  getId,
  recordBorrowerPayment,
} from "@/lib/api";
import type { Loan, LoanStatus } from "@/types";

const borrowerNav = [
  { href: "/borrower", label: "Dashboard" },
  { href: "/borrower/profile", label: "Profile" },
  { href: "/borrower/upload", label: "Upload Slip" },
  { href: "/borrower/apply", label: "Apply Loan" },
  { href: "/borrower/loan", label: "Loan Status" },
];

const lifecycle: LoanStatus[] = [
  "APPLIED",
  "SANCTIONED",
  "DISBURSED",
  "CLOSED",
];

export default function BorrowerLoanPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [utr, setUtr] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState<Record<string, string>>({});
  const [activeLoanId, setActiveLoanId] = useState("");
  const latestLoan = loans[0] ?? null;
  const activeLoans = loans.filter(
    (loan) => loan.status === "DISBURSED" && loan.repayment.outstanding > 0,
  );
  const previousLoans = loans.filter(
    (loan) => loan.status !== "DISBURSED" || loan.repayment.outstanding <= 0,
  );

  async function loadLoans() {
    const list = await getBorrowerLoans();
    setLoans(list);
  }

  useEffect(() => {
    async function loadLoan() {
      try {
        await loadLoans();
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    void loadLoan();
  }, []);

  async function handlePayment(
    event: FormEvent<HTMLFormElement>,
    loanId: string,
  ) {
    event.preventDefault();
    setActiveLoanId(loanId);
    setError("");
    setMessage("");

    try {
      const response = await recordBorrowerPayment(loanId, {
        utr: utr[loanId] ?? "",
        amount: Number(amount[loanId] ?? 0),
      });
      setMessage(response.message);
      setUtr((current) => ({ ...current, [loanId]: "" }));
      setAmount((current) => ({ ...current, [loanId]: "" }));
      await loadLoans();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setActiveLoanId("");
    }
  }

  return (
    <PageGuard allowedRoles={["BORROWER"]}>
      <AppShell title="Loan Status" navItems={borrowerNav}>
        {loading ? <LoadingState message="Loading loan status..." /> : null}
        {message ? <AlertBanner kind="success" message={message} /> : null}
        {error ? <AlertBanner message={error} /> : null}

        {!loading ? (
          loans.length ? (
            <>
              <SectionCard title="Active loans">
                {activeLoans.length ? (
                  <div className="space-y-4">
                    {activeLoans.map((loan) => (
                      <div
                        key={getId(loan)}
                        className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <LoanStatusBadge status={loan.status} />
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            Loan ID: {getId(loan)}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <p>
                            Amount:{" "}
                            <strong className="text-slate-900">
                              Rs. {loan.amount.toLocaleString()}
                            </strong>
                          </p>
                          <p>
                            Total repayment:{" "}
                            <strong className="text-slate-900">
                              Rs. {loan.totalRepayment.toLocaleString()}
                            </strong>
                          </p>
                          <p>
                            Total paid:{" "}
                            <strong className="text-slate-900">
                              Rs. {loan.repayment.totalPaid.toLocaleString()}
                            </strong>
                          </p>
                          <p>
                            Outstanding:{" "}
                            <strong className="text-slate-900">
                              Rs. {loan.repayment.outstanding.toLocaleString()}
                            </strong>
                          </p>
                        </div>
                        <form
                          className="mt-4 grid gap-4 sm:grid-cols-2"
                          onSubmit={(event) => void handlePayment(event, getId(loan))}
                        >
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                              UTR
                            </label>
                            <input
                              value={utr[getId(loan)] ?? ""}
                              onChange={(event) =>
                                setUtr((current) => ({
                                  ...current,
                                  [getId(loan)]: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                              Amount
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={loan.repayment.outstanding}
                              value={amount[getId(loan)] ?? ""}
                              onChange={(event) =>
                                setAmount((current) => ({
                                  ...current,
                                  [getId(loan)]: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <button
                              type="submit"
                              disabled={activeLoanId === getId(loan)}
                              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                              {activeLoanId === getId(loan) ? "Processing..." : "Pay loan"}
                            </button>
                          </div>
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No active loans" />
                )}
              </SectionCard>

              <SectionCard title="Loan history">
                {previousLoans.length ? (
                  <div className="space-y-4">
                    {previousLoans.map((loan) => (
                      <div
                        key={getId(loan)}
                        className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <LoanStatusBadge status={loan.status} />
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            Loan ID: {getId(loan)}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <p>
                            Amount:{" "}
                            <strong className="text-slate-900">
                              Rs. {loan.amount.toLocaleString()}
                            </strong>
                          </p>
                          <p>
                            Tenure:{" "}
                            <strong className="text-slate-900">{loan.tenureDays} days</strong>
                          </p>
                          <p>
                            Interest:{" "}
                            <strong className="text-slate-900">
                              Rs. {loan.interest.toLocaleString()}
                            </strong>
                          </p>
                          <p>
                            Total repayment:{" "}
                            <strong className="text-slate-900">
                              Rs. {loan.totalRepayment.toLocaleString()}
                            </strong>
                          </p>
                          <p>
                            Total paid:{" "}
                            <strong className="text-slate-900">
                              Rs. {loan.repayment.totalPaid.toLocaleString()}
                            </strong>
                          </p>
                          <p>
                            Outstanding:{" "}
                            <strong className="text-slate-900">
                              Rs. {loan.repayment.outstanding.toLocaleString()}
                            </strong>
                          </p>
                        </div>
                        {loan.rejectionReason ? (
                          <div className="mt-4">
                            <AlertBanner
                              kind="info"
                              message={`Rejection reason: ${loan.rejectionReason}`}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No previous loans" />
                )}
              </SectionCard>

              <SectionCard title="Lifecycle">
                <div className="grid gap-3 sm:grid-cols-4">
                  {lifecycle.map((step) => {
                    const active =
                      latestLoan?.status === step ||
                      lifecycle.indexOf(step) <
                        lifecycle.indexOf(latestLoan?.status as LoanStatus);

                    return (
                      <div
                        key={step}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                          active
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-300 bg-white text-slate-600"
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </>
          ) : (
            <EmptyState title="No loans found" />
          )
        ) : null}
      </AppShell>
    </PageGuard>
  );
}
