import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import fs from "fs";
import placesRoutes from "./routes/places-routes";
import usersRoutes from "./routes/users-routes";
import searchRoutes from "./routes/search-routes";
import HttpError from "./models/http-error";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

interface CustomError extends Error {
  statusCode?: number;
}

dotenv.config();
const app = express();
const PORT: string | number = process.env.PORT ?? 5000;
const MONGO_URI: string | undefined = process.env.MONGO_URI ?? "";

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use(cors());
app.use(bodyParser.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/search", searchRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError("Could not find this route.", 404);
  next(error);
});

app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log("Error deleting file", err);
      });
    }
    if (res.headersSent) {
      return next(error);
    }
    res
      .status(error.statusCode ?? 500)
      .json({ message: error.message || "An unknown error occurred!" });
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
