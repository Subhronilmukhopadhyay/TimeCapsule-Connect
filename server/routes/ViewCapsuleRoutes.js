import express from 'express';
import { createCapsule, updateCapsule, lockCapsule, getCapsule } from '../controllers/capsuleController.js'
import authenticate from '../controllers/authController.js'; //to authenticate the before post

const router = express.Router();
router.use(authenticate);

// // Get a capsule by ID
router.get('/:id', getCapsule);

// // Get all capsules of users
// router.get('user/:id', userCapsule);

export default router;