import { cloudinary } from "./cloudinary";

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "salary-slips",
    resource_type: "auto",
  });

  return result.secure_url;
};