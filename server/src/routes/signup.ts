import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { validateRequest } from "../middlewares/validate-request";
import { User, UserRole } from "../models/users";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be 4–20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: "Email already in use" });
    }

    const user = User.build({
      email,
      password,
      role: UserRole.BORROWER,
    });

    await user.save();

    const userJwt = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_KEY!
    );

    req.session = { jwt: userJwt } as any;

    res.status(201).send({
      id: user._id,
      email: user.email,
    });
  }
);

export { router as signupRouter };