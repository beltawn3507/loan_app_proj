"use client";

import { FormEvent, useEffect, useState } from "react";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { LoadingState } from "@/components/loading-state";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import {
  getApiErrorMessage,
  getBorrowerProfile,
  saveBorrowerProfile,
} from "@/lib/api";
import type {
  BorrowerProfile,
  BorrowerProfilePayload,
  EmploymentType,
} from "@/types";

const borrowerNav = [
  { href: "/borrower", label: "Dashboard" },
  { href: "/borrower/profile", label: "Profile" },
  { href: "/borrower/upload", label: "Upload Slip" },
  { href: "/borrower/apply", label: "Apply Loan" },
  { href: "/borrower/loan", label: "Loan Status" },
];

const initialForm: BorrowerProfilePayload = {
  fullName: "",
  pan: "",
  dob: "",
  monthlySalary: 25000,
  employmentType: "SALARIED",
};

export default function BorrowerProfilePage() {
  const [form, setForm] = useState(initialForm);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const existingProfile = await getBorrowerProfile();

        if (!existingProfile) {
          setProfile(null);
          return;
        }

        setProfile(existingProfile);
        setForm({
          fullName: existingProfile.fullName,
          pan: existingProfile.pan,
          dob: existingProfile.dob.slice(0, 10),
          monthlySalary: existingProfile.monthlySalary,
          employmentType: existingProfile.employmentType,
        });
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await saveBorrowerProfile(form);
      setProfile(response.profile);
      setMessage("Profile saved successfully.");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageGuard allowedRoles={["BORROWER"]}>
      <AppShell title="Borrower Profile" navItems={borrowerNav}>
        {loading ? <LoadingState message="Loading borrower profile..." /> : null}

        {error ? <AlertBanner message={error} /> : null}
        {message ? <AlertBanner kind="success" message={message} /> : null}

        {profile ? (
          <SectionCard title="Current profile">
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
                <p className="text-xs uppercase tracking-wide text-slate-500">Salary slip</p>
                <p className="mt-1 font-medium text-slate-900">
                  {profile.salarySlipUrl ? "Uploaded" : "Pending"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Employment type</p>
                <p className="mt-1 font-medium text-slate-900">{profile.employmentType}</p>
              </div>
            </div>
          </SectionCard>
        ) : !loading ? (
          <SectionCard title="Create profile">
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">PAN</label>
                <input
                  value={form.pan}
                  onChange={(event) =>
                    setForm({ ...form, pan: event.target.value.toUpperCase() })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date of birth
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(event) => setForm({ ...form, dob: event.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Monthly salary
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.monthlySalary}
                  onChange={(event) =>
                    setForm({ ...form, monthlySalary: Number(event.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Employment type
                </label>
                <select
                  value={form.employmentType}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      employmentType: event.target.value as EmploymentType,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                >
                  <option value="SALARIED">SALARIED</option>
                  <option value="SELF_EMPLOYED">SELF_EMPLOYED</option>
                  <option value="UNEMPLOYED">UNEMPLOYED</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {submitting ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </SectionCard>
        ) : null}
      </AppShell>
    </PageGuard>
  );
}
