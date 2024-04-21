import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import express from "express";
import { decodeJWT } from "../middlewares/Token.js";

const router = express();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(decodeJWT, logoutUser);

export default router;
