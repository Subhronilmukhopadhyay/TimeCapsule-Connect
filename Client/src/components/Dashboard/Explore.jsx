import { useState } from 'react';
import CapsuleFilter from './Explore/CapsuleFilter.jsx'
import CapsuleList from './Explore/CapsuleList.jsx'

const ExplorePage = () => {
  const [type, setType] = useState('time'); // 'time' or 'location'

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Explore Capsules</h2>
      <CapsuleFilter selected={type} onChange={setType} />
      <CapsuleList capsuleType={type} />
    </div>
  );
};

export default ExplorePage;
