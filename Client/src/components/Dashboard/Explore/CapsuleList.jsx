// import { useEffect, useState, useRef, useCallback } from 'react';
// import CapsuleCard from '../CapsuleCard';

// const CapsuleList = ({ capsuleType }) => {
//   const [capsules, setCapsules] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const loader = useRef(null);

//   const fetchCapsules = useCallback(async () => {
//     const res = await fetch(`/api/capsules?type=${capsuleType}&page=${page}`);
//     const data = await res.json();

//     if (data.length === 0) {
//       setHasMore(false);
//     } else {
//       setCapsules((prev) => [...prev, ...data]);
//     }
//   }, [capsuleType, page]);

//   useEffect(() => {
//     setCapsules([]);
//     setPage(1);
//     setHasMore(true);
//   }, [capsuleType]);

//   useEffect(() => {
//     if (page === 1) fetchCapsules();
//   }, [fetchCapsules, page]);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && hasMore) {
//           setPage((prev) => prev + 1);
//         }
//       },
//       { threshold: 1 }
//     );

//     const currentLoader = loader.current;
//     if (currentLoader) observer.observe(currentLoader);

//     return () => {
//       if (currentLoader) observer.unobserve(currentLoader);
//     };
//   }, [loader, hasMore]);

//   const locked = capsules.filter((c) => c.locked);
//   const unlocked = capsules.filter((c) => !c.locked);

//   return (
//     <div className="space-y-8">
//       <section>
//         <h3 className="text-xl font-semibold">🔒 Locked Capsules</h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {locked.map((capsule, idx) => (
//             <CapsuleCard key={idx} capsule={capsule} />
//           ))}
//         </div>
//       </section>

//       <section>
//         <h3 className="text-xl font-semibold">🔓 Unlocked Capsules</h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {unlocked.map((capsule, idx) => (
//             <CapsuleCard key={idx} capsule={capsule} />
//           ))}
//         </div>
//       </section>

//       <div ref={loader} className="text-center text-sm text-gray-500 mt-4">
//         {hasMore ? 'Loading more...' : 'No more capsules'}
//       </div>
//     </div>
//   );
// };


// export default CapsuleList;

import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../../../services/api';
import CapsuleCard from '../CapsuleCard';

const CapsuleList = () => {
  const [capsules, setCapsules] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const loader = useRef(null);

  const fetchCapsules = useCallback(async () => {
    if (loading) return; // Prevent concurrent requests
    
    try {
      setLoading(true);
      const res = await api.get(`/view/capsule?page=${page}&limit=10`);
      const { data: newCapsules, hasMore: more } = res.data;

      if (newCapsules.length === 0 || !more) {
        setHasMore(false);
      }
      
      setCapsules((prev) => {
        // Remove duplicates by checking if capsule already exists
        const existingIds = new Set(prev.map(c => c.id));
        const uniqueNewCapsules = newCapsules.filter(c => !existingIds.has(c.id));
        return [...prev, ...uniqueNewCapsules];
      });
    } catch (error) {
      console.error("Failed to fetch capsules:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  // Initial load - only run once
  useEffect(() => {
    setCapsules([]);
    setPage(1);
    setHasMore(true);
  }, []);

  // Fetch capsules when page changes
  useEffect(() => {
    fetchCapsules();
  }, [page]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, loading]);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true }
    );
  }, []);

  // Helper to calculate distance between two coordinates (Haversine formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const now = new Date();
  const nearFutureThreshold = 3 * 24 * 60 * 60 * 1000; // 3 days
  const nearbyDistanceThreshold = 10; // 10 km
  
  const locked = capsules.filter((c) => {
    if (!c.locked) return false;

    const unlockSoon =
      c.unlockTime &&
      new Date(c.unlockTime).getTime() - now.getTime() <= nearFutureThreshold;

    const isNearby =
      userLocation &&
      c.location &&
      getDistance(
        userLocation.latitude,
        userLocation.longitude,
        c.location.latitude,
        c.location.longitude
      ) <= nearbyDistanceThreshold;

    return unlockSoon || isNearby;
  });

  const unlocked = capsules.filter((c) => !c.locked && !c.inMaking);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-semibold">🔒 Locked Capsules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locked.length > 0 ? (
            locked.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))
          ) : (
            <p className="text-sm text-gray-400">
              No nearby or soon-to-unlock capsules
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold">🔓 Unlocked Capsules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {unlocked.length > 0 ? (
            unlocked.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))
          ) : (
            <p className="text-sm text-gray-400">No unlocked capsules</p>
          )}
        </div>
      </section>

      <div ref={loader} className="text-center text-sm text-gray-500 mt-4">
        {hasMore ? 'Loading more...' : 'No more capsules'}
      </div>
    </div>
  );
};

export default CapsuleList;