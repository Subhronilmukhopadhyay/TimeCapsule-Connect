import express from 'express';
import 'dotenv/config';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { registerUser, loginUser } from '../middleware/authMiddleware.js'

const router = express.Router();

router.post('/register', validateRegister, registerUser);

router.post('/login', validateLogin, loginUser);

export default router;