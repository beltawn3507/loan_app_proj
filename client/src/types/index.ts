export type UserRole =
  | "BORROWER"
  | "SALES"
  | "SANCTION"
  | "DISBURSEMENT"
  | "COLLECTION"
  | "ADMIN";

export type EmploymentType = "SALARIED" | "SELF_EMPLOYED" | "UNEMPLOYED";
export type BreStatus = "PENDING" | "PASSED" | "FAILED";
export type LoanStatus =
  | "APPLIED"
  | "SANCTIONED"
  | "REJECTED"
  | "DISBURSED"
  | "CLOSED";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface BreResult {
  isEligible: boolean;
  errors: string[];
}

export interface BorrowerProfile {
  _id?: string;
  id?: string;
  userId: string;
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentType: EmploymentType;
  breStatus: BreStatus;
  isEligible: boolean;
  salarySlipUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RepaymentSummary {
  totalPaid: number;
  outstanding: number;
}

export interface Loan {
  _id?: string;
  id?: string;
  borrowerId: string;
  amount: number;
  tenureDays: number;
  interestRate?: number;
  interest: number;
  totalRepayment: number;
  status: LoanStatus;
  isSanctioned: boolean;
  isDisbursed: boolean;
  rejectionReason?: string;
  repayment: RepaymentSummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id?: string;
  id?: string;
  loanId: string;
  utr: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanWithBorrowerProfile {
  loan: Loan;
  borrowerProfile: BorrowerProfile | null;
}

export interface BorrowerProfilePayload {
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentType: EmploymentType;
}

export interface LoanApplicationPayload {
  amount: number;
  tenureDays: number;
}

export interface PaymentPayload {
  utr: string;
  amount: number;
}

export interface UserSummary {
  _id?: string;
  id?: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}
