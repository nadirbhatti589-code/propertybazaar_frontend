import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const initialState = {
  title: '',
  description: '',
  listingType: 'buy',
  category: 'house',
  price: '',
  priceUnit: 'month',
  city: '',
  area: '',
  address: '',
  bedrooms: '',
  bathrooms: '',
  floors: '',
  areaSize: '',
  areaUnit: 'sqft',
  plotType: 'residential',
  amenitiesText: '',
};

const PostProperty = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        areaSize: Number(form.areaSize),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        floors: form.floors ? Number(form.floors) : undefined,
        amenities: form.amenitiesText
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      };
      delete payload.amenitiesText;

      await api.post('/properties', payload);
      setSuccess('Listing submitted! It will appear publicly once an admin approves it.');
      setForm(initialState);
      setTimeout(() => navigate('/my-listings'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Property</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Beautiful 3 Bedroom House in DHA"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Listing Type</label>
            <select
              name="listingType"
              value={form.listingType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="buy">Buy (Sell)</option>
              <option value="rent">Rent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="plot">Plot</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Price (PKR)</label>
            <input
              type="number"
              name="price"
              required
              value={form.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {form.listingType === 'rent' && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Per</label>
              <select
                name="priceUnit"
                value={form.priceUnit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">City</label>
            <input
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Area / Neighborhood</label>
            <input
              name="area"
              required
              value={form.area}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Full Address (optional)</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {form.category !== 'plot' ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={form.bedrooms}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={form.bathrooms}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Floors</label>
              <input
                type="number"
                name="floors"
                value={form.floors}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Plot Type</label>
            <select
              name="plotType"
              value={form.plotType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="agricultural">Agricultural</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Area Size</label>
            <input
              type="number"
              name="areaSize"
              required
              value={form.areaSize}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Unit</label>
            <select
              name="areaUnit"
              value={form.areaUnit}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="sqft">Sq Ft</option>
              <option value="sqyd">Sq Yard</option>
              <option value="marla">Marla</option>
              <option value="kanal">Kanal</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Amenities (comma separated)</label>
          <input
            name="amenitiesText"
            placeholder="Parking, Gas, Electricity, Security"
            value={form.amenitiesText}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <p className="text-xs text-gray-500">
          Note: image upload isn't wired into this form yet — you can add image URLs later via the
          edit endpoint once Cloudinary is fully connected.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Listing for Review'}
        </button>
      </form>
    </div>
  );
};

export default PostProperty;
