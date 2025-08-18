import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CapsuleCard from './CapsuleCard';

const ContentArea = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const res = await api.get(`/view/capsule/user`);
        // console.log(res.data);
        setCapsules(res.data);
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">All Capsules</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {capsules.length ? (
          capsules.map((capsule, idx) => {
          const capsuleId = capsule._id || capsule.id;

          if (capsule.locked) {
            return <CapsuleCard key={idx} capsule={capsule} />;
          }

          const linkPath = capsule.inMaking
            ? `/create-capsule/${capsuleId}`
            : `/view-capsule/${capsuleId}`;

          return (
            <Link to={linkPath} key={idx}>
              <CapsuleCard capsule={capsule} />
            </Link>
          );
        })
        ) : (
          <p className="text-sm text-gray-400">No capsules found</p>
        )}
      </div>
    </div>
  );
};

export default ContentArea;
