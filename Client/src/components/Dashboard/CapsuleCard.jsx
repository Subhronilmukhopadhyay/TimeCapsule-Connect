// import { motion } from 'framer-motion';

const CapsuleCard = ({ capsule }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}        // Starts faded and pushed down
      animate={{ opacity: 1, y: 0 }}         // Animates to visible and original position
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 border hover:border-blue-400"
    >
      {capsule.imageUrl && (
        <img
          src={capsule.imageUrl}
          alt={capsule.title}
          className="w-full h-40 object-cover rounded mb-3 transform hover:scale-105 transition-transform duration-300"
        />
      )}

      <h4 className="text-lg font-semibold mb-1">{capsule.title}</h4>
      <p className="text-sm text-gray-600 mb-2">{capsule.description}</p>

      <p className="text-xs text-gray-400 italic">
        {capsule.locked ? '🔒 Locked' : '🔓 Unlocked'} — {capsule.type}
      </p>
    </motion.div>
  );
};

export default CapsuleCard