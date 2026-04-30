import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/users";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).send({ error: "Not authorized" });
    }

    if (!allowedRoles.includes(req.currentUser.role)) {
      return res.status(403).send({ error: "Forbidden" });
    }

    next();
  };
};