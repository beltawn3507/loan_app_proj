"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import { BreStatusBadge } from "@/components/status-badge";
import { getApiErrorMessage, getSalesLeads } from "@/lib/api";
import type { BorrowerProfile } from "@/types";

const salesNav = [{ href: "/sales", label: "Leads" }];

export default function SalesPage() {
  const [leads, setLeads] = useState<BorrowerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeads() {
      try {
        setLeads(await getSalesLeads());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    void loadLeads();
  }, []);

  return (
    <PageGuard allowedRoles={["SALES", "ADMIN"]}>
      <AppShell title="Sales Leads" navItems={salesNav}>
        <SectionCard title="Lead list">
          {loading ? <LoadingState message="Loading sales leads..." /> : null}
          {error ? <AlertBanner message={error} /> : null}

          {!loading ? (
            leads.length ? (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <Link
                    key={lead.userId}
                    href={`/sales/${lead.userId}`}
                    className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-950 hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{lead.fullName}</p>
                        <p className="mt-1 text-sm text-slate-600">PAN: {lead.pan}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <BreStatusBadge status={lead.breStatus} />
                        <span className="text-sm font-medium text-slate-700">
                          {lead.isEligible ? "Eligible" : "Not eligible"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No leads found"
              />
            )
          ) : null}
        </SectionCard>
      </AppShell>
    </PageGuard>
  );
}
