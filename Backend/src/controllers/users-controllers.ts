import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import HttpError from "../models/http-error";
import User from "../models/user";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(
      new HttpError("Fetching users failed, please try again later.", 500),
    );
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500),
    );
  }

  if (existingUser) {
    return next(
      new HttpError("User exists already, please login instead.", 422),
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  const createdUser = new User({
    name,
    email,
    image: req.file ? req.file.path : undefined,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500),
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" },
    );
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500),
    );
  }

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 3600000, // 1 hour
    secure: process.env.NODE_ENV === "production", // Secure only in production
    sameSite: "strict",
  });

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500),
    );
  }

  if (!identifiedUser) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 403),
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    return next(
      new HttpError(
        "Could not log you in, please check your credentials and try again.",
        500,
      ),
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 403),
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" },
    );
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500),
    );
  }

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 3600000, // 1 hour
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({
    userId: identifiedUser.id,
    email: identifiedUser.email,
    token: token,
  });
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export { getUsers, signup, login, logout };
