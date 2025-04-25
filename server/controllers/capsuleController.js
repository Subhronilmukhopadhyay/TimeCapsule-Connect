import Capsule from '../models/Capsule.js';
import { generateTimeCapsuleId } from '../utils/idGenerator.js';
import { processCapsuleContent, extractMediaItems } from '../utils/capsuleService.js';
import { detectMediaChanges } from '../config/googleDrive.js';

/**
 * Creates a new time capsule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const createCapsule = async (req, res) => {
    try {
        console.log(req.body);
        const { title, content } = req.body;
        // console.log('HERE'+'1'+content);
        // console.log(content);
        const processedContent = await processCapsuleContent(content);
        // console.log('process:- '+JSON.stringify(processedContent, null, 2));
        const capsuleId = await generateTimeCapsuleId();
        // console.log(capsuleId);
        const newCapsule = new Capsule({
            _id: capsuleId,
            title: title,
            content: processedContent,
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
        console.log(req.body);
        const { title, content } = req.body;

        const existingCapsule = await Capsule.findById(req.params.id);
        if(!existingCapsule) {
            return res.status(404).json({ error: 'Capsule Not Found' });
        }

        const existingMedia = extractMediaItems(existingCapsule.capsuleContent);
        const newMedia = extractMediaItems(content);
        const { hasChanges } = detectMediaChanges(existingMedia, newMedia);

        let processedContent = content;
        if (hasChanges) {
        console.log('Media changes detected, processing new content');
        processedContent = await processCapsuleContent(content);
        }

        const updatedCapsule = await Capsule.findByIdAndUpdate(
            req.params.id,
            {
                title: title,
                content: processedContent,
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

export const lockCapsule = async (req, res) => {
    try {
        console.log(req.body);
        const { lockSettings } = req.body;
        const lockedCapsule = await Capsule.findByIdAndUpdate(
            req.params.id,
            lockSettings,
            { new: true }
        )
        if(!lockedCapsule) {
            return res.status(404).json({ error: 'Capsule not found' });
        }
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}