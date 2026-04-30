import express, { Request, Response } from "express";

import { upload } from "../middlewares/upload";
import { uploadToCloudinary } from "../services/upload-to-cloudinary";

import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";
import { UserRole } from "../models/users";
import { BorrowerProfile } from "../models/bre";

const router = express.Router();

router.post(
  "/api/borrower/upload",
  currentUser,
  requireAuth,
  requireRole(UserRole.BORROWER),
  upload.single("file"),
  async (req: Request, res: Response) => {
    console.log("FILE:", req.file);
    if (!req.file) {
      return res.status(400).send({ error: "File required" });
    }

    try {
      
      const fileUrl = await uploadToCloudinary(req.file);

      
      const profile = await BorrowerProfile.findOne({
        userId: req.currentUser!.id,
      });

      if (!profile) {
        return res.status(400).send({
          error: "Profile not found. Complete profile first.",
        });
      }

      
      profile.salarySlipUrl = fileUrl;

      await profile.save();

      res.status(200).send({
        message: "File uploaded successfully",
        fileUrl,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Upload failed" });
    }
  }
);

export { router as uploadRouter };