import express from 'express';
import 'dotenv/config';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { registerUser, loginUser, logout } from '../middleware/authMiddleware.js';
import authenticate from '../controllers/authController.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);

router.post('/login', validateLogin, loginUser);

router.post('/logout', authenticate, logout);

export default router;