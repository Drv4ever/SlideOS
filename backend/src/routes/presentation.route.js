import express from "express";
import auth from "../middleware/middleware.js";
import {
  createPresentation,
  deletePresentation,
  getMyPresentations,
  getMyPresentationById,
  getPublicPresentationById,
  updatePresentation,
} from "../controllers/presentation.controller.js";

const router = express.Router();

router.post("/", auth, createPresentation);
router.get("/", auth, getMyPresentations);
// Public share route: intentionally NOT behind auth so anyone with the link
// can view the deck (only if the owner enabled isPublic). Kept before /:id so
// the "share" segment is never captured as an id.
router.get("/share/:id", getPublicPresentationById);
router.get("/:id", auth, getMyPresentationById);
router.put("/:id", auth, updatePresentation);
router.delete("/:id", auth, deletePresentation);

export default router;
