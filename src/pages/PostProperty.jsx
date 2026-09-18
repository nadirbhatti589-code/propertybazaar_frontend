import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import ImageUpload from '../components/ImageUpload';
import { PAKISTAN_LOCATIONS, CITIES } from '../constants/pakistanLocations';

const initialState = {
  title: '',
  description: '',
  listingType: 'buy',
  category: 'house',
  price: '',
  priceUnit: 'month',
  city: 'Lahore',
  area: '',
  address: '',
  bedrooms: '',
  bathrooms: '',
  floors: '',
  areaSize: '',
  areaUnit: 'marla',
  plotType: 'residential',
  possessionStatus: 'ready',
  isFurnished: 'unfurnished',
  isCornerPlot: false,
  amenitiesText: '',
  images: [],
};

const Section = ({ title, children }) => (
  <section className="border-t border-sand-200 pt-6">
    <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
    {children}
  </div>
);

const PostProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingListing, setLoadingListing] = useState(Boolean(id));

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        const property = data.property;
        setForm({
          ...initialState,
          ...property,
          images: property.images || [],
          amenitiesText: (property.amenities || []).join(', '),
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this listing for editing.');
      } finally {
        setLoadingListing(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (event, isDraft = false) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        isDraft,
        price: Number(form.price),
        areaSize: Number(form.areaSize),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        floors: form.floors ? Number(form.floors) : undefined,
        possessionStatus: form.possessionStatus || null,
        isFurnished: form.isFurnished || null,
        isCornerPlot: Boolean(form.isCornerPlot),
        amenities: form.amenitiesText
          .split(',')
          .map((amenity) => amenity.trim())
          .filter(Boolean),
      };
      delete payload.amenitiesText;

      if (id) {
        await api.put(`/properties/${id}`, payload);
      } else {
        await api.post('/properties', payload);
      }

      setSuccess(
        isDraft
          ? 'Draft saved.'
          : id
          ? 'Listing updated and submitted for review.'
          : 'Listing submitted! It will appear publicly once verified by an admin.'
      );
      setTimeout(() => navigate('/my-listings'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${id ? 'update' : 'create'} listing`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingListing) return <p className="py-20 text-center text-sand-600">Loading your listing…</p>;

  const societies = PAKISTAN_LOCATIONS[form.city] || [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
        {id ? 'Refine your listing' : 'Create a listing'}
      </p>
      <h1 className="section-heading mt-1">{id ? 'Edit Property' : 'Post a Property'}</h1>
      <p className="mt-2 text-sm text-sand-600">
        Fill out the property specifications accurately to reach genuine buyers.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-7 border border-sand-200 bg-white p-5 sm:p-7">
        {error && <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</p>}
        {success && <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700">{success}</p>}

        {/* Basic Info */}
        <Section title="Basic Info">
          <Field label="Title">
            <input
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. 1 Kanal Modern Designer House in DHA Phase 6"
              className="form-input"
            />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              required
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the architectural design, fittings, location highlights, and access..."
              className="form-input resize-y"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Listing Type">
              <select name="listingType" value={form.listingType} onChange={handleChange} className="form-input">
                <option value="buy">Buy (Sale)</option>
                <option value="rent">Rent</option>
              </select>
            </Field>

            <Field label="Category">
              <select name="category" value={form.category} onChange={handleChange} className="form-input">
                <option value="house">House / Villa</option>
                <option value="apartment">Flat / Apartment</option>
                <option value="plot">Plot / Land</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Price (PKR)">
              <input
                type="number"
                name="price"
                required
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 35000000"
                className="form-input"
              />
            </Field>
            {form.listingType === 'rent' && (
              <Field label="Per">
                <select name="priceUnit" value={form.priceUnit} onChange={handleChange} className="form-input">
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </Field>
            )}
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="City">
              <select name="city" required value={form.city} onChange={handleChange} className="form-input">
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Society / Area">
              {societies.length > 0 ? (
                <div>
                  <input
                    list="societies-list"
                    name="area"
                    required
                    value={form.area}
                    onChange={handleChange}
                    placeholder="e.g. DHA Phase 6"
                    className="form-input"
                  />
                  <datalist id="societies-list">
                    {societies.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              ) : (
                <input
                  name="area"
                  required
                  value={form.area}
                  onChange={handleChange}
                  placeholder="e.g. Gulberg III"
                  className="form-input"
                />
              )}
            </Field>
          </div>

          <Field label="Full Address (optional)">
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street address, block number, or landmark"
              className="form-input"
            />
          </Field>
        </Section>

        {/* Property Details */}
        <Section title="Property Details">
          {form.category !== 'plot' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Bedrooms">
                <input
                  type="number"
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  className="form-input"
                />
              </Field>
              <Field label="Bathrooms">
                <input
                  type="number"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  className="form-input"
                />
              </Field>
              <Field label="Floors">
                <input
                  type="number"
                  name="floors"
                  value={form.floors}
                  onChange={handleChange}
                  className="form-input"
                />
              </Field>
            </div>
          ) : (
            <Field label="Plot Type">
              <select name="plotType" value={form.plotType} onChange={handleChange} className="form-input">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
              </select>
            </Field>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Area Size">
              <input
                type="number"
                step="any"
                name="areaSize"
                required
                value={form.areaSize}
                onChange={handleChange}
                placeholder="e.g. 10"
                className="form-input"
              />
            </Field>
            <Field label="Unit">
              <select name="areaUnit" value={form.areaUnit} onChange={handleChange} className="form-input">
                <option value="marla">Marla</option>
                <option value="kanal">Kanal</option>
                <option value="sqft">Sq Ft</option>
                <option value="sqyd">Sq Yard</option>
              </select>
            </Field>
          </div>

          {/* Phase 2 Attributes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <Field label="Possession Status">
              <select
                name="possessionStatus"
                value={form.possessionStatus}
                onChange={handleChange}
                className="form-input"
              >
                <option value="ready">Ready to Move</option>
                <option value="under_construction">Under Construction</option>
              </select>
            </Field>

            <Field label="Furnishing Status">
              <select
                name="isFurnished"
                value={form.isFurnished}
                onChange={handleChange}
                className="form-input"
              >
                <option value="unfurnished">Unfurnished</option>
                <option value="semi_furnished">Semi-Furnished</option>
                <option value="furnished">Furnished</option>
              </select>
            </Field>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="isCornerPlot"
                checked={form.isCornerPlot}
                onChange={handleChange}
                className="h-4 w-4 rounded border-sand-400 text-brand-600 focus:ring-brand-500"
              />
              Corner Plot / Facing Park / Main Boulevard
            </label>
          </div>
        </Section>

        {/* Photos & Amenities */}
        <Section title="Photos & Amenities">
          <ImageUpload images={form.images} onChange={(images) => setForm({ ...form, images })} />
          <Field label="Amenities (comma separated)">
            <input
              name="amenitiesText"
              placeholder="Parking, Sui Gas, Electricity, Water Supply, Security Guards"
              value={form.amenitiesText}
              onChange={handleChange}
              className="form-input"
            />
          </Field>
        </Section>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            formNoValidate
            disabled={loading}
            onClick={(event) => handleSubmit(event, true)}
            className="btn-secondary flex-1"
          >
            Save Draft
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : id ? 'Save & Submit for Review' : 'Submit Listing for Review'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default PostProperty;
