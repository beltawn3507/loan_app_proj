import mongoose from "mongoose";
import dotenv from "dotenv";

import { User, UserRole } from "../models/users";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;

const users = [
  { email: "admin@test.com", password: "password", role: UserRole.ADMIN },
  { email: "sales@test.com", password: "password", role: UserRole.SALES },
  { email: "sanction@test.com", password: "password", role: UserRole.SANCTION },
  { email: "disbursement@test.com", password: "password", role: UserRole.DISBURSEMENT },
  { email: "collection@test.com", password: "password", role: UserRole.COLLECTION },
  { email: "borrower@test.com", password: "password", role: UserRole.BORROWER },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });

      if (existing) {
        console.log(`User already exists: ${u.email}`);
        continue;
      }

      const user = User.build({
        email: u.email,
        password: u.password,
        role: u.role,
      });

      await user.save();
      console.log(`Created user: ${u.email}`);
    }

    console.log("Seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();