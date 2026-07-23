import express from 'express';

import { generateLogin, generateRegister, googleAuth } from '../controllers/login.controller.js';
const router = express.Router();
router.post("/register",generateRegister);

router.post("/login",generateLogin);

router.post("/google",googleAuth);

export default router;
