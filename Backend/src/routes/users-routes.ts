import express from "express";
import * as usersController from "../controllers/users-controllers";

const router = express.Router();

router.get("/", usersController.getUsers);

router.post("/signup", usersController.signup);

router.post("/login", usersController.login);

export default router;
