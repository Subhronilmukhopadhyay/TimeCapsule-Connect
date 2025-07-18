// import { useEffect, useState } from 'react';
// import api from '../../services/api'
// import CapsuleCard from './CapsuleCard.jsx';

// const SharedCapsules = () => {
//   const [capsules, setCapsules] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSharedCapsules = async () => {
//       try {
//         const res = await api.get('/view/capsule?collab=true');
//         const data = res.data;
//         setCapsules(data);
//       } catch (err) {
//         setError(err.message || 'Something went wrong');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSharedCapsules();
//   }, []);

//   const locked = capsules.filter((c) => c.locked);
//   const unlocked = capsules.filter((c) => !c.locked);

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Shared with Me</h2>

//       {loading && <p className="text-gray-500">Loading...</p>}
//       {error && <p className="text-red-500">Error: {error}</p>}

//       {!loading && !error && (
//         <>
//           <section className="mb-6">
//             <h3 className="text-xl font-semibold mb-2">🔒 Locked</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//               {locked.length ? (
//                 locked.map((capsule, idx) => <CapsuleCard key={idx} capsule={capsule} />)
//               ) : (
//                 <p className="text-sm text-gray-400">No locked shared capsules</p>
//               )}
//             </div>
//           </section>

//           <section>
//             <h3 className="text-xl font-semibold mb-2">🔓 Unlocked</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//               {unlocked.length ? (
//                 unlocked.map((capsule, idx) => <CapsuleCard key={idx} capsule={capsule} />)
//               ) : (
//                 <p className="text-sm text-gray-400">No unlocked shared capsules</p>
//               )}
//             </div>
//           </section>
//         </>
//       )}
//     </div>
//   );
// };

// export default SharedCapsules;


import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CapsuleCard from './CapsuleCard.jsx';

const SharedCapsules = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedCapsules = async () => {
      try {
        const res = await api.get('/view/capsule?collab=true');
        const data = res.data.data; // ensure this is the correct path
        setCapsules(data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedCapsules();
  }, []);

  const locked = capsules.filter((c) => c.locked);
  const inMaking = capsules.filter((c) => !c.locked && c.inMaking);
  const unlocked = capsules.filter((c) => !c.locked && !c.inMaking);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Shared with Me</h2>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* 🔒 Locked Capsules */}
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">🔒 Locked</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {locked.length ? (
                locked.map((capsule, idx) => (
                  <CapsuleCard key={idx} capsule={capsule} />
                ))
              ) : (
                <p className="text-sm text-gray-400">No locked shared capsules</p>
              )}
            </div>
          </section>

          {/* 🛠️ In Making Capsules */}
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">🛠️ In Making</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {inMaking.length ? (
                inMaking.map((capsule, idx) => {
                  const capsuleId = capsule._id || capsule.id;
                  return (
                    <Link to={`/create-capsule/${capsuleId}`} key={idx}>
                      <CapsuleCard capsule={capsule} />
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">No capsules in making</p>
              )}
            </div>
          </section>

          {/* 🔓 Unlocked Capsules */}
          <section>
            <h3 className="text-xl font-semibold mb-2">🔓 Unlocked</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {unlocked.length ? (
                unlocked.map((capsule, idx) => {
                  const capsuleId = capsule._id || capsule.id;
                  return (
                    <Link to={`/view-capsule/${capsuleId}`} key={idx}>
                      <CapsuleCard capsule={capsule} />
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">No unlocked shared capsules</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default SharedCapsules;