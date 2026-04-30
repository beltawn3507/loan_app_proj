"use client";

import { FormEvent, useState } from "react";

import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { PageGuard } from "@/components/page-guard";
import { SectionCard } from "@/components/section-card";
import { getApiErrorMessage, uploadSalarySlip } from "@/lib/api";

const borrowerNav = [
  { href: "/borrower", label: "Dashboard" },
  { href: "/borrower/profile", label: "Profile" },
  { href: "/borrower/upload", label: "Upload Slip" },
  { href: "/borrower/apply", label: "Apply Loan" },
  { href: "/borrower/loan", label: "Loan Status" },
];

export default function BorrowerUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await uploadSalarySlip(file);
      setMessage(`Upload complete. File URL: ${response.fileUrl}`);
      setFile(null);
      const input = document.getElementById("salary-slip") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageGuard allowedRoles={["BORROWER"]}>
      <AppShell title="Upload Salary Slip" navItems={borrowerNav}>
        <SectionCard title="Upload document">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              id="salary-slip"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-white"
            />

            {message ? <AlertBanner kind="success" message={message} /> : null}
            {error ? <AlertBanner message={error} /> : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Uploading..." : "Upload salary slip"}
            </button>
          </form>
        </SectionCard>
      </AppShell>
    </PageGuard>
  );
}
