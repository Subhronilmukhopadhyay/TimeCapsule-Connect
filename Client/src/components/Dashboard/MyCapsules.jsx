import { useEffect, useState } from 'react';
import api from '../../services/api'
import CapsuleCard from './CapsuleCard'

const MyCapsules = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCapsules = async () => {
      try {
        const res = await api.get('/view/capsule');
        const data = res.data;
        setCapsules(data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCapsules();
  }, []);

  const locked = capsules.filter((c) => c.locked);
  const unlocked = capsules.filter((c) => !c.locked);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Capsules</h2>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">🔒 Locked</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {locked.length ? (
                locked.map((capsule, idx) => <CapsuleCard key={idx} capsule={capsule} />)
              ) : (
                <p className="text-sm text-gray-400">No locked capsules</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">🔓 Unlocked</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {unlocked.length ? (
                unlocked.map((capsule, idx) => <CapsuleCard key={idx} capsule={capsule} />)
              ) : (
                <p className="text-sm text-gray-400">No unlocked capsules</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default MyCapsules;
