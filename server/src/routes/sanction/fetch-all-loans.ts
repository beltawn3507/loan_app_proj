import express, { Request, Response } from "express";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireRole } from "../../middlewares/require-role";

import { UserRole } from "../../models/users";
import { Loan, LoanStatus } from "../../models/loan";

const router = express.Router();

router.get(
  "/api/sanction/loans",
  currentUser,
  requireAuth,
  requireRole(UserRole.SANCTION, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    console.log("SANCTION ROUTE HIT");
    const loans = await Loan.find({
      status: LoanStatus.APPLIED,
    });

    res.send(loans);
  }
);

export { router as sanctionLoansRouter };
