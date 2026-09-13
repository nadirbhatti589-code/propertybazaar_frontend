import { useState } from 'react';

const SearchFilters = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    search: '',
    listingType: '',
    category: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Strip empty values before sending to the API
    const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    onSearch(cleaned);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3"
    >
      <input
        type="text"
        name="search"
        placeholder="Search by keyword..."
        value={filters.search}
        onChange={handleChange}
        className="col-span-2 lg:col-span-2 border border-gray-300 rounded-md px-3 py-2 text-sm"
      />

      <select
        name="listingType"
        value={filters.listingType}
        onChange={handleChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">Buy / Rent</option>
        <option value="buy">Buy</option>
        <option value="rent">Rent</option>
      </select>

      <select
        name="category"
        value={filters.category}
        onChange={handleChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">All Types</option>
        <option value="house">House</option>
        <option value="apartment">Apartment</option>
        <option value="plot">Plot</option>
      </select>

      <input
        type="text"
        name="city"
        placeholder="City"
        value={filters.city}
        onChange={handleChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      />

      <input
        type="number"
        name="minPrice"
        placeholder="Min Price"
        value={filters.minPrice}
        onChange={handleChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      />

      <input
        type="number"
        name="maxPrice"
        placeholder="Max Price"
        value={filters.maxPrice}
        onChange={handleChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      />

      <button
        type="submit"
        className="col-span-2 sm:col-span-1 lg:col-span-7 bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 text-sm font-medium"
      >
        Search
      </button>
    </form>
  );
};

export default SearchFilters;
