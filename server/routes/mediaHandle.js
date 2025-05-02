import express from 'express';
import { uploadMedia, uploadChunk, completeUpload } from '../controllers/MediaController.js'
import multer from 'multer';
import authenticate from '../controllers/authController.js';

const router = express.Router();
router.use(authenticate);

const upload = multer({ dest: 'uploads/tmp/' });

//upload media one way
router.post('/upload-media', upload.single('file'), uploadMedia);

// send media to google drive in chuck
router.post('/upload-chunk', upload.single('chunk'), uploadChunk);

// send media to google drive complete
router.post('/upload-complete', completeUpload);

export default router;