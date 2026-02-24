
import express from 'express';

import {generatePresentation} from "../controllers/generate.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, generatePresentation);



export default router;
