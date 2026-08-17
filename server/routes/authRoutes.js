import express from 'express';
import 'dotenv/config';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { registerUser, loginUser, logout } from '../middleware/authMiddleware.js';
import { googleAuthStart, googleAuthCallback } from '../controllers/googleAuthController.js';
import authenticate from '../controllers/authController.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);

router.post('/login', validateLogin, loginUser);

router.post('/logout', authenticate, logout);

// Google OAuth. Both are GET because the browser is redirected through them;
// csurf ignores GET, and the flow is protected by its own `state` parameter.
router.get('/google', googleAuthStart);
router.get('/google/callback', googleAuthCallback);

export default router;