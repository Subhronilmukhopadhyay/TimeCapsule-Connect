// utils/blob-upload.js
import api from './api';

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_MB = 2000;

/**
 * Slices a file into 50MB chunks
 * @param {File} file - File object to slice
 * @returns {Blob[]} - Array of file chunks
 */
function sliceFile(file) {
  const chunks = [];
  for (let start = 0; start < file.size; start += CHUNK_SIZE) {
    chunks.push(file.slice(start, start + CHUNK_SIZE));
  }
  return chunks;
}

/**
 * Gets last uploaded chunk index from localStorage
 * @param {string} uploadId - Unique ID for the file
 * @returns {number} - Last uploaded chunk index
 */
function getUploadedIndex(uploadId) {
  return parseInt(localStorage.getItem(uploadId) || '0', 10);
}

/**
 * Stores current uploaded chunk index in localStorage
 * @param {string} uploadId - Unique ID for the file
 * @param {number} idx - Chunk index to store
 */
function setUploadedIndex(uploadId, idx) {
  localStorage.setItem(uploadId, idx);
}

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Uploads a file chunk to the server with retry support
 * @param {Blob} blob - The chunk to upload
 * @param {number} index - Index of the chunk
 * @param {string} uploadId - Unique ID for the upload session
 * @param {string} fileName - Original file name
 * @param {number} maxRetries - Number of retry attempts
 * @returns {Promise<void>}
 */
async function uploadChunkWithRetry(blob, index, uploadId, fileName, maxRetries = 5) {
  const form = new FormData();
  form.append('chunk', blob);
  form.append('index', index);
  form.append('uploadId', uploadId);
  form.append('fileName', fileName);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await api.post('/media-handle/upload-chunk', form);
      return;
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`Retry chunk ${index} in ${delay}ms`);
      await sleep(delay);
    }
  }
}

/**
 * Converts blob URL into a Blob object
 * @param {string} blobUrl - Blob URL to convert
 * @returns {Promise<Blob>} - Converted Blob
 */
export async function blobUrlToBlob(blobUrl) {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  if (blob.size > MAX_MB * 1024 * 1024) {
    throw new Error(`File exceeds ${MAX_MB}MB limit`);
  }
  return blob;
}

async function hashBlob(blob) {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Uploads a small file using FormData
 * @param {string|null} capsuleId - Existing capsule ID (null for new capsules)
 * @param {Blob} blob - File blob to upload
 * @param {string} fileName - Name of the file
 * @returns {Promise<Object>} - Server response with URL
 */
export async function uploadMediaFile(capsuleId, blob, fileName) {
  const hash = await hashBlob(blob);
  const cacheKey = `upload-url-${capsuleId}-${hash}`;
  const cachedUrl = localStorage.getItem(cacheKey);
  if (cachedUrl) return { url: cachedUrl };
  // console.log("HERE2");
  const form = new FormData();
  form.append('file', blob, fileName);

  const res = await api.post('/media-handle/upload-media', form);
  localStorage.setItem(cacheKey, res.data.url);
  return res.data; // { url }
}

/**
 * Uploads large files in chunks with resumable support
 * @param {string|null} capsuleId - Existing capsule ID (null for new capsules)
 * @param {File|Blob} file - The file to upload
 * @param {string} name - File name to use
 * @returns {Promise<Object>} - Server response with final URL
 */
export async function uploadLargeFileInChunks(capsuleId, file, name) {
  const hash = await hashBlob(file);
  const cacheKey = `upload-url-${capsuleId}-${hash}`;
  const cachedUrl = localStorage.getItem(cacheKey);
  if (cachedUrl) return { url: cachedUrl };

  const time = file.lastModified || Date.now();
  const uploadId = `${name}-${file.size}-${time}`;
  const chunks = sliceFile(file);
  let startIndex = getUploadedIndex(uploadId);
  // console.log("HERE2");
  for (let i = startIndex; i < chunks.length; i += 3) {
    const batch = chunks.slice(i, i + 3).map((blob, j) =>
      uploadChunkWithRetry(blob, i + j, uploadId, name)
        .then(() => setUploadedIndex(uploadId, i + j + 1))
    );

    const results = await Promise.allSettled(batch);
    const rejected = results.find(r => r.status === 'rejected');
    if (rejected) throw rejected.reason;
  }

  const { data } = await api.post('/media-handle/upload-complete', {
    uploadId,
    fileName: name,
    totalChunks: chunks.length
  });

  localStorage.removeItem(uploadId);
  localStorage.setItem(`upload-url-${name}`, data.url);
  return data; // { url }
}

/**
 * Processes editor content before saving, uploads any blob URLs
 * @param {string|null} capsuleId - Existing capsule ID (null for new capsules)
 * @param {Array} content - Editor content array
 * @returns {Promise<Array>} - Updated content with real media URLs
 */
export const processContentBeforeSave = async (capsuleId, content) => {
  if (!Array.isArray(content)) {
    console.log("Content is not an array.");
    return null;
  }

  if (content.length === 0) {
    console.log("Content array is empty.");
    return null;
  }

  const processedContent = await Promise.all(
    content.map(async (item, index) => {
      try {
        const mediaType = getMediaType(item);
        if (mediaType && item.url?.startsWith('blob:')) {
          const blob = await blobUrlToBlob(item.url);
          // console.log("HERE");
          const uploader = blob.size > CHUNK_SIZE ? uploadLargeFileInChunks : uploadMediaFile;
          const uploadResponse = await uploader(capsuleId, blob, item.name || `media-${index}`);
          // console.log(uploadResponse);
          return { ...item, url: uploadResponse.url, blobProcessed: true };
        }
        return item;
      } catch (error) {
        console.error(`Error processing object at index ${index}:`, error);
        return item;
      }
    })
  );

  return processedContent;
};

/**
 * Determines valid media type
 * @param {Object} obj - Content block object
 * @returns {string|null} - Media type or null
 */
function getMediaType(obj) {
  if (obj && obj.type) {
    const lower = obj.type.toLowerCase();
    if (['image', 'video', 'audio', 'file'].includes(lower)) return lower;
  }
  return null;
}