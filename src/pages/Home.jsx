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
    <main className="mx-auto max-w-7xl px-4 py-8"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500">Pakistan property marketplace</p><h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">Find your next place.</h1></div>

      <SearchFilters onSearch={handleSearch} />

      {loading && <p className="py-10 text-center text-sand-600">Loading properties...</p>}
      {error && <p className="py-10 text-center text-brand-500">{error}</p>}

      {!loading && !error && properties.length === 0 && (
        <p className="py-10 text-center text-sand-600">No properties found. Try adjusting your filters.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {properties.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>
    </main>
  );
};

export default Home;
