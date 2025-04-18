import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('email').isEmail().normalizeEmail().trim().escape(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().trim().escape(),
  body('password').notEmpty().withMessage('Password is required').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];