import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { Request, Response, NextFunction, RequestHandler } from "express";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const fileName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "-");

    return {
      folder: "SnapSpot",
      allowed_formats: ["jpg", "png", "jpeg"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
      public_id: `snapspot-${Date.now()}-${fileName}`,
    };
  },
});

const fileUpload = multer({
  storage: storage,
  // Limit file size to 5MB to prevent DoS
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  // Only accept specific MIME types
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

export const requireImage: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file) {
    return res.status(422).json({ message: "Image file is required." });
  }
  next();
};

export default fileUpload;
