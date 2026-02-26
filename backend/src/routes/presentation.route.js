import express from "express";
import auth from "../middleware/middleware.js";
import {
  createPresentation,
  getMyPresentations,
  getPresentationById,
} from "../controllers/presentation.controller.js";

const router = express.Router();

router.post("/", auth, createPresentation);
router.get("/", auth, getMyPresentations);
router.get("/:id", auth, getPresentationById);

export default router;
