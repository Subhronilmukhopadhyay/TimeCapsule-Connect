import Capsule from '../models/Capsule.js';
import { generateTimeCapsuleId } from '../utils/idGenerator.js';

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