import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data.property);
      } catch (err) {
        // property not found or server error
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setInquiryStatus('');
    try {
      await api.post('/inquiries', { propertyId: id, message });
      setInquiryStatus('Message sent! The owner will be in touch.');
      setMessage('');
    } catch (err) {
      setInquiryStatus(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleFavorite = async () => {
    try {
      await api.post(`/favorites/${id}`);
      alert('Added to favorites');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading...</p>;
  if (!property) return <p className="text-center py-20 text-gray-500">Property not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="h-72 bg-gray-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400">No image available</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-500 mb-3">
            {property.area}, {property.city}
          </p>
          <p className="text-2xl font-bold text-primary-600 mb-4">
            PKR {property.price.toLocaleString()}
            {property.priceUnit && <span className="text-base font-normal text-gray-500"> /{property.priceUnit}</span>}
          </p>

          <div className="flex gap-6 text-sm text-gray-700 border-y py-3 mb-4">
            {property.category !== 'plot' && (
              <>
                <span>{property.bedrooms ?? '-'} Bedrooms</span>
                <span>{property.bathrooms ?? '-'} Bathrooms</span>
              </>
            )}
            <span>
              {property.areaSize} {property.areaUnit}
            </span>
            <span className="capitalize">{property.category}</span>
          </div>

          <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 mb-4 whitespace-pre-line">{property.description}</p>

          {property.amenities && property.amenities.length > 0 && (
            <>
              <h2 className="font-semibold text-gray-900 mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {property.amenities.map((a) => (
                  <span key={a} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">Posted by</h3>
            <p className="text-gray-700">{property.postedBy?.name}</p>
            {property.postedBy?.phone && <p className="text-sm text-gray-500">{property.postedBy.phone}</p>}
          </div>

          {user ? (
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Send an inquiry</h3>
              <form onSubmit={handleInquiry}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I'm interested in this property..."
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2"
                />
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 text-sm font-medium"
                >
                  Send Message
                </button>
              </form>
              {inquiryStatus && <p className="text-sm text-gray-600 mt-2">{inquiryStatus}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">Log in to contact the owner.</p>
          )}

          <button
            onClick={handleFavorite}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md py-2 text-sm font-medium"
          >
            ♥ Save to Favorites
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
