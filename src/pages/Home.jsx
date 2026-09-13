import { useEffect, useState } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});

  const fetchProperties = async (activeFilters = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/properties', { params: activeFilters });
      setProperties(data.properties);
    } catch (err) {
      setError('Failed to load properties. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    fetchProperties(newFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Your Next Property</h1>

      <SearchFilters onSearch={handleSearch} />

      {loading && <p className="text-center text-gray-500 py-10">Loading properties...</p>}
      {error && <p className="text-center text-red-500 py-10">{error}</p>}

      {!loading && !error && properties.length === 0 && (
        <p className="text-center text-gray-500 py-10">No properties found. Try adjusting your filters.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {properties.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default Home;
