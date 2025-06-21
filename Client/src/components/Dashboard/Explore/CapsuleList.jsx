import { useEffect, useState, useRef, useCallback } from 'react';
import CapsuleCard from '../CapsuleCard';

const CapsuleList = ({ capsuleType }) => {
  const [capsules, setCapsules] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);

  const fetchCapsules = useCallback(async () => {
    const res = await fetch(`/api/capsules?type=${capsuleType}&page=${page}`);
    const data = await res.json();

    if (data.length === 0) {
      setHasMore(false);
    } else {
      setCapsules((prev) => [...prev, ...data]);
    }
  }, [capsuleType, page]);

  useEffect(() => {
    setCapsules([]);
    setPage(1);
    setHasMore(true);
  }, [capsuleType]);

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

  const locked = capsules.filter((c) => c.locked);
  const unlocked = capsules.filter((c) => !c.locked);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-semibold">🔒 Locked Capsules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locked.map((capsule, idx) => (
            <CapsuleCard key={idx} capsule={capsule} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold">🔓 Unlocked Capsules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {unlocked.map((capsule, idx) => (
            <CapsuleCard key={idx} capsule={capsule} />
          ))}
        </div>
      </section>

      <div ref={loader} className="text-center text-sm text-gray-500 mt-4">
        {hasMore ? 'Loading more...' : 'No more capsules'}
      </div>
    </div>
  );
};


export default CapsuleList;
