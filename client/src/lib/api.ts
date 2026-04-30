import axios, { AxiosError } from "axios";

import type {
  AuthUser,
  BorrowerProfile,
  BorrowerProfilePayload,
  BreResult,
  Loan,
  LoanApplicationPayload,
  LoanWithBorrowerProfile,
  Payment,
  PaymentPayload,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 5000,
});

interface ErrorPayload {
  error?: string;
  errors?: Array<{ message?: string }>;
}

const isNotFoundError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

const extractErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    const data = error.response?.data;

    if (data?.error) {
      return data.error;
    }

    if (data?.errors?.length) {
      return data.errors
        .map((entry) => entry.message)
        .filter(Boolean)
        .join(", ");
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while contacting the API.";
};

export function getApiErrorMessage(error: unknown) {
  return extractErrorMessage(error);
}

export function getId(record: { id?: string; _id?: string }) {
  return record.id ?? record._id ?? "";
}

export async function getCurrentUser() {
  const response = await api.get<{ currentUser: AuthUser | null }>(
    "/api/users/currentuser",
  );

  return response.data.currentUser;
}

export async function login(email: string, password: string) {
  await api.post("/api/users/signin", { email, password });
  return getCurrentUser();
}

export async function signup(
  email: string,
  password: string
) {
  const res = await fetch(`${API_URL}/api/users/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    signal: AbortSignal.timeout(5000),
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Signup failed");
  }

  return data;
}

export async function logout() {
  await api.post("/api/users/signout");
}

export async function saveBorrowerProfile(payload: BorrowerProfilePayload) {
  const response = await api.post<{ profile: BorrowerProfile; bre: BreResult }>(
    "/api/borrower/profile",
    payload,
  );

  return response.data;
}

export async function getBorrowerProfile() {
  try {
    const response = await api.get<BorrowerProfile>("/api/borrower/profile");
    return response.data;
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }

    throw error;
  }
}

export async function uploadSalarySlip(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<{ message: string; fileUrl: string }>(
    "/api/borrower/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function applyForLoan(payload: LoanApplicationPayload) {
  const response = await api.post<{ message: string; loan: Loan }>(
    "/api/loans/apply",
    payload,
  );

  return response.data;
}

export async function getBorrowerLoans() {
  const response = await api.get<Loan[]>("/api/loans/me");
  return response.data;
}

export async function getLatestBorrowerLoan() {
  const loans = await getBorrowerLoans();
  return loans[0] ?? null;
}

export async function getSalesLeads() {
  return api.get<BorrowerProfile[]>("/api/sales/leads").then((res) => res.data);
}

export async function getSalesLead(userId: string) {
  const leads = await getSalesLeads();
  const matchedLead = leads.find((lead) => lead.userId === userId);

  if (!matchedLead) {
    throw new Error("Lead not found");
  }

  return matchedLead;
}

export async function getSanctionLoans() {
  return api
    .get<Loan[]>("/api/sanction/loans")
    .then((response) => response.data);
}

export async function getSanctionLoan(loanId: string) {
  return api
    .get<LoanWithBorrowerProfile>(`/api/sanction/loans/${loanId}`)
    .then((response) => response.data);
}

export async function updateSanctionDecision(
  loanId: string,
  action: "APPROVE" | "REJECT",
  reason?: string,
) {
  return api
    .patch<{ message: string; loan: Loan }>(`/api/sanction/loans/${loanId}`, {
      action,
      reason,
    })
    .then((response) => response.data);
}

export async function getDisbursementLoans() {
  return api
    .get<Loan[]>("/api/disbursement/loans")
    .then((response) => response.data);
}

export async function disburseLoan(loanId: string) {
  return api
    .patch<{ message: string; loan: Loan }>(`/api/disbursement/loans/${loanId}`)
    .then((response) => response.data);
}

export async function getCollectionLoans() {
  return api
    .get<Loan[]>("/api/collection/loans")
    .then((response) => response.data);
}

export async function getCollectionLoan(loanId: string) {
  return api
    .get<{ loan: Loan; payments: Payment[] }>(`/api/collection/loans/${loanId}`)
    .then((response) => response.data);
}

export async function recordPayment(loanId: string, payload: PaymentPayload) {
  return api
    .post<{ message: string; loan: Loan; payment: Payment }>(
      `/api/collection/loans/${loanId}/pay`,
      payload,
    )
    .then((response) => response.data);
}

export async function recordBorrowerPayment(
  loanId: string,
  payload: PaymentPayload,
) {
  return api
    .post<{ message: string; loan: Loan; payment: Payment }>(
      `/api/loans/${loanId}/pay`,
      payload,
    )
    .then((response) => response.data);
}

export type ApiRequestError = AxiosError<ErrorPayload>;
