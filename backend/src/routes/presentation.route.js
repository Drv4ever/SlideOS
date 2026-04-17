import express from "express";
import auth from "../middleware/middleware.js";
import {
  createPresentation,
  deletePresentation,
  getMyPresentations,
  getMyPresentationById,
  updatePresentation,
} from "../controllers/presentation.controller.js";

const router = express.Router();

router.post("/", auth, createPresentation);
router.get("/", auth, getMyPresentations);
router.get("/:id", auth, getMyPresentationById);
router.put("/:id", auth, updatePresentation);
router.delete("/:id", auth, deletePresentation);

export default router;
