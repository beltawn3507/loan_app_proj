"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/sales", label: "Sales" },
  { href: "/sanction", label: "Sanction" },
  { href: "/disbursement", label: "Disbursement" },
  { href: "/collection", label: "Collection" },
];

const adminSections = [
  { href: "/sales", title: "Sales", description: "View borrower leads." },
  { href: "/sanction", title: "Sanction", description: "View applied loans." },
  { href: "/disbursement", title: "Disbursement", description: "View sanctioned loans." },
  { href: "/collection", title: "Collection", description: "View disbursed loans and payments." },
];

export default function AdminPage() {
  return (
    <PageGuard allowedRoles={["ADMIN"]}>
      <AppShell title="Admin Dashboard" navItems={adminNav}>
        <SectionCard title="Admin Access">
          <div className="grid gap-3 sm:grid-cols-2">
            {adminSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-950 hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">{section.title}</p>
                <p className="mt-1 text-sm text-slate-600">{section.description}</p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </AppShell>
    </PageGuard>
  );
}
