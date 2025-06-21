const CapsuleFilter = ({ selected, onChange }) => {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        className={`px-4 py-2 rounded ${selected === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => onChange('time')}
      >
        Time Capsules
      </button>
      <button
        className={`px-4 py-2 rounded ${selected === 'location' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => onChange('location')}
      >
        Location Capsules
      </button>
    </div>
  );
};

export default CapsuleFilter;
