import express, { Request, Response } from "express";
import { body } from "express-validator";
import { BorrowerProfile } from "../../models/bre";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireRole } from "../../middlewares/require-role";
import { validateRequest } from "../../middlewares/validate-request";
import { UserRole } from "../../models/users";
import { Loan, LoanStatus } from "../../models/loan";

const router = express.Router();

router.get(
  "/api/sanction/loans/:loanId",
  currentUser,
  requireAuth,
  requireRole(UserRole.SANCTION, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).send({
        error: "Loan not found",
      });
    }

    const profile = await BorrowerProfile.findOne({
      userId: loan.borrowerId,
    });

    res.send({
      loan,
      borrowerProfile: profile,
    });
  }
);


router.patch(
  "/api/sanction/loans/:loanId",
  currentUser,
  requireAuth,
  requireRole(UserRole.SANCTION, UserRole.ADMIN),

  [
    body("action")
      .isIn(["APPROVE", "REJECT"])
      .withMessage("Action must be APPROVE or REJECT"),

    body("reason")
      .optional()
      .isString()
      .withMessage("Reason must be a string"),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { action, reason } = req.body;

    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).send({ error: "Loan not found" });
    }

    if (loan.status !== LoanStatus.APPLIED) {
      return res.status(400).send({
        error: "Loan is not in APPLIED state",
      });
    }

    if (action === "APPROVE") {
      loan.status = LoanStatus.SANCTIONED;
      loan.isSanctioned = true;
    }

    if (action === "REJECT") {
      loan.status = LoanStatus.REJECTED;
      loan.rejectionReason =
        reason || "Rejected by sanction team";
    }

    await loan.save();

    res.send({
      message: `Loan ${action.toLowerCase()}d successfully`,
      loan,
    });
  }
);

export { router as sanctionRouter };
