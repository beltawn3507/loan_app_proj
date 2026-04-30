import express, { Request, Response } from "express";

import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

import { UserRole } from "../models/users";
import { BorrowerProfile } from "../models/bre";
import { Loan } from "../models/loan";

const 
router = express.Router();

router.get(
  "/api/sales/leads",
  currentUser,
  requireAuth,
  requireRole(UserRole.SALES, UserRole.ADMIN),
  async (req: Request, res: Response) => {

    const loans = await Loan.find().select("borrowerId");

    const loanUserIds = loans.map((l) => l.borrowerId.toString());

    const leads = await BorrowerProfile.find({
      userId: { $nin: loanUserIds },
    });

    res.send(leads);
  }
);

export { router as salesLeadsRouter };
