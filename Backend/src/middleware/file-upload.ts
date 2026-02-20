import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer, { File } from "multer";
import { Request } from "express";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "SnapSpot",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
  // Generate a unique public ID for each uploaded file
  public_id: (req: Request, file: File) => {
    const fileName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "-");
    return `snapspot-${Date.now()}-${fileName}`;
  },
});

const fileUpload = multer({
  storage: storage,
  // Limit file size to 5MB to prevent DoS
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  // Only accept specific MIME types
  fileFilter: (req: Request, file: File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

export const requireImage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file) {
    return next(
      new HttpError("No image provided. Please upload an image.", 400),
    );
  }
  next();
};

export default fileUpload;
