import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { validateRequest } from "../middlewares/validate-request";
import { User } from "../models/users";
import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "Invalid credentials" });
    }

    const isMatch = await Password.compare(user.password, password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid credentials" });
    }

    const userJwt = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_KEY!
    );

    req.session = { jwt: userJwt } as any;

    res.status(200).send({
      id: user._id,
      email: user.email,
    });
  }
);

export { router as signinRouter };