import express, { Request, Response } from "express";
import { body } from "express-validator";

import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";
import { validateRequest } from "../middlewares/validate-request";

import { UserRole } from "../models/users";
import { Loan, LoanStatus } from "../models/loan";
import { Payment } from "../models/payment";

const router = express.Router();

router.get(
  "/api/collection/loans",
  currentUser,
  requireAuth,
  requireRole(UserRole.COLLECTION, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    const loans = await Loan.find({
      status: LoanStatus.DISBURSED,
    });

    res.send(loans);
  }
);

router.get(
  "/api/collection/loans/:loanId",
  currentUser,
  requireAuth,
  requireRole(UserRole.COLLECTION, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).send({ error: "Loan not found" });
    }

    const payments = await Payment.find({
      loanId: loan._id,
    });

    res.send({ loan, payments });
  }
);

router.post(
  "/api/collection/loans/:loanId/pay",
  currentUser,
  requireAuth,
  requireRole(UserRole.COLLECTION, UserRole.ADMIN),
  [
    body("utr").notEmpty().withMessage("UTR required"),
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { utr, amount } = req.body;

    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).send({ error: "Loan not found" });
    }

    if (loan.status !== LoanStatus.DISBURSED) {
      return res.status(400).send({
        error: "Loan is not in DISBURSED state",
      });
    }

    if (amount > loan.repayment.outstanding) {
      return res.status(400).send({
        error: "Payment exceeds outstanding amount",
      });
    }

    let payment;

    try {
      payment = Payment.build({
        loanId: loan._id,
        utr,
        amount,
      });

      await payment.save();
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(400).send({
          error: "UTR must be unique",
        });
      }
      throw err;
    }

    loan.repayment.totalPaid += amount;
    loan.repayment.outstanding -= amount;

    if (loan.repayment.outstanding === 0) {
      loan.status = LoanStatus.CLOSED;
    }

    await loan.save();

    res.send({
      message: "Payment recorded successfully",
      loan,
      payment,
    });
  }
);

export { router as collectionRouter };
