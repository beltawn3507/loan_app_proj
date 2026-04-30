import express, { Request, Response } from "express";
import { body } from "express-validator";

import { validateRequest } from "../middlewares/validate-request";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

import { UserRole } from "../models/users";
import { BorrowerProfile } from "../models/bre";
import { Loan, LoanStatus } from "../models/loan";
import { Payment } from "../models/payment";

const router = express.Router();

const calculateLoan = (amount: number, tenureDays: number) => {
  const rate = 12;

  const interest = (amount * rate * tenureDays) / (365 * 100);
  const totalRepayment = amount + interest;

  return {
    interest: Math.round(interest),
    totalRepayment: Math.round(totalRepayment),
  };
};

router.get(
  "/api/loans/me",
  currentUser,
  requireAuth,
  requireRole(UserRole.BORROWER),
  async (req: Request, res: Response) => {
    const loans = await Loan.find({
      borrowerId: req.currentUser!.id,
    }).sort({ createdAt: -1 });

    res.send(loans);
  }
);

router.post(
  "/api/loans/apply",
  currentUser,
  requireAuth,
  requireRole(UserRole.BORROWER),

  [
    body("amount")
      .isFloat({ min: 50000, max: 500000 })
      .withMessage("Amount must be between 50k and 5L"),

    body("tenureDays")
      .isInt({ min: 30, max: 365 })
      .withMessage("Tenure must be between 30 and 365 days"),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { amount, tenureDays } = req.body;

    const profile = await BorrowerProfile.findOne({
      userId: req.currentUser!.id,
    });

    if (!profile) {
      return res.status(400).send({
        error: "Borrower profile not found",
      });
    }

    if (!profile.isEligible) {
      return res.status(400).send({
        error: "User is not eligible for loan",
      });
    }

    if (!profile.salarySlipUrl) {
      return res.status(400).send({
        error: "Salary slip not uploaded",
      });
    }

    
    const { interest, totalRepayment } = calculateLoan(
      amount,
      tenureDays
    );

   
    const loan = Loan.build({
      borrowerId: req.currentUser!.id,
      amount,
      tenureDays,
      interest,
      totalRepayment,
    });

    
    loan.repayment = {
      totalPaid: 0,
      outstanding: totalRepayment,
    };

    await loan.save();

    res.status(201).send({
      message: "Loan applied successfully",
      loan,
    });
  }
);

router.post(
  "/api/loans/:loanId/pay",
  currentUser,
  requireAuth,
  requireRole(UserRole.BORROWER),
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

    if (loan.borrowerId.toString() !== req.currentUser!.id) {
      return res.status(403).send({ error: "Forbidden" });
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

export { router as applyLoanRouter };
