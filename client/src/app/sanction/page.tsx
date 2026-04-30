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
import { getApiErrorMessage, getId, getSanctionLoans } from "@/lib/api";
import type { Loan } from "@/types";

const sanctionNav = [{ href: "/sanction", label: "Applied Loans" }];

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLoans() {
      try {
        setLoans(await getSanctionLoans());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    void loadLoans();
  }, []);

  return (
    <PageGuard allowedRoles={["SANCTION", "ADMIN"]}>
      <AppShell title="Sanction Queue" navItems={sanctionNav}>
        <SectionCard title="Applied loans">
          {loading ? <LoadingState message="Loading sanction queue..." /> : null}
          {error ? <AlertBanner message={error} /> : null}

          {!loading ? (
            loans.length ? (
              <div className="space-y-3">
                {loans.map((loan) => (
                  <Link
                    key={getId(loan)}
                    href={`/sanction/${getId(loan)}`}
                    className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-950 hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          Borrower ID: {loan.borrowerId}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Rs. {loan.amount.toLocaleString()} for {loan.tenureDays} days
                        </p>
                      </div>
                      <LoanStatusBadge status={loan.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No applied loans"
              />
            )
          ) : null}
        </SectionCard>
      </AppShell>
    </PageGuard>
  );
}
