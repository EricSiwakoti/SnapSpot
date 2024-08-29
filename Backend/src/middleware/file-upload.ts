import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { v4 as uuid } from "uuid";
import { CallbackError } from "mongoose";
import fs from "fs";
import path from "path";

const MIME_TYPE_MAP: { [key: string]: string } = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const uploadDir = path.join(__dirname, "uploads/images");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileUpload = multer({
  limits: { fileSize: 5000000 }, // 5MB
  storage: multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: CallbackError | null, destination: string) => void
    ) => {
      cb(null, uploadDir);
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: CallbackError | null, filename: string) => void
    ) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, `${uuid()}.${ext}`); // Generate a unique filename
    },
  }),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];

    if (isValid) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Invalid file type!") as any, false); // Reject the file with an error
    }
  },
});

export default fileUpload;
