"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import { applyForLoan, getApiErrorMessage } from "@/lib/api";

const borrowerNav = [
  { href: "/borrower", label: "Dashboard" },
  { href: "/borrower/profile", label: "Profile" },
  { href: "/borrower/upload", label: "Upload Slip" },
  { href: "/borrower/apply", label: "Apply Loan" },
  { href: "/borrower/loan", label: "Loan Status" },
];

const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 500000;
const MIN_TENURE = 30;
const MAX_TENURE = 365;
const INTEREST_RATE = 12;

export default function BorrowerApplyPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(MIN_AMOUNT);
  const [tenureDays, setTenureDays] = useState(MIN_TENURE);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const interest = Math.round(
    (amount * INTEREST_RATE * tenureDays) / (365 * 100),
  );
  const totalRepayment = Math.round(amount + interest);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await applyForLoan({ amount, tenureDays });
      setMessage(
        `Loan submitted. Total repayment is Rs. ${response.loan.totalRepayment.toLocaleString()}.`,
      );
      router.push("/borrower/loan");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageGuard allowedRoles={["BORROWER"]}>
      <AppShell title="Apply For Loan" navItems={borrowerNav}>
        <SectionCard title="Loan application">
          <form className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]" onSubmit={handleSubmit}>
            <div>
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-slate-700">Loan Amount</label>
                    <span className="text-sm font-semibold text-slate-950">
                      Rs. {amount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    step={5000}
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                    className="w-full accent-slate-950"
                  />
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>Rs. 50,000</span>
                    <span>Rs. 5,00,000</span>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-slate-700">Tenure</label>
                    <span className="text-sm font-semibold text-slate-950">
                      {tenureDays} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min={MIN_TENURE}
                    max={MAX_TENURE}
                    step={1}
                    value={tenureDays}
                    onChange={(event) => setTenureDays(Number(event.target.value))}
                    className="w-full accent-slate-950"
                  />
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>30 days</span>
                    <span>365 days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Live Calculation
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-600">Principal</span>
                  <strong className="text-slate-950">Rs. {amount.toLocaleString()}</strong>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-600">Interest rate</span>
                  <strong className="text-slate-950">{INTEREST_RATE}% p.a.</strong>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-600">Tenure</span>
                  <strong className="text-slate-950">{tenureDays} days</strong>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-600">Simple interest</span>
                  <strong className="text-slate-950">Rs. {interest.toLocaleString()}</strong>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-700">Total repayment</span>
                    <strong className="text-xl text-slate-950">
                      Rs. {totalRepayment.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-2">
              {message ? <AlertBanner kind="success" message={message} /> : null}
              {error ? <AlertBanner message={error} /> : null}
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? "Applying..." : "Apply"}
              </button>
            </div>
          </form>
        </SectionCard>
      </AppShell>
    </PageGuard>
  );
}
