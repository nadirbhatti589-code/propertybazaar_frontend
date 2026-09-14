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
      className="mb-8 grid grid-cols-2 gap-3 border border-sand-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-7"
    >
      <input
        type="text"
        name="search"
        placeholder="Search by keyword..."
        value={filters.search}
        onChange={handleChange}
        className="form-input col-span-2 lg:col-span-2"
      />

      <select
        name="listingType"
        value={filters.listingType}
        onChange={handleChange}
        className="form-input"
      >
        <option value="">Buy / Rent</option>
        <option value="buy">Buy</option>
        <option value="rent">Rent</option>
      </select>

      <select
        name="category"
        value={filters.category}
        onChange={handleChange}
        className="form-input"
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
        className="form-input"
      />

      <input
        type="number"
        name="minPrice"
        placeholder="Min Price"
        value={filters.minPrice}
        onChange={handleChange}
        className="form-input"
      />

      <input
        type="number"
        name="maxPrice"
        placeholder="Max Price"
        value={filters.maxPrice}
        onChange={handleChange}
        className="form-input"
      />

      <button
        type="submit"
        className="btn-primary col-span-2 sm:col-span-1 lg:col-span-7"
      >
        Search
      </button>
    </form>
  );
};

export default SearchFilters;
