import express from "express";
import auth from "../middleware/middleware.js";
import {
  createPresentation,
  getMyPresentations,
  getMyPresentationById,
  updatePresentation,
} from "../controllers/presentation.controller.js";

const router = express.Router();

router.post("/", auth, createPresentation);
router.get("/", auth, getMyPresentations);
router.get("/:id", auth, getMyPresentationById);
router.put("/:id", auth, updatePresentation);

export default router;
