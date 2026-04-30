import express, { Request, Response } from "express";

import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

import { UserRole } from "../models/users";
import { Loan, LoanStatus } from "../models/loan";

const router = express.Router();

router.get(
  "/api/disbursement/loans",
  currentUser,
  requireAuth,
  requireRole(UserRole.DISBURSEMENT, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    const loans = await Loan.find({
      status: LoanStatus.SANCTIONED,
    });

    res.send(loans);
  }
);


router.patch(
  "/api/disbursement/loans/:loanId",
  currentUser,
  requireAuth,
  requireRole(UserRole.DISBURSEMENT, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).send({
        error: "Loan not found",
      });
    }

    if (loan.status !== LoanStatus.SANCTIONED) {
      return res.status(400).send({
        error: "Loan is not in SANCTIONED state",
      });
    }

    loan.status = LoanStatus.DISBURSED;
    loan.isDisbursed = true;

    await loan.save();

    res.send({
      message: "Loan disbursed successfully",
      loan,
    });
  }
);

export { router as disbursementRouter };
