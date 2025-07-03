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
import CapsuleCard from '../CapsuleCard';

const CapsuleList = () => {
  const [capsules, setCapsules] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const loader = useRef(null);

  const fetchCapsules = useCallback(async () => {
    try {
      const res = await fetch(`/api/capsules?page=${page}`);
      const data = await res.json();

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setCapsules((prev) => [...prev, ...data]);
      }
    } catch (error) {
      console.error("Failed to fetch capsules:", error);
    }
  }, [page]);

  useEffect(() => {
    setCapsules([]);
    setPage(1);
    setHasMore(true);
  }, []);

  useEffect(() => {
    if (page === 1) fetchCapsules();
  }, [fetchCapsules, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
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
  }, [loader, hasMore]);

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

  const unlocked = capsules.filter((c) => !c.locked);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-semibold">🔒 Locked Capsules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locked.length > 0 ? (
            locked.map((capsule, idx) => (
              <CapsuleCard key={idx} capsule={capsule} />
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
            unlocked.map((capsule, idx) => (
              <CapsuleCard key={idx} capsule={capsule} />
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
