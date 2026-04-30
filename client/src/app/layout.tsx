import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Loan Management System",
  description: "Frontend demo for borrower, sales, sanction, disbursement, collection, and admin flows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 text-slate-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
