import express from "express";
import * as usersController from "../controllers/users-controllers";
import { check } from "express-validator";
import fileUpload, { requireImage } from "../middleware/file-upload";
import authMiddleware from "../middleware/check-auth";

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  requireImage,
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup,
);

router.post("/login", usersController.login);
router.post("/logout", authMiddleware, usersController.logout);

export default router;
