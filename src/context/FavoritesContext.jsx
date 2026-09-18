import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    const loadFavorites = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/favorites');
        const ids = (data.favorites || [])
          .map((fav) => (fav.property?._id || fav.property))
          .filter(Boolean);
        setFavoriteIds(new Set(ids));
      } catch (err) {
        // silent fail on network error
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const isFavorite = (propertyId) => favoriteIds.has(propertyId);

  const toggleFavorite = async (propertyId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const wasFav = favoriteIds.has(propertyId);
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });

    try {
      if (wasFav) {
        await api.delete(`/favorites/${propertyId}`);
      } else {
        await api.post(`/favorites/${propertyId}`);
      }
    } catch (err) {
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
