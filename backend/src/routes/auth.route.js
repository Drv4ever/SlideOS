import express from 'express';

import { generateLogin, generateRegister } from '../controllers/login.controller.js';
const router = express.Router();
router.post("/register",generateRegister);

router.post("/login",generateLogin);

export default router;
