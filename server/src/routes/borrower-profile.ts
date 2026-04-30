import express, { Request, Response } from "express";
import { body } from "express-validator";

import { validateRequest } from "../middlewares/validate-request";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";
import { UserRole } from "../models/users";
import { BorrowerProfile } from "../models/bre";
import { BreStatus } from "../models/bre";
import { runBRE } from "../services/bre";

const router = express.Router();

router.get(
  "/api/borrower/profile",
  currentUser,
  requireAuth,
  requireRole(UserRole.BORROWER),
  async (req: Request, res: Response) => {
    const profile = await BorrowerProfile.findOne({
      userId: req.currentUser!.id,
    });

    if (!profile) {
      return res.status(404).send({
        error: "Borrower profile not found",
      });
    }

    res.send(profile);
  }
);

router.post(
  "/api/borrower/profile",
  currentUser,
  requireAuth,
  requireRole(UserRole.BORROWER),
  [
    body("fullName").notEmpty(),
    body("pan").notEmpty(),
    body("dob").notEmpty(),
    body("monthlySalary").isNumeric(),
    body("employmentType").notEmpty(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { fullName, pan, dob, monthlySalary, employmentType } =
      req.body;

    const existing = await BorrowerProfile.findOne({
      userId: req.currentUser!.id,
    });

    if (existing) {
      return res
        .status(400)
        .send({ error: "Profile already exists" });
    }

    const breResult = runBRE({
      dob,
      monthlySalary,
      employmentType,
      pan,
    });

    const profile = BorrowerProfile.build({
      userId: req.currentUser!.id,
      fullName,
      pan,
      dob,
      monthlySalary,
      employmentType,
    });

    profile.breStatus = breResult.isEligible
  ? BreStatus.PASSED
  : BreStatus.FAILED;

    profile.isEligible = breResult.isEligible;

    await profile.save();

    res.status(201).send({
      profile,
      bre: breResult,
    });
  }
);

export { router as borrowerProfileRouter };
