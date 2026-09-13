import { useEffect, useState } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data } = await api.get('/favorites');
        setFavorites(data.favorites);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) return <p className="text-center py-20 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Favorites</h1>

      {favorites.length === 0 ? (
        <p className="text-gray-500">You haven't saved any properties yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map(
            (fav) => fav.property && <PropertyCard key={fav._id} property={fav.property} />
          )}
        </div>
      )}
    </div>
  );
};

export default Favorites;
