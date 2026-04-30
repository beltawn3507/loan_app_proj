"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  href: string;
  label: string;
}

export function AppShell({
  title,
  subtitle,
  navItems,
  children,
}: {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Loan Management System
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            ) : null}
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user?.email ?? "Unknown user"}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {user?.role ?? "Guest"}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm lg:w-64 lg:self-start">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 space-y-6">{children}</main>
      </div>
    </div>
  );
}
