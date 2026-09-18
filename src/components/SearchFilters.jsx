import { useState, useEffect } from 'react';
import { PAKISTAN_LOCATIONS, CITIES } from '../constants/pakistanLocations';

const SearchFilters = ({ initialFilters = {}, onSearch, onReset }) => {
  const [filters, setFilters] = useState({
    search: '',
    listingType: '',
    category: '',
    city: '',
    society: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    areaUnit: 'marla',
    bedrooms: '',
    bathrooms: '',
    possessionStatus: '',
    isFurnished: '',
    isCornerPlot: false,
    sortBy: 'newest',
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync state if initialFilters change externally (e.g. browser back/forward)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      ...initialFilters,
      isCornerPlot: initialFilters.isCornerPlot === 'true' || initialFilters.isCornerPlot === true,
    }));
  }, [initialFilters]);

  const availableSocieties = filters.city ? PAKISTAN_LOCATIONS[filters.city] || [] : [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // If city changes, reset society
      if (name === 'city' && value !== prev.city) {
        next.society = '';
      }
      return next;
    });
  };

  const setListingType = (type) => {
    setFilters((prev) => ({
      ...prev,
      listingType: prev.listingType === type ? '' : type,
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cleaned = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined && val !== false) {
        cleaned[key] = val;
      }
    });
    onSearch(cleaned);
  };

  const handleClear = () => {
    const resetValues = {
      search: '',
      listingType: '',
      category: '',
      city: '',
      society: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      areaUnit: 'marla',
      bedrooms: '',
      bathrooms: '',
      possessionStatus: '',
      isFurnished: '',
      isCornerPlot: false,
      sortBy: 'newest',
    };
    setFilters(resetValues);
    if (onReset) onReset();
    else onSearch({});
  };

  const activeFilterCount = Object.entries(filters).filter(([key, val]) => {
    if (['areaUnit', 'sortBy'].includes(key)) return false;
    return val !== '' && val !== false && val !== null && val !== undefined;
  }).length;

  return (
    <div className="mb-8 border border-sand-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Top bar: Buy/Rent toggle + Keyword search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center rounded-md bg-sand-100 p-1">
          <button
            type="button"
            onClick={() => setListingType('buy')}
            className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded ${
              filters.listingType === 'buy'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-sand-700 hover:text-ink'
            }`}
          >
            Buy (Sale)
          </button>
          <button
            type="button"
            onClick={() => setListingType('rent')}
            className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded ${
              filters.listingType === 'rent'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-sand-700 hover:text-ink'
            }`}
          >
            Rent
          </button>
          {filters.listingType && (
            <button
              type="button"
              onClick={() => setListingType('')}
              className="px-2.5 py-1 text-xs text-sand-500 hover:text-ink"
              title="Clear Buy/Rent filter"
            >
              ✕ All
            </button>
          )}
        </div>

        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            name="search"
            placeholder="Search keywords (e.g. Modern DHA House, Corner Plot)..."
            value={filters.search}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="form-input w-full pl-9 text-sm"
          />
          <span className="pointer-events-none absolute left-3 top-2.5 text-sand-400">🔍</span>
        </div>
      </div>

      {/* Main filters grid */}
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category */}
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sand-600">
            Property Type
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="form-input text-sm"
          >
            <option value="">All Property Types</option>
            <option value="house">House / Villa</option>
            <option value="apartment">Flat / Apartment</option>
            <option value="plot">Plot / Land</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sand-600">
            City
          </label>
          <select
            name="city"
            value={filters.city}
            onChange={handleChange}
            className="form-input text-sm"
          >
            <option value="">All Pakistan Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Society / Area */}
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sand-600">
            Society / Neighborhood
          </label>
          {availableSocieties.length > 0 ? (
            <select
              name="society"
              value={filters.society}
              onChange={handleChange}
              className="form-input text-sm"
            >
              <option value="">All Societies in {filters.city}</option>
              {availableSocieties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="society"
              placeholder={filters.city ? 'Type society / sector' : 'Select a city or type here'}
              value={filters.society}
              onChange={handleChange}
              className="form-input text-sm"
            />
          )}
        </div>

        {/* Sort By */}
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sand-600">
            Sort Order
          </label>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="form-input text-sm"
          >
            <option value="newest">Featured & Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="area_asc">Area: Small to Large</option>
            <option value="area_desc">Area: Large to Small</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sand-600">
            Price Range (PKR)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price (e.g. 5000000)"
              value={filters.minPrice}
              onChange={handleChange}
              className="form-input flex-1 text-sm"
            />
            <span className="text-sand-400">to</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price (e.g. 25000000)"
              value={filters.maxPrice}
              onChange={handleChange}
              className="form-input flex-1 text-sm"
            />
          </div>
        </div>

        {/* Area Range with Marla / Kanal toggle */}
        <div className="sm:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wider text-sand-600">
              Area Range
            </label>
            <div className="flex gap-1 text-[11px] font-medium text-sand-600">
              {['marla', 'kanal', 'sqft', 'sqyd'].map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, areaUnit: unit }))}
                  className={`rounded px-1.5 py-0.5 uppercase ${
                    filters.areaUnit === unit
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-sand-100 hover:bg-sand-200 text-sand-700'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              name="minArea"
              placeholder={`Min (${filters.areaUnit.toUpperCase()})`}
              value={filters.minArea}
              onChange={handleChange}
              className="form-input flex-1 text-sm"
            />
            <span className="text-sand-400">to</span>
            <input
              type="number"
              step="any"
              name="maxArea"
              placeholder={`Max (${filters.areaUnit.toUpperCase()})`}
              value={filters.maxArea}
              onChange={handleChange}
              className="form-input flex-1 text-sm"
            />
          </div>
        </div>

        {/* Advanced Filter Collapse Toggle */}
        <div className="col-span-full border-t border-sand-200 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 hover:text-teal-700"
          >
            <span>{showAdvanced ? '▲ Less Filters' : '▼ More Filters (Beds, Possession, Furnishing, Corner)'}</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] text-teal-800">
                {activeFilterCount} Active
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters Section */}
        {showAdvanced && (
          <div className="col-span-full grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded bg-sand-50/75 p-3.5 border border-sand-200">
            {/* Bedrooms */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sand-600">
                Bedrooms
              </label>
              <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleChange}
                className="form-input text-sm"
              >
                <option value="">Any Bedrooms</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4 Beds</option>
                <option value="5">5+ Beds</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sand-600">
                Bathrooms
              </label>
              <select
                name="bathrooms"
                value={filters.bathrooms}
                onChange={handleChange}
                className="form-input text-sm"
              >
                <option value="">Any Bathrooms</option>
                <option value="1">1 Bath</option>
                <option value="2">2 Baths</option>
                <option value="3">3 Baths</option>
                <option value="4">4+ Baths</option>
              </select>
            </div>

            {/* Possession Status */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sand-600">
                Possession
              </label>
              <select
                name="possessionStatus"
                value={filters.possessionStatus}
                onChange={handleChange}
                className="form-input text-sm"
              >
                <option value="">Any Possession</option>
                <option value="ready">Ready to Move</option>
                <option value="under_construction">Under Construction / Off-plan</option>
              </select>
            </div>

            {/* Furnished Status */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sand-600">
                Furnishing
              </label>
              <select
                name="isFurnished"
                value={filters.isFurnished}
                onChange={handleChange}
                className="form-input text-sm"
              >
                <option value="">Any Furnishing</option>
                <option value="furnished">Furnished</option>
                <option value="semi_furnished">Semi-Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>

            {/* Corner Plot Toggle */}
            <div className="col-span-full flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  name="isCornerPlot"
                  checked={filters.isCornerPlot}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-sand-400 text-brand-600 focus:ring-brand-500"
                />
                Corner Plot / Main Boulevard Only
              </label>
            </div>
          </div>
        )}

        {/* Buttons Bar */}
        <div className="col-span-full flex items-center justify-between border-t border-sand-200 pt-3">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold uppercase tracking-wider text-sand-600 hover:text-brand-600"
          >
            Reset Filters
          </button>

          <button
            type="submit"
            className="btn-primary px-7 py-2 text-sm font-semibold shadow"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
