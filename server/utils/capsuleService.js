// // utils/capsuleService.js
// import { processMediaFiles } from '../config/googleDrive.js';

// /**
//  * Extracts media items from capsule content
//  * @param {Object} capsuleContent - Capsule content object
//  * @returns {Array} Array of media items
//  */
// export const extractMediaItems = (capsuleContent) => {
//   if (!capsuleContent) return [];
  
//   // Process different content structures
//   // Assuming capsuleContent might be an array of content blocks or an object with sections
//   let mediaItems = [];
  
//   if (Array.isArray(capsuleContent)) {
//     // If content is an array of blocks
//     capsuleContent.forEach(block => {
//       if (block.type === 'image' || block.type === 'video' || block.type === 'audio' || block.type === 'file') {
//         mediaItems.push(block);
//       } else if (block.media) {
//         // If block has a media property
//         mediaItems = [...mediaItems, ...block.media];
//       }
//     });
//   } else if (typeof capsuleContent === 'object') {
//     // If content is an object with properties
//     Object.values(capsuleContent).forEach(value => {
//       if (value && typeof value === 'object') {
//         if (value.type === 'image' || value.type === 'video' || value.type === 'audio') {
//           mediaItems.push(value);
//         } else if (value.media && Array.isArray(value.media)) {
//           mediaItems = [...mediaItems, ...value.media];
//         }
//       }
//     });
//   }
  
//   return mediaItems;
// };

// /**
//  * Processes capsule content and uploads media to Google Drive
//  * @param {Object} capsuleContent - Capsule content with media items
//  * @returns {Promise<Object>} Processed capsule content with Google Drive URLs
//  */
// export const processCapsuleContent = async (capsuleContent) => {
//   try {
//     // Clone the content to avoid modifying the original
//     // console.log('HERE'+capsuleContent);
//     const processedContent = JSON.parse(JSON.stringify(capsuleContent));
    
//     // Extract media items
//     const mediaItems = extractMediaItems(processedContent);
    
//     if (mediaItems.length === 0) {
//       return processedContent;
//     }
    
//     // Process media files and get Google Drive URLs
//     const processedMediaItems = await processMediaFiles(mediaItems);
    
//     // Update the URLs in the content
//     if (Array.isArray(processedContent)) {
//       processedContent.forEach(block => {
//         if (block.type === 'image' || block.type === 'video' || block.type === 'audio') {
//           const processedItem = processedMediaItems.find(item => item.name === block.name);
//           if (processedItem) {
//             block.url = processedItem.url;
//           }
//         } else if (block.media) {
//           block.media.forEach((mediaItem, index) => {
//             const processedItem = processedMediaItems.find(item => item.name === mediaItem.name);
//             if (processedItem) {
//               block.media[index].url = processedItem.url;
//             }
//           });
//         }
//       });
//     } else if (typeof processedContent === 'object') {
//       Object.entries(processedContent).forEach(([key, value]) => {
//         if (value && typeof value === 'object') {
//           if (value.type === 'image' || value.type === 'video' || value.type === 'audio') {
//             const processedItem = processedMediaItems.find(item => item.name === value.name);
//             if (processedItem) {
//               processedContent[key].url = processedItem.url;
//             }
//           } else if (value.media && Array.isArray(value.media)) {
//             value.media.forEach((mediaItem, index) => {
//               const processedItem = processedMediaItems.find(item => item.name === mediaItem.name);
//               if (processedItem) {
//                 processedContent[key].media[index].url = processedItem.url;
//               }
//             });
//           }
//         }
//       });
//     }
    
//     return processedContent;
//   } catch (error) {
//     console.error('Error processing capsule content:', error);
//     throw error;
//   }
// };