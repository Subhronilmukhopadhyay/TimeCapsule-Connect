// tasks/unlockScheduler.js
import cron from 'node-cron';
import Capsule from '../models/capsule.js';

// Schedule to run every 30 minutes
const unlockScheduler = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const now = new Date();
      const result = await Capsule.updateMany(
        { locked: true, lockDate: { $lte: now } },
        { $set: { locked: false } }
      );

      if (result.modifiedCount > 0) {
        console.log(`[${new Date().toISOString()}] Unlocked ${result.modifiedCount} capsules`);
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error unlocking capsules:`, err);
    }
  });
};

export default unlockScheduler;
