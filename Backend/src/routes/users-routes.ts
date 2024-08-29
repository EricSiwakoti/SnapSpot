import express from "express";
import * as usersController from "../controllers/users-controllers";
import { check } from "express-validator";
import fileUpload from "../middleware/file-upload";

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

export default router;
