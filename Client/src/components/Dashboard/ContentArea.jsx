import { useEffect, useState } from 'react';

const ContentArea = () => {
  const [data, setData] = useState([]);       // Stores fetched data
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [error, setError] = useState(null);     // Tracks error

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const res = await fetch('/api/data'); // Replace with your real endpoint
        // if (!res.ok) throw new Error('Failed to fetch');
        // const json = await res.json();
        setData(['Fetched Data']);
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Fetched Data</h3>
      <ul className="space-y-2">
        {data.map((item, index) => (
          <li key={index} className="p-3 bg-gray-100 rounded shadow-sm">
            {JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentArea;
