"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { LoadingState } from "@/components/loading-state";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import { BreStatusBadge } from "@/components/status-badge";
import { getApiErrorMessage, getSalesLead } from "@/lib/api";
import type { BorrowerProfile } from "@/types";

const salesNav = [{ href: "/sales", label: "Leads" }];

export default function SalesLeadDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const [lead, setLead] = useState<BorrowerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLead() {
      try {
        setLead(await getSalesLead(userId));
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      void loadLead();
    }
  }, [userId]);

  return (
    <PageGuard allowedRoles={["SALES", "ADMIN"]}>
      <AppShell title="Lead Detail" navItems={salesNav}>
        {loading ? <LoadingState message="Loading lead details..." /> : null}
        {error ? <AlertBanner message={error} /> : null}

        {lead ? (
          <SectionCard title={lead.fullName}>
            <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">PAN</p>
                <p className="mt-1 font-medium text-slate-900">{lead.pan}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Monthly salary</p>
                <p className="mt-1 font-medium text-slate-900">
                  Rs. {lead.monthlySalary.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Employment type</p>
                <p className="mt-1 font-medium text-slate-900">{lead.employmentType}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Eligibility</p>
                <p className="mt-1 font-medium text-slate-900">
                  {lead.isEligible ? "Eligible" : "Not eligible"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">BRE status</p>
                <div className="mt-2">
                  <BreStatusBadge status={lead.breStatus} />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Salary slip</p>
                <p className="mt-1 font-medium text-slate-900">
                  {lead.salarySlipUrl ? "Uploaded" : "Missing"}
                </p>
              </div>
            </div>
          </SectionCard>
        ) : null}
      </AppShell>
    </PageGuard>
  );
}
