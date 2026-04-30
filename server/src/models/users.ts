import mongoose from "mongoose";
import { Password } from "../services/password";

interface UserAttrs {
  email: string;
  password: string;
  role?: UserRole;
}

export enum UserRole {
  BORROWER = "BORROWER",
  ADMIN = "ADMIN",
  SALES = "SALES",
  SANCTION = "SANCTION",
  DISBURSEMENT = "DISBURSEMENT",
  COLLECTION = "COLLECTION",
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BORROWER,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

userSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.password;
  },
});

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };