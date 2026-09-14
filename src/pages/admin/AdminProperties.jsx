import { useEffect, useState } from 'react';
import api from '../../api/axios';

const formatPrice = (price) => `PKR ${Number(price || 0).toLocaleString()}`;

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await api.get('/admin/properties/pending');
        setProperties(data.properties || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load pending properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleReview = async (id, action) => {
    setProcessingId(id);
    setError('');
    try {
      await api.patch(`/admin/properties/${id}/${action}`);
      setProperties((current) => current.filter((property) => property._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${action} this property.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p className="py-10 text-center text-gray-500">Loading pending properties...</p>;

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {properties.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <p className="font-medium text-gray-900">No properties are waiting for approval.</p>
          <p className="mt-1 text-sm text-gray-500">New submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((property) => (
            <div key={property._id} className="rounded-lg border border-gray-200 bg-white p-4 sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{property.title}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {property.area}, {property.city} · {formatPrice(property.price)} · {property.category} · {property.listingType}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Posted by {property.postedBy?.name || 'Unknown'} ({property.postedBy?.email || 'No email'})
                </p>
              </div>
              <div className="mt-4 flex gap-2 sm:mt-0 sm:ml-4">
                <button
                  type="button"
                  onClick={() => handleReview(property._id, 'approve')}
                  disabled={processingId === property._id}
                  className="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(property._id, 'reject')}
                  disabled={processingId === property._id}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
