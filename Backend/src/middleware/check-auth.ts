import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import HttpError from "../models/http-error";

interface AuthRequest extends Request {
  userData?: { userId: string };
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_KEY as string
    ) as jwt.JwtPayload;
    req.userData = { userId: decodedToken.userId as string };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed!", 403);
    return next(error);
  }
};

export default authMiddleware;
