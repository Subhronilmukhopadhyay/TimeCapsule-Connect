// config/googleDrive.js
import { google } from 'googleapis';
import stream from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  credentials: process.env.NODE_ENV === 'production'
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    : undefined,
  keyFile: process.env.NODE_ENV !== 'production'
    ? process.env.GOOGLE_APPLICATION_CREDENTIALS
    : undefined,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// /**
//  * Uploads a base64 encoded file to Google Drive
//  * @param {string} base64Data - Base64 encoded file content
//  * @param {string} fileName - Desired filename
//  * @param {string} mimeType - MIME type of file
//  * @returns {Promise<string>} Google Drive file URL
//  */
// export const uploadBase64ToDrive = async (base64Data, fileName, mimeType) => {
//   try {
//     const fileBuffer = Buffer.from(base64Data, 'base64');
//     const bufferStream = new stream.PassThrough();
//     bufferStream.end(fileBuffer);

//     const response = await drive.files.create({
//       requestBody: {
//         name: fileName,
//         parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//       },
//       media: {
//         mimeType,
//         body: bufferStream,
//       },
//       fields: 'id',
//     });

//     await drive.permissions.create({
//       fileId: response.data.id,
//       requestBody: { role: 'reader', type: 'anyone' },
//     });

//     const { data } = await drive.files.get({
//       fileId: response.data.id,
//       fields: 'webContentLink',
//     });

//     return data.webContentLink;
//   } catch (err) {
//     console.error('Error uploading base64 to Drive:', err);
//     throw new Error('Failed to upload base64 file to Google Drive');
//   }
// };

/**
 * Uploads a stream (used for merged chunks) to Google Drive
 * @param {stream.Readable} fileStream - Readable stream of file
 * @param {string} fileName - Name of the file
 * @returns {Promise<string>} Google Drive file URL
 */
export const uploadStreamToDrive = async (fileStream, fileName) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        body: fileStream,
      },
      fields: 'id',
    });

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const { data } = await drive.files.get({
      fileId: response.data.id,
      fields: 'webContentLink',
    });

    return data.webContentLink;
  } catch (err) {
    console.error('Error uploading stream to Drive:', err);
    throw new Error('Failed to upload stream file to Google Drive');
  }
};
