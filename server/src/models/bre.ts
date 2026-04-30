import mongoose from "mongoose";

export enum EmploymentType {
  SALARIED = "SALARIED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  UNEMPLOYED = "UNEMPLOYED",
}

export enum BreStatus {
  PENDING = "PENDING",
  PASSED = "PASSED",
  FAILED = "FAILED",
}

interface BorrowerProfileAttrs {
  userId: string;
  fullName: string;
  pan: string;
  dob: Date;
  monthlySalary: number;
  employmentType: EmploymentType;
}

interface BorrowerProfileDoc extends mongoose.Document {
  userId: string;
  fullName: string;
  pan: string;
  dob: Date;
  monthlySalary: number;
  employmentType: EmploymentType;
  breStatus: BreStatus;
  isEligible: boolean;
  salarySlipUrl?: string;
}

interface BorrowerProfileModel
  extends mongoose.Model<BorrowerProfileDoc> {
  build(attrs: BorrowerProfileAttrs): BorrowerProfileDoc;
}

const borrowerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    fullName: { type: String, required: true },
    pan: { type: String, required: true },
    dob: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    employmentType: {
      type: String,
      enum: Object.values(EmploymentType),
      required: true,
    },
    breStatus: {
      type: String,
      enum: Object.values(BreStatus),
      default: BreStatus.PENDING,
    },
    isEligible: {
      type: Boolean,
      default: false,
    },
    salarySlipUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

borrowerProfileSchema.statics.build = (attrs: BorrowerProfileAttrs) => {
  return new BorrowerProfile(attrs);
};

const BorrowerProfile = mongoose.model<
  BorrowerProfileDoc,
  BorrowerProfileModel
>("BorrowerProfile", borrowerProfileSchema);

export { BorrowerProfile };