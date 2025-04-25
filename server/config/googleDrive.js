// config/googleDrive.js
import { google } from 'googleapis';
import fs from 'fs/promises';
import axios from 'axios';
import stream from 'stream';
import { promisify } from 'util';

// Configure Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });
const pipelineAsync = promisify(stream.pipeline);

/**
 * Downloads a file from a URL and returns it as a buffer
 * @param {string} url - URL of the file to download
 * @returns {Promise<Buffer>} File buffer
 */
export const downloadFileFromUrl = async (url) => {
  try {
    // Handle blob URLs by fetching from the client
    if (url.startsWith('blob:')) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } else {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Uploads a file to Google Drive
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} fileName - Name of the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Google Drive file ID
 */
export const uploadFileToDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Set your folder ID in .env
      },
      media: {
        mimeType,
        body: bufferStream,
      },
      fields: 'id',
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get the webViewLink
    const fileInfo = await drive.files.get({
      fileId: response.data.id,
      fields: 'webContentLink',
    });

    return fileInfo.data.webContentLink;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
};

/**
 * Processes media files in capsule content and uploads them to Google Drive
 * @param {Array} mediaItems - Array of media items
 * @returns {Promise<Array>} Array of processed media items with Google Drive URLs
 */
export const processMediaFiles = async (mediaItems) => {
  if (!mediaItems || !Array.isArray(mediaItems)) return [];

  const processedItems = await Promise.all(
    mediaItems.map(async (item) => {
      // Skip if it's already a Google Drive link
      if (item.url && item.url.includes('drive.google.com')) {
        return item;
      }

      try {
        const fileBuffer = await downloadFileFromUrl(item.url);
        // Determine MIME type based on the item type or file extension
        const mimeType = item.type === 'image' 
          ? `image/${item.name.split('.').pop().toLowerCase()}`
          : 'application/octet-stream';
        
        const driveUrl = await uploadFileToDrive(fileBuffer, item.name, mimeType);
        
        return {
          ...item,
          url: driveUrl,
          originalUrl: item.url // Keep the original URL for reference
        };
      } catch (error) {
        console.error(`Error processing media item ${item.name}:`, error);
        return item; // Return original item if processing fails
      }
    })
  );

  return processedItems;
};

/**
 * Compares media items between old and new content to identify changes
 * @param {Array} oldMedia - Previous media items
 * @param {Array} newMedia - New media items
 * @returns {Object} Object containing items that need to be processed
 */
export const detectMediaChanges = (oldMedia = [], newMedia = []) => {
  if (!Array.isArray(oldMedia)) oldMedia = [];
  if (!Array.isArray(newMedia)) newMedia = [];

  // Find new or modified items
  const itemsToProcess = newMedia.filter(newItem => {
    // Check if item is new or modified
    const existingItem = oldMedia.find(oldItem => oldItem.name === newItem.name);
    return !existingItem || existingItem.url !== newItem.url;
  });

  return {
    hasChanges: itemsToProcess.length > 0,
    itemsToProcess
  };
};