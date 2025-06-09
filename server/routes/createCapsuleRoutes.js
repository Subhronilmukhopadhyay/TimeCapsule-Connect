import express from 'express';
import { createCapsule, updateCapsule, lockCapsule, getCapsule, getCapsuleCollab } from '../controllers/capsuleController.js'
import authenticate from '../controllers/authController.js'; //to authenticate the before post

const router = express.Router();
router.use(authenticate);

// get the working id has any collab mode active
router.get('/collab/:id', getCapsuleCollab);

// get the working id
router.get('/:id', getCapsule);

// Create a new capsule
router.post('/', createCapsule);

// Update a capsule (partial update)
router.patch('/:id', updateCapsule);

// Lock a capsule (partial update)
router.patch('/:id/lock', lockCapsule);

export default router;