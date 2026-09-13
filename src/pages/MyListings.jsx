import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusColors = {
  available: 'bg-green-100 text-green-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  sold: 'bg-gray-100 text-gray-700',
  rented: 'bg-gray-100 text-gray-700',
};

const MyListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMine = async () => {
      try {
        const { data } = await api.get('/properties/mine');
        setProperties(data.properties);
      } catch (err) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <Link to="/post-property" className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-md">
          + Post New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-gray-500">You haven't posted any properties yet.</p>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <div
              key={p._id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <Link to={`/property/${p._id}`} className="font-medium text-gray-900 hover:text-primary-600">
                  {p.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {p.area}, {p.city} · PKR {p.price.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[p.status] || 'bg-gray-100 text-gray-700'}`}>
                  {p.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
