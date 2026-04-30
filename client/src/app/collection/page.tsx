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
import { getApiErrorMessage, getCollectionLoans, getId } from "@/lib/api";
import type { Loan } from "@/types";

const collectionNav = [{ href: "/collection", label: "Disbursed Loans" }];

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLoans() {
      try {
        setLoans(await getCollectionLoans());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    void loadLoans();
  }, []);

  return (
    <PageGuard allowedRoles={["COLLECTION", "ADMIN"]}>
      <AppShell title="Collection Queue" navItems={collectionNav}>
        <SectionCard title="Disbursed loans">
          {loading ? <LoadingState message="Loading collection queue..." /> : null}
          {error ? <AlertBanner message={error} /> : null}

          {!loading ? (
            loans.length ? (
              <div className="space-y-3">
                {loans.map((loan) => (
                  <Link
                    key={getId(loan)}
                    href={`/collection/${getId(loan)}`}
                    className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-950 hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          Borrower ID: {loan.borrowerId}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Outstanding Rs. {loan.repayment.outstanding.toLocaleString()} | Paid Rs.{" "}
                          {loan.repayment.totalPaid.toLocaleString()}
                        </p>
                      </div>
                      <LoanStatusBadge status={loan.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No disbursed loans"
              />
            )
          ) : null}
        </SectionCard>
      </AppShell>
    </PageGuard>
  );
}
