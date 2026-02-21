
import express from 'express';

import {generatePresentation} from "../controllers/generate.controller.js";

const router = express.Router();

router.post("/", generatePresentation);



export default router;
