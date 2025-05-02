// server/controllers/uploadController.js
import fs from 'fs';
import path from 'path';
import { uploadStreamToDrive } from '../config/googleDrive.js';

export const uploadMedia = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const { path: filePath, originalname, mimetype } = file;
    const stream = fs.createReadStream(filePath);

    const driveUrl = await uploadStreamToDrive(stream, originalname, mimetype);

    // clean up temp file
    fs.unlinkSync(filePath);

    return res.status(200).json({ url: driveUrl, name: originalname });
  } catch (error) {
    console.error('Error uploading media:', error);
    return res.status(500).json({ error: 'Error uploading media' });
  }
};  

// Chunked upload: save each chunk to disk
defaultChunkFolder();
export const uploadChunk = async (req, res) => {
  try {
    const { index, uploadId, fileName } = req.body;
    const chunk = req.file;

    if (!chunk || !uploadId || index === undefined) {
      return res.status(400).json({ error: 'Missing chunk or metadata' });
    }

    const chunkPath = path.join('uploads', 'tmp', `${uploadId}-${index}`);
    fs.renameSync(chunk.path, chunkPath);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error saving chunk:', err);
    res.status(500).json({ error: 'Failed to save chunk' });
  }
};

// Finalize upload: merge chunks and upload to Drive
export const completeUpload = async (req, res) => {
  try {
    const { uploadId, fileName, totalChunks } = req.body;
    const chunkPaths = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join('uploads', 'tmp', `${uploadId}-${i}`);
      if (!fs.existsSync(chunkPath)) {
        return res.status(400).json({ error: `Missing chunk ${i}` });
      }
      chunkPaths.push(chunkPath);
    }

    const mergedPath = path.join('uploads', 'tmp', `${uploadId}-merged`);
    const writeStream = fs.createWriteStream(mergedPath);

    for (const chunkPath of chunkPaths) {
      const data = fs.readFileSync(chunkPath);
      writeStream.write(data);
    }
    writeStream.end();

    writeStream.on('finish', async () => {
      const readStream = fs.createReadStream(mergedPath);
      const driveUrl = await uploadStreamToDrive(readStream, fileName);

      [...chunkPaths, mergedPath].forEach(p => fs.unlinkSync(p));

      res.status(200).json({ url: driveUrl, name: fileName });
    });

    writeStream.on('error', (err) => {
      console.error('Error merging file:', err);
      res.status(500).json({ error: 'Failed to finalize upload' });
    });
  } catch (err) {
    console.error('Finalization error:', err);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
};

function defaultChunkFolder() {
  const tmpPath = path.join('uploads', 'tmp');
  if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath, { recursive: true });
}