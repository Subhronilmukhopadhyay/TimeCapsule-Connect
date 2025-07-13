import Capsule from '../models/capsule.js';
import { generateTimeCapsuleId } from '../utils/idGenerator.js';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import 'dotenv/config';

/**
 * getting the working capsule collab mode
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getCapsuleCollab = async (req, res) => {
    try {
      const { id } = req.params;
      const capsule = await Capsule.findById(id);
  
      if (!capsule) {
        return res.status(404).json({ error: 'Capsule not found' });
      }
  
      return res.status(200).json({
        collabMode: capsule.isCollab
      });
    } catch (error) {
      console.error('Error loading capsule:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
};  

/**
 * getting the working capsule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getCapsule = async (req, res) => {
    try {
      const { id } = req.params;
      const capsule = await Capsule.findById(id);
  
      if (!capsule) {
        return res.status(404).json({ error: 'Capsule not found' });
      }

    //   // Check if the capsule is locked
    //   if (capsule.locked) {
    //     return res.status(403).json({ error: 'This capsule is locked and cannot be opened' });
    //   }
  
      return res.status(200).json({
        id: capsule._id,
        title: capsule.title,
        content: capsule.content,
        inMaking: capsule.inMaking,
        locked: capsule.locked || false,
        unlockDate: capsule.unlockDate || null,
        unlockLocation: capsule.unlockLocation || null
      });
    } catch (error) {
      console.error('Error loading capsule:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
};  

/**
 * Creates a new time capsule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const createCapsule = async (req, res) => {
    try {
        const { title, content } = req.body;
        // console.log('HERE'+'1'+content);
        // console.log(content);
        // const processedContent = await processCapsuleContent(content);
        // console.log('process:- '+JSON.stringify(processedContent, null, 2));
        const capsuleId = await generateTimeCapsuleId();
        // console.log(capsuleId);
        const newCapsule = new Capsule({
            _id: capsuleId,
            title: title,
            content: content,
            owner: req.user.id,
        });
        await newCapsule.save();
        res.status(201).json({ id: capsuleId });
    } 
    catch(error) {
        console.error('Error creating capsule:', error);
        res.status(500).json({ error: 'Error creating capsule' });
    }
}

/**
 * Updates an existing time capsule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const updateCapsule = async (req, res) => {
    try {
        const { title, content } = req.body;

        const existingCapsule = await Capsule.findById(req.params.id);
        if(!existingCapsule) {
            return res.status(404).json({ error: 'Capsule Not Found' });
        }

        // const existingMedia = extractMediaItems(existingCapsule.capsuleContent);
        // const newMedia = extractMediaItems(content);
        // const { hasChanges } = detectMediaChanges(existingMedia, newMedia);

        // Blob URLs should already be processed on the client side,
        // so we don't need to detect and process them here
        const updatedCapsule = await Capsule.findByIdAndUpdate(
            req.params.id,
            {
                title: title,
                content: content,
            },
            { new: true }
        );
        res.status(200).json({ updatedCapsule });
    } 
    catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

/**
 * Lock the time capsule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const lockCapsule = async (req, res) => {
    try {
        const { lockSettings } = req.body;
        const lockedCapsule = await Capsule.findByIdAndUpdate(
            req.params.id,
            {
                inMaking: false,
                locked: true,
                ...lockSettings,
            },
            { new: true }
        )
        if(!lockedCapsule) {
            return res.status(404).json({ error: 'Capsule not found' });
        }
        return res.status(200).json({ success: true, capsule: lockedCapsule });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getCollaborator = async (req, res) => {
  try {
    const userId = req.user.id; // from authenticate middleware
    const result = await pool.query('SELECT name FROM userlogin WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ name: result.rows[0].name });
  } catch (err) {
    console.error('Error fetching collaborator name:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all the capsules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const userCapsules = async (req, res) => {
  try {
    const { collab } = req.query;

    const filter = { owner: req.user.id };

    if (collab === 'true') {
      filter.isCollab = true;
    }

    const capsules = await Capsule.find(filter);

    return res.status(200).json(
      capsules.map(capsule => ({
        id: capsule._id,
        title: capsule.title,
        content: capsule.content,
        inMaking: capsule.inMaking,
        locked: capsule.locked,
        unlockDate: capsule.unlockDate,
        unlockLocation: capsule.unlockLocation,
      }))
    );
  } catch (error) {
    console.error('Error fetching user capsules:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get all the capsules within 5 km radius of the user coordinates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const capsules = async (req, res) => {
  try {
    const capsules = await Capsule.find();

    return res.status(200).json(
      capsules.map(capsule => ({
        id: capsule._id,
        title: capsule.title,
        content: capsule.content,
        inMaking: capsule.inMaking,
        locked: capsule.locked,
        unlockDate: capsule.unlockDate,
        unlockLocation: capsule.unlockLocation
      }))
    );
  } catch (error) {
    console.error('Error fetching user capsules:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};