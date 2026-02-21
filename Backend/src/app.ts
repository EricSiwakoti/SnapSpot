import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import placesRoutes from "./routes/places-routes";
import usersRoutes from "./routes/users-routes";
import searchRoutes from "./routes/search-routes";
import HttpError from "./models/http-error";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import cookieParser from "cookie-parser";

interface CustomError extends Error {
  statusCode?: number;
  code?: string | number;
}

dotenv.config();
const app = express();
const PORT: string | number = process.env.PORT ?? 5000;
const MONGO_URI: string | undefined = process.env.MONGO_URI ?? "";

app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
app.use(express.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/search", searchRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError("Could not find this route.", 404);
  next(error);
});

app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    // Handle Multer Errors specifically
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File size too large. Max 5MB allowed." });
      }
      return res.status(400).json({ message: "File upload error." });
    }

    if (res.headersSent) {
      return next(error);
    }

    // In production, hide detailed error messages for 500 errors
    const isProd = process.env.NODE_ENV === "production";
    res.status(error.statusCode ?? 500).json({
      message:
        isProd && error.statusCode === 500
          ? "An unknown error occurred!"
          : error.message || "An unknown error occurred!",
    });
  },
);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to database successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
    process.exit(1);
  });
