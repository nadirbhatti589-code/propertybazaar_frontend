import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { useFavorites } from '../context/FavoritesContext';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite } = useFavorites();

  const fetchFavorites = async () => {
    try {
      const { data } = await api.get('/favorites');
      setFavorites(data.favorites || []);
    } catch (err) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sand-400 border-t-teal-600" />
        <p className="mt-3 text-sm text-sand-600">Loading your saved properties...</p>
      </div>
    );
  }

  // Filter properties that are still favorited in context
  const activeFavorites = favorites.filter((fav) => fav.property && isFavorite(fav.property._id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
        Saved Places
      </p>
      <h1 className="section-heading mb-6 mt-1">Your Favorites ({activeFavorites.length})</h1>

      {activeFavorites.length === 0 ? (
        <div className="border border-dashed border-sand-400 bg-sand-100/60 px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold text-ink">A good shortlist is worth keeping.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-sand-600">
            Explore listings and click the heart icon on any property to save it here for later.
          </p>
          <Link to="/" className="btn-primary mt-6 inline-block">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeFavorites.map((fav) => (
            <PropertyCard key={fav._id} property={fav.property} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Favorites;
