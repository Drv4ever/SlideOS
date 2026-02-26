
import express from 'express';

import {generatePresentation} from "../controllers/generate.controller.js";
import auth from "../middleware/middleware.js";

const router = express.Router();

router.post("/", auth, generatePresentation);



export default router;
