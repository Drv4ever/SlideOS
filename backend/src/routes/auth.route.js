import express from "express";
import { login, register } from "../controllers/login.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
