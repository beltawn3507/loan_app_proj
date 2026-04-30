"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import { LoanStatusBadge } from "@/components/status-badge";
import {
  getApiErrorMessage,
  getBorrowerProfile,
  getLatestBorrowerLoan,
} from "@/lib/api";
import type { BorrowerProfile, Loan } from "@/types";

const borrowerNav = [
  { href: "/borrower", label: "Dashboard" },
  { href: "/borrower/profile", label: "Profile" },
  { href: "/borrower/upload", label: "Upload Slip" },
  { href: "/borrower/apply", label: "Apply Loan" },
  { href: "/borrower/loan", label: "Loan Status" },
];

export default function BorrowerDashboardPage() {
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      const [profileResult, loanResult] = await Promise.allSettled([
        getBorrowerProfile(),
        getLatestBorrowerLoan(),
      ]);

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
        setProfileMissing(!profileResult.value);
      } else {
        setProfile(null);
        setProfileMissing(false);
        setError(getApiErrorMessage(profileResult.reason));
      }

      if (loanResult.status === "fulfilled") {
        setLoan(loanResult.value);
      } else {
        setLoan(null);
        setError((currentError) =>
          currentError || getApiErrorMessage(loanResult.reason),
        );
      }

      setLoading(false);
    }

    void loadDashboard();
  }, []);

  return (
    <PageGuard allowedRoles={["BORROWER"]}>
      <AppShell
        title="Borrower Dashboard"
        navItems={borrowerNav}
      >
        {loading ? <LoadingState message="Loading borrower dashboard..." /> : null}
        {error ? <AlertBanner message={error} /> : null}

        {!loading ? (
          <>
            {profileMissing ? (
              <SectionCard title="Complete your profile">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    Your borrower profile is still missing.
                  </p>
                  <Link
                    href="/borrower/profile"
                    className="inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Complete profile
                  </Link>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard title="Your Profile">
              {profile ? (
                <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Full name</p>
                    <p className="mt-1 font-medium text-slate-900">{profile.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">PAN</p>
                    <p className="mt-1 font-medium text-slate-900">{profile.pan}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Date of birth</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {new Date(profile.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Monthly salary</p>
                    <p className="mt-1 font-medium text-slate-900">
                      Rs. {profile.monthlySalary.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Employment type</p>
                    <p className="mt-1 font-medium text-slate-900">{profile.employmentType}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Salary slip</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {profile.salarySlipUrl ? "Uploaded" : "Pending upload"}
                    </p>
                  </div>
                </div>
              ) : profileMissing ? (
                <EmptyState
                  title="Profile missing"
                  description="Complete your borrower profile to view your details here."
                />
              ) : null}
            </SectionCard>

            <SectionCard title="Loan Progress">
              {loan ? (
                <div className="space-y-4 text-sm text-slate-700">
                  <div className="flex flex-wrap items-center gap-3">
                    <LoanStatusBadge status={loan.status} />
                    <span>
                      Principal: <strong className="text-slate-900">Rs. {loan.amount.toLocaleString()}</strong>
                    </span>
                    <span>
                      Outstanding:{" "}
                      <strong className="text-slate-900">
                        Rs. {loan.repayment.outstanding.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                  <p>
                    Total repayment:{" "}
                    <strong className="text-slate-900">
                      Rs. {loan.totalRepayment.toLocaleString()}
                    </strong>
                  </p>
                  {loan.rejectionReason ? (
                    <AlertBanner kind="info" message={`Rejection reason: ${loan.rejectionReason}`} />
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  title="No loan found"
                  description={
                    profileMissing
                      ? "Complete your profile first, then upload your salary slip before applying."
                      : "Upload your salary slip and apply for a loan when you are ready."
                  }
                />
              )}
            </SectionCard>
          </>
        ) : null}
      </AppShell>
    </PageGuard>
  );
}
