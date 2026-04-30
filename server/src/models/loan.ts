import mongoose from "mongoose";

export enum LoanStatus {
  APPLIED = "APPLIED",
  SANCTIONED = "SANCTIONED",
  REJECTED = "REJECTED",
  DISBURSED = "DISBURSED",
  CLOSED = "CLOSED",
}

interface LoanAttrs {
  borrowerId: string;
  amount: number;
  tenureDays: number;
  interest: number;
  totalRepayment: number;
}

interface LoanDoc extends mongoose.Document {
  borrowerId: string;

  amount: number;
  tenureDays: number;
  interestRate: number;

  interest: number;
  totalRepayment: number;

  status: LoanStatus;

  isSanctioned: boolean;
  isDisbursed: boolean;

  rejectionReason?: string;

  repayment: {
    totalPaid: number;
    outstanding: number;
  };
}

interface LoanModel extends mongoose.Model<LoanDoc> {
  build(attrs: LoanAttrs): LoanDoc;
}

const loanSchema = new mongoose.Schema(
  {
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 50000,
      max: 500000,
    },

    tenureDays: {
      type: Number,
      required: true,
      min: 30,
      max: 365,
    },

    interestRate: {
      type: Number,
      default: 12,
    },

    interest: {
      type: Number,
      required: true,
    },

    totalRepayment: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.APPLIED,
    },

    isSanctioned: {
      type: Boolean,
      default: false,
    },

    isDisbursed: {
      type: Boolean,
      default: false,
    },

    rejectionReason: {
      type: String,
    },

    repayment: {
      totalPaid: {
        type: Number,
        default: 0,
      },
      outstanding: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);

loanSchema.statics.build = (attrs: LoanAttrs) => {
  return new Loan(attrs);
};

const Loan = mongoose.model<LoanDoc, LoanModel>("Loan", loanSchema);

export { Loan };